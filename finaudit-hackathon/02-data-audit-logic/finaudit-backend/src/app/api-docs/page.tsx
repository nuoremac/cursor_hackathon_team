"use client";

/**
 * /api-docs
 * -----------------------------------------------------------------------------
 * Page Swagger UI du backend FinAudit.
 *
 * Elle charge la spécification servie par /api/openapi et l'affiche de manière
 * interactive (essai des endpoints depuis le navigateur).
 *
 * `swagger-ui-react` manipule le DOM directement : on l'importe donc en dynamic
 * avec `ssr: false` pour qu'il ne s'exécute QUE côté client.
 */

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => <p style={{ padding: 24 }}>Chargement de la documentation…</p>,
});

export default function ApiDocsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#fafafa" }}>
      <SwaggerUI url="/api/openapi" />
    </main>
  );
}
