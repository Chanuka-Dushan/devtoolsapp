"use client";

import { useState } from "react";
import { Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Contact Engineering & Support
        </h1>
        <p className="mt-2 text-sm text-muted">
          Have feedback, need a new tool added, or want to discuss enterprise sponsorships?
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-foreground">Message Sent!</h2>
            <p className="text-sm text-muted mt-1">
              Thank you for reaching out. Our engineering team will review your message.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-6"
              onClick={() => setSubmitted(false)}
            >
              Send another message
            </Button>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Your Name
                </label>
                <Input placeholder="Ada Lovelace" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Email Address
                </label>
                <Input type="email" placeholder="ada@domain.com" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Subject
              </label>
              <Input placeholder="Feature request / Partner inquiry" required />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Message
              </label>
              <Textarea
                rows={5}
                placeholder="Tell us how we can help or what tool you need..."
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send Message
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
