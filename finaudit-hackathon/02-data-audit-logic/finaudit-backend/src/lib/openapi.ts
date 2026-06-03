/**
 * openapi.ts
 * -----------------------------------------------------------------------------
 * Spécification OpenAPI 3.0 du backend FinAudit.
 *
 * C'est la documentation "vivante" de l'API : elle est servie en JSON par
 * /api/openapi et rendue visuellement par Swagger UI sur /api-docs.
 * Le frontend (Personne 1) et l'IA (Personne 3) peuvent s'y référer ou
 * l'importer dans Postman/Insomnia.
 */

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "FinAudit API",
    version: "1.0.0",
    description:
      "API de détection d'anomalies comptables (Personne 2). " +
      "Analyse un CSV de transactions et renvoie des findings classés par " +
      "niveau de risque ainsi que des métriques pour le tableau de bord.",
  },
  servers: [{ url: "http://localhost:3001", description: "Backend local" }],
  tags: [
    { name: "Audit", description: "Analyse de transactions et données de démo" },
  ],
  paths: {
    "/api/analyze": {
      post: {
        tags: ["Audit"],
        summary: "Analyser un fichier CSV de transactions",
        description:
          "Reçoit un fichier CSV (multipart/form-data, champ `file`), le parse " +
          "et exécute les 8 règles de détection. Retourne les findings et les métriques.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                    description: "Fichier CSV à auditer (en-tête obligatoire).",
                  },
                },
                required: ["file"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Audit réalisé avec succès.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuditResult" },
              },
            },
          },
          "400": {
            description: "Requête invalide (fichier manquant ou CSV illisible).",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/demo-data": {
      get: {
        tags: ["Audit"],
        summary: "Charger les données de démonstration auditées",
        description:
          "Charge le CSV de démo embarqué, l'audite et retourne les transactions " +
          "sources accompagnées des findings et des métriques. Idéal pour la démo " +
          "sans avoir à uploader de fichier.",
        responses: {
          "200": {
            description: "Données de démo auditées.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DemoDataResponse" },
              },
            },
          },
          "500": {
            description: "Erreur de chargement du CSV de démo.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      RiskLevel: {
        type: "string",
        enum: ["low", "medium", "high"],
        description: "Niveau de risque d'une anomalie.",
      },
      Transaction: {
        type: "object",
        properties: {
          id: { type: "string", example: "TX-0001" },
          date: { type: "string", example: "2026-05-01" },
          accountCode: { type: "string", example: "601" },
          description: { type: "string", example: "Achat materiel informatique" },
          vendor: { type: "string", example: "TechPro" },
          invoiceNumber: { type: "string", example: "INV-001" },
          debit: { type: "number", example: 500000 },
          credit: { type: "number", example: 0 },
          amount: { type: "number", example: 500000 },
        },
        required: [
          "id",
          "date",
          "accountCode",
          "description",
          "vendor",
          "invoiceNumber",
          "debit",
          "credit",
          "amount",
        ],
      },
      AuditFinding: {
        type: "object",
        properties: {
          transactionId: {
            type: "string",
            description: 'Id de la transaction, ou "GLOBAL" pour le contrôle d\'équilibre.',
            example: "TX-0002",
          },
          risk: { $ref: "#/components/schemas/RiskLevel" },
          reasons: {
            type: "array",
            items: { type: "string" },
            example: ["Montant très élevé (1200000 > 1000000)."],
          },
          recommendation: { type: "string" },
          aiExplanation: {
            type: "string",
            description: "Explication IA optionnelle (remplie par la Personne 3).",
          },
        },
        required: ["transactionId", "risk", "reasons", "recommendation"],
      },
      AuditMetrics: {
        type: "object",
        properties: {
          totalTransactions: { type: "integer", example: 27 },
          totalDebit: { type: "number", example: 16000000 },
          totalCredit: { type: "number", example: 1690000 },
          balanceDiff: { type: "number", example: 14310000 },
          suspiciousCount: { type: "integer", example: 12 },
          highCount: { type: "integer", example: 8 },
          mediumCount: { type: "integer", example: 4 },
          lowCount: { type: "integer", example: 3 },
        },
        required: [
          "totalTransactions",
          "totalDebit",
          "totalCredit",
          "balanceDiff",
          "suspiciousCount",
          "highCount",
          "mediumCount",
          "lowCount",
        ],
      },
      AuditResult: {
        type: "object",
        properties: {
          findings: {
            type: "array",
            items: { $ref: "#/components/schemas/AuditFinding" },
          },
          metrics: { $ref: "#/components/schemas/AuditMetrics" },
        },
        required: ["findings", "metrics"],
      },
      DemoDataResponse: {
        allOf: [
          { $ref: "#/components/schemas/AuditResult" },
          {
            type: "object",
            properties: {
              transactions: {
                type: "array",
                items: { $ref: "#/components/schemas/Transaction" },
              },
            },
            required: ["transactions"],
          },
        ],
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string", example: "Aucun fichier 'file' fourni." },
        },
        required: ["error"],
      },
    },
  },
} as const;
