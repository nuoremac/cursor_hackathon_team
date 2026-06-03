export type RiskLevel = "low" | "medium" | "high";

export type Transaction = {
  id: string;
  date: string; // "YYYY-MM-DD"
  accountCode: string;
  description: string;
  vendor: string;
  invoiceNumber: string;
  debit: number;
  credit: number;
  amount: number;
};

export type AuditFinding = {
  transactionId: string;
  risk: RiskLevel;
  reasons: string[];
  recommendation: string;
  aiExplanation?: string;
};

export type DashboardMetrics = {
  totalTransactions: number;
  totalDebit: number;
  totalCredit: number;
  balanceGap: number;
  suspiciousCount: number;
  highRiskCount: number;
};

export type AppState =
  | "NO_DATA"
  | "DATA_LOADED"
  | "AUDIT_COMPLETE"
  | "AI_LOADING";

export type SectionId =
  | "dashboard"
  | "transactions"
  | "report"
  | "ai-review";

export type Locale = "fr" | "en";

export type Theme = "light" | "dark";
