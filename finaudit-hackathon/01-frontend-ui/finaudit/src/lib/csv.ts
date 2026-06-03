import type { Transaction } from "./types";

export type CsvParseResult = {
  transactions: Transaction[];
  errors: string[];
};

const HEADER_ALIASES: Record<keyof Transaction, string[]> = {
  id: ["id"],
  date: ["date"],
  accountCode: ["accountcode", "account", "compte", "account_code"],
  description: ["description", "libelle", "libellé"],
  vendor: ["vendor", "fournisseur", "supplier"],
  invoiceNumber: ["invoicenumber", "invoice", "facture", "invoice_number"],
  debit: ["debit", "débit"],
  credit: ["credit", "crédit"],
  amount: ["amount", "montant"],
};

/** Split a single CSV line honouring double-quoted fields. */
function splitLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  out.push(current);
  return out.map((c) => c.trim());
}

function toNumber(raw: string): number {
  if (!raw) return 0;
  // Strip spaces / non-breaking spaces (FR grouping) but keep sign and dot.
  const cleaned = raw.replace(/[\s\u00A0]/g, "").replace(/,/g, ".");
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : 0;
}

/**
 * Parse a CSV string into typed Transactions.
 * Expected headers (case-insensitive, aliases supported):
 * date, accountCode, description, vendor, invoiceNumber, debit, credit, amount
 */
export function parseCsv(text: string): CsvParseResult {
  const errors: string[] = [];
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return { transactions: [], errors: ["CSV is empty or missing rows."] };
  }

  const headers = splitLine(lines[0]).map((h) => h.toLowerCase());

  const indexFor = (field: keyof Transaction): number => {
    for (const alias of HEADER_ALIASES[field]) {
      const idx = headers.indexOf(alias);
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const idx = {
    date: indexFor("date"),
    accountCode: indexFor("accountCode"),
    description: indexFor("description"),
    vendor: indexFor("vendor"),
    invoiceNumber: indexFor("invoiceNumber"),
    debit: indexFor("debit"),
    credit: indexFor("credit"),
    amount: indexFor("amount"),
  };

  const transactions: Transaction[] = [];

  for (let r = 1; r < lines.length; r += 1) {
    const cells = splitLine(lines[r]);
    const get = (i: number): string => (i >= 0 && i < cells.length ? cells[i] : "");

    const debit = toNumber(get(idx.debit));
    const credit = toNumber(get(idx.credit));
    let amount = toNumber(get(idx.amount));
    if (amount === 0) amount = debit !== 0 ? debit : credit;

    transactions.push({
      id: `csv-${String(r).padStart(3, "0")}`,
      date: get(idx.date),
      accountCode: get(idx.accountCode),
      description: get(idx.description),
      vendor: get(idx.vendor) || "—",
      invoiceNumber: get(idx.invoiceNumber),
      debit,
      credit,
      amount,
    });
  }

  if (transactions.length === 0) {
    errors.push("No transactions could be parsed from the file.");
  }

  return { transactions, errors };
}
