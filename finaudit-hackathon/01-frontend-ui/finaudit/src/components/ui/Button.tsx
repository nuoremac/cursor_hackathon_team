"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
};

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "bg-accent text-on-accent hover:bg-accent-hover border border-transparent disabled:opacity-50 disabled:cursor-not-allowed",
  ghost:
    "bg-transparent text-tsecondary border border-[var(--border)] hover:bg-surface-2 disabled:opacity-50 disabled:cursor-not-allowed",
  subtle:
    "bg-surface-2 text-tprimary border border-transparent hover:bg-[var(--border-subtle)] disabled:opacity-50 disabled:cursor-not-allowed",
  danger:
    "bg-[var(--danger)] text-white border border-transparent hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
};

const SIZE_CLASS: Record<Size, string> = {
  sm: "h-8 px-2.5 text-[12px] gap-1.5",
  md: "h-9 px-3.5 text-[13px] gap-2",
};

export function Button({
  variant = "ghost",
  size = "md",
  icon,
  iconRight,
  fullWidth,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`press inline-flex items-center justify-center rounded-md font-medium transition-colors duration-150 ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
}
