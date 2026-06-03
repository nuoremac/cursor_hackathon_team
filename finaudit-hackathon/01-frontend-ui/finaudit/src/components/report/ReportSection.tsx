"use client";

import { IconRadar2, IconSparkles, IconDownload } from "@tabler/icons-react";
import { useApp } from "@/context/AppContext";
import type { TranslationKey } from "@/lib/i18n";
import { translate } from "@/lib/i18n";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { AnomalyCard } from "./AnomalyCard";

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 } as const;

export function ReportSection() {
  const {
    findings,
    transactions,
    auditRun,
    runAuditAction,
    explainFinding,
    aiLoadingIds,
    locale,
    t,
  } = useApp();

  if (!auditRun) {
    return (
      <EmptyState
        icon={<IconRadar2 size={40} stroke={1.4} />}
        title={t("report.empty.title")}
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

  const ordered = [...findings]
    .sort((a, b) => SEVERITY_ORDER[a.risk] - SEVERITY_ORDER[b.risk])
    .map((f) => ({ finding: f, tx: transactions.find((tx) => tx.id === f.transactionId) }))
    .filter((i): i is { finding: typeof findings[number]; tx: NonNullable<typeof i.tx> } =>
      Boolean(i.tx),
    );

  const explainAll = () => {
    ordered.forEach(({ finding }) => {
      if (!finding.aiExplanation && !aiLoadingIds.has(finding.transactionId)) {
        void explainFinding(finding.transactionId);
      }
    });
  };

  const exportCsv = () => {
    const header = ["transactionId", "vendor", "invoice", "date", "amount", "risk", "reasons", "recommendation"];
    const lines = ordered.map(({ finding, tx }) => {
      const reasons = finding.reasons.map((r) => translate(r as TranslationKey, locale)).join("; ");
      const rec = translate(finding.recommendation as TranslationKey, locale);
      return [
        finding.transactionId,
        tx.vendor,
        tx.invoiceNumber,
        tx.date,
        String(tx.amount),
        finding.risk,
        reasons,
        rec,
      ]
        .map((c) => `"${c.replace(/"/g, '""')}"`)
        .join(",");
    });
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "finaudit-anomalies.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[14px] font-medium text-tprimary">
          {t("report.detected", { count: findings.length })}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={<IconSparkles size={14} stroke={1.85} />}
            onClick={explainAll}
          >
            {t("report.explainAll")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<IconDownload size={14} stroke={1.85} />}
            onClick={exportCsv}
          >
            {t("report.export")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {ordered.map(({ finding, tx }, idx) => (
          <AnomalyCard key={finding.transactionId} transaction={tx} finding={finding} index={idx} />
        ))}
      </div>
    </div>
  );
}
