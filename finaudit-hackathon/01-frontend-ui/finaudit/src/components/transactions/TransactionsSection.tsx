"use client";

import { useMemo, useState } from "react";
import { IconTable, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useApp } from "@/context/AppContext";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { FilterTabs, type TxFilter } from "./FilterTabs";
import { SearchInput } from "./SearchInput";
import { TransactionsTable } from "./TransactionsTable";

const PAGE_SIZES = [10, 20, 50] as const;

export function TransactionsSection() {
  const { transactions, findingFor, auditRun, loadDemoData, t } = useApp();
  const [filter, setFilter] = useState<TxFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number>(20);

  const counts = useMemo(() => {
    const c: Record<TxFilter, number> = { all: transactions.length, normal: 0, suspicious: 0, high: 0 };
    for (const tx of transactions) {
      const f = auditRun ? findingFor(tx.id) : undefined;
      if (!f) c.normal += 1;
      else {
        c.suspicious += 1;
        if (f.risk === "high") c.high += 1;
      }
    }
    return c;
  }, [transactions, findingFor, auditRun]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((tx) => {
      const f = auditRun ? findingFor(tx.id) : undefined;
      if (filter === "normal" && f) return false;
      if (filter === "suspicious" && !f) return false;
      if (filter === "high" && f?.risk !== "high") return false;
      if (q) {
        const haystack = `${tx.vendor} ${tx.invoiceNumber} ${tx.description} ${tx.accountCode}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, findingFor, auditRun, filter, query]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<IconTable size={32} stroke={1.5} />}
        title={t("tx.empty.title")}
        subtitle={t("tx.empty.subtitle")}
        action={
          <Button variant="primary" size="sm" onClick={loadDemoData}>
            {t("empty.loadDemo")}
          </Button>
        }
      />
    );
  }

  const changeFilter = (next: TxFilter) => {
    setFilter(next);
    setPage(0);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <FilterTabs value={filter} onChange={changeFilter} counts={counts} />
        <SearchInput
          value={query}
          onChange={(v) => {
            setQuery(v);
            setPage(0);
          }}
        />
      </div>

      {total === 0 ? (
        <EmptyState
          icon={<IconTable size={28} stroke={1.5} />}
          title={t("tx.noMatch")}
          compact
        />
      ) : (
        <>
          <TransactionsTable
            transactions={pageRows}
            findingFor={findingFor}
            auditRun={auditRun}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] text-tsecondary">
              {t("tx.showing", {
                from: total === 0 ? 0 : start + 1,
                to: Math.min(start + pageSize, total),
                total,
              })}
            </p>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-[12px] text-tsecondary">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(0);
                  }}
                  className="h-8 rounded-md border border-[var(--border)] bg-surface px-2 text-[12px] text-tprimary"
                  aria-label={t("tx.perPage")}
                >
                  {PAGE_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {t("tx.perPage")}
              </label>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={safePage === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  icon={<IconChevronLeft size={14} />}
                >
                  {t("tx.previous")}
                </Button>
                <span className="num px-1 text-[12px] text-tsecondary">
                  {safePage + 1} / {pageCount}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={safePage >= pageCount - 1}
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                  iconRight={<IconChevronRight size={14} />}
                >
                  {t("tx.next")}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
