"use client";

import { IconRadar2, IconArrowRight } from "@tabler/icons-react";
import { useApp } from "@/context/AppContext";
import { EmptyState } from "@/components/ui/EmptyState";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { RISK_COLOR } from "@/lib/risk";
import type { TranslationKey } from "@/lib/i18n";

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 } as const;

export function RecentAnomaliesList() {
  const { findings, transactions, auditRun, setActiveSection, t } = useApp();

  const items = [...findings]
    .sort((a, b) => SEVERITY_ORDER[a.risk] - SEVERITY_ORDER[b.risk])
    .slice(0, 5)
    .map((f) => ({
      finding: f,
      tx: transactions.find((tx) => tx.id === f.transactionId),
    }))
    .filter((i) => i.tx);

  return (
    <section className="flex h-full flex-col rounded-[10px] border border-[var(--border)] bg-surface p-5">
      <header className="mb-2 flex items-center justify-between">
        <h2 className="text-[13px] font-medium text-tprimary">
          {t("dash.recentAnomalies")}
        </h2>
        {auditRun && items.length > 0 ? (
          <button
            type="button"
            onClick={() => setActiveSection("report")}
            className="inline-flex items-center gap-1 text-[12px] text-accent hover:underline"
          >
            {t("dash.viewReport")}
            <IconArrowRight size={13} stroke={2} />
          </button>
        ) : null}
      </header>

      {!auditRun || items.length === 0 ? (
        <EmptyState
          icon={<IconRadar2 size={24} stroke={1.5} />}
          title={t("dash.noAnomaliesYet")}
          compact
        />
      ) : (
        <ul className="-mx-1 flex flex-col">
          {items.map(({ finding, tx }, idx) => (
            <li
              key={finding.transactionId}
              className={`flex items-center gap-3 px-1 py-2 ${idx < items.length - 1 ? "border-b border-[var(--border-subtle)]" : ""}`}
              style={{ boxShadow: `inset 3px 0 0 0 ${RISK_COLOR[finding.risk]}` }}
            >
              <div className="min-w-0 flex-1 pl-2">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[13px] font-medium text-tprimary">
                    {tx!.vendor}
                  </span>
                  <span className="num shrink-0 text-[11px] text-tmuted">
                    {tx!.invoiceNumber}
                  </span>
                </div>
                <p className="truncate text-[11px] text-tmuted">
                  {t(finding.reasons[0] as TranslationKey)}
                </p>
              </div>
              <RiskBadge risk={finding.risk} withIcon={false} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
