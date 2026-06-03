import type { Locale } from "./types";

const en = {
  // App / brand (note: the app name itself is a non-translatable constant
  // exposed via APP_NAME in lib/constants.ts — do not add it here.)
  "app.tagline": "Audit Assistant",

  // Landing page
  "landing.badge": "AI-powered audit assistant",
  "landing.kicker": "AI accounting audit",
  "landing.titleLine1": "Accounting Anomaly Detector",
  "landing.titleLine2": "",
  "landing.subtitle":
    "FinAudit analyses your accounting entries, highlights anomalies and tells the auditor exactly what to check.",
  "landing.start": "Get started",
  "landing.note": "No account required — instant access to the dashboard.",
  "landing.feature1.title": "Anomaly detection",
  "landing.feature1.text":
    "Automatically flag duplicates, negative amounts and suspicious entries.",
  "landing.feature2.title": "AI explanations",
  "landing.feature2.text": "Understand each risk and the action to take, in one click.",
  "landing.feature3.title": "Clear dashboard",
  "landing.feature3.text":
    "Key metrics, risk distribution and a complete audit report.",
  "landing.footer": "Audit Assistant",

  // Sidebar nav
  "nav.dashboard": "Dashboard",
  "nav.transactions": "Transactions",
  "nav.report": "Anomaly Report",
  "nav.aiReview": "AI Review",
  "nav.settings": "Settings",
  "nav.comingSoon": "Coming soon",
  "nav.logout": "Log out",
  "nav.home": "Home",
  "nav.collapse": "Collapse sidebar",
  "nav.expand": "Expand sidebar",

  // Top bar
  "topbar.toggleTheme": "Toggle theme",
  "topbar.notifications": "Notifications",
  "topbar.language": "Language",

  // Section titles
  "section.dashboard": "Dashboard",
  "section.transactions": "Transactions",
  "section.report": "Anomaly Report",
  "section.aiReview": "AI Review",

  // Top actions
  "actions.loadDemo": "Load Demo Data",
  "actions.uploadCsv": "Upload CSV",
  "actions.runAudit": "Run Audit",
  "actions.rerunAudit": "Re-run Audit",
  "actions.auditing": "Auditing…",

  // Status text
  "status.noData": "No data loaded",
  "status.loaded": "{count} transactions loaded",
  "status.auditComplete": "Audit complete — {count} anomalies found",

  // KPI cards
  "kpi.totalTransactions": "Total transactions",
  "kpi.totalDebit": "Total debit",
  "kpi.totalCredit": "Total credit",
  "kpi.suspiciousItems": "Suspicious items",
  "kpi.highRisk": "High risk",
  "kpi.balanceGap": "Balance gap",
  "kpi.updatedNow": "Updated now",
  "kpi.afterAudit": "After last audit run",
  "kpi.runToCompute": "Run audit to compute",

  // Dashboard
  "dash.riskDistribution": "Risk distribution",
  "dash.basedOnAudit": "Based on last audit",
  "dash.runToSeeDistribution": "Run audit to see distribution",
  "dash.recentAnomalies": "Recent anomalies",
  "dash.viewReport": "View report",
  "dash.noAnomaliesYet": "No anomalies yet. Run the audit.",
  "dash.debitCreditByDate": "Debit / credit by date",
  "dash.transactions": "transactions",

  // Risk
  "risk.high": "High risk",
  "risk.medium": "Medium risk",
  "risk.low": "Low risk",
  "risk.normal": "Normal",
  "risk.highShort": "High",
  "risk.mediumShort": "Medium",
  "risk.lowShort": "Low",
  "risk.normalShort": "Normal",
  "risk.ariaHigh": "High risk transaction",
  "risk.ariaMedium": "Medium risk transaction",
  "risk.ariaLow": "Low risk transaction",
  "risk.ariaNormal": "Normal transaction",

  // Transactions
  "tx.filter.all": "All",
  "tx.filter.normal": "Normal",
  "tx.filter.suspicious": "Suspicious",
  "tx.filter.highRisk": "High Risk",
  "tx.search": "Search vendor, invoice…",
  "tx.col.date": "Date",
  "tx.col.account": "Account",
  "tx.col.vendor": "Vendor",
  "tx.col.invoice": "Invoice",
  "tx.col.description": "Description",
  "tx.col.debit": "Debit",
  "tx.col.credit": "Credit",
  "tx.col.amount": "Amount",
  "tx.col.risk": "Risk",
  "tx.empty.title": "No transactions loaded",
  "tx.empty.subtitle": "Click Load Demo Data to begin",
  "tx.noMatch": "No transactions match your filters",
  "tx.showing": "Showing {from}–{to} of {total} transactions",
  "tx.previous": "Previous",
  "tx.next": "Next",
  "tx.perPage": "per page",

  // Report
  "report.detected": "{count} anomalies detected",
  "report.runToGenerate": "Run audit to generate report",
  "report.explainAll": "Explain all with AI",
  "report.export": "Export",
  "report.empty.title": "Run the audit to generate anomaly findings",
  "report.detectedIssues": "Detected issues",
  "report.recommendedAction": "Recommended action",
  "report.explainWithAi": "Explain with AI",
  "report.explaining": "Explaining…",
  "report.aiExplanation": "AI explanation",
  "report.transaction": "Transaction",

  // AI Review
  "ai.empty.title": "Run the audit to start the AI review",
  "ai.selectFinding": "Select a finding to review",
  "ai.findings": "Findings",
  "ai.generate": "Generate AI explanation",
  "ai.reviewed": "Reviewed",
  "ai.pending": "Pending",

  // Empty / generic
  "empty.runAudit": "Run Audit",
  "empty.loadDemo": "Load Demo Data",

  // Settings (placeholder)
  "settings.title": "Settings",
  "settings.theme": "Theme",
  "settings.language": "Language",
  "settings.light": "Light",
  "settings.dark": "Dark",

  // Reasons (audit rule labels)
  "reason.duplicateInvoice": "Duplicate invoice number",
  "reason.negativeAmount": "Negative posting amount",
  "reason.largeRoundAmount": "Large round-number amount",
  "reason.missingAccount": "Missing account code",
  "reason.unknownVendor": "Unknown / unverified vendor",
  "reason.rareVendor": "Rare or first-seen vendor",
  "reason.weekendEntry": "Posted on a weekend",
  "reason.roundAmount": "Suspiciously round amount",

  // Recommendations
  "rec.duplicateInvoice":
    "Verify against the supplier ledger — this invoice number was posted more than once and may be a double payment.",
  "rec.negativeAmount":
    "Review the journal entry justification and supporting documents for this negative posting.",
  "rec.largeRoundAmount":
    "Request the original invoice and confirm the rounded amount matches contractual terms.",
  "rec.missingAccount":
    "Assign a valid account code and confirm the correct expense classification.",
  "rec.unknownVendor":
    "Validate the vendor in the master file and confirm the supplier exists before payment.",
  "rec.rareVendor":
    "Confirm onboarding and bank details for this rarely used vendor.",
  "rec.weekendEntry":
    "Check the authorization trail — postings outside business days warrant extra scrutiny.",
  "rec.roundAmount":
    "Cross-check the round figure against the quote or purchase order.",
} as const;

