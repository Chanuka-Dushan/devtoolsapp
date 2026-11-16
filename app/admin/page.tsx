import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { SuperAdminView } from "./SuperAdminView";

export const metadata = {
  title: "Super Admin Dashboard | DevTools Platform",
  description: "Manage users, monitor free tier usage, and manage Pro subscriptions.",
};

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  const email = session.user.email.toLowerCase();
  const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const isSuperAdminEmail = superAdminEmails.includes(email);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && !isSuperAdminEmail)) {
    // Strictly block normal users
    redirect("/");
  }

  // If user has super admin email but DB role wasn't updated yet, sync it
  if (isSuperAdminEmail && user.role !== "SUPER_ADMIN") {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "SUPER_ADMIN", isPro: true, subscriptionStatus: "PRO" },
    });
  }

  return <SuperAdminView adminEmail={email} />;
}
