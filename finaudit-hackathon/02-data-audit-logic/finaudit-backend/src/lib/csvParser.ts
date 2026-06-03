/**
 * csvParser.ts
 * -----------------------------------------------------------------------------
 * Transforme un contenu CSV brut en `Transaction[]` normalisées.
 *
 * On s'appuie sur PapaParse (mode `header: true`) puis on nettoie chaque ligne :
 * trim des chaînes, conversion robuste des nombres, génération d'un `id` stable.
 *
 * Format attendu (en-tête obligatoire) :
 *   date,accountCode,description,vendor,invoiceNumber,debit,credit,amount
 *
 * Décisions (voir DECISIONS.md) :
 *  - Le CSV ne contient pas d'`id` : on en génère un déterministe ("TX-0001"...)
 *    basé sur l'ordre des lignes.
 *  - `amount` est pris tel quel depuis le CSV ; s'il est absent/illisible, on
 *    retombe sur `debit - credit`.
 */

import Papa from "papaparse";
import type { Transaction } from "@/lib/types";

/** Forme brute d'une ligne CSV : toutes les valeurs arrivent en `string`. */
interface RawCsvRow {
  date?: string;
  accountCode?: string;
  description?: string;
  vendor?: string;
  invoiceNumber?: string;
  debit?: string;
  credit?: string;
  amount?: string;
}

/** Convertit une valeur texte en nombre robuste (gère vide, espaces, virgule). */
function toNumber(value: string | undefined): number {
  if (value === undefined) return 0;
  const cleaned = value.trim().replace(/\s/g, "").replace(",", ".");
  if (cleaned === "") return 0;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Nettoie une chaîne (undefined -> ""). */
function toText(value: string | undefined): string {
  return (value ?? "").trim();
}

/** Génère un identifiant déterministe à partir de l'index de ligne (0-based). */
function makeId(index: number): string {
  return `TX-${String(index + 1).padStart(4, "0")}`;
}

/**
 * Parse un contenu CSV (string) en transactions normalisées.
 *
 * @param csvContent Contenu textuel complet du fichier CSV (en-tête inclus).
 * @returns la liste des transactions prêtes à auditer.
 * @throws si le CSV est illisible ou ne contient aucune ligne exploitable.
 */
export function parseCsv(csvContent: string): Transaction[] {
  const result = Papa.parse<RawCsvRow>(csvContent, {
    header: true,
    skipEmptyLines: "greedy", // ignore les lignes totalement vides
    transformHeader: (header) => header.trim(), // tolère les espaces dans l'en-tête
  });

  if (result.errors.length > 0) {
    // On ne bloque pas sur des erreurs mineures de ligne, mais on remonte la 1re
    // erreur "fatale" éventuelle pour aider au debug côté appelant.
    const fatal = result.errors.find((e) => e.type === "Delimiter");
    if (fatal) {
      throw new Error(`CSV illisible : ${fatal.message}`);
    }
  }

  const transactions = result.data
    // On écarte les lignes sans aucune donnée utile (sécurité supplémentaire).
    .filter((row) => Object.values(row).some((v) => toText(v as string) !== ""))
    .map((row, index) => {
      const debit = toNumber(row.debit);
      const credit = toNumber(row.credit);
      const hasAmount = toText(row.amount) !== "";

      const tx: Transaction = {
        id: makeId(index),
        date: toText(row.date),
        accountCode: toText(row.accountCode),
        description: toText(row.description),
        vendor: toText(row.vendor),
        invoiceNumber: toText(row.invoiceNumber),
        debit,
        credit,
        // amount du CSV si présent, sinon dérivé de debit - credit.
        amount: hasAmount ? toNumber(row.amount) : debit - credit,
      };
      return tx;
    });

  if (transactions.length === 0) {
    throw new Error("Aucune transaction exploitable dans le CSV fourni.");
  }

  return transactions;
}
