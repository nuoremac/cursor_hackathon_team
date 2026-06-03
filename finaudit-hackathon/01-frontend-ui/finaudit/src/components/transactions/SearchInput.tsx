"use client";

import { IconSearch } from "@tabler/icons-react";
import { useApp } from "@/context/AppContext";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchInput({ value, onChange }: SearchInputProps) {
  const { t } = useApp();
  return (
    <div className="relative w-full sm:w-[220px]">
      <IconSearch
        size={15}
        stroke={1.75}
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-tmuted"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("tx.search")}
        aria-label={t("tx.search")}
        className="h-8 w-full rounded-md border border-[var(--border)] bg-surface pl-8 pr-2.5 text-[13px] text-tprimary placeholder:text-tmuted focus:border-accent"
      />
    </div>
  );
}
