/**
 * rule.ts
 * -----------------------------------------------------------------------------
 * Contrat commun à toutes les règles de détection.
 *
 * Deux familles de règles existent :
 *  1. Les règles "par transaction" (`TransactionRule`) : évaluées sur chaque
 *     ligne, avec accès à un contexte global pré-calculé (comptes de doublons,
 *     fréquence des fournisseurs, totaux...).
 *  2. Les règles "globales" (ex. déséquilibre débit/crédit) qui produisent un
 *     finding unique pour tout le fichier. Elles sont gérées à part dans le
 *     moteur d'audit car elles ne ciblent pas une transaction précise.
 */

import type { RiskLevel, Transaction } from "@/lib/types";

/**
 * Contexte partagé, calculé UNE seule fois par audit, puis passé à chaque règle.
 * Évite que chaque règle re-parcoure tout le tableau de transactions.
 */
export interface RuleContext {
  /** Toutes les transactions du fichier (lecture seule). */
  transactions: Transaction[];
  /** invoiceNumber -> nombre d'occurrences (sert à détecter les doublons). */
  invoiceCounts: Map<string, number>;
  /** vendor (normalisé) -> nombre d'occurrences (sert à repérer les rares). */
  vendorCounts: Map<string, number>;
  /** Somme de tous les débits. */
  totalDebit: number;
  /** Somme de tous les crédits. */
  totalCredit: number;
}

/**
 * Ce qu'une règle renvoie lorsqu'elle se déclenche.
 * `null` signifie "aucune anomalie détectée par cette règle".
 */
export interface RuleHit {
  /** Niveau de risque associé à ce déclenchement. */
  risk: RiskLevel;
  /** Raison lisible, destinée à l'auditeur (en français). */
  reason: string;
}

/** Une règle évaluée transaction par transaction. */
export interface TransactionRule {
  /** Identifiant court et stable de la règle (utile pour les logs/tests). */
  id: string;
  /** Description courte du contrôle effectué. */
  description: string;
  /**
   * Évalue une transaction dans son contexte.
   * @returns un `RuleHit` si l'anomalie est détectée, sinon `null`.
   */
  evaluate(tx: Transaction, ctx: RuleContext): RuleHit | null;
}
