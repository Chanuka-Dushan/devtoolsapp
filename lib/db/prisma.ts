import { PrismaClient } from "@prisma/client";

declare global {
  // Allow global var in development to prevent multiple instances
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Singleton Prisma client.
 * In development, reuse the global instance to avoid connection pool exhaustion
 * during hot module reloads.
 */
export const prisma =
  global.__prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
