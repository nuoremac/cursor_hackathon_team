# Person 2 - Data & Audit Logic Lead

## Mission

Make anomaly detection work reliably.

## Work Here

Use this folder for CSV parsing logic, audit rule notes, data models, and test datasets.

## Main Tasks

- Define the `Transaction` and `AuditFinding` types.
- Load and parse CSV data with PapaParse.
- Implement `runAudit(transactions)`.
- Detect duplicate invoices, missing account codes, large amounts, weekend transactions, negative amounts, and rare vendors.
- Compute dashboard metrics.

## 2-Hour Deliverable

`runAudit(transactions)` returns suspicious transactions with reasons and risk levels.
