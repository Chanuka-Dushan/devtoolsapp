import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        usageCount: 0,
        freeTierLimit: 1,
        remaining: 1,
        isPro: false,
        hasUsedFreeTier: false,
      });
    }

    const email = session.user.email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        subscriptionStatus: true,
        usageCount: true,
        freeTierLimit: true,
        isPro: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        usageCount: 0,
        freeTierLimit: 1,
        remaining: 1,
        isPro: false,
        hasUsedFreeTier: false,
      });
    }

    const isSuperAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";
    const isPro = user.isPro || user.role === "PRO" || user.subscriptionStatus === "PRO" || isSuperAdmin;
    const limit = user.freeTierLimit || 1;
    const remaining = isPro ? 999999 : Math.max(0, limit - user.usageCount);
    const hasUsedFreeTier = !isPro && user.usageCount >= limit;

    return NextResponse.json({
      authenticated: true,
      user: {
        ...user,
        isPro,
        isSuperAdmin,
      },
      usageCount: user.usageCount,
      freeTierLimit: limit,
      remaining,
      isPro,
      isSuperAdmin,
      hasUsedFreeTier,
    });
  } catch (error) {
    console.error("Error in GET /api/user/usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage status" },
      { status: 500 }
    );
  }
}
