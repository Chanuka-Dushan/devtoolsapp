import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";

const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      id: "demo-credentials",
      name: "Demo / Dev Account",
      credentials: {
        email: { label: "Email", type: "email" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const email = (credentials.email as string).trim().toLowerCase();
        const requestedRole = (credentials.role as string) || "USER";

        const isSuperAdminEmail = superAdminEmails.includes(email);
        const finalRole = isSuperAdminEmail ? "SUPER_ADMIN" : (requestedRole === "SUPER_ADMIN" ? "SUPER_ADMIN" : requestedRole === "PRO" ? "PRO" : "USER");

        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: email.split("@")[0],
              role: finalRole as any,
              subscriptionStatus: finalRole === "PRO" || finalRole === "SUPER_ADMIN" ? "PRO" : "FREE",
              isPro: finalRole === "PRO" || finalRole === "SUPER_ADMIN",
              usageCount: 0,
              freeTierLimit: 1,
            },
          });
        } else if (isSuperAdminEmail && user.role !== "SUPER_ADMIN") {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { role: "SUPER_ADMIN", isPro: true, subscriptionStatus: "PRO" },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          subscriptionStatus: user.subscriptionStatus,
          usageCount: user.usageCount,
          freeTierLimit: user.freeTierLimit,
          isPro: user.isPro,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user?.email) {
        const email = user.email.toLowerCase();
        if (superAdminEmails.includes(email)) {
          try {
            await prisma.user.updateMany({
              where: { email },
              data: { role: "SUPER_ADMIN", isPro: true, subscriptionStatus: "PRO" },
            });
          } catch (e) {
            console.error("Error setting super admin role:", e);
          }
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }

      // If session update triggered
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      // Always fetch latest state from DB for highest security
      if (token?.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: {
              id: true,
              role: true,
              subscriptionStatus: true,
              usageCount: true,
              freeTierLimit: true,
              isPro: true,
            },
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.subscriptionStatus = dbUser.subscriptionStatus;
            token.usageCount = dbUser.usageCount;
            token.freeTierLimit = dbUser.freeTierLimit;
            token.isPro = dbUser.isPro || dbUser.role === "PRO" || dbUser.role === "SUPER_ADMIN";
          }
        } catch (err) {
          console.error("Error syncing jwt with db:", err);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = (token.id as string) || session.user.id;
        (session.user as any).role = token.role || "USER";
        (session.user as any).subscriptionStatus = token.subscriptionStatus || "FREE";
        (session.user as any).usageCount = typeof token.usageCount === "number" ? token.usageCount : 0;
        (session.user as any).freeTierLimit = typeof token.freeTierLimit === "number" ? token.freeTierLimit : 1;
        (session.user as any).isPro = Boolean(token.isPro);
      }
      return session;
    },
  },
});
