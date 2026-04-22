import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JCP POC — Button fixture",
  description: "Button fixture for the jira-codex-poc auto-fix workflow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
