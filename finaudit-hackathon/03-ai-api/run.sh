#!/usr/bin/env bash
# Convenience launcher for the FinAudit AI API.
set -e
cd "$(dirname "$0")"
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
