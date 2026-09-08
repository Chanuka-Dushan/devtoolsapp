import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "primary" | "success" | "warning" | "error" | "info" | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-surface-elevated text-muted border border-border",
  secondary: "bg-surface-elevated text-foreground border border-border",
  primary: "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  error: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  outline: "border border-border text-muted bg-transparent",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

interface DotBadgeProps {
  label: string;
  color?: "green" | "amber" | "red" | "blue" | "indigo";
}

export function DotBadge({ label, color = "green" }: DotBadgeProps) {
  const dotColors = {
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
    indigo: "bg-indigo-500",
  };
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted font-medium">
      <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[color])} />
      {label}
    </span>
  );
}
