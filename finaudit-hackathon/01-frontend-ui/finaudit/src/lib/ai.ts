import type { AuditFinding, Locale, Transaction } from "./types";
import { formatCurrency, formatDate } from "./format";
import { translate, type TranslationKey } from "./i18n";

/**
 * Mock AI explanation. Produces a deterministic, audit-flavoured narrative
 * from the finding + transaction. Async with a small delay so the UI can
 * show its shimmer-loading state. Swap this for a real API call later.
 */
export function generateAiExplanation(
  transaction: Transaction,
  finding: AuditFinding,
  locale: Locale,
): Promise<string> {
  const delay = 900 + Math.random() * 700;
  return new Promise((resolve) => {
    setTimeout(() => resolve(buildExplanation(transaction, finding, locale)), delay);
  });
}

function buildExplanation(
  tx: Transaction,
  finding: AuditFinding,
  locale: Locale,
): string {
  const amount = formatCurrency(Math.abs(tx.amount), locale);
  const date = formatDate(tx.date, locale);
  const reasons = finding.reasons
    .map((r) => translate(r as TranslationKey, locale).toLowerCase())
    .join(", ");

  if (locale === "fr") {
    const lead =
      finding.risk === "high"
        ? "Cette écriture présente un risque élevé et devrait être examinée en priorité."
        : finding.risk === "medium"
          ? "Cette écriture présente un risque modéré et mérite une vérification."
          : "Cette écriture présente un risque faible mais reste à confirmer.";
    return [
      `${lead} L'opération du ${date} concerne ${tx.vendor} pour un montant de ${amount} (facture ${tx.invoiceNumber}).`,
      `Les signaux détectés sont : ${reasons}. Pris ensemble, ils suggèrent que la pièce justificative et l'autorisation doivent être confirmées avant validation.`,
      `Action conseillée pour l'auditeur : ${translate(finding.recommendation as TranslationKey, locale)}`,
    ].join(" ");
  }

  const lead =
    finding.risk === "high"
      ? "This entry is high risk and should be reviewed as a priority."
      : finding.risk === "medium"
        ? "This entry is medium risk and warrants a closer look."
        : "This entry is low risk but should still be confirmed.";
  return [
    `${lead} The ${date} posting involves ${tx.vendor} for ${amount} (invoice ${tx.invoiceNumber}).`,
    `The signals detected are: ${reasons}. Taken together, they suggest the supporting document and approval should be confirmed before sign-off.`,
    `Suggested auditor action: ${translate(finding.recommendation as TranslationKey, locale)}`,
  ].join(" ");
}
