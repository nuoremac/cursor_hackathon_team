# Person 1 - Frontend/UI Lead

## Mission

Build the visible FinAudit interface as a serious audit dashboard that an accountant or auditor could use during a review.

The frontend must make the judges understand the product in less than 15 seconds:

> We load accounting data, detect risky transactions, and use AI to explain what the auditor should verify.

## Frontend Direction

Do **not** build a landing page.

The first screen must be the working audit dashboard.

Build FinAudit as a **single-page app with tabs/sections**, not many complex pages. This is faster to integrate and easier to demo.

Recommended sections:

- Dashboard
- Transactions
- Anomaly Report
- AI Review, if time allows

## Layout

Use this structure:

```txt
FinAudit
AI-Assisted Accounting Anomaly Detector

┌────────────────────────┬────────────────────────────────────────────┐
│ Sidebar                │ Top actions                                │
│                        │ Load Demo Data | Upload CSV | Run Audit    │
│ Dashboard              ├────────────────────────────────────────────┤
│ Transactions           │ Main workspace                             │
│ Anomaly Report         │ Dashboard / Transactions / Report content  │
│ AI Review              │                                            │
└────────────────────────┴────────────────────────────────────────────┘
```

## Visual Style

The UI should feel like an enterprise audit tool:

- Light gray or off-white page background.
- White panels/cards with subtle borders.
- Small border radius.
- Compact, readable spacing.
- Tables, filters, badges, and charts.
- No marketing hero section.
- No decorative graphics.
- No oversized text.

Recommended colors:

- Primary action: dark blue or dark green.
- Normal status: green.
- Low risk: blue/gray.
- Medium risk: amber.
- High risk: red.

## Top Actions

The top bar must include:

- `Load Demo Data`
- `Upload CSV`
- `Run Audit`

Priority:

1. `Load Demo Data` must work.
2. `Run Audit` must work.
3. `Upload CSV` is useful, but can be secondary if time is short.

## Dashboard Section

This is the first visible section.

Show summary cards:

```txt
Total Transactions
Total Debit
Total Credit
Suspicious Items
High Risk
Balance Gap
```

Example:

```txt
Total Transactions: 10
Total Debit: 8,935,000 FCFA
Total Credit: 900,000 FCFA
Suspicious Items: 7
High Risk: 4
Balance Gap: 8,035,000 FCFA
```

Below the cards, add:

- Risk distribution chart.
- Recent anomalies list.
- Button/link: `View Anomaly Report`.

If chart integration takes too long, keep the summary cards and recent anomalies. Cards are more important than charts.

## Transactions Section

This is the core audit table.

Columns:

```txt
Date | Account | Vendor | Invoice | Description | Debit | Credit | Amount | Risk
```

Required controls:

- Search input.
- Filter tabs: `All`, `Normal`, `Suspicious`, `High Risk`.
- Risk badges.
- Suspicious row highlighting.

Example row:

```txt
2026-05-04 | 601 | TechPro | INV-001 | Achat materiel informatique | 500,000 | 0 | 500,000 | High
```

Table behavior:

- Before data load: show a clean empty state.
- After loading data: show all rows.
- After audit: highlight suspicious rows and display risk badges.

## Anomaly Report Section

This is where the product value becomes obvious.

Each anomaly should show:

- Risk level.
- Main issue.
- Transaction summary.
- Detected reasons.
- Recommended auditor action.
- `Explain with AI` button/result.

Example card:

```txt
High Risk
Duplicate invoice number: INV-001

Transaction:
TechPro - 500,000 FCFA - 2026-05-04

Detected reasons:
- Duplicate invoice number
- Same vendor and same amount repeated

Recommended action:
Verify invoice, approval document, and payment history.
```

After AI explanation:

```txt
AI Explanation:
This transaction is high risk because the same invoice number appears more than once with the same vendor and amount. The auditor should verify whether this is a duplicate payment or a legitimate correction.
```

## Component Checklist

Build these components if using React/Next.js:

- `AppShell`
- `Sidebar`
- `TopActions`
- `MetricCard`
- `RiskBadge`
- `TransactionsTable`
- `AnomalyCard`
- `RiskDistributionChart`
- `EmptyState`
- `LoadingState`

Keep components simple. The goal is fast integration, not a perfect design system.

## Data Contract Needed From Person 2

The frontend should expect transactions like:

```ts
type Transaction = {
  id: string;
  date: string;
  accountCode: string;
  description: string;
  vendor: string;
  invoiceNumber: string;
  debit: number;
  credit: number;
  amount: number;
};
```

Audit findings should look like:

```ts
type AuditFinding = {
  transactionId: string;
  risk: "low" | "medium" | "high";
  reasons: string[];
  recommendation: string;
  aiExplanation?: string;
};
```

## Frontend State Flow

Use this simple flow:

```txt
No data
  -> Load Demo Data
Data loaded
  -> Run Audit
Audit results available
  -> Show highlighted transactions and anomaly report
AI requested
  -> Show loading state
AI response received
  -> Show AI explanation
```

## Required Demo Flow

The presenter must be able to do this:

1. Open FinAudit.
2. Click `Load Demo Data`.
3. Show dashboard metrics.
4. Open the transactions table.
5. Click `Run Audit`.
6. Suspicious rows become highlighted.
7. Open `Anomaly Report`.
8. Click `Explain with AI`.
9. Show AI-generated or mock-AI audit recommendations.

## 2-Hour Deliverable

After 2 hours, the frontend must have:

- A working shell with sidebar and top actions.
- Dashboard cards visible.
- Transactions table visible with demo data.
- Filter tabs/search UI.
- Risk badges and highlighted suspicious rows when audit data exists.
- Anomaly report layout ready for integration.

## Emergency Priorities

If time is short, build in this order:

1. App shell.
2. Load demo data button.
3. Dashboard cards.
4. Transactions table.
5. Run audit integration.
6. Anomaly report cards.
7. AI explanation display.
8. Charts.

Charts are optional. The working audit flow is mandatory.
