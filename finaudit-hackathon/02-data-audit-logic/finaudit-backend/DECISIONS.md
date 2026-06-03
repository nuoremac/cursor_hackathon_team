# FinAudit — Décisions & Levée des ambiguïtés (Personne 2)

> Ce document recense **toutes les décisions de conception** prises pour lever les
> ambiguïtés du périmètre confié au Data & Audit Logic Lead. Objectif : que toute
> l'équipe (et les juges) comprenne *pourquoi* le backend se comporte ainsi, sans
> avoir à lire le code.

---

## 1. Contexte & cadrage

| Sujet | Décision |
|---|---|
| Rôle | Personne 2 — API REST de détection d'anomalies. |
| Stack backend | Next.js 16 (App Router) + TypeScript, **projet séparé** du frontend. |
| Port | Backend sur **`http://localhost:3001`**, frontend sur `:3000`. |
| Persistance | **Aucune base de données** — tout est calculé en mémoire à la volée. |
| Détection | **Règles déterministes** uniquement (pas de ML). |
| Endpoints à ma charge | `POST /api/analyze`, `GET /api/demo-data`. `/api/explain-anomalies` reste à la Personne 3. |
| Documentation | **Swagger / OpenAPI** (choix d'équipe) servi sur `/api-docs`, spec JSON sur `/api/openapi`. |

---

## 2. Forme de la réponse de `runAudit`

`runAudit(transactions)` renvoie **un seul objet** :

```ts
{ findings: AuditFinding[]; metrics: AuditMetrics }
```

- `POST /api/analyze` renvoie exactement `{ findings, metrics }`.
- `GET /api/demo-data` renvoie `{ transactions, findings, metrics }` (il ajoute les
  transactions sources, car le client n'a pas uploadé de fichier).

**Raison :** le client de `/api/analyze` possède déjà le CSV qu'il vient d'envoyer ;
inutile de le lui renvoyer. La démo, elle, a besoin des transactions pour peupler le tableau.

---

## 3. Les 8 règles & ambiguïtés tranchées

| # | Règle | Risque | Seuil / Définition retenue |
|---|---|---|---|
| 1 | Doublon de numéro de facture | **high** | `invoiceNumber` apparaissant > 1 fois. Les factures **vides sont ignorées**. |
| 2 | Code comptable manquant | **medium** | `accountCode` vide (après `trim`). |
| 3 | Montant négatif | **high** | `amount < 0`. |
| 4 | Montant très élevé | **high** | `amount > 1 000 000` (**strict** : 1 000 000 pile n'est pas flaggé). |
| 5 | Déséquilibre débit/crédit | **high** | Contrôle **GLOBAL** (voir §4). |
| 6 | Transaction un week-end | **medium** | Date tombant un samedi/dimanche, **interprétée en UTC**. |
| 7 | Montant rond suspect | **low / medium** | Divisible par 100 000 (voir §5 pour low vs medium). |
| 8 | Fournisseur rare + montant élevé | **high** | Fournisseur vu **exactement 1 fois** ET `amount >= 500 000` (voir §6). |

### Détail des points ambigus

#### §4 — Déséquilibre débit/crédit = contrôle GLOBAL
- On compare **la somme de tous les débits** à **la somme de tous les crédits** du fichier.
- En cas d'écart, on produit **un finding unique** avec `transactionId: "GLOBAL"`.
- Une tolérance d'arrondi (`BALANCE_EPSILON = 0.01`) évite les faux positifs liés aux flottants.
- **Raison :** l'équilibre est une propriété du fichier entier, pas d'une ligne ; un id
  spécial `"GLOBAL"` permet au frontend de l'afficher distinctement.

#### §5 — Montant rond : « Faible » ou « Moyen » ?
L'énoncé disait « Faible/Moyen » sans trancher. Décision :
- Montant rond **ET `>= 1 000 000`** → **medium**.
- Sinon (petit montant rond) → **low**.
- Le montant **0 est ignoré** (un débit/crédit nul est trivialement « rond »).
- **Raison :** un gros montant rond est plus suspect qu'un petit ; on garde une granularité utile.

#### §6 — Fournisseur « rare » et « montant élevé »
- **Rare** = `vendorCount === 1` (apparaît **exactement** une fois). Décision verrouillée en amont.
- **Montant élevé** (ambigu) = `amount >= 500 000`, **seuil dédié volontairement plus bas**
  que celui de la règle « montant très élevé » (1 000 000).
- **Raison :** on veut capter le fournisseur unique au montant « moyennement élevé »,
  cas typique d'un paiement fictif, sans le confondre avec la règle des très gros montants.
- La comparaison de noms est **insensible à la casse et aux espaces** (`trim().toLowerCase()`),
  pour que « TechPro » et « techpro » comptent comme le même fournisseur.

---

## 4. Cumul des règles sur une même transaction

- Une transaction peut déclencher **plusieurs règles** simultanément.
- Dans ce cas : ses `reasons` sont **toutes cumulées**, et le `risk` final est le
  **maximum** des risques déclenchés (`low < medium < high`).
- La `recommendation` est dérivée de ce risque maximal (message standard par niveau).
- **Raison :** un seul finding par transaction reste lisible côté frontend, tout en
  conservant la traçabilité de chaque règle via `reasons`.

---

## 5. Calcul des métriques (`metrics`)

| Champ | Définition retenue |
|---|---|
| `totalTransactions` | Nombre de lignes parsées. |
| `totalDebit` / `totalCredit` | Sommes des colonnes. |
| `balanceDiff` | `totalDebit - totalCredit` (signé). |
| `suspiciousCount` | Nombre de **transactions** suspectes (**hors** finding `"GLOBAL"`). |
| `highCount` / `mediumCount` / `lowCount` | Répartition de **TOUS** les findings par risque (**finding `GLOBAL` inclus**). |

> ⚠️ Conséquence assumée : `highCount + mediumCount + lowCount` = **nombre total de findings**,
> ce qui peut être supérieur à `suspiciousCount` d'une unité quand le finding `GLOBAL` existe.
> **Raison :** le graphe de répartition des risques (frontend) doit refléter *tous* les findings,
> y compris le déséquilibre global, tandis que « transactions suspectes » ne compte que des lignes réelles.

---

## 6. Parsing CSV

| Point ambigu | Décision |
|---|---|
| Pas d'`id` dans le CSV | Génération déterministe `TX-0001`, `TX-0002`… selon l'ordre des lignes. |
| Colonne `amount` vs `debit/credit` | On utilise **`amount` du CSV** s'il est présent ; sinon on retombe sur `debit - credit`. |
| Valeurs numériques sales | `trim`, suppression des espaces, virgule décimale tolérée ; valeur illisible → `0`. |
| Lignes vides | Ignorées (`skipEmptyLines`). |
| En-têtes avec espaces | Tolérés (`transformHeader: trim`). |

---

## 7. CORS

- Le frontend (`:3000`) et le backend (`:3001`) sont d'**origines différentes** → CORS requis.
- On autorise explicitement `http://localhost:3000` et `http://127.0.0.1:3000`.
- Chaque route répond aussi au **pré-vol `OPTIONS`**.
- **Raison :** permettre les appels `fetch` du frontend sans ouvrir l'API à n'importe quelle origine.

---

## 8. Hors périmètre (rappel)

Base de données, authentification réelle, ML, export PDF, multi-entreprise,
déploiement cloud. `localhost` suffit pour la démo.
