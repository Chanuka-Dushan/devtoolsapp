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
 * Check if the user is authenticated and permitted to use the tool.
 * Does NOT consume the credit yet (credit is consumed only upon success).
 */
export async function checkToolAccess(
  req?: NextRequest,
  toolSlug: string = "video-caption-generator"
): Promise<UsageAuthResult> {
  try {
    // If it's NOT a paid tool, always allow
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

    const user = await prisma.user.findUnique({
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

    const isSuperAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";
    const isPro = user.isPro || user.role === "PRO" || user.subscriptionStatus === "PRO" || isSuperAdmin;

    if (isPro) {
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

    return {
      ok: true,
      status: 200,
      message: "Authorized (1 free credit available)",
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
      remaining: Math.max(0, limit - user.usageCount),
    };
  } catch (err) {
    console.error("Error in checkToolAccess:", err);
    return {
      ok: false,
      status: 500,
      error: "INTERNAL_ERROR",
      message: "Security check error.",
    };
  }
}

/**
 * Consumes 1 credit in PostgreSQL upon SUCCESSFUL subtitle generation.
 * This guarantees the user's free credit is never lost on failed API calls.
 */
export async function consumeToolCredit(
  req?: NextRequest,
  toolSlug: string = "video-caption-generator",
  metadata: Record<string, unknown> = {}
): Promise<UsageAuthResult> {
  try {
    if (!isPaidTool(toolSlug)) {
      return { ok: true, status: 200, message: "Free tool" };
    }

    const session = await auth();
    if (!session?.user?.email) {
      return { ok: false, status: 401, error: "AUTH_REQUIRED", message: "Not signed in" };
    }

    const email = session.user.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { ok: false, status: 401, error: "AUTH_REQUIRED", message: "User not found" };
    }

    let clientIp = "127.0.0.1";
    if (req) {
      const forwarded = req.headers.get("x-forwarded-for");
      clientIp = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";
    }

    const isSuperAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";
    const isPro = user.isPro || user.role === "PRO" || user.subscriptionStatus === "PRO" || isSuperAdmin;

    if (isPro) {
      // Just record tool usage for analytics
      try {
        await prisma.toolUsage.create({
          data: {
            toolSlug,
            userId: user.id,
            metadata: { ...metadata, role: user.role, isPro: true, ip: clientIp },
          },
        });
      } catch (e) {}

      return {
        ok: true,
        status: 200,
        message: "Pro usage recorded",
        remaining: 999999,
      };
    }

    // Free user: Increment usageCount atomically in PostgreSQL
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        usageCount: { increment: 1 },
        lastLoginAt: new Date(),
        lastIpAddress: clientIp,
      },
    });

    try {
      await prisma.toolUsage.create({
        data: {
          toolSlug,
          userId: user.id,
          metadata: { ...metadata, role: "USER", usedFreeTrial: true, ip: clientIp },
        },
      });

      await prisma.deviceUsage.upsert({
        where: { ipAddress: clientIp },
        create: { ipAddress: clientIp, usageCount: 1 },
        update: { usageCount: { increment: 1 } },
      });
    } catch (dbErr) {
      console.error("Error logging usage audit:", dbErr);
    }

    return {
      ok: true,
      status: 200,
      message: "1 free credit successfully consumed",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        subscriptionStatus: updatedUser.subscriptionStatus,
        usageCount: updatedUser.usageCount,
        freeTierLimit: updatedUser.freeTierLimit,
        isPro: false,
      },
      remaining: Math.max(0, updatedUser.freeTierLimit - updatedUser.usageCount),
    };
  } catch (error) {
    console.error("Error in consumeToolCredit:", error);
    return {
      ok: false,
      status: 500,
      error: "INTERNAL_ERROR",
      message: "Failed to record credit consumption",
    };
  }
}

/**
 * Backward compatibility wrapper.
 */
export async function authorizeAndTrackUsage(
  req?: NextRequest,
  toolSlug: string = "video-caption-generator",
  metadata: Record<string, unknown> = {}
): Promise<UsageAuthResult> {
  const check = await checkToolAccess(req, toolSlug);
  if (!check.ok) return check;
  return await consumeToolCredit(req, toolSlug, metadata);
}
