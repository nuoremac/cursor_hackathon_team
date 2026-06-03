/**
 * Règle : Doublon de numéro de facture  ->  risque ÉLEVÉ
 * -----------------------------------------------------------------------------
 * Un même numéro de facture apparaissant plusieurs fois est un signal classique
 * de double paiement (fraude ou erreur de saisie).
 *
 * Décision (voir DECISIONS.md) : les numéros de facture VIDES sont ignorés —
 * on ne traite pas "pas de facture" comme un doublon les uns des autres.
 */

import type { TransactionRule } from "@/lib/rules/rule";

export const duplicateInvoiceRule: TransactionRule = {
  id: "duplicate-invoice",
  description: "Numéro de facture apparaissant plus d'une fois dans le fichier.",

  evaluate(tx, ctx) {
    const invoice = tx.invoiceNumber.trim();
    if (invoice === "") return null; // facture absente => non concerné par cette règle

    const occurrences = ctx.invoiceCounts.get(invoice) ?? 0;
    if (occurrences > 1) {
      return {
        risk: "high",
        reason: `Numéro de facture en doublon (${invoice} apparaît ${occurrences} fois).`,
      };
    }
    return null;
  },
};
