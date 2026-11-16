import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

// Verify that the request is from an authenticated SUPER_ADMIN
async function checkSuperAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    return { ok: false, error: "Unauthorized: Please sign in.", status: 401 };
  }

  const email = session.user.email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true },
  });

  const isSuperAdminEmail = (process.env.SUPER_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .includes(email);

  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && !isSuperAdminEmail)) {
    return { ok: false, error: "Forbidden: Super Admin access required.", status: 403 };
  }

  return { ok: true, admin: user };
}

/**
 * GET /api/admin/users
 * Returns list of all users, their subscriptions, free tier usage, and recent activity.
 */
export async function GET(request: NextRequest) {
  const authCheck = await checkSuperAdmin();
  if (!authCheck.ok) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase() || "";
    const roleFilter = searchParams.get("role") || "";
    const planFilter = searchParams.get("plan") || "";

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { toolUsages: true },
        },
        toolUsages: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
    });

    let filtered = users;

    if (query) {
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(query) ||
          (u.name && u.name.toLowerCase().includes(query)) ||
          u.id.toLowerCase().includes(query)
      );
    }

    if (roleFilter && roleFilter !== "ALL") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    if (planFilter && planFilter !== "ALL") {
      if (planFilter === "PRO") {
        filtered = filtered.filter((u) => u.isPro || u.subscriptionStatus === "PRO");
      } else if (planFilter === "FREE_USED") {
        filtered = filtered.filter((u) => !u.isPro && u.usageCount >= u.freeTierLimit);
      } else if (planFilter === "FREE_AVAILABLE") {
        filtered = filtered.filter((u) => !u.isPro && u.usageCount < u.freeTierLimit);
      }
    }

    // Platform overview stats
    const totalUsers = users.length;
    const proUsers = users.filter((u) => u.isPro || u.role === "PRO" || u.subscriptionStatus === "PRO").length;
    const superAdmins = users.filter((u) => u.role === "SUPER_ADMIN" || u.role === "ADMIN").length;
    const freeTierMaxed = users.filter((u) => !u.isPro && u.usageCount >= u.freeTierLimit).length;
    const totalUsagesCount = await prisma.toolUsage.count();

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        proUsers,
        superAdmins,
        freeTierMaxed,
        totalUsagesCount,
      },
      users: filtered.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        image: u.image,
        role: u.role,
        subscriptionStatus: u.subscriptionStatus,
        usageCount: u.usageCount,
        freeTierLimit: u.freeTierLimit,
        isPro: u.isPro || u.role === "PRO" || u.subscriptionStatus === "PRO",
        paymentNotes: u.paymentNotes,
        lastLoginAt: u.lastLoginAt,
        lastIpAddress: u.lastIpAddress,
        createdAt: u.createdAt,
        totalToolUsages: u._count.toolUsages,
        recentUsages: u.toolUsages,
      })),
    });
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/users
 * Update user subscription, role, usage counts, or payment notes.
 */
export async function PATCH(request: NextRequest) {
  const authCheck = await checkSuperAdmin();
  if (!authCheck.ok) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();
    const { userId, role, isPro, subscriptionStatus, usageCount, freeTierLimit, paymentNotes } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (role !== undefined) updateData.role = role;
    if (isPro !== undefined) {
      updateData.isPro = Boolean(isPro);
      if (isPro) {
        updateData.subscriptionStatus = "PRO";
      }
    }
    if (subscriptionStatus !== undefined) updateData.subscriptionStatus = subscriptionStatus;
    if (typeof usageCount === "number") updateData.usageCount = usageCount;
    if (typeof freeTierLimit === "number") updateData.freeTierLimit = freeTierLimit;
    if (paymentNotes !== undefined) updateData.paymentNotes = paymentNotes;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      user: updated,
      message: `User ${updated.email} updated successfully.`,
    });
  } catch (error) {
    console.error("Error in PATCH /api/admin/users:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
