/**
 * Règle : Code comptable manquant  ->  risque MOYEN
 * -----------------------------------------------------------------------------
 * Une écriture sans code comptable ne peut pas être correctement imputée.
 * Ce n'est pas critique en soi, mais cela nécessite une régularisation.
 */

import type { TransactionRule } from "@/lib/rules/rule";

export const missingAccountCodeRule: TransactionRule = {
  id: "missing-account-code",
  description: "Le code comptable est vide.",

  evaluate(tx) {
    if (tx.accountCode.trim() === "") {
      return {
        risk: "medium",
        reason: "Code comptable manquant : l'écriture n'est pas imputée.",
      };
    }
    return null;
  },
};
