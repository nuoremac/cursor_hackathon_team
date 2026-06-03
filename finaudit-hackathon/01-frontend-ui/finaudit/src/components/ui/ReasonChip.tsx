"use client";

import { IconPointFilled } from "@tabler/icons-react";

type ReasonChipProps = {
  label: string;
};

export function ReasonChip({ label }: ReasonChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-1 text-[12px] text-tsecondary">
      <IconPointFilled size={12} className="text-tmuted" aria-hidden />
      {label}
    </span>
  );
}
