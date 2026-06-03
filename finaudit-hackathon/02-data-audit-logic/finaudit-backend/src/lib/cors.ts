/**
 * cors.ts
 * -----------------------------------------------------------------------------
 * Petit utilitaire CORS partagé par les routes API.
 *
 * Le frontend (Personne 1) tourne sur http://localhost:3000 et appelle ce
 * backend sur http://localhost:3001 : c'est une origine différente, donc le
 * navigateur exige des en-têtes CORS (et une réponse au pré-vol OPTIONS).
 *
 * En contexte hackathon (localhost uniquement), on reste permissif mais propre :
 * on renvoie l'origine appelante si elle est connue, sinon le frontend par défaut.
 */

import { NextResponse } from "next/server";
import { ALLOWED_ORIGINS } from "@/lib/constants";

/** Construit les en-têtes CORS pour une requête donnée. */
export function corsHeaders(origin: string | null): Record<string, string> {
  const allowed =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

/** Réponse JSON avec en-têtes CORS appliqués (raccourci pour les routes). */
export function jsonWithCors(
  data: unknown,
  origin: string | null,
  status = 200,
): NextResponse {
  return NextResponse.json(data, { status, headers: corsHeaders(origin) });
}

/** Réponse standard au pré-vol CORS (OPTIONS). */
export function preflight(origin: string | null): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}
