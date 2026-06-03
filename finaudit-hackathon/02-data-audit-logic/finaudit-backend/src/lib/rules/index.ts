/**
 * rules/index.ts
 * -----------------------------------------------------------------------------
 * Point d'entrée unique du catalogue de règles.
 *
 * - `transactionRules` : toutes les règles évaluées ligne par ligne. Le moteur
 *   d'audit itère simplement sur ce tableau ; ajouter une règle = créer son
 *   fichier puis l'ajouter ici (aucune autre modification nécessaire).
 * - `evaluateBalance` : la règle globale (déséquilibre), traitée à part car elle
 *   ne cible pas une transaction précise.
 */

import { duplicateInvoiceRule } from "@/lib/rules/duplicateInvoice";
import { largeAmountRule } from "@/lib/rules/largeAmount";
import { missingAccountCodeRule } from "@/lib/rules/missingAccountCode";
import { negativeAmountRule } from "@/lib/rules/negativeAmount";
import { rareVendorRule } from "@/lib/rules/rareVendor";
import { roundAmountRule } from "@/lib/rules/roundAmount";
import { weekendTransactionRule } from "@/lib/rules/weekendTransaction";
import type { TransactionRule } from "@/lib/rules/rule";

/** Les 7 règles "par transaction" (la 8e, l'équilibre, est globale). */
export const transactionRules: TransactionRule[] = [
  duplicateInvoiceRule,
  missingAccountCodeRule,
  negativeAmountRule,
  largeAmountRule,
  weekendTransactionRule,
  roundAmountRule,
  rareVendorRule,
];

export { evaluateBalance, GLOBAL_FINDING_ID } from "@/lib/rules/balanceCheck";
export type { RuleContext, RuleHit, TransactionRule } from "@/lib/rules/rule";
