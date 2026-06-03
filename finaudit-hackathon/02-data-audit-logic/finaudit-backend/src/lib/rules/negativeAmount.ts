/**
 * Règle : Montant négatif  ->  risque ÉLEVÉ
 * -----------------------------------------------------------------------------
 * Un montant négatif sur une écriture est anormal (souvent une contre-passation
 * mal saisie ou une manipulation). On le signale systématiquement.
 */

import type { TransactionRule } from "@/lib/rules/rule";

export const negativeAmountRule: TransactionRule = {
  id: "negative-amount",
  description: "Le montant de la ligne est strictement négatif.",

  evaluate(tx) {
    if (tx.amount < 0) {
      return {
        risk: "high",
        reason: `Montant négatif détecté (${tx.amount}).`,
      };
    }
    return null;
  },
};
