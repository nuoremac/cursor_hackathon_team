"use client";

import { useEffect, useRef, useState } from "react";
import { IconChevronDown, IconCheck, IconWorld } from "@tabler/icons-react";
import { useApp } from "@/context/AppContext";
import type { Locale } from "@/lib/types";

const OPTIONS: { value: Locale; label: string }[] = [
  { value: "fr", label: "FR" },
  { value: "en", label: "EN" },
];

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("topbar.language")}
        className="flex h-8 items-center gap-1.5 rounded-md border border-[var(--border)] px-2 text-[13px] font-medium text-tsecondary transition-colors hover:bg-surface-2"
      >
        <IconWorld size={15} stroke={1.75} aria-hidden />
        {locale.toUpperCase()}
        <IconChevronDown size={13} stroke={2} aria-hidden />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="fade-up absolute right-0 z-30 mt-1 w-28 overflow-hidden rounded-md border border-[var(--border)] bg-surface py-1 shadow-lg"
        >
          {OPTIONS.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                role="option"
                aria-selected={locale === opt.value}
                onClick={() => {
                  setLocale(opt.value);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-3 py-1.5 text-[13px] text-tprimary transition-colors hover:bg-surface-2"
              >
                {opt.label}
                {locale === opt.value ? (
                  <IconCheck size={14} className="text-accent" aria-hidden />
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
