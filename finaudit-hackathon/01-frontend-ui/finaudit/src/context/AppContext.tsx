"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AppState,
  AuditFinding,
  DashboardMetrics,
  Locale,
  SectionId,
  Theme,
  Transaction,
} from "@/lib/types";
import { computeMetrics, runAudit } from "@/lib/audit";
import { DEMO_TRANSACTIONS } from "@/lib/demoData";
import { parseCsv } from "@/lib/csv";
import { generateAiExplanation } from "@/lib/ai";
import { translate, type TranslationKey } from "@/lib/i18n";

type AppContextValue = {
  // i18n + theme
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  theme: Theme;
  toggleTheme: () => void;

  // navigation
  activeSection: SectionId;
  setActiveSection: (section: SectionId) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;

  // data + state machine
  appState: AppState;
  transactions: Transaction[];
  findings: AuditFinding[];
  metrics: DashboardMetrics;
  auditRun: boolean;
  isAuditing: boolean;
  uploadError: string | null;

  // actions
  loadDemoData: () => void;
  uploadCsv: (text: string) => void;
  resetData: () => void;
  runAuditAction: () => void;
  findingFor: (transactionId: string) => AuditFinding | undefined;
  transactionFor: (transactionId: string) => Transaction | undefined;
  explainFinding: (transactionId: string) => Promise<void>;
  aiLoadingIds: ReadonlySet<string>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [theme, setTheme] = useState<Theme>("light");
  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [findings, setFindings] = useState<AuditFinding[]>([]);
  const [auditRun, setAuditRun] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [aiLoadingIds, setAiLoadingIds] = useState<Set<string>>(new Set());

  // Restore persisted theme / locale.
  useEffect(() => {
    try {
      const storedTheme = window.localStorage.getItem("finaudit-theme") as Theme | null;
      const storedLocale = window.localStorage.getItem("finaudit-locale") as Locale | null;
      if (storedTheme === "light" || storedTheme === "dark") setTheme(storedTheme);
      else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) setTheme("dark");
      if (storedLocale === "fr" || storedLocale === "en") setLocaleState(storedLocale);
    } catch {
      /* ignore storage access errors */
    }
  }, []);

  // Apply theme to <html> + persist.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem("finaudit-theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem("finaudit-locale", next);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) =>
      translate(key, locale, vars),
    [locale],
  );

  const toggleTheme = useCallback(
    () => setTheme((prev) => (prev === "light" ? "dark" : "light")),
    [],
  );

  const toggleSidebar = useCallback(() => setSidebarCollapsed((p) => !p), []);

  const appState: AppState = useMemo(() => {
    if (aiLoadingIds.size > 0) return "AI_LOADING";
    if (transactions.length === 0) return "NO_DATA";
    if (auditRun) return "AUDIT_COMPLETE";
    return "DATA_LOADED";
  }, [aiLoadingIds.size, transactions.length, auditRun]);

  const metrics = useMemo(
    () => computeMetrics(transactions, auditRun ? findings : []),
    [transactions, findings, auditRun],
  );

  const loadDemoData = useCallback(() => {
    setTransactions(DEMO_TRANSACTIONS);
    setFindings([]);
    setAuditRun(false);
    setUploadError(null);
    setAiLoadingIds(new Set());
  }, []);

  const uploadCsv = useCallback((text: string) => {
    const result = parseCsv(text);
    if (result.errors.length > 0 || result.transactions.length === 0) {
      setUploadError(result.errors[0] ?? "Unable to parse CSV.");
      return;
    }
    setUploadError(null);
    setTransactions(result.transactions);
    setFindings([]);
    setAuditRun(false);
    setAiLoadingIds(new Set());
  }, []);

  const resetData = useCallback(() => {
    setTransactions([]);
    setFindings([]);
    setAuditRun(false);
    setUploadError(null);
    setAiLoadingIds(new Set());
  }, []);

  const runAuditAction = useCallback(() => {
    if (transactions.length === 0) return;
    setIsAuditing(true);
    // Brief delay so the "auditing" state is perceptible in the demo.
    window.setTimeout(() => {
      setFindings(runAudit(transactions));
      setAuditRun(true);
      setIsAuditing(false);
    }, 650);
  }, [transactions]);

  const findingFor = useCallback(
    (transactionId: string) => findings.find((f) => f.transactionId === transactionId),
    [findings],
  );

  const transactionFor = useCallback(
    (transactionId: string) => transactions.find((tx) => tx.id === transactionId),
    [transactions],
  );

  const explainFinding = useCallback(
    async (transactionId: string) => {
      const finding = findings.find((f) => f.transactionId === transactionId);
      const tx = transactions.find((t) => t.id === transactionId);
      if (!finding || !tx || finding.aiExplanation) return;

      setAiLoadingIds((prev) => new Set(prev).add(transactionId));
      const explanation = await generateAiExplanation(tx, finding, locale);
      setFindings((prev) =>
        prev.map((f) =>
          f.transactionId === transactionId ? { ...f, aiExplanation: explanation } : f,
        ),
      );
      setAiLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(transactionId);
        return next;
      });
    },
    [findings, transactions, locale],
  );

  const value: AppContextValue = {
    locale,
    setLocale,
    t,
    theme,
    toggleTheme,
    activeSection,
    setActiveSection,
    sidebarCollapsed,
    toggleSidebar,
    mobileNavOpen,
    setMobileNavOpen,
    appState,
    transactions,
    findings,
    metrics,
    auditRun,
    isAuditing,
    uploadError,
    loadDemoData,
    uploadCsv,
    resetData,
    runAuditAction,
    findingFor,
    transactionFor,
    explainFinding,
    aiLoadingIds,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an AppProvider");
  return ctx;
}
