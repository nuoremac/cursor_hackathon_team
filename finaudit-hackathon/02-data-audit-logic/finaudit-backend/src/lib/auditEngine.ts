/**
 * auditEngine.ts
 * -----------------------------------------------------------------------------
 * Cœur de la détection d'anomalies : la fonction `runAudit`.
 *
 * Pipeline :
 *   1. Construire un CONTEXTE global (comptes de doublons, fréquence des
 *      fournisseurs, totaux débit/crédit) une seule fois.
 *   2. Pour CHAQUE transaction, exécuter toutes les règles "par transaction" ;
 *      cumuler les raisons et retenir le risque le plus élevé.
 *   3. Ajouter le finding GLOBAL si les comptes sont déséquilibrés.
 *   4. Calculer les métriques agrégées du tableau de bord.
 *
 * `runAudit` est PUR (pas d'I/O, pas d'aléatoire) : pour un même tableau de
 * transactions, il renvoie toujours le même résultat — idéal pour les tests et
 * pour une démo fiable.
 */

import {
  evaluateBalance,
  transactionRules,
  type RuleContext,
} from "@/lib/rules";
import { vendorKey } from "@/lib/rules/vendorKey";
import type {
  AuditFinding,
  AuditMetrics,
  AuditResult,
  RiskLevel,
  Transaction,
} from "@/lib/types";

/** Poids ordinal des niveaux de risque, pour calculer un maximum. */
const RISK_RANK: Record<RiskLevel, number> = { low: 1, medium: 2, high: 3 };

/** Recommandation standard associée à un niveau de risque. */
const RECOMMENDATION_BY_RISK: Record<RiskLevel, string> = {
  high: "Vérification prioritaire : contrôler les pièces justificatives et faire valider par un responsable.",
  medium: "À examiner : vérifier la cohérence de l'écriture et la documentation associée.",
  low: "Contrôle de routine recommandé lors de la prochaine revue.",
};

/** Renvoie le niveau de risque le plus élevé d'une liste (au moins un élément). */
function highestRisk(risks: RiskLevel[]): RiskLevel {
  return risks.reduce((max, current) =>
    RISK_RANK[current] > RISK_RANK[max] ? current : max,
  );
}

/**
 * Pré-calcule le contexte partagé par les règles, en un seul passage.
 * Évite à chaque règle de re-parcourir l'ensemble des transactions.
 */
function buildContext(transactions: Transaction[]): RuleContext {
  const invoiceCounts = new Map<string, number>();
  const vendorCounts = new Map<string, number>();
  let totalDebit = 0;
  let totalCredit = 0;

  for (const tx of transactions) {
    totalDebit += tx.debit;
    totalCredit += tx.credit;

    const invoice = tx.invoiceNumber.trim();
    if (invoice !== "") {
      invoiceCounts.set(invoice, (invoiceCounts.get(invoice) ?? 0) + 1);
    }

    const vKey = vendorKey(tx.vendor);
    if (vKey !== "") {
      vendorCounts.set(vKey, (vendorCounts.get(vKey) ?? 0) + 1);
    }
  }

  return { transactions, invoiceCounts, vendorCounts, totalDebit, totalCredit };
}

/**
 * Lance l'audit complet sur un jeu de transactions.
 *
 * @param transactions Les lignes comptables normalisées (issues du parser).
 * @returns `{ findings, metrics }` — l'objet de retour unique de l'audit.
 */
export function runAudit(transactions: Transaction[]): AuditResult {
  const ctx = buildContext(transactions);
  const findings: AuditFinding[] = [];

  // --- 1) Règles par transaction ------------------------------------------
  for (const tx of transactions) {
    const reasons: string[] = [];
    const risks: RiskLevel[] = [];

    for (const rule of transactionRules) {
      const hit = rule.evaluate(tx, ctx);
      if (hit) {
        reasons.push(hit.reason);
        risks.push(hit.risk);
      }
    }

    // Une transaction ne devient un "finding" que si au moins une règle s'est
    // déclenchée. Le risque retenu est le maximum des règles déclenchées.
    if (reasons.length > 0) {
      const risk = highestRisk(risks);
      findings.push({
        transactionId: tx.id,
        risk,
        reasons,
        recommendation: RECOMMENDATION_BY_RISK[risk],
      });
    }
  }

  // --- 2) Règle globale : équilibre débit / crédit -------------------------
  const balanceFinding = evaluateBalance(ctx);
  if (balanceFinding) {
    findings.push(balanceFinding);
  }

  // --- 3) Métriques du tableau de bord -------------------------------------
  const metrics = computeMetrics(transactions, findings, ctx);

  return { findings, metrics };
}

/**
 * Calcule les indicateurs agrégés affichés sur le dashboard.
 *
 * Conventions (voir DECISIONS.md) :
 *  - `suspiciousCount` = nombre de TRANSACTIONS suspectes (on exclut le finding
 *    "GLOBAL" qui ne correspond pas à une ligne).
 *  - `highCount`/`mediumCount`/`lowCount` = répartition de TOUS les findings par
 *    risque (finding GLOBAL inclus). Leur somme = nombre total de findings.
 */
function computeMetrics(
  transactions: Transaction[],
  findings: AuditFinding[],
  ctx: RuleContext,
): AuditMetrics {
  const transactionFindings = findings.filter(
    (f) => f.transactionId !== "GLOBAL",
  );

  const countByRisk = (risk: RiskLevel) =>
    findings.filter((f) => f.risk === risk).length;

  return {
    totalTransactions: transactions.length,
    totalDebit: ctx.totalDebit,
    totalCredit: ctx.totalCredit,
    balanceDiff: ctx.totalDebit - ctx.totalCredit,
    suspiciousCount: transactionFindings.length,
    highCount: countByRisk("high"),
    mediumCount: countByRisk("medium"),
    lowCount: countByRisk("low"),
  };
}
