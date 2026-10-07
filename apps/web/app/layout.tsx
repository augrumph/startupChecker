import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Startup Checker",
  description: "Thesis Engine V4",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
