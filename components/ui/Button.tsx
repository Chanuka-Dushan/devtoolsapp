"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "outline"
  | "success";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm shadow-brand-600/20 focus-visible:ring-brand-500",
  secondary:
    "bg-surface-elevated text-foreground hover:bg-border border border-border focus-visible:ring-brand-500",
  ghost:
    "text-muted hover:text-foreground hover:bg-surface-elevated focus-visible:ring-brand-500",
  danger:
    "bg-error text-white hover:bg-red-600 active:bg-red-700 shadow-sm shadow-red-500/20 focus-visible:ring-red-500",
  outline:
    "border border-brand-600 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 focus-visible:ring-brand-500",
  success:
    "bg-success text-white hover:bg-emerald-600 active:bg-emerald-700 shadow-sm shadow-emerald-500/20 focus-visible:ring-emerald-500",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-6 text-base gap-2.5",
  icon: "h-9 w-9 p-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Base
          "inline-flex items-center justify-center font-medium rounded-lg whitespace-nowrap flex-nowrap",
          "transition-all duration-150 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "select-none",
          // Variant
          variantClasses[variant],
          // Size
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent shrink-0"
            aria-hidden="true"
          />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
