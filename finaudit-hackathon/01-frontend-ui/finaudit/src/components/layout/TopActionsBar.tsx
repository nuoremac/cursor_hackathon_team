"use client";

import { useRef, type ChangeEvent } from "react";
import {
  IconDatabase,
  IconUpload,
  IconRadar2,
  IconLoader2,
  IconCircleCheck,
} from "@tabler/icons-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";

export function TopActionsBar() {
  const {
    transactions,
    metrics,
    auditRun,
    isAuditing,
    loadDemoData,
    uploadCsv,
    runAuditAction,
    uploadError,
    t,
  } = useApp();

  const fileRef = useRef<HTMLInputElement>(null);
  const hasData = transactions.length > 0;

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => uploadCsv(String(reader.result ?? ""));
    reader.readAsText(file);
    e.target.value = "";
  };

  const statusText = !hasData
    ? t("status.noData")
    : auditRun
      ? t("status.auditComplete", { count: metrics.suspiciousCount })
      : t("status.loaded", { count: transactions.length });

  return (
    <div className="flex flex-col gap-3 border-b border-[var(--border)] bg-surface px-4 py-2.5 md:h-12 md:flex-row md:items-center md:gap-4 md:py-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          variant="primary"
          size="sm"
          icon={<IconDatabase size={15} stroke={1.85} />}
          onClick={loadDemoData}
          fullWidth
          className="sm:w-auto"
        >
          {t("actions.loadDemo")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={<IconUpload size={15} stroke={1.85} />}
          onClick={() => fileRef.current?.click()}
          fullWidth
          className="sm:w-auto"
        >
          {t("actions.uploadCsv")}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          onChange={onFile}
          className="hidden"
          aria-hidden
        />
      </div>

      <div className="flex items-center gap-1.5 text-[12px] text-tsecondary md:mx-2">
        {auditRun ? (
          <IconCircleCheck size={14} className="text-[var(--success)]" aria-hidden />
        ) : null}
        <span aria-live="polite">{statusText}</span>
        {uploadError ? (
          <span className="text-[var(--danger)]">· {uploadError}</span>
        ) : null}
      </div>

      <div className="md:ml-auto">
        <Button
          variant="primary"
          size="sm"
          disabled={!hasData || isAuditing}
          onClick={runAuditAction}
          fullWidth
          className="px-4 sm:w-auto"
          icon={
            isAuditing ? (
              <IconLoader2 size={15} className="animate-spin" stroke={2} />
            ) : (
              <IconRadar2 size={15} stroke={1.85} />
            )
          }
          aria-disabled={!hasData || isAuditing}
        >
          {isAuditing
            ? t("actions.auditing")
            : auditRun
              ? t("actions.rerunAudit")
              : t("actions.runAudit")}
        </Button>
      </div>
    </div>
  );
}
