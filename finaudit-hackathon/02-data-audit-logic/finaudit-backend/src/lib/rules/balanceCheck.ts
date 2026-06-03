/**
 * Règle GLOBALE : Déséquilibre débit / crédit  ->  risque ÉLEVÉ
 * -----------------------------------------------------------------------------
 * Contrairement aux autres règles, celle-ci ne porte pas sur une transaction
 * isolée mais sur l'ENSEMBLE du fichier : en comptabilité en partie double, la
 * somme des débits doit égaler la somme des crédits.
 *
 * Décision (voir DECISIONS.md) : le déséquilibre est représenté par un finding
 * unique dont `transactionId === "GLOBAL"`. Une tolérance d'arrondi
 * (BALANCE_EPSILON) évite les faux positifs dus aux flottants.
 */

import { BALANCE_EPSILON } from "@/lib/constants";
import type { RuleContext } from "@/lib/rules/rule";
import type { AuditFinding } from "@/lib/types";

/** Identifiant réservé au finding de contrôle global. */
export const GLOBAL_FINDING_ID = "GLOBAL";

/**
 * Évalue l'équilibre global du fichier.
 * @returns un `AuditFinding` "GLOBAL" si déséquilibre, sinon `null`.
 */
export function evaluateBalance(ctx: RuleContext): AuditFinding | null {
  const diff = ctx.totalDebit - ctx.totalCredit;

  if (Math.abs(diff) > BALANCE_EPSILON) {
    return {
      transactionId: GLOBAL_FINDING_ID,
      risk: "high",
      reasons: [
        `Déséquilibre débit/crédit global : total débit (${ctx.totalDebit}) ` +
          `≠ total crédit (${ctx.totalCredit}), écart de ${diff}.`,
      ],
      recommendation:
        "Rapprocher les écritures pour identifier la ou les lignes responsables " +
        "du déséquilibre et rétablir l'équilibre comptable.",
    };
  }
  return null;
}
