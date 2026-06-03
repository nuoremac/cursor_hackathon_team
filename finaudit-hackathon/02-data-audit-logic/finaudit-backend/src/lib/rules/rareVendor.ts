/**
 * Règle : Fournisseur rare avec montant élevé  ->  risque ÉLEVÉ
 * -----------------------------------------------------------------------------
 * Un fournisseur qui n'apparaît qu'une seule fois ET pour un montant important
 * est un profil à risque (fournisseur fictif, paiement détourné...).
 *
 * Décisions (voir DECISIONS.md) :
 *  - "rare" = le fournisseur apparaît EXACTEMENT 1 fois (vendorCount === 1).
 *  - "montant élevé" = montant >= RARE_VENDOR_AMOUNT_THRESHOLD (seuil dédié,
 *    plus bas que celui de la règle "montant très élevé").
 *  - la comparaison de nom de fournisseur est insensible à la casse / espaces
 *    (le même calcul de clé est utilisé dans le contexte d'audit).
 */

import { RARE_VENDOR_AMOUNT_THRESHOLD } from "@/lib/constants";
import type { TransactionRule } from "@/lib/rules/rule";
import { vendorKey } from "@/lib/rules/vendorKey";

export const rareVendorRule: TransactionRule = {
  id: "rare-vendor",
  description: `Fournisseur vu une seule fois avec un montant >= ${RARE_VENDOR_AMOUNT_THRESHOLD}.`,

  evaluate(tx, ctx) {
    const key = vendorKey(tx.vendor);
    if (key === "") return null; // fournisseur non renseigné => non évaluable

    const occurrences = ctx.vendorCounts.get(key) ?? 0;
    const isRare = occurrences === 1;
    const isLarge = tx.amount >= RARE_VENDOR_AMOUNT_THRESHOLD;

    if (isRare && isLarge) {
      return {
        risk: "high",
        reason: `Fournisseur rare ("${tx.vendor}", vu 1 fois) pour un montant élevé (${tx.amount}).`,
      };
    }
    return null;
  },
};
