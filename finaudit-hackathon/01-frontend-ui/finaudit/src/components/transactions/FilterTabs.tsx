"use client";

import { useApp } from "@/context/AppContext";
import type { TranslationKey } from "@/lib/i18n";

export type TxFilter = "all" | "normal" | "suspicious" | "high";

type FilterTabsProps = {
  value: TxFilter;
  onChange: (filter: TxFilter) => void;
  counts: Record<TxFilter, number>;
};

const TABS: { id: TxFilter; labelKey: TranslationKey }[] = [
  { id: "all", labelKey: "tx.filter.all" },
  { id: "normal", labelKey: "tx.filter.normal" },
  { id: "suspicious", labelKey: "tx.filter.suspicious" },
  { id: "high", labelKey: "tx.filter.highRisk" },
];

export function FilterTabs({ value, onChange, counts }: FilterTabsProps) {
  const { t } = useApp();
  return (
    <div role="tablist" aria-label={t("tx.col.risk")} className="flex flex-wrap gap-1.5">
      {TABS.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[13px] transition-colors duration-150 ${
              active
                ? "border-accent bg-surface font-medium text-accent"
                : "border-transparent text-tsecondary hover:bg-surface-2"
            }`}
          >
            {t(tab.labelKey)}
            <span
              className={`num text-[11px] ${active ? "text-accent" : "text-tmuted"}`}
            >
              ({counts[tab.id]})
            </span>
          </button>
        );
      })}
    </div>
  );
}
