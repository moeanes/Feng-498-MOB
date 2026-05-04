import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "PulseWatch — Centralized System Monitoring",
  description:
    "Monitor every machine from one place. Track CPU, memory, disk, and network activity across multiple machines in real time with PulseWatch.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
