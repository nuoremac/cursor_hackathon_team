/**
 * Règle : Montant très élevé  ->  risque ÉLEVÉ
 * -----------------------------------------------------------------------------
 * Au-delà d'un seuil fixe, un montant mérite une vérification renforcée.
 *
 * Décision (voir DECISIONS.md) : le seuil est STRICT (`> 1 000 000`). Un montant
 * exactement égal à 1 000 000 n'est donc pas signalé par cette règle.
 */

import { LARGE_AMOUNT_THRESHOLD } from "@/lib/constants";
import type { TransactionRule } from "@/lib/rules/rule";

export const largeAmountRule: TransactionRule = {
  id: "large-amount",
  description: `Montant supérieur à ${LARGE_AMOUNT_THRESHOLD}.`,

  evaluate(tx) {
    if (tx.amount > LARGE_AMOUNT_THRESHOLD) {
      return {
        risk: "high",
        reason: `Montant très élevé (${tx.amount} > ${LARGE_AMOUNT_THRESHOLD}).`,
      };
    }
    return null;
  },
};
