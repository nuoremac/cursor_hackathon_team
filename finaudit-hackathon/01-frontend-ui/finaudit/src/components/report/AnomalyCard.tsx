"use client";

import { IconWand, IconLoader2 } from "@tabler/icons-react";
import { useApp } from "@/context/AppContext";
import type { AuditFinding, Transaction } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n";
import { formatCurrency, formatDate } from "@/lib/format";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { ReasonChip } from "@/components/ui/ReasonChip";
import { RISK_COLOR } from "@/lib/risk";
import { AiExplanationPanel } from "./AiExplanationPanel";

type AnomalyCardProps = {
  transaction: Transaction;
  finding: AuditFinding;
  index: number;
};

export function AnomalyCard({ transaction, finding, index }: AnomalyCardProps) {
  const { locale, t, explainFinding, aiLoadingIds } = useApp();
  const loading = aiLoadingIds.has(finding.transactionId);
  const done = Boolean(finding.aiExplanation);

  return (
    <article
      className="card-in rounded-[10px] border border-[var(--border)] bg-surface p-5"
      style={{
        borderLeft: `4px solid ${RISK_COLOR[finding.risk]}`,
        animationDelay: `${Math.min(index, 8) * 50}ms`,
      }}
    >
      {/* Top row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <RiskBadge risk={finding.risk} />
          <span className="num text-[11px] text-tmuted">
            {t("report.transaction")} · {transaction.id}
          </span>
        </div>
        <button
          type="button"
          onClick={() => void explainFinding(finding.transactionId)}
          disabled={loading || done}
          className="press inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--border)] px-2.5 text-[12px] font-medium text-tsecondary transition-colors hover:bg-surface-2 disabled:opacity-50"
        >
          {loading ? (
            <IconLoader2 size={14} className="animate-spin" />
          ) : (
            <IconWand size={14} stroke={1.85} />
          )}
          {loading ? t("report.explaining") : t("report.explainWithAi")}
        </button>
      </div>

      {/* Vendor / invoice / date */}
      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-[16px] font-medium text-tprimary">{transaction.vendor}</h3>
        <span className="num text-[12px] text-tsecondary">{transaction.invoiceNumber}</span>
        <span className="text-[12px] text-tmuted">·</span>
        <span className="text-[12px] text-tsecondary">
          {formatDate(transaction.date, locale)}
        </span>
      </div>

      {/* Amount */}
      <p
        className="num mt-2 text-[20px] font-medium"
        style={{ color: RISK_COLOR[finding.risk] }}
      >
        {formatCurrency(transaction.amount, locale)}
      </p>

      {/* Reasons */}
      <div className="mt-4">
        <p className="col-label mb-1.5">{t("report.detectedIssues")}</p>
        <div className="flex flex-wrap gap-1.5">
          {finding.reasons.map((reason) => (
            <ReasonChip key={reason} label={t(reason as TranslationKey)} />
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div className="mt-4">
        <p className="col-label mb-1">{t("report.recommendedAction")}</p>
        <p className="text-[14px] leading-relaxed text-tprimary">
          {t(finding.recommendation as TranslationKey)}
        </p>
      </div>

      <AiExplanationPanel loading={loading} explanation={finding.aiExplanation} />
    </article>
  );
}
