"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Code2,
  ShieldCheck,
  Sparkles,
  Crown,
  Zap,
  Lock,
  ArrowRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      setLoadingGoogle(true);
      setErrorMessage("");
      await signIn("google", { callbackUrl });
    } catch (err) {
      console.error("Google sign in error:", err);
      setErrorMessage("Failed to initiate Google Sign-In. Please check OAuth credentials in .env.");
      setLoadingGoogle(false);
    }
  };

  const handleDemoSignIn = async (email: string, role: string) => {
    try {
      setLoadingDemo(role);
      setErrorMessage("");
      const result = await signIn("demo-credentials", {
        email,
        role,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setErrorMessage("Sign-in failed. Please try again.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error("Demo sign-in error:", err);
      setErrorMessage("An unexpected error occurred during demo sign-in.");
    } finally {
      setLoadingDemo(null);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-foreground text-2xl tracking-tight">DevTools</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Sign In to DevTools Platform
        </h1>
        <p className="mt-2 text-sm text-muted">
          Access all AI utilities, video tools, document converters, and your 1 free tier credit.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface border border-border py-8 px-4 shadow-xl shadow-black/5 sm:rounded-2xl sm:px-10 space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400">
              {errorMessage}
            </div>
          )}

          {/* Primary Action: Google Sign In */}
          <div className="space-y-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full flex items-center justify-center gap-3 font-semibold py-3 border-border hover:bg-surface-elevated transition-all shadow-sm"
              onClick={handleGoogleSignIn}
              disabled={loadingGoogle}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loadingGoogle ? "Connecting to Google..." : "Continue with Google"}</span>
            </Button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-2 text-muted">Dev & Testing Accounts</span>
            </div>
          </div>

          {/* Quick Demo & Super Admin buttons for easy verification */}
          <div className="space-y-2.5">
            <p className="text-[11px] text-muted text-center">
              Click below to test any role instantly:
            </p>

            <button
              type="button"
              onClick={() => handleDemoSignIn("chanukadushan1030@gmail.com", "SUPER_ADMIN")}
              disabled={loadingDemo !== null}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                <div>
                  <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    Sign in as Super Admin
                  </div>
                  <div className="text-[10px] text-muted">
                    chanukadushan1030@gmail.com • Access Admin Dashboard
                  </div>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-amber-500" />
            </button>

            <button
              type="button"
              onClick={() => handleDemoSignIn("free.user@devtools.local", "USER")}
              disabled={loadingDemo !== null}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-brand-500" />
                <div>
                  <div className="text-xs font-semibold text-foreground">
                    Sign in as Free Tier User
                  </div>
                  <div className="text-[10px] text-muted">
                    free.user@devtools.local • 1 Free Usage Included
                  </div>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted" />
            </button>

            <button
              type="button"
              onClick={() => handleDemoSignIn("pro.member@devtools.local", "PRO")}
              disabled={loadingDemo !== null}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-brand-500/30 bg-brand-500/10 hover:bg-brand-500/20 text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-500" />
                <div>
                  <div className="text-xs font-bold text-brand-600 dark:text-brand-400">
                    Sign in as Pro Member
                  </div>
                  <div className="text-[10px] text-muted">
                    pro.member@devtools.local • Unlimited Tool Access
                  </div>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-brand-500" />
            </button>
          </div>

          {/* High Security notice */}
          <div className="pt-2 border-t border-border flex items-start gap-2 text-xs text-muted">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-[11px] leading-relaxed">
              <strong>High Security & Anti-Abuse:</strong> 1 free usage is strictly enforced per authenticated Google account in PostgreSQL. Clearing browser cookies or cache will not reset usage.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Loading sign in...</div>}>
      <SignInContent />
    </Suspense>
  );
}
