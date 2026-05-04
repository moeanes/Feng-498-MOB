import { db } from "@/db";
import { sql } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard — PulseWatch",
  description: "System monitoring dashboard",
};

/**
 * Dashboard Page — /dashboard
 *
 * NOTE: This is a placeholder page that preserves the original DB connectivity
 * check from the starter template. The actual dashboard UI should be built here
 * (or imported here) without modifying the landing page or login page.
 *
 * FIREBASE ROUTE PROTECTION NOTE:
 * Once Firebase auth is integrated, add a middleware check at src/middleware.ts
 * to redirect unauthenticated users away from this route back to /login.
 * The LoginForm component (src/components/login/LoginForm.tsx) contains
 * detailed integration instructions.
 */
export default async function DashboardPage() {
  // Preserve the original DB health check from the starter template
  await db.execute(sql`select 1`);

  return (
    <div className="min-h-screen bg-[#0b1120] text-white">

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="border-b border-white/[0.06] bg-[#0d1520]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#dash-logo-grad)" />
              <polyline points="3,16 8,16 10,10 13,22 16,8 19,20 22,14 24,16 29,16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="16" cy="8" r="1.5" fill="#34d399" />
              <defs>
                <linearGradient id="dash-logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#0369a1" />
                </linearGradient>
              </defs>
            </svg>
            <span className="font-bold text-sm text-white">PulseWatch Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-mono">LIVE</span>
            </div>
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-200 transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">

          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-500/15 border border-sky-500/25 mb-6">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-sky-400" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <polyline points="8 21 12 17 16 21" />
              <path d="M6 8l4 4 2-2 4 5" />
            </svg>
          </div>

          <h1 className="text-3xl font-extrabold text-white mb-3">
            Dashboard Ready
          </h1>
          <p className="text-slate-400 max-w-md mx-auto mb-2">
            The database connection is active and healthy. Your monitoring
            dashboard will be rendered here.
          </p>
          <p className="text-xs text-slate-600 mb-8">
            PostgreSQL connection verified · Drizzle ORM ready
          </p>

          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-emerald-300 font-medium">Database connected successfully</span>
          </div>

          {/* Navigation hint */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.09] transition-all"
            >
              ← Homepage
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-sky-500 hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/20"
            >
              Login Page →
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
