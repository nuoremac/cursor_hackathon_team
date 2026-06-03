"use client";

import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  compact?: boolean;
};

export function EmptyState({
  icon,
  title,
  subtitle,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${compact ? "py-10" : "py-20"}`}
    >
      <div className="mb-3 text-tmuted" aria-hidden>
        {icon}
      </div>
      <p className="text-[14px] font-medium text-tprimary">{title}</p>
      {subtitle ? (
        <p className="mt-1 max-w-sm text-[13px] text-tsecondary">{subtitle}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
