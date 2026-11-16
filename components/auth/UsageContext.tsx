"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UpgradeModal } from "./UpgradeModal";
import { SignInModal } from "./SignInModal";

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
  triggerSignInModal: (message?: string) => void;
  checkAccess: (toolSlug?: string, toolName?: string) => Promise<{ allowed: boolean; reason?: string }>;
  consumeCredit: (toolSlug?: string, metadata?: Record<string, unknown>) => Promise<{ ok: boolean }>;
}

const UsageContext = createContext<UsageContextValue | null>(null);

export function UsageProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [freeTierLimit, setFreeTierLimit] = useState(1);
  const [remaining, setRemaining] = useState(1);
  const [hasUsedFreeTier, setHasUsedFreeTier] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState<string | undefined>(undefined);

  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [signInMessage, setSignInMessage] = useState<string | undefined>(undefined);

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
      console.error("Error refreshing usage:", err);
    }
  }, []);

  useEffect(() => {
    refreshUsage();
  }, [refreshUsage]);

  const triggerUpgradeModal = useCallback((msg?: string) => {
    if (msg) setUpgradeMessage(msg);
    setUpgradeModalOpen(true);
  }, []);

  const triggerSignInModal = useCallback((msg?: string) => {
    if (msg) setSignInMessage(msg);
    setSignInModalOpen(true);
  }, []);

  // Pre-check tool access without consuming the credit
  const checkAccess = useCallback(
    async (toolSlug: string = "video-caption-generator", toolName?: string): Promise<{ allowed: boolean; reason?: string }> => {
      try {
        const res = await fetch("/api/user/authorize-tool", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug, action: "check", metadata: { toolName } }),
        });

        const data = await res.json();

        if (res.status === 401 || data.error === "AUTH_REQUIRED") {
          triggerSignInModal(data.message);
          return { allowed: false, reason: "AUTH_REQUIRED" };
        }

        if (res.status === 403 || data.error === "UPGRADE_REQUIRED") {
          await refreshUsage();
          triggerUpgradeModal(data.message);
          return { allowed: false, reason: "UPGRADE_REQUIRED" };
        }

        if (res.ok && data.ok) {
          return { allowed: true };
        }

        return { allowed: false, reason: data.message || "Authorization check failed" };
      } catch (err) {
        console.error("Error in checkAccess:", err);
        return { allowed: false, reason: "Network error" };
      }
    },
    [triggerSignInModal, triggerUpgradeModal, refreshUsage]
  );

  // Consume credit ONLY upon successful subtitle generation
  const consumeCredit = useCallback(
    async (toolSlug: string = "video-caption-generator", metadata: Record<string, unknown> = {}): Promise<{ ok: boolean }> => {
      try {
        const res = await fetch("/api/user/authorize-tool", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug, action: "consume", metadata }),
        });

        await refreshUsage();
        return { ok: res.ok };
      } catch (err) {
        console.error("Error consuming credit:", err);
        return { ok: false };
      }
    },
    [refreshUsage]
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
        triggerSignInModal,
        checkAccess,
        consumeCredit,
      }}
    >
      {children}
      <UpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        message={upgradeMessage}
        userEmail={userEmail}
      />
      <SignInModal
        open={signInModalOpen}
        onClose={() => setSignInModalOpen(false)}
        message={signInMessage}
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
