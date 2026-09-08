"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { copyToClipboard } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  size?: "sm" | "md";
  className?: string;
  label?: string;
}

export function CopyButton({
  text,
  size = "sm",
  className,
  label = "Copy",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button
      variant={copied ? "success" : "secondary"}
      size={size}
      onClick={handleCopy}
      leftIcon={
        copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )
      }
      className={cn("transition-all", className)}
      aria-label={copied ? "Copied!" : label}
    >
      {copied ? "Copied!" : label}
    </Button>
  );
}
