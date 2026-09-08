"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Code2, ArrowRight, Mail, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage(`Magic sign-in link sent to ${email}! Check your inbox.`);
    }, 600);
  };

  const handleGuestDemo = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("devtools_user", JSON.stringify({ name: "Demo Developer", email: "developer@example.com", role: "FREE" }));
    }
    router.push("/dashboard");
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
          Welcome to DevTools Platform
        </h1>
        <p className="mt-2 text-sm text-muted">
          Access your saved tools, usage history, and AI utilities across all your devices.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface border border-border py-8 px-4 shadow-xl shadow-black/5 sm:rounded-2xl sm:px-10">
          {successMessage ? (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {successMessage}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setSuccessMessage("")}
              >
                Use another email
              </Button>
            </div>
          ) : (
            <>
              {/* OAuth options */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 font-medium"
                  onClick={handleGuestDemo}
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  Continue with GitHub
                </Button>

                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 font-medium"
                  onClick={handleGuestDemo}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
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
                  Continue with Google
                </Button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-surface px-2 text-muted">Or with email</span>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-foreground mb-1">
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                  {loading ? "Sending link..." : "Send Magic Link"}
                </Button>
              </form>

              {/* Guest demo mode button */}
              <div className="mt-6 pt-4 border-t border-border text-center">
                <button
                  type="button"
                  onClick={handleGuestDemo}
                  className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Instant Guest Demo (No signup needed) →
                </button>
              </div>
            </>
          )}

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted text-center">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Privacy first: We never share or sell developer data.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
