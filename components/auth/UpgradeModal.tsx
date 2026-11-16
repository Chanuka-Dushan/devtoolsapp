"use client";

import { useState } from "react";
import {
  Sparkles,
  Check,
  ShieldCheck,
  Zap,
  Lock,
  X,
  CreditCard,
  Crown,
  ArrowRight,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  userEmail?: string;
}

export function UpgradeModal({
  open,
  onClose,
  title = "Subtitle Free Tier Limit Reached",
  message = "You have used your 1 free subtitle generation credit. To continue generating synchronized kinetic captions and exporting subtitled videos, please upgrade to DevTools Pro.",
  userEmail,
}: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "lifetime">("monthly");
  const [paymentNotice, setPaymentNotice] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-surface border border-border shadow-2xl animate-scale-up">
        {/* Top banner styling */}
        <div className="relative bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-700 px-6 py-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-2">
            <Crown className="h-3.5 w-3.5 text-amber-300" />
            1/1 Free Subtitle Credit Consumed
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {title}
          </h2>
          <p className="mt-2 text-sm text-white/90 max-w-lg mx-auto">
            {message}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* High Security notice */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
            <ShieldCheck className="h-4 w-4 shrink-0 text-amber-500" />
            <span>
              <strong>High Security Enforced:</strong> Your free subtitle credit is linked directly to your authenticated Google account in our secure database. Clearing browser data, cookies, or cache will not reset usage.
            </span>
          </div>

          {/* Plan selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Monthly */}
            <div
              onClick={() => setSelectedPlan("monthly")}
              className={`cursor-pointer rounded-xl border p-4 transition-all relative ${
                selectedPlan === "monthly"
                  ? "border-brand-500 bg-brand-500/5 shadow-md shadow-brand-500/10"
                  : "border-border hover:border-border-hover bg-surface"
              }`}
            >
              {selectedPlan === "monthly" && (
                <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded bg-brand-600 text-[10px] font-bold text-white uppercase tracking-wider">
                  Selected
                </span>
              )}
              <h3 className="font-semibold text-foreground text-sm">Monthly Pro</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">$12</span>
                <span className="text-xs text-muted">/ month</span>
              </div>
              <p className="text-xs text-muted mt-1">Unlimited AI subtitle generation & exports.</p>
            </div>

            {/* Lifetime */}
            <div
              onClick={() => setSelectedPlan("lifetime")}
              className={`cursor-pointer rounded-xl border p-4 transition-all relative ${
                selectedPlan === "lifetime"
                  ? "border-indigo-500 bg-indigo-500/5 shadow-md shadow-indigo-500/10"
                  : "border-border hover:border-border-hover bg-surface"
              }`}
            >
              <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-bold text-white uppercase tracking-wider">
                Best Value
              </span>
              <h3 className="font-semibold text-foreground text-sm">Lifetime Unlimited</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">$49</span>
                <span className="text-xs text-muted">one-time</span>
              </div>
              <p className="text-xs text-muted mt-1">Pay once, enjoy unlimited lifetime subtitle generation.</p>
            </div>
          </div>

          {/* Feature list */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
              What you get with Pro Subtitle Access:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                "Unlimited AI Video Subtitle Generation",
                "Full video transcription with Whisper AI",
                "Kinetic TikTok, Hormozi & Sinhala presets",
                "High-res MP4 video export & rendering",
                "SRT & VTT subtitle file exports",
                "Zero watermarks & instant priority processing",
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-foreground">
                  <div className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment gateway notice */}
          {paymentNotice && (
            <div className="p-4 rounded-xl bg-surface-elevated border border-border text-center space-y-2 animate-fade-in">
              <div className="inline-flex p-2 rounded-full bg-brand-500/10 text-brand-500 mb-1">
                <CreditCard className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">
                Payment Gateway Pending Configuration
              </h4>
              <p className="text-xs text-muted max-w-md mx-auto">
                Payment gateway checkout will be activated shortly. If you have completed a payment or require manual Pro upgrade, please contact the Super Admin at{" "}
                <a
                  href="mailto:chanukadushan1030@gmail.com?subject=DevTools%20Pro%20Upgrade%20Request"
                  className="font-medium text-brand-600 dark:text-brand-400 underline"
                >
                  chanukadushan1030@gmail.com
                </a>{" "}
                with your account email {userEmail ? `(${userEmail})` : ""}.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 font-semibold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-brand-500/25"
              onClick={() => setPaymentNotice(true)}
            >
              <Zap className="h-4 w-4" />
              Upgrade to Pro ({selectedPlan === "monthly" ? "$12/mo" : "$49 lifetime"})
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="sm:w-auto"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
