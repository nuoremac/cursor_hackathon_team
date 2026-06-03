import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinAudit API — Backend",
  description:
    "API de détection d'anomalies comptables (FinAudit). Endpoints d'analyse CSV et données de démo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
