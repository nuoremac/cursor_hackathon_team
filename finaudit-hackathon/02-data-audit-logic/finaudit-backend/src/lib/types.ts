/**
 * types.ts
 * -----------------------------------------------------------------------------
 * Contrats de données partagés par tout le backend FinAudit.
 *
 * Ces types sont la "source de vérité" de l'API : ils décrivent ce que renvoient
 * les endpoints /api/analyze et /api/demo-data. Le frontend (Personne 1) et le
 * service IA (Personne 3) s'appuient dessus, donc on les garde stables et
 * explicites.
 */

/** Niveau de risque d'une anomalie, du moins au plus critique. */
export type RiskLevel = "low" | "medium" | "high";

/**
 * Une ligne comptable normalisée, telle qu'utilisée par le moteur d'audit.
 *
 * Les champs numériques (`debit`, `credit`, `amount`) sont toujours des `number`
 * après parsing : le CSV brut ne contient que du texte, la normalisation est
 * faite dans `csvParser.ts`.
 */
export interface Transaction {
  /** Identifiant interne stable (généré au parsing, ex. "TX-0001"). */
  id: string;
  /** Date de l'écriture au format ISO "YYYY-MM-DD". */
  date: string;
  /** Code comptable (ex. "601"). Peut être vide => anomalie potentielle. */
  accountCode: string;
  /** Libellé lisible de l'opération. */
  description: string;
  /** Nom du fournisseur / tiers. */
  vendor: string;
  /** Numéro de facture (ex. "INV-001"). Sert à détecter les doublons. */
  invoiceNumber: string;
  /** Montant au débit (>= 0 en données normales). */
  debit: number;
  /** Montant au crédit (>= 0 en données normales). */
  credit: number;
  /** Montant de référence de la ligne (utilisé par les règles de seuil). */
  amount: number;
}

/**
 * Résultat de détection pour UNE transaction (ou pour le contrôle global).
 *
 * Une même transaction peut déclencher plusieurs règles : dans ce cas les
 * `reasons` sont cumulées et `risk` correspond au niveau le plus élevé observé.
 *
 * Cas particulier : le déséquilibre débit/crédit est un contrôle GLOBAL sur tout
 * le fichier. Il est représenté par un finding unique dont
 * `transactionId === "GLOBAL"`.
 */
export interface AuditFinding {
  /** Id de la transaction concernée, ou "GLOBAL" pour un contrôle d'ensemble. */
  transactionId: string;
  /** Niveau de risque retenu (le maximum parmi les règles déclenchées). */
  risk: RiskLevel;
  /** Liste lisible des raisons de détection (une entrée par règle déclenchée). */
  reasons: string[];
  /** Action recommandée à l'auditeur, dérivée du niveau de risque. */
  recommendation: string;
  /** Explication enrichie par l'IA (remplie plus tard par la Personne 3). */
  aiExplanation?: string;
}

/**
 * Indicateurs agrégés affichés sur le tableau de bord.
 *
 * Convention importante (voir DECISIONS.md) :
 * - `suspiciousCount` compte les TRANSACTIONS suspectes (hors finding "GLOBAL").
 * - `highCount` / `mediumCount` / `lowCount` comptent TOUS les findings par
 *   niveau de risque, y compris le finding global. Leur somme = nombre total de
 *   findings.
 */
export interface AuditMetrics {
  totalTransactions: number;
  totalDebit: number;
  totalCredit: number;
  /** Écart débit - crédit (signé). Zéro = comptes équilibrés. */
  balanceDiff: number;
  suspiciousCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

/**
 * Objet de retour unique de `runAudit`.
 *
 * Tous les endpoints réutilisent cette forme. `/api/demo-data` y ajoute en plus
 * la liste `transactions` (voir `DemoDataResponse`).
 */
export interface AuditResult {
  findings: AuditFinding[];
  metrics: AuditMetrics;
}

/** Réponse de `/api/demo-data` : l'audit + les transactions sources. */
export interface DemoDataResponse extends AuditResult {
  transactions: Transaction[];
}
