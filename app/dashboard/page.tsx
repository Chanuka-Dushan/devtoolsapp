import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

/**
 * Normal users do not have access to any dashboard.
 * If a Super Admin visits /dashboard, redirect them to /admin.
 * If a normal user or guest visits /dashboard, redirect them to the home page (/).
 */
export default async function DashboardRedirectPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/");
  }

  const email = session.user.email.toLowerCase();
  const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const isSuperAdminEmail = superAdminEmails.includes(email);

  if (isSuperAdminEmail || (session.user as any).role === "SUPER_ADMIN" || (session.user as any).role === "ADMIN") {
    redirect("/admin");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });

  if (user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") {
    redirect("/admin");
  }

  // Normal users are strictly denied dashboard access
  redirect("/");
}
