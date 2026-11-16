"use client";

import { SessionProvider } from "next-auth/react";
import { UsageProvider } from "./UsageContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UsageProvider>{children}</UsageProvider>
    </SessionProvider>
  );
}
