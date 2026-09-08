"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  mono?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, mono = false, className, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            "w-full rounded-lg border border-border bg-surface px-3 py-2.5",
            "text-sm text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
            "transition-colors duration-150",
            "resize-y min-h-[120px]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-error focus:ring-error",
            mono && "font-mono text-xs leading-relaxed tool-textarea",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-error flex items-center gap-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  mono?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftElement, rightElement, mono = false, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftElement && (
            <div className="absolute left-3 flex items-center text-muted">
              {leftElement}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full rounded-lg border border-border bg-surface",
              "h-9 px-3 text-sm text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
              "transition-colors duration-150",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-error focus:ring-error",
              mono && "font-mono",
              leftElement && "pl-9",
              rightElement && "pr-9",
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 flex items-center text-muted">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
