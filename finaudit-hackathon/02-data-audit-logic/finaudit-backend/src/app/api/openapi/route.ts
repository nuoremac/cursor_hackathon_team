/**
 * GET /api/openapi
 * -----------------------------------------------------------------------------
 * Sert la spécification OpenAPI au format JSON.
 * Consommée par Swagger UI (/api-docs) et importable dans Postman/Insomnia.
 */

import type { NextRequest } from "next/server";
import { jsonWithCors, preflight } from "@/lib/cors";
import { openApiSpec } from "@/lib/openapi";

export function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  return jsonWithCors(openApiSpec, origin);
}

export function OPTIONS(request: NextRequest) {
  return preflight(request.headers.get("origin"));
}
