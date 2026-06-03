/**
 * demoData.ts
 * -----------------------------------------------------------------------------
 * Charge le CSV de démonstration livré avec le backend.
 *
 * Le fichier vit dans `src/data/demo-transactions.csv` (chemin standard décidé
 * pour ce projet). On le lit sur le disque au moment de la requête plutôt que de
 * l'importer, ce qui le garde lisible/éditable sans rebuild — pratique en démo.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseCsv } from "@/lib/csvParser";
import type { Transaction } from "@/lib/types";

/** Chemin absolu du CSV de démo, résolu depuis la racine du projet. */
const DEMO_CSV_PATH = join(
  process.cwd(),
  "src",
  "data",
  "demo-transactions.csv",
);

/** Lit et parse le CSV de démo en transactions normalisées. */
export function loadDemoTransactions(): Transaction[] {
  const content = readFileSync(DEMO_CSV_PATH, "utf-8");
  return parseCsv(content);
}
