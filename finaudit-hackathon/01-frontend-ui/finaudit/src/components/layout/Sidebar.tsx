"use client";

import Image from "next/image";
import {
  IconLayoutDashboard,
  IconTable,
  IconAlertTriangle,
  IconWand,
  IconSettings,
  IconLogout,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconX,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useApp } from "@/context/AppContext";
import type { SectionId } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n";

type NavItem = {
  id: SectionId;
  labelKey: TranslationKey;
  icon: Icon;
  disabled?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", labelKey: "nav.dashboard", icon: IconLayoutDashboard },
  { id: "transactions", labelKey: "nav.transactions", icon: IconTable },
  { id: "report", labelKey: "nav.report", icon: IconAlertTriangle },
  { id: "ai-review", labelKey: "nav.aiReview", icon: IconWand },
];

export function Sidebar() {
  const {
    activeSection,
    setActiveSection,
    sidebarCollapsed,
    toggleSidebar,
    mobileNavOpen,
    setMobileNavOpen,
    t,
  } = useApp();

  const collapsed = sidebarCollapsed;

  const go = (id: SectionId) => {
    setActiveSection(id);
    setMobileNavOpen(false);
  };

  return (
    <>
      {/* Mobile scrim */}
      {mobileNavOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden
        />
      ) : null}

      <aside
        className={`${collapsed ? "lg:w-[52px]" : "lg:w-[220px]"} ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col border-r border-[var(--border)] bg-sidebar transition-[width,transform] duration-200 lg:static lg:z-auto`}
        aria-label="Primary"
      >
        {/* Logo row */}
        <div className="flex h-[52px] items-center gap-2 border-b border-[var(--border)] px-4">
          <button
            type="button"
            onClick={() => go("dashboard")}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
            aria-label={t("app.name")}
          >
            <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#0b1a2b] ring-1 ring-[var(--border)]">
              <Image
                src="/logo.png"
                alt={t("app.name")}
                fill
                sizes="28px"
                className="scale-[1.7] object-contain"
                priority
              />
            </span>
            {!collapsed ? (
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-[14px] font-medium text-tprimary">
                  {t("app.name")}
                </span>
                <span className="truncate text-[11px] text-tmuted">
                  {t("app.tagline")}
                </span>
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-tsecondary hover:bg-surface-2 lg:hidden"
            aria-label={t("nav.collapse")}
          >
            <IconX size={16} />
          </button>
          <button
            type="button"
            onClick={toggleSidebar}
            className="hidden h-7 w-7 items-center justify-center rounded-md text-tsecondary hover:bg-surface-2 lg:flex"
            aria-label={collapsed ? t("nav.expand") : t("nav.collapse")}
            title={collapsed ? t("nav.expand") : t("nav.collapse")}
          >
            {collapsed ? (
              <IconLayoutSidebarLeftExpand size={16} />
            ) : (
              <IconLayoutSidebarLeftCollapse size={16} />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <ul className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <NavButton
                  item={item}
                  active={activeSection === item.id}
                  collapsed={collapsed}
                  onClick={() => go(item.id)}
                  label={t(item.labelKey)}
                  comingSoon={t("nav.comingSoon")}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom */}
        <div className="border-t border-[var(--border)] px-2 py-3">
          <button
            type="button"
            className={`flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-[13px] text-tsecondary transition-colors hover:bg-surface-2 ${collapsed ? "lg:justify-center" : ""}`}
            title={t("nav.settings")}
          >
            <IconSettings size={16} stroke={1.75} className="shrink-0" />
            {!collapsed ? <span>{t("nav.settings")}</span> : null}
          </button>

          <div
            className={`mt-2 flex items-center gap-2.5 rounded-md px-2.5 py-1.5 ${collapsed ? "lg:justify-center" : ""}`}
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-medium text-on-accent"
              aria-hidden
            >
              AK
            </span>
            {!collapsed ? (
              <>
                <span className="min-w-0 flex-1 truncate text-[12px] text-tprimary">
                  Aïcha Kamga
                </span>
                <button
                  type="button"
                  aria-label={t("nav.logout")}
                  title={t("nav.logout")}
                  className="flex h-6 w-6 items-center justify-center rounded text-tmuted hover:text-tprimary"
                >
                  <IconLogout size={14} />
                </button>
              </>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
}

type NavButtonProps = {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  label: string;
  comingSoon: string;
  onClick: () => void;
};

function NavButton({
  item,
  active,
  collapsed,
  label,
  onClick,
}: NavButtonProps) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={`group relative flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-[13px] transition-colors duration-150 ${
        collapsed ? "lg:justify-center" : ""
      } ${
        active
          ? "bg-accent-soft font-medium text-accent"
          : "text-tsecondary hover:bg-surface-2"
      }`}
    >
      {active ? (
        <span
          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-accent"
          aria-hidden
        />
      ) : null}
      <Icon size={16} stroke={1.85} className="shrink-0" />
      {!collapsed ? <span className="truncate">{label}</span> : null}
    </button>
  );
}
