"use client";

import type { Icon } from "@tabler/icons-react";
import { useApp } from "@/context/AppContext";
import { useCountUp } from "@/lib/useCountUp";
import { formatCurrency, formatNumber } from "@/lib/format";

type MetricVariant = "default" | "danger" | "success" | "warning";

type MetricCardProps = {
  label: string;
  value: number;
  format: "number" | "currency";
  icon: Icon;
  subtext: string;
  variant?: MetricVariant;
  animate?: boolean;
};

const VALUE_COLOR: Record<MetricVariant, string> = {
  default: "text-tprimary",
  danger: "text-[var(--danger)]",
  success: "text-[var(--success)]",
  warning: "text-[var(--warning)]",
};

export function MetricCard({
  label,
  value,
  format,
  icon: Icon,
  subtext,
  variant = "default",
  animate = true,
}: MetricCardProps) {
  const { locale } = useApp();
  const animated = useCountUp(animate ? value : value);
  const rounded = Math.round(animated);
  const display =
    format === "currency"
      ? formatCurrency(rounded, locale)
      : formatNumber(rounded, locale);

  return (
    <div className="rounded-[10px] border border-[var(--border)] bg-surface p-5">
      <div className="flex items-start justify-between">
        <span className="col-label">{label}</span>
        <Icon size={16} stroke={1.75} className="text-tmuted" aria-hidden />
      </div>
      <p
        className={`num mt-2 text-[20px] font-medium leading-tight ${VALUE_COLOR[variant]}`}
      >
        {display}
      </p>
      <p className="mt-1 text-[11px] text-tmuted">{subtext}</p>
    </div>
  );
}
