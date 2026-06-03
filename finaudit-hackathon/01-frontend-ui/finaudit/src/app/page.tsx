"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconRadar2,
  IconArrowRight,
  IconShieldCheck,
  IconSparkles,
  IconChartHistogram,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import type { Locale } from "@/lib/types";
import { translate, type TranslationKey } from "@/lib/i18n";

const FEATURES: {
  icon: Icon;
  titleKey: TranslationKey;
  textKey: TranslationKey;
}[] = [
  {
    icon: IconRadar2,
    titleKey: "landing.feature1.title",
    textKey: "landing.feature1.text",
  },
  {
    icon: IconSparkles,
    titleKey: "landing.feature2.title",
    textKey: "landing.feature2.text",
  },
  {
    icon: IconChartHistogram,
    titleKey: "landing.feature3.title",
    textKey: "landing.feature3.text",
  },
];

export default function LandingPage() {
  const [locale, setLocale] = useState<Locale>("fr");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("finaudit-locale") as Locale | null;
      if (stored === "fr" || stored === "en") setLocale(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const changeLocale = (next: Locale) => {
    setLocale(next);
    try {
      window.localStorage.setItem("finaudit-locale", next);
    } catch {
      /* ignore */
    }
  };

  const t = (key: TranslationKey) => translate(key, locale);

  return (
    <main className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#0b1a2b]">
      {/* Background photo */}
      <Image
        src="/landing-bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Lighter readability overlay — keeps the photo visible */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b1a2b]/85 via-[#0b1a2b]/60 to-[#1e3a5f]/55" />
      <div className="absolute inset-0 bg-[#0b1a2b]/10" />

      {/* Header — logo flush left, language switch flush right */}
      <header className="relative z-20 flex h-16 w-full items-center justify-between border-b border-white/10 bg-[#0b1a2b]/30 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-[#0b1a2b] ring-1 ring-white/15">
            <Image
              src="/logo.png"
              alt="Audit Radar"
              fill
              sizes="36px"
              className="scale-[1.7] object-contain"
              priority
            />
          </span>
          <span className="text-[16px] font-semibold tracking-tight text-white sm:text-[17px]">
            Audit Radar
          </span>
        </div>

        <LocaleSwitch locale={locale} onChange={changeLocale} />
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 py-14 text-center sm:px-6 sm:py-20">
        <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[12px] font-medium text-white/90 backdrop-blur-sm sm:mb-8">
          <IconShieldCheck size={14} stroke={1.9} />
          {t("landing.badge")}
        </span>

        <h1 className="text-balance text-[30px] font-semibold leading-[1.15] tracking-tight text-white sm:text-[44px] md:text-[48px]">
          {t("landing.titleLine1")}
          <br className="hidden sm:block" /> {t("landing.titleLine2")}
        </h1>

        <p className="mt-6 max-w-xl text-[14px] leading-relaxed text-white/80 sm:mt-7 sm:text-[15px]">
          {t("landing.subtitle")}
        </p>

        {/* Start button */}
        <div className="mt-10 flex w-full justify-center sm:mt-12">
          <Link
            href="/dashboard"
            className="press inline-flex h-12 w-full max-w-xs items-center justify-center gap-2 rounded-md bg-white px-8 text-[15px] font-semibold text-[#1e3a5f] shadow-xl transition-transform hover:bg-white/90 sm:w-auto sm:max-w-none"
          >
            {t("landing.start")}
            <IconArrowRight size={18} stroke={2} />
          </Link>
        </div>

        {/* Feature row */}
        <div className="mt-14 grid w-full grid-cols-1 gap-4 sm:mt-20 sm:grid-cols-3 sm:gap-5">
          {FEATURES.map((f) => {
            const FeatureIcon = f.icon;
            return (
              <div
                key={f.titleKey}
                className="rounded-xl border border-white/15 bg-white/5 p-5 text-left backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                <FeatureIcon size={22} stroke={1.85} className="text-[#7eb0e8]" />
                <h3 className="mt-3 text-[14px] font-medium text-white">
                  {t(f.titleKey)}
                </h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-white/70">
                  {t(f.textKey)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="relative z-10 px-6 py-8 text-center text-[11px] text-white/50">
        © {new Date().getFullYear()} Audit Radar — {t("landing.footer")}
      </footer>
    </main>
  );
}

function LocaleSwitch({
  locale,
  onChange,
}: {
  locale: Locale;
  onChange: (next: Locale) => void;
}) {
  const options: Locale[] = ["fr", "en"];
  return (
    <div
      role="group"
      aria-label="Language"
      className="flex items-center rounded-md border border-white/20 bg-white/5 p-0.5 backdrop-blur-sm"
    >
      {options.map((opt) => {
        const active = locale === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={active}
            className={`h-7 rounded px-2.5 text-[12px] font-medium transition-colors ${
              active ? "bg-white text-[#1e3a5f]" : "text-white/70 hover:text-white"
            }`}
          >
            {opt.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
