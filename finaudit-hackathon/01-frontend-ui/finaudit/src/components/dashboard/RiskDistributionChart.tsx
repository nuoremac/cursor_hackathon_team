"use client";

import { IconRadar2 } from "@tabler/icons-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { useApp } from "@/context/AppContext";
import { computeRiskDistribution } from "@/lib/audit";
import { EmptyState } from "@/components/ui/EmptyState";

type Segment = {
  key: "high" | "medium" | "low" | "normal";
  label: string;
  value: number;
  color: string;
};

export function RiskDistributionChart() {
  const { transactions, findings, auditRun, t } = useApp();
  const dist = computeRiskDistribution(transactions, findings);

  const allSegments: Segment[] = [
    { key: "high", label: t("risk.highShort"), value: dist.high, color: "var(--danger)" },
    { key: "medium", label: t("risk.mediumShort"), value: dist.medium, color: "var(--warning)" },
    { key: "low", label: t("risk.lowShort"), value: dist.low, color: "var(--info)" },
    { key: "normal", label: t("risk.normalShort"), value: dist.normal, color: "var(--success)" },
  ];
  const segments = allSegments.filter((s) => s.value > 0);

  const total = transactions.length;

  return (
    <section className="flex h-full flex-col rounded-[10px] border border-[var(--border)] bg-surface p-5">
      <header className="mb-1">
        <h2 className="text-[13px] font-medium text-tprimary">
          {t("dash.riskDistribution")}
        </h2>
        <p className="text-[11px] text-tmuted">{t("dash.basedOnAudit")}</p>
      </header>

      {!auditRun || segments.length === 0 ? (
        <EmptyState
          icon={<IconRadar2 size={28} stroke={1.5} />}
          title={t("dash.runToSeeDistribution")}
          compact
        />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 pt-2 sm:flex-row sm:gap-6">
          <div className="relative h-[160px] w-[160px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segments}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={52}
                  outerRadius={74}
                  paddingAngle={2}
                  stroke="none"
                  isAnimationActive
                >
                  {segments.map((s) => (
                    <Cell key={s.key} fill={s.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="num text-[22px] font-medium text-tprimary">{total}</span>
              <span className="text-[11px] text-tmuted">{t("dash.transactions")}</span>
            </div>
          </div>

          <ul className="flex flex-col gap-2">
            {segments.map((s) => (
              <li key={s.key} className="flex items-center gap-2 text-[12px]">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: s.color }}
                  aria-hidden
                />
                <span className="text-tsecondary">{s.label}</span>
                <span className="num ml-auto font-medium text-tprimary">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
