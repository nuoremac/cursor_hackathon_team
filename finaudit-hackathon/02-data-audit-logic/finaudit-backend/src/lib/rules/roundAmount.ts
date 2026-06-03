/**
 * Règle : Montant rond suspect  ->  risque FAIBLE ou MOYEN
 * -----------------------------------------------------------------------------
 * Les montants "ronds" (divisibles par 100 000) sont sur-représentés dans les
 * écritures fictives ou ajustées manuellement.
 *
 * Décision (voir DECISIONS.md) sur l'ambiguïté "Faible/Moyen" :
 *  - montant rond ET >= ROUND_AMOUNT_MEDIUM_THRESHOLD  -> "medium"
 *  - sinon (petit montant rond)                        -> "low"
 * On ignore le montant 0 (un débit/crédit nul est trivialement "rond").
 */

import {
  ROUND_AMOUNT_DIVISOR,
  ROUND_AMOUNT_MEDIUM_THRESHOLD,
} from "@/lib/constants";
import type { TransactionRule } from "@/lib/rules/rule";

export const roundAmountRule: TransactionRule = {
  id: "round-amount",
  description: `Montant divisible par ${ROUND_AMOUNT_DIVISOR}.`,

  evaluate(tx) {
    const value = Math.abs(tx.amount);
    if (value === 0) return null; // on n'alerte pas sur un montant nul

    if (value % ROUND_AMOUNT_DIVISOR === 0) {
      const risk = value >= ROUND_AMOUNT_MEDIUM_THRESHOLD ? "medium" : "low";
      return {
        risk,
        reason: `Montant rond suspect (${tx.amount}, multiple de ${ROUND_AMOUNT_DIVISOR}).`,
      };
    }
    return null;
  },
};
