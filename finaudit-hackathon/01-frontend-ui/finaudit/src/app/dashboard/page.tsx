import { AppProvider } from "@/context/AppContext";
import { AppShell } from "@/components/layout/AppShell";

export default function DashboardPage() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
