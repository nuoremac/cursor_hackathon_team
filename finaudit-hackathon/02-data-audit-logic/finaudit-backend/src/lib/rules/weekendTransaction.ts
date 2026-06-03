/**
 * Règle : Transaction passée un week-end  ->  risque MOYEN
 * -----------------------------------------------------------------------------
 * Les écritures comptables passées un samedi ou un dimanche sont inhabituelles
 * et peuvent indiquer une saisie hors processus normal.
 *
 * Décision (voir DECISIONS.md) : la date est interprétée en UTC pour garantir un
 * résultat déterministe, indépendant du fuseau horaire de la machine.
 */

import type { TransactionRule } from "@/lib/rules/rule";

export const weekendTransactionRule: TransactionRule = {
  id: "weekend-transaction",
  description: "Date de transaction tombant un samedi ou un dimanche.",

  evaluate(tx) {
    // On construit la date en UTC explicitement ("YYYY-MM-DD" => minuit UTC).
    const parsed = new Date(`${tx.date}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime())) return null; // date invalide => non évaluable

    const day = parsed.getUTCDay(); // 0 = dimanche, 6 = samedi
    if (day === 0 || day === 6) {
      const label = day === 0 ? "dimanche" : "samedi";
      return {
        risk: "medium",
        reason: `Transaction enregistrée un week-end (${label} ${tx.date}).`,
      };
    }
    return null;
  },
};
