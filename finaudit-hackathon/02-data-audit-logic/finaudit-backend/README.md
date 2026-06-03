# FinAudit — Backend (Personne 2)

API REST de **détection d'anomalies comptables** par règles déterministes.
Projet Next.js 16 (App Router) + TypeScript, **séparé du frontend**, tournant sur le port **3001**.

## Démarrage

```bash
npm install      # déjà fait si node_modules existe
npm run dev      # démarre sur http://localhost:3001
```

- Accueil / sommaire : <http://localhost:3001>
- **Documentation Swagger** : <http://localhost:3001/api-docs>
- Spec OpenAPI brute (JSON) : <http://localhost:3001/api/openapi>

## Endpoints

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/demo-data` | Charge le CSV de démo audité → `{ transactions, findings, metrics }`. |
| `POST` | `/api/analyze` | Analyse un CSV uploadé (`multipart/form-data`, champ `file`) → `{ findings, metrics }`. |
| `GET` | `/api/openapi` | Spécification OpenAPI au format JSON. |

### Exemples

```bash
# Données de démo auditées
curl http://localhost:3001/api/demo-data

# Analyse d'un fichier CSV
curl -F "file=@src/data/demo-transactions.csv" http://localhost:3001/api/analyze
```

## Structure

```
src/
├── lib/
│   ├── types.ts          # Contrats de données (Transaction, AuditFinding, metrics)
│   ├── constants.ts      # Seuils métier centralisés
│   ├── csvParser.ts      # Parsing + normalisation CSV (PapaParse)
│   ├── auditEngine.ts    # runAudit() : orchestration + agrégation + métriques
│   ├── demoData.ts       # Chargement du CSV de démo
│   ├── cors.ts           # Helpers CORS partagés
│   ├── openapi.ts        # Spécification OpenAPI
│   └── rules/            # Une règle de détection par fichier
│       ├── rule.ts            # Contrat commun (TransactionRule, RuleContext)
│       ├── index.ts           # Catalogue des règles
│       ├── duplicateInvoice.ts
│       ├── missingAccountCode.ts
│       ├── negativeAmount.ts
│       ├── largeAmount.ts
│       ├── weekendTransaction.ts
│       ├── roundAmount.ts
│       ├── rareVendor.ts
│       └── balanceCheck.ts    # Règle GLOBALE (déséquilibre débit/crédit)
├── app/
│   ├── page.tsx          # Page d'accueil (sommaire des endpoints)
│   ├── api-docs/page.tsx # Interface Swagger UI
│   └── api/
│       ├── analyze/route.ts
│       ├── demo-data/route.ts
│       └── openapi/route.ts
└── data/
    └── demo-transactions.csv   # Jeu de démo (couvre toutes les anomalies)
```

## Règles de détection

8 règles déterministes (détail et seuils dans **[`DECISIONS.md`](./DECISIONS.md)**) :
doublon de facture, code comptable manquant, montant négatif, montant très élevé,
déséquilibre débit/crédit global, transaction le week-end, montant rond suspect,
fournisseur rare avec montant élevé.

> Les choix de conception et la levée des ambiguïtés sont documentés dans
> **[`DECISIONS.md`](./DECISIONS.md)**.
