"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApp } from "@/context/AppContext";
import type { Locale } from "@/lib/types";
import { formatCompact, formatCurrency, formatDate } from "@/lib/format";

type Row = { date: string; label: string; debit: number; credit: number };

export function DebitCreditChart() {
  const { transactions, locale, t } = useApp();
  if (transactions.length === 0) return null;

  const byDate = new Map<string, Row>();
  for (const tx of transactions) {
    const row = byDate.get(tx.date) ?? {
      date: tx.date,
      label: formatDate(tx.date, locale),
      debit: 0,
      credit: 0,
    };
    row.debit += Math.max(tx.debit, 0);
    row.credit += Math.max(tx.credit, 0);
    byDate.set(tx.date, row);
  }
  const data = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <section className="rounded-[10px] border border-[var(--border)] bg-surface p-5">
      <header className="mb-3">
        <h2 className="text-[13px] font-medium text-tprimary">
          {t("dash.debitCreditByDate")}
        </h2>
      </header>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barGap={4}>
            <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v: number) => formatCompact(v, locale)}
            />
            <Tooltip
              cursor={{ fill: "var(--border-subtle)", opacity: 0.4 }}
              content={<ChartTooltip locale={locale} debitLabel={t("tx.col.debit")} creditLabel={t("tx.col.credit")} />}
            />
            <Bar dataKey="debit" fill="var(--accent)" radius={[3, 3, 0, 0]} maxBarSize={28} />
            <Bar dataKey="credit" fill="var(--success)" radius={[3, 3, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

type TooltipItem = { dataKey?: string | number; value?: number | string };

type ChartTooltipProps = {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string;
  locale: Locale;
  debitLabel: string;
  creditLabel: string;
};

function ChartTooltip({ active, payload, label, locale, debitLabel, creditLabel }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const debit = Number(payload.find((p) => p.dataKey === "debit")?.value ?? 0);
  const credit = Number(payload.find((p) => p.dataKey === "credit")?.value ?? 0);
  return (
    <div className="rounded-md border border-[var(--border)] bg-surface px-3 py-2 text-[12px] shadow-lg">
      <p className="mb-1 font-medium text-tprimary">{label}</p>
      <p className="flex items-center gap-2 text-tsecondary">
        <span className="h-2 w-2 rounded-sm" style={{ background: "var(--accent)" }} />
        {debitLabel}: <span className="num text-tprimary">{formatCurrency(debit, locale)}</span>
      </p>
      <p className="flex items-center gap-2 text-tsecondary">
        <span className="h-2 w-2 rounded-sm" style={{ background: "var(--success)" }} />
        {creditLabel}: <span className="num text-tprimary">{formatCurrency(credit, locale)}</span>
      </p>
    </div>
  );
}
