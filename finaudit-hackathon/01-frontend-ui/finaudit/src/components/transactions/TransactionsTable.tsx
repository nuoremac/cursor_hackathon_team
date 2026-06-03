"use client";

import { useApp } from "@/context/AppContext";
import type { AuditFinding, Transaction } from "@/lib/types";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { RISK_ROW_CLASS } from "@/lib/risk";

type TransactionsTableProps = {
  transactions: Transaction[];
  findingFor: (id: string) => AuditFinding | undefined;
  auditRun: boolean;
};

export function TransactionsTable({
  transactions,
  findingFor,
  auditRun,
}: TransactionsTableProps) {
  const { locale, t } = useApp();

  return (
    <div className="overflow-x-auto rounded-[10px] border border-[var(--border)] bg-surface">
      <table className="w-full min-w-[920px] border-collapse text-left">
        <thead className="sticky top-0 z-10">
          <tr className="bg-surface-2">
            <Th className="w-[92px]">{t("tx.col.date")}</Th>
            <Th className="w-[72px]">{t("tx.col.account")}</Th>
            <Th className="w-[140px]">{t("tx.col.vendor")}</Th>
            <Th className="w-[92px]">{t("tx.col.invoice")}</Th>
            <Th>{t("tx.col.description")}</Th>
            <Th className="w-[110px] text-right">{t("tx.col.debit")}</Th>
            <Th className="w-[110px] text-right">{t("tx.col.credit")}</Th>
            <Th className="w-[120px] text-right">{t("tx.col.amount")}</Th>
            <Th className="w-[96px]">{t("tx.col.risk")}</Th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const finding = auditRun ? findingFor(tx.id) : undefined;
            const rowClass = finding ? RISK_ROW_CLASS[finding.risk] : "";
            return (
              <tr
                key={tx.id}
                className={`border-b border-[var(--border-subtle)] transition-colors duration-100 last:border-0 ${
                  rowClass || "hover:bg-surface-2"
                }`}
              >
                <Td className="text-tsecondary">{formatDate(tx.date, locale)}</Td>
                <Td className="num text-tsecondary">{tx.accountCode || "—"}</Td>
                <Td className="font-medium text-tprimary">{tx.vendor}</Td>
                <Td className="num text-tsecondary">{tx.invoiceNumber}</Td>
                <Td className="max-w-[1px] truncate text-tsecondary" title={tx.description}>
                  {tx.description}
                </Td>
                <Td className="num text-right text-tsecondary">
                  {tx.debit !== 0 ? formatNumber(tx.debit, locale) : "—"}
                </Td>
                <Td className="num text-right text-tsecondary">
                  {tx.credit !== 0 ? formatNumber(tx.credit, locale) : "—"}
                </Td>
                <Td className="num text-right font-medium text-tprimary">
                  {formatCurrency(tx.amount, locale)}
                </Td>
                <Td>
                  <RiskBadge risk={finding ? finding.risk : "normal"} withIcon={false} />
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={`col-label border-b border-[var(--border)] px-3.5 py-2.5 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <td className={`px-3.5 py-2.5 text-[12px] ${className}`} title={title}>
      {children}
    </td>
  );
}
