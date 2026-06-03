"use client";

import {
  IconList,
  IconTrendingUp,
  IconTrendingDown,
  IconAlertTriangle,
  IconAlertCircle,
  IconScale,
} from "@tabler/icons-react";
import { useApp } from "@/context/AppContext";
import { MetricCard } from "./MetricCard";
import { RiskDistributionChart } from "./RiskDistributionChart";
import { RecentAnomaliesList } from "./RecentAnomaliesList";
import { DebitCreditChart } from "./DebitCreditChart";

export function Dashboard() {
  const { metrics, auditRun, t } = useApp();
  const sub = auditRun ? t("kpi.afterAudit") : t("kpi.updatedNow");
  const riskSub = auditRun ? t("kpi.afterAudit") : t("kpi.runToCompute");

  return (
    <div className="flex flex-col gap-6">
      {/* Row 1 — KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label={t("kpi.totalTransactions")}
          value={metrics.totalTransactions}
          format="number"
          icon={IconList}
          subtext={sub}
        />
        <MetricCard
          label={t("kpi.totalDebit")}
          value={metrics.totalDebit}
          format="currency"
          icon={IconTrendingUp}
          subtext={sub}
        />
        <MetricCard
          label={t("kpi.totalCredit")}
          value={metrics.totalCredit}
          format="currency"
          icon={IconTrendingDown}
          subtext={sub}
        />
        <MetricCard
          label={t("kpi.suspiciousItems")}
          value={metrics.suspiciousCount}
          format="number"
          icon={IconAlertTriangle}
          subtext={riskSub}
          variant={metrics.suspiciousCount > 0 ? "danger" : "default"}
        />
        <MetricCard
          label={t("kpi.highRisk")}
          value={metrics.highRiskCount}
          format="number"
          icon={IconAlertCircle}
          subtext={riskSub}
          variant={metrics.highRiskCount > 0 ? "danger" : "default"}
        />
        <MetricCard
          label={t("kpi.balanceGap")}
          value={metrics.balanceGap}
          format="currency"
          icon={IconScale}
          subtext={sub}
          variant={metrics.balanceGap === 0 ? "success" : "danger"}
        />
      </div>

      {/* Row 2 — distribution + recent anomalies */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RiskDistributionChart />
        </div>
        <div className="lg:col-span-2">
          <RecentAnomaliesList />
        </div>
      </div>

      {/* Row 3 — debit/credit by date */}
      <DebitCreditChart />
    </div>
  );
}
