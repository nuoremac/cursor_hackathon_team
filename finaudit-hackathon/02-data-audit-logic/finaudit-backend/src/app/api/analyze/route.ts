/**
 * POST /api/analyze
 * -----------------------------------------------------------------------------
 * Reçoit un CSV en multipart/form-data (champ `file`), le parse et l'audite.
 * Renvoie : { findings, metrics }  (les transactions sources ne sont PAS
 * renvoyées ici — le client possède déjà le fichier qu'il a uploadé).
 *
 * Codes de retour :
 *   200 - audit réussi
 *   400 - fichier manquant, vide, ou CSV illisible
 */

import type { NextRequest } from "next/server";
import { runAudit } from "@/lib/auditEngine";
import { jsonWithCors, preflight } from "@/lib/cors";
import { parseCsv } from "@/lib/csvParser";
import type { AuditResult } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    // Validation : on attend bien un fichier sous la clé "file".
    if (!file || typeof file === "string") {
      return jsonWithCors(
        { error: "Aucun fichier 'file' fourni dans le formulaire." },
        origin,
        400,
      );
    }

    const content = await file.text();
    if (content.trim() === "") {
      return jsonWithCors({ error: "Le fichier CSV est vide." }, origin, 400);
    }

    const transactions = parseCsv(content);
    const result: AuditResult = runAudit(transactions);

    return jsonWithCors(result, origin);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur de traitement du CSV.";
    return jsonWithCors({ error: message }, origin, 400);
  }
}

export function OPTIONS(request: NextRequest) {
  return preflight(request.headers.get("origin"));
}
