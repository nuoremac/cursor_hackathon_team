"use client";

import { useEffect, useState } from "react";
import { IconWand, IconSparkles, IconLoader2, IconCircleCheck } from "@tabler/icons-react";
import { useApp } from "@/context/AppContext";
import type { TranslationKey } from "@/lib/i18n";
import { formatCurrency, formatDate } from "@/lib/format";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { ReasonChip } from "@/components/ui/ReasonChip";
import { SkeletonLines } from "@/components/ui/Skeleton";
import { RISK_COLOR } from "@/lib/risk";

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 } as const;

export function AiReviewSection() {
  const {
    findings,
    auditRun,
    transactionFor,
    explainFinding,
    aiLoadingIds,
    runAuditAction,
    transactions,
    locale,
    t,
  } = useApp();

  const ordered = [...findings].sort(
    (a, b) => SEVERITY_ORDER[a.risk] - SEVERITY_ORDER[b.risk],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (ordered.length > 0 && (selectedId === null || !ordered.some((f) => f.transactionId === selectedId))) {
      setSelectedId(ordered[0].transactionId);
    }
  }, [ordered, selectedId]);

  if (!auditRun || ordered.length === 0) {
    return (
      <EmptyState
        icon={<IconWand size={40} stroke={1.4} />}
        title={t("ai.empty.title")}
        action={
          <Button
            variant="primary"
            size="sm"
            disabled={transactions.length === 0}
            onClick={runAuditAction}
          >
            {t("empty.runAudit")}
          </Button>
        }
      />
    );
  }

  const selected = ordered.find((f) => f.transactionId === selectedId) ?? ordered[0];
  const selectedTx = transactionFor(selected.transactionId);
  const loading = aiLoadingIds.has(selected.transactionId);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Left — findings list */}
      <aside className="rounded-[10px] border border-[var(--border)] bg-surface lg:col-span-1">
        <header className="border-b border-[var(--border)] px-4 py-3">
          <h2 className="text-[13px] font-medium text-tprimary">{t("ai.findings")}</h2>
        </header>
        <ul className="max-h-[60vh] overflow-y-auto p-2">
          {ordered.map((f) => {
            const tx = transactionFor(f.transactionId);
            const active = f.transactionId === selected.transactionId;
            return (
              <li key={f.transactionId}>
                <button
                  type="button"
                  onClick={() => setSelectedId(f.transactionId)}
                  className={`mb-1 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left transition-colors ${
                    active ? "bg-accent-soft" : "hover:bg-surface-2"
                  }`}
                  style={{ boxShadow: `inset 3px 0 0 0 ${RISK_COLOR[f.risk]}` }}
                >
                  <div className="min-w-0 flex-1 pl-1.5">
                    <p className="truncate text-[13px] font-medium text-tprimary">
                      {tx?.vendor ?? f.transactionId}
                    </p>
                    <p className="num truncate text-[11px] text-tmuted">
                      {tx?.invoiceNumber}
                    </p>
                  </div>
                  {f.aiExplanation ? (
                    <IconCircleCheck size={15} className="text-[var(--success)]" aria-label={t("ai.reviewed")} />
                  ) : aiLoadingIds.has(f.transactionId) ? (
                    <IconLoader2 size={15} className="animate-spin text-tmuted" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Right — detail */}
      <section className="rounded-[10px] border border-[var(--border)] bg-surface p-5 lg:col-span-2">
        {selectedTx ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <RiskBadge risk={selected.risk} />
                <span className="num text-[11px] text-tmuted">{selectedTx.id}</span>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={
                  loading ? (
                    <IconLoader2 size={14} className="animate-spin" />
                  ) : (
                    <IconSparkles size={14} stroke={1.85} />
                  )
                }
                disabled={loading || Boolean(selected.aiExplanation)}
                onClick={() => void explainFinding(selected.transactionId)}
              >
                {loading ? t("report.explaining") : t("ai.generate")}
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="text-[18px] font-medium text-tprimary">{selectedTx.vendor}</h3>
              <span className="num text-[12px] text-tsecondary">{selectedTx.invoiceNumber}</span>
              <span className="text-tmuted">·</span>
              <span className="text-[12px] text-tsecondary">
                {formatDate(selectedTx.date, locale)}
              </span>
            </div>

            <p
              className="num mt-2 text-[20px] font-medium"
              style={{ color: RISK_COLOR[selected.risk] }}
            >
              {formatCurrency(selectedTx.amount, locale)}
            </p>

            <div className="mt-4">
              <p className="col-label mb-1.5">{t("report.detectedIssues")}</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.reasons.map((r) => (
                  <ReasonChip key={r} label={t(r as TranslationKey)} />
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="col-label mb-1">{t("report.recommendedAction")}</p>
              <p className="text-[14px] leading-relaxed text-tprimary">
                {t(selected.recommendation as TranslationKey)}
              </p>
            </div>

            <div
              className="fade-up mt-5 rounded-md border-l-[3px] border-accent bg-accent-soft p-4"
              style={{ borderRadius: "0 6px 6px 0" }}
            >
              <div className="mb-2 flex items-center gap-1.5">
                <IconSparkles size={14} className="text-accent" aria-hidden />
                <span className="text-[11px] font-medium uppercase tracking-wide text-accent">
                  {t("report.aiExplanation")}
                </span>
              </div>
              {loading ? (
                <SkeletonLines />
              ) : selected.aiExplanation ? (
                <p className="text-[13px] leading-[1.7] text-tprimary">
                  {selected.aiExplanation}
                </p>
              ) : (
                <p className="text-[13px] text-tmuted">{t("ai.selectFinding")}</p>
              )}
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
