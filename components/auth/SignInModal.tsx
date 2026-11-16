"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import {
  Film,
  Sparkles,
  ShieldCheck,
  X,
  Crown,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  callbackUrl?: string;
}

export function SignInModal({
  open,
  onClose,
  title = "Sign In to Generate Subtitles",
  message = "DevTools gives every Google account 1 free AI subtitle generation credit. Sign in to extract speech and animate viral kinetic subtitles.",
  callbackUrl = "/tools/video-caption-generator",
}: SignInModalProps) {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState<string | null>(null);

  if (!open) return null;

  const handleGoogleSignIn = async () => {
    try {
      setLoadingGoogle(true);
      await signIn("google", { callbackUrl });
    } catch (err) {
      console.error("Google sign in error:", err);
      setLoadingGoogle(false);
    }
  };

  const handleDemoSignIn = async (email: string, role: string) => {
    try {
      setLoadingDemo(role);
      await signIn("demo-credentials", {
        email,
        role,
        callbackUrl,
      });
    } catch (err) {
      console.error("Demo sign in error:", err);
    } finally {
      setLoadingDemo(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-surface border border-border shadow-2xl p-6 sm:p-7 space-y-5 animate-scale-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center space-y-2 pt-1">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/25">
            <Film className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            {title}
          </h3>
          <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
            {message}
          </p>
        </div>

        {/* Primary Action: Google Sign In */}
        <div className="space-y-3 pt-1">
          <Button
            variant="outline"
            size="lg"
            className="w-full flex items-center justify-center gap-3 font-semibold py-3 border-border hover:bg-surface-elevated transition-all shadow-sm cursor-pointer"
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

        {/* Quick Testing Options */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-surface px-2 text-muted">Dev Quick Test</span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleDemoSignIn("free.user@devtools.local", "USER")}
            disabled={loadingDemo !== null}
            className="w-full flex items-center justify-between p-2 rounded-xl border border-border bg-surface-elevated/50 hover:bg-surface-elevated text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-500" />
              <div>
                <div className="text-xs font-semibold text-foreground">
                  Test as Free User (1 Credit)
                </div>
                <div className="text-[10px] text-muted">free.user@devtools.local</div>
              </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted" />
          </button>

          <button
            type="button"
            onClick={() => handleDemoSignIn("chanukadushan1030@gmail.com", "SUPER_ADMIN")}
            disabled={loadingDemo !== null}
            className="w-full flex items-center justify-between p-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-500" />
              <div>
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  Test as Super Admin (Unlimited)
                </div>
                <div className="text-[10px] text-muted">chanukadushan1030@gmail.com</div>
              </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-amber-500" />
          </button>
        </div>

        <div className="pt-2 border-t border-border flex items-center justify-center gap-1.5 text-[11px] text-muted text-center">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>High Security: Usage locked to account in database.</span>
        </div>
      </div>
    </div>
  );
}
