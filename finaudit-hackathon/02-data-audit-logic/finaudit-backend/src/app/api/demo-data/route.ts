/**
 * GET /api/demo-data
 * -----------------------------------------------------------------------------
 * Charge le CSV de démo embarqué, l'audite, et renvoie :
 *   { transactions, findings, metrics }
 *
 * Sert de chemin "sans upload" pour la démo : le frontend peut afficher un
 * tableau de bord complet en un seul appel.
 */

import type { NextRequest } from "next/server";
import { runAudit } from "@/lib/auditEngine";
import { jsonWithCors, preflight } from "@/lib/cors";
import { loadDemoTransactions } from "@/lib/demoData";
import type { DemoDataResponse } from "@/lib/types";

// La lecture du CSV se fait sur le disque : on force le rendu dynamique.
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const origin = request.headers.get("origin");

  try {
    const transactions = loadDemoTransactions();
    const { findings, metrics } = runAudit(transactions);

    const payload: DemoDataResponse = { transactions, findings, metrics };
    return jsonWithCors(payload, origin);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue.";
    return jsonWithCors(
      { error: `Impossible de charger les données de démo : ${message}` },
      origin,
      500,
    );
  }
}

export function OPTIONS(request: NextRequest) {
  return preflight(request.headers.get("origin"));
}
