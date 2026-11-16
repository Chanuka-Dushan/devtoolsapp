import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export interface UsageAuthResult {
  ok: boolean;
  status: number;
  error?: "AUTH_REQUIRED" | "UPGRADE_REQUIRED" | "INTERNAL_ERROR";
  message: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    subscriptionStatus: string;
    usageCount: number;
    freeTierLimit: number;
    isPro: boolean;
  };
  remaining?: number;
}

// Only subtitle / video caption generator requires payment / 1-free-tier gating.
// All other tools stay 100% free for everyone!
export const PAID_TOOL_SLUGS = [
  "video-caption-generator",
  "caption-studio",
  "subtitle-generator",
  "ai-video-captions",
  "caption-transcribe",
  "caption-export",
];

export function isPaidTool(slug: string): boolean {
  return PAID_TOOL_SLUGS.includes(slug.toLowerCase().trim());
}

/**
 * Server-side guard to verify authentication and enforce the 1-free-tier usage limit.
 * ONLY the subtitle/caption generator is gated. All other tools are free!
 *
 * Security Model:
 * 1. For subtitle/caption generator, user must be authenticated with Google / account.
 * 2. High security: Usage is stored in PostgreSQL database linked to user account.
 *    Clearing cookies/cache/localStorage will NOT reset free tier credits.
 * 3. Pro users and Super Admins have unlimited access.
 * 4. Free users get exactly 1 free subtitle generation credit.
 * 5. Device IP is tracked to prevent multi-account abuse.
 */
export async function authorizeAndTrackUsage(
  req?: NextRequest,
  toolSlug: string = "video-caption-generator",
  metadata: Record<string, unknown> = {}
): Promise<UsageAuthResult> {
  try {
    // If it's NOT a paid tool (all other tools on the platform stay free), allow immediately!
    if (!isPaidTool(toolSlug)) {
      return {
        ok: true,
        status: 200,
        message: "Free tool access granted",
        remaining: 999999,
      };
    }

    const session = await auth();

    if (!session?.user?.id && !session?.user?.email) {
      return {
        ok: false,
        status: 401,
        error: "AUTH_REQUIRED",
        message: "Please sign in with Google to generate subtitles (1 free generation included).",
      };
    }

    const email = session.user.email?.toLowerCase();
    if (!email) {
      return {
        ok: false,
        status: 401,
        error: "AUTH_REQUIRED",
        message: "No verified email associated with this session.",
      };
    }

    // Always fetch latest authoritative data from PostgreSQL
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        ok: false,
        status: 401,
        error: "AUTH_REQUIRED",
        message: "User account not found.",
      };
    }

    // Client IP for anti-abuse tracking
    let clientIp = "127.0.0.1";
    if (req) {
      const forwarded = req.headers.get("x-forwarded-for");
      clientIp = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";
    }

    const isSuperAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";
    const isPro = user.isPro || user.role === "PRO" || user.subscriptionStatus === "PRO" || isSuperAdmin;

    // Pro and Super Admin have unlimited subtitle generation
    if (isPro) {
      try {
        await prisma.toolUsage.create({
          data: {
            toolSlug,
            userId: user.id,
            metadata: { ...metadata, role: user.role, isPro: true, ip: clientIp },
          },
        });
      } catch (err) {
        console.error("Failed to record pro tool usage:", err);
      }

      return {
        ok: true,
        status: 200,
        message: "Authorized (Pro/Unlimited)",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          subscriptionStatus: user.subscriptionStatus,
          usageCount: user.usageCount,
          freeTierLimit: user.freeTierLimit,
          isPro: true,
        },
        remaining: 999999,
      };
    }

    // Free Tier Check: allow only 1 free tier subtitle generation
    const limit = user.freeTierLimit || 1;
    if (user.usageCount >= limit) {
      return {
        ok: false,
        status: 403,
        error: "UPGRADE_REQUIRED",
        message: "You have used your 1 free subtitle generation credit. Please upgrade to Pro for unlimited subtitle generation.",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          subscriptionStatus: user.subscriptionStatus,
          usageCount: user.usageCount,
          freeTierLimit: limit,
          isPro: false,
        },
        remaining: 0,
      };
    }

    // Consume the 1 free tier credit atomically in PostgreSQL
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        usageCount: { increment: 1 },
        lastLoginAt: new Date(),
        lastIpAddress: clientIp,
      },
    });

    // Record tool usage
    try {
      await prisma.toolUsage.create({
        data: {
          toolSlug,
          userId: user.id,
          metadata: { ...metadata, role: "USER", usedFreeTrial: true, ip: clientIp },
        },
      });

      // Update Device IP usage
      await prisma.deviceUsage.upsert({
        where: { ipAddress: clientIp },
        create: {
          ipAddress: clientIp,
          usageCount: 1,
        },
        update: {
          usageCount: { increment: 1 },
        },
      });
    } catch (dbErr) {
      console.error("Error logging free tier usage audit:", dbErr);
    }

    return {
      ok: true,
      status: 200,
      message: "Authorized (1 free subtitle generation credit consumed)",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        subscriptionStatus: updatedUser.subscriptionStatus,
        usageCount: updatedUser.usageCount,
        freeTierLimit: limit,
        isPro: false,
      },
      remaining: Math.max(0, limit - updatedUser.usageCount),
    };
  } catch (error) {
    console.error("Error in authorizeAndTrackUsage:", error);
    return {
      ok: false,
      status: 500,
      error: "INTERNAL_ERROR",
      message: "An unexpected error occurred during security authorization.",
    };
  }
}
