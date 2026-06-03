"use client";

import { IconBell, IconMenu2 } from "@tabler/icons-react";
import { useApp } from "@/context/AppContext";
import type { SectionId } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";

const SECTION_TITLE: Record<SectionId, TranslationKey> = {
  dashboard: "section.dashboard",
  transactions: "section.transactions",
  report: "section.report",
  "ai-review": "section.aiReview",
};

export function TopBar() {
  const { activeSection, t, auditRun, setMobileNavOpen } = useApp();

  return (
    <header className="sticky top-0 z-30 flex h-[52px] items-center gap-3 border-b border-[var(--border)] bg-surface px-4">
      <button
        type="button"
        onClick={() => setMobileNavOpen(true)}
        className="flex h-8 w-8 items-center justify-center rounded-md text-tsecondary hover:bg-surface-2 lg:hidden"
        aria-label="Open navigation"
      >
        <IconMenu2 size={18} />
      </button>

      <div className="flex min-w-0 items-center gap-2">
        <h1 className="truncate text-[16px] font-medium text-tprimary">
          {t(SECTION_TITLE[activeSection])}
        </h1>
        {auditRun ? (
          <>
            <span className="text-tmuted" aria-hidden>
              ›
            </span>
            <span className="hidden text-[13px] text-tsecondary sm:inline">
              {t("dash.basedOnAudit")}
            </span>
          </>
        ) : null}
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        <LanguageSwitcher />
        <ThemeToggle />
        <button
          type="button"
          aria-label={t("topbar.notifications")}
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-tsecondary transition-colors hover:bg-surface-2"
        >
          <IconBell size={18} stroke={1.75} />
          {auditRun ? (
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--danger)]" />
          ) : null}
        </button>
      </div>
    </header>
  );
}
