import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  as?: React.ElementType;
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({
  children,
  className,
  hover = false,
  padding = "md",
  as: Component = "div",
  ...props
}: CardProps) {
  return (
    <Component
      {...props}
      className={cn(
        "rounded-xl border border-border bg-surface",
        "transition-all duration-200",
        hover &&
          "hover:border-brand-500/40 hover:shadow-md hover:shadow-brand-500/5 cursor-pointer",
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </Component>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3 mb-3", className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("font-semibold text-foreground text-sm leading-snug", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-sm text-muted leading-relaxed", className)}>
      {children}
    </p>
  );
}
