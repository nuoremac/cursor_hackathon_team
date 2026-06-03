import type {
  AuditFinding,
  DashboardMetrics,
  RiskLevel,
  Transaction,
} from "./types";
import type { TranslationKey } from "./i18n";
import { isWeekend } from "./format";

/** Vendors considered rare / first-seen for the demo heuristics. */
const RARE_VENDORS = new Set(["newvendorx", "fastservice", "rarevendor"]);

const SEVERITY_RANK: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

type Rule = {
  reasonKey: TranslationKey;
  recommendationKey: TranslationKey;
  severity: RiskLevel;
};

/**
 * Pure, deterministic anomaly detection. Works for both demo data and
 * uploaded CSVs so "Run Audit" behaves identically in every flow.
 */
export function runAudit(transactions: Transaction[]): AuditFinding[] {
  const invoiceCounts = new Map<string, number>();
  for (const tx of transactions) {
    const key = tx.invoiceNumber.trim().toLowerCase();
    if (!key) continue;
    invoiceCounts.set(key, (invoiceCounts.get(key) ?? 0) + 1);
  }

  const findings: AuditFinding[] = [];

  for (const tx of transactions) {
    const rules: Rule[] = [];
    const invoiceKey = tx.invoiceNumber.trim().toLowerCase();

    if (invoiceKey && (invoiceCounts.get(invoiceKey) ?? 0) > 1) {
      rules.push({
        reasonKey: "reason.duplicateInvoice",
        recommendationKey: "rec.duplicateInvoice",
        severity: "high",
      });
    }

    if (tx.amount < 0 || tx.debit < 0 || tx.credit < 0) {
      rules.push({
        reasonKey: "reason.negativeAmount",
        recommendationKey: "rec.negativeAmount",
        severity: "high",
      });
    }

    const absAmount = Math.abs(tx.amount);
    const isRound = absAmount > 0 && absAmount % 500_000 === 0;
    if (isRound && absAmount >= 2_000_000) {
      rules.push({
        reasonKey: "reason.largeRoundAmount",
        recommendationKey: "rec.largeRoundAmount",
        severity: "high",
      });
    } else if (isRound && absAmount >= 1_000_000) {
      rules.push({
        reasonKey: "reason.roundAmount",
        recommendationKey: "rec.roundAmount",
        severity: "low",
      });
    }

    if (!tx.accountCode.trim()) {
      rules.push({
        reasonKey: "reason.missingAccount",
        recommendationKey: "rec.missingAccount",
        severity: "medium",
      });
    }

    const vendorKey = tx.vendor.trim().toLowerCase();
    if (vendorKey.includes("unknown") || vendorKey.includes("inconnu")) {
      rules.push({
        reasonKey: "reason.unknownVendor",
        recommendationKey: "rec.unknownVendor",
        severity: "medium",
      });
    } else if (RARE_VENDORS.has(vendorKey)) {
      rules.push({
        reasonKey: "reason.rareVendor",
        recommendationKey: "rec.rareVendor",
        severity: "medium",
      });
    }

    if (isWeekend(tx.date)) {
      rules.push({
        reasonKey: "reason.weekendEntry",
        recommendationKey: "rec.weekendEntry",
        severity: "medium",
      });
    }

    if (rules.length === 0) continue;

    rules.sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);
    const topRule = rules[0];

    findings.push({
      transactionId: tx.id,
      risk: topRule.severity,
      reasons: rules.map((r) => r.reasonKey),
      recommendation: topRule.recommendationKey,
    });
  }

  return findings;
}

/** Compute dashboard metrics. Findings are optional (pre-audit -> 0 counts). */
export function computeMetrics(
  transactions: Transaction[],
  findings: AuditFinding[] = [],
): DashboardMetrics {
  const totalDebit = transactions.reduce((sum, tx) => sum + tx.debit, 0);
  const totalCredit = transactions.reduce((sum, tx) => sum + tx.credit, 0);

  return {
    totalTransactions: transactions.length,
    totalDebit,
    totalCredit,
    balanceGap: Math.abs(totalDebit - totalCredit),
    suspiciousCount: findings.length,
    highRiskCount: findings.filter((f) => f.risk === "high").length,
  };
}

/** Count of transactions per risk bucket, including normal. */
export type RiskDistribution = {
  high: number;
  medium: number;
  low: number;
  normal: number;
};

export function computeRiskDistribution(
  transactions: Transaction[],
  findings: AuditFinding[],
): RiskDistribution {
  const byId = new Map<string, RiskLevel>();
  for (const f of findings) byId.set(f.transactionId, f.risk);

  const dist: RiskDistribution = { high: 0, medium: 0, low: 0, normal: 0 };
  for (const tx of transactions) {
    const risk = byId.get(tx.id);
    if (risk) dist[risk] += 1;
    else dist.normal += 1;
  }
  return dist;
}
