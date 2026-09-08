import { AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type MessageType = "error" | "success" | "warning" | "info";

interface StatusMessageProps {
  type: MessageType;
  message: string;
  className?: string;
}

const configs: Record<
  MessageType,
  { icon: React.ElementType; bg: string; border: string; text: string }
> = {
  error: {
    icon: AlertCircle,
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800/40",
    text: "text-red-700 dark:text-red-400",
  },
  success: {
    icon: CheckCircle,
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800/40",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800/40",
    text: "text-amber-700 dark:text-amber-400",
  },
  info: {
    icon: Info,
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800/40",
    text: "text-blue-700 dark:text-blue-400",
  },
};

export function StatusMessage({ type, message, className }: StatusMessageProps) {
  const config = configs[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm animate-fade-in",
        config.bg,
        config.border,
        config.text,
        className
      )}
      role={type === "error" ? "alert" : "status"}
    >
      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <span className="leading-relaxed">{message}</span>
    </div>
  );
}
