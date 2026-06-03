/**
 * Page d'accueil du backend FinAudit.
 *
 * Ce projet est une API : la page sert surtout de point d'entrée lisible qui
 * pointe vers la documentation Swagger et résume les endpoints disponibles.
 */

const endpoints = [
  {
    method: "GET",
    path: "/api/demo-data",
    description: "Charge le CSV de démo audité (transactions + findings + metrics).",
  },
  {
    method: "POST",
    path: "/api/analyze",
    description: "Analyse un CSV uploadé (multipart/form-data, champ « file »).",
  },
  {
    method: "GET",
    path: "/api/openapi",
    description: "Spécification OpenAPI brute (JSON), importable dans Postman.",
  },
];

export default function Home() {
  return (
    <main
      style={{
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        maxWidth: 760,
        margin: "0 auto",
        padding: "64px 24px",
        lineHeight: 1.6,
      }}
    >
      <p
        style={{
          display: "inline-block",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: "#2563eb",
          background: "#eff6ff",
          padding: "4px 10px",
          borderRadius: 999,
          margin: 0,
        }}
      >
        Backend · Personne 2
      </p>

      <h1 style={{ fontSize: 36, margin: "16px 0 8px" }}>FinAudit API</h1>
      <p style={{ color: "#475569", margin: "0 0 32px" }}>
        Détection d&apos;anomalies comptables par règles déterministes. Ce
        service tourne sur le port <strong>3001</strong> et alimente le frontend.
      </p>

      <a
        href="/api-docs"
        style={{
          display: "inline-block",
          background: "#2563eb",
          color: "#fff",
          padding: "12px 20px",
          borderRadius: 8,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Ouvrir la documentation Swagger →
      </a>

      <h2 style={{ fontSize: 20, margin: "40px 0 12px" }}>Endpoints</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {endpoints.map((ep) => (
          <li
            key={ep.path}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 10,
            }}
          >
            <code
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                fontWeight: 700,
                color: ep.method === "POST" ? "#9333ea" : "#16a34a",
                marginRight: 8,
              }}
            >
              {ep.method}
            </code>
            <code style={{ fontFamily: "var(--font-geist-mono), monospace" }}>
              {ep.path}
            </code>
            <p style={{ margin: "6px 0 0", color: "#475569", fontSize: 14 }}>
              {ep.description}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
