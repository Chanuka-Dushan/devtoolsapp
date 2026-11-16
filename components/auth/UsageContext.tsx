"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UpgradeModal } from "./UpgradeModal";

interface UsageContextValue {
  isAuthenticated: boolean;
  isPro: boolean;
  isSuperAdmin: boolean;
  usageCount: number;
  freeTierLimit: number;
  remaining: number;
  hasUsedFreeTier: boolean;
  userEmail?: string;
  refreshUsage: () => Promise<void>;
  triggerUpgradeModal: (message?: string) => void;
  checkAndConsume: (toolSlug: string, toolName?: string) => Promise<{ allowed: boolean; reason?: string }>;
}

const UsageContext = createContext<UsageContextValue | null>(null);

export function UsageProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [freeTierLimit, setFreeTierLimit] = useState(1);
  const [remaining, setRemaining] = useState(1);
  const [hasUsedFreeTier, setHasUsedFreeTier] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | undefined>(undefined);

  const refreshUsage = useCallback(async () => {
    try {
      const res = await fetch("/api/user/usage");
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(Boolean(data.authenticated));
        setIsPro(Boolean(data.isPro));
        setIsSuperAdmin(Boolean(data.isSuperAdmin));
        setUsageCount(data.usageCount || 0);
        setFreeTierLimit(data.freeTierLimit || 1);
        setRemaining(typeof data.remaining === "number" ? data.remaining : 1);
        setHasUsedFreeTier(Boolean(data.hasUsedFreeTier));
        if (data.user?.email) {
          setUserEmail(data.user.email);
        }
      }
    } catch (err) {
      console.error("Error refreshing usage in UsageProvider:", err);
    }
  }, []);

  useEffect(() => {
    refreshUsage();
  }, [refreshUsage]);

  const triggerUpgradeModal = useCallback((msg?: string) => {
    if (msg) setModalMessage(msg);
    setModalOpen(true);
  }, []);

  const checkAndConsume = useCallback(
    async (toolSlug: string, toolName?: string): Promise<{ allowed: boolean; reason?: string }> => {
      try {
        const res = await fetch("/api/user/authorize-tool", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug, metadata: { toolName } }),
        });

        const data = await res.json();

        if (res.status === 401 || data.error === "AUTH_REQUIRED") {
          // Redirect to signin with callback url
          if (typeof window !== "undefined") {
            const currentUrl = window.location.pathname;
            router.push(`/auth/signin?callbackUrl=${encodeURIComponent(currentUrl)}`);
          }
          return { allowed: false, reason: "AUTH_REQUIRED" };
        }

        if (res.status === 403 || data.error === "UPGRADE_REQUIRED") {
          await refreshUsage();
          triggerUpgradeModal(data.message);
          return { allowed: false, reason: "UPGRADE_REQUIRED" };
        }

        if (res.ok && data.ok) {
          await refreshUsage();
          return { allowed: true };
        }

        return { allowed: false, reason: data.message || "Unknown authorization failure" };
      } catch (err) {
        console.error("Error calling /api/user/authorize-tool:", err);
        return { allowed: false, reason: "Network error" };
      }
    },
    [router, refreshUsage, triggerUpgradeModal]
  );

  return (
    <UsageContext.Provider
      value={{
        isAuthenticated,
        isPro,
        isSuperAdmin,
        usageCount,
        freeTierLimit,
        remaining,
        hasUsedFreeTier,
        userEmail,
        refreshUsage,
        triggerUpgradeModal,
        checkAndConsume,
      }}
    >
      {children}
      <UpgradeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMessage}
        userEmail={userEmail}
      />
    </UsageContext.Provider>
  );
}

export function useUsage() {
  const context = useContext(UsageContext);
  if (!context) {
    throw new Error("useUsage must be used within a UsageProvider");
  }
  return context;
}
