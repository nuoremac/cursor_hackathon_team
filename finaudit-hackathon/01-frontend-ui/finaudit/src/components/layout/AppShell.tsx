"use client";

import { useApp } from "@/context/AppContext";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { TopActionsBar } from "./TopActionsBar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { TransactionsSection } from "@/components/transactions/TransactionsSection";
import { ReportSection } from "@/components/report/ReportSection";
import { AiReviewSection } from "@/components/aireview/AiReviewSection";

export function AppShell() {
  const { activeSection } = useApp();

  return (
    <div className="theme-transition flex h-screen w-full overflow-hidden bg-page">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <TopActionsBar />
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="mx-auto max-w-[1280px]">
            {activeSection === "dashboard" ? <Dashboard /> : null}
            {activeSection === "transactions" ? <TransactionsSection /> : null}
            {activeSection === "report" ? <ReportSection /> : null}
            {activeSection === "ai-review" ? <AiReviewSection /> : null}
          </div>
        </main>
      </div>
    </div>
  );
}