export type TranslationKey = keyof typeof en;

type Dictionary = Record<TranslationKey, string>;

const fr: Dictionary = {
  "app.tagline": "Assistant d'audit",

  "landing.badge": "Assistant d'audit propulsé par l'IA",
  "landing.kicker": "Audit comptable par IA",
  "landing.titleLine1": "Détecteur d'Anomalies Comptables",
  "landing.titleLine2": "",
  "landing.subtitle":
    "FinAudit analyse vos écritures comptables, met en évidence les anomalies et explique à l'auditeur ce qu'il faut vérifier.",
  "landing.start": "Commencer",
  "landing.note": "Aucun compte requis — accès immédiat au tableau de bord.",
  "landing.feature1.title": "Détection d'anomalies",
  "landing.feature1.text":
    "Repérez automatiquement doublons, montants négatifs et écritures suspectes.",
  "landing.feature2.title": "Explications par IA",
  "landing.feature2.text": "Comprenez chaque risque et l'action à mener, en un clic.",
  "landing.feature3.title": "Tableau de bord clair",
  "landing.feature3.text":
    "Indicateurs clés, répartition des risques et rapport d'audit complet.",
  "landing.footer": "Assistant d'audit",

  "nav.dashboard": "Tableau de bord",
  "nav.transactions": "Transactions",
  "nav.report": "Rapport d'anomalies",
  "nav.aiReview": "Revue IA",
  "nav.settings": "Paramètres",
  "nav.comingSoon": "Bientôt disponible",
  "nav.logout": "Déconnexion",
  "nav.home": "Accueil",
  "nav.collapse": "Réduire le menu",
  "nav.expand": "Agrandir le menu",

  "topbar.toggleTheme": "Changer de thème",
  "topbar.notifications": "Notifications",
  "topbar.language": "Langue",

  "section.dashboard": "Tableau de bord",
  "section.transactions": "Transactions",
  "section.report": "Rapport d'anomalies",
  "section.aiReview": "Revue IA",

  "actions.loadDemo": "Charger les données démo",
  "actions.uploadCsv": "Importer un CSV",
  "actions.runAudit": "Lancer l'audit",
  "actions.rerunAudit": "Relancer l'audit",
  "actions.auditing": "Audit en cours…",

  "status.noData": "Aucune donnée chargée",
  "status.loaded": "{count} transactions chargées",
  "status.auditComplete": "Audit terminé — {count} anomalies détectées",

  "kpi.totalTransactions": "Total des transactions",
  "kpi.totalDebit": "Total débit",
  "kpi.totalCredit": "Total crédit",
  "kpi.suspiciousItems": "Éléments suspects",
  "kpi.highRisk": "Risque élevé",
  "kpi.balanceGap": "Écart de balance",
  "kpi.updatedNow": "Mis à jour à l'instant",
  "kpi.afterAudit": "Après le dernier audit",
  "kpi.runToCompute": "Lancez l'audit pour calculer",

  "dash.riskDistribution": "Répartition des risques",
  "dash.basedOnAudit": "Basé sur le dernier audit",
  "dash.runToSeeDistribution": "Lancez l'audit pour voir la répartition",
  "dash.recentAnomalies": "Anomalies récentes",
  "dash.viewReport": "Voir le rapport",
  "dash.noAnomaliesYet": "Aucune anomalie. Lancez l'audit.",
  "dash.debitCreditByDate": "Débit / crédit par date",
  "dash.transactions": "transactions",

  "risk.high": "Risque élevé",
  "risk.medium": "Risque moyen",
  "risk.low": "Risque faible",
  "risk.normal": "Normal",
  "risk.highShort": "Élevé",
  "risk.mediumShort": "Moyen",
  "risk.lowShort": "Faible",
  "risk.normalShort": "Normal",
  "risk.ariaHigh": "Transaction à risque élevé",
  "risk.ariaMedium": "Transaction à risque moyen",
  "risk.ariaLow": "Transaction à risque faible",
  "risk.ariaNormal": "Transaction normale",

  "tx.filter.all": "Toutes",
  "tx.filter.normal": "Normales",
  "tx.filter.suspicious": "Suspectes",
  "tx.filter.highRisk": "Risque élevé",
  "tx.search": "Rechercher fournisseur, facture…",
  "tx.col.date": "Date",
  "tx.col.account": "Compte",
  "tx.col.vendor": "Fournisseur",
  "tx.col.invoice": "Facture",
  "tx.col.description": "Description",
  "tx.col.debit": "Débit",
  "tx.col.credit": "Crédit",
  "tx.col.amount": "Montant",
  "tx.col.risk": "Risque",
  "tx.empty.title": "Aucune transaction chargée",
  "tx.empty.subtitle": "Cliquez sur Charger les données démo pour commencer",
  "tx.noMatch": "Aucune transaction ne correspond à vos filtres",
  "tx.showing": "Affichage {from}–{to} sur {total} transactions",
  "tx.previous": "Précédent",
  "tx.next": "Suivant",
  "tx.perPage": "par page",

  "report.detected": "{count} anomalies détectées",
  "report.runToGenerate": "Lancez l'audit pour générer le rapport",
  "report.explainAll": "Tout expliquer avec l'IA",
  "report.export": "Exporter",
  "report.empty.title": "Lancez l'audit pour générer les constats d'anomalies",
  "report.detectedIssues": "Problèmes détectés",
  "report.recommendedAction": "Action recommandée",
  "report.explainWithAi": "Expliquer avec l'IA",
  "report.explaining": "Explication…",
  "report.aiExplanation": "Explication IA",
  "report.transaction": "Transaction",

  "ai.empty.title": "Lancez l'audit pour démarrer la revue IA",
  "ai.selectFinding": "Sélectionnez un constat à examiner",
  "ai.findings": "Constats",
  "ai.generate": "Générer l'explication IA",
  "ai.reviewed": "Examiné",
  "ai.pending": "En attente",

  "empty.runAudit": "Lancer l'audit",
  "empty.loadDemo": "Charger les données démo",

  "settings.title": "Paramètres",
  "settings.theme": "Thème",
  "settings.language": "Langue",
  "settings.light": "Clair",
  "settings.dark": "Sombre",

  "reason.duplicateInvoice": "Numéro de facture en double",
  "reason.negativeAmount": "Montant comptabilisé négatif",
  "reason.largeRoundAmount": "Montant rond élevé",
  "reason.missingAccount": "Code de compte manquant",
  "reason.unknownVendor": "Fournisseur inconnu / non vérifié",
  "reason.rareVendor": "Fournisseur rare ou nouveau",
  "reason.weekendEntry": "Comptabilisé un week-end",
  "reason.roundAmount": "Montant anormalement rond",

  "rec.duplicateInvoice":
    "Vérifiez le grand livre fournisseur — ce numéro de facture a été comptabilisé plusieurs fois et pourrait être un double paiement.",
  "rec.negativeAmount":
    "Examinez la justification de l'écriture et les pièces justificatives de ce montant négatif.",
  "rec.largeRoundAmount":
    "Demandez la facture originale et confirmez que le montant arrondi correspond aux termes du contrat.",
  "rec.missingAccount":
    "Attribuez un code de compte valide et confirmez la classification de la charge.",
  "rec.unknownVendor":
    "Validez le fournisseur dans le fichier maître et confirmez son existence avant paiement.",
  "rec.rareVendor":
    "Confirmez l'enregistrement et les coordonnées bancaires de ce fournisseur peu utilisé.",
  "rec.weekendEntry":
    "Vérifiez la piste d'autorisation — les écritures hors jours ouvrés méritent une attention accrue.",
  "rec.roundAmount":
    "Recoupez le montant rond avec le devis ou le bon de commande.",
};

const dictionaries: Record<Locale, Dictionary> = { en, fr };

/**
 * Translate a key for a locale, with optional {placeholder} interpolation.
 */
export function translate(
  key: TranslationKey,
  locale: Locale,
  vars?: Record<string, string | number>,
): string {
  const template = dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in vars ? String(vars[name]) : `{${name}}`,
  );
}
