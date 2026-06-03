"use client";

import { IconMoon, IconSun } from "@tabler/icons-react";
import { useApp } from "@/context/AppContext";

export function ThemeToggle() {
  const { theme, toggleTheme, t } = useApp();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t("topbar.toggleTheme")}
      title={t("topbar.toggleTheme")}
      className="flex h-8 w-8 items-center justify-center rounded-md text-tsecondary transition-colors hover:bg-surface-2"
    >
      {isDark ? <IconSun size={18} stroke={1.75} /> : <IconMoon size={18} stroke={1.75} />}
    </button>
  );
}
