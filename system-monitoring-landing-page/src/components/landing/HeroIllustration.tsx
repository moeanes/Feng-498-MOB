"use client";

/**
 * HeroIllustration — SVG-based dashboard mock preview card.
 * Represents a monitoring dashboard with metric bars, status indicators,
 * and a mini chart — purely decorative, no real data.
 */
export default function HeroIllustration() {
  return (
    <div className="relative w-full max-w-[580px] mx-auto animate-fade-in-up delay-400">
      {/* ── Outer glow ring ──────────────────────────────────────── */}
      <div className="absolute inset-0 rounded-2xl bg-sky-500/10 blur-2xl scale-105 pointer-events-none" />

      {/* ── Main card ────────────────────────────────────────────── */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-[#111827] overflow-hidden shadow-2xl shadow-black/60">

        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-[#0d1520]">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <span className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <span className="ml-3 text-xs font-mono text-slate-400">
            PulseWatch — System Overview
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-mono">LIVE</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">

          {/* ── Machine status row ─────────────────────────────── */}
          <div className="flex gap-3">
            {[
              { name: "web-server-01",  status: "ok",   cpu: 42 },
              { name: "db-primary",     status: "warn", cpu: 78 },
              { name: "analytics-node", status: "ok",   cpu: 31 },
            ].map((machine) => (
              <div
                key={machine.name}
                className="flex-1 rounded-lg bg-[#0d1520] border border-white/[0.05] p-3"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      machine.status === "ok"
                        ? "bg-emerald-400"
                        : "bg-yellow-400 animate-pulse"
                    }`}
                  />
                  <span className="text-[9px] font-mono text-slate-400 truncate">
                    {machine.name}
                  </span>
                </div>
                <div className="text-lg font-bold text-white leading-none">
                  {machine.cpu}%
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">CPU</div>
                <div className="mt-2 h-1 rounded-full bg-white/[0.05]">
                  <div
                    className={`h-full rounded-full transition-all ${
                      machine.cpu > 70
                        ? "bg-yellow-400"
                        : "bg-sky-400"
                    }`}
                    style={{ width: `${machine.cpu}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ── Metrics ───────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            {/* RAM metric */}
            <div className="rounded-lg bg-[#0d1520] border border-white/[0.05] p-3">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Memory</div>
                  <div className="text-2xl font-bold text-white mt-0.5">12.4 <span className="text-sm font-normal text-slate-400">GB</span></div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="#a78bfa" strokeWidth="1.2" />
                    <rect x="3" y="5.5" width="2" height="3" rx="0.5" fill="#a78bfa" />
                    <rect x="6" y="5.5" width="2" height="3" rx="0.5" fill="#a78bfa" />
                    <rect x="9" y="5.5" width="2" height="3" rx="0.5" fill="#a78bfa" />
                  </svg>
                </div>
              </div>
              {/* Mini sparkline */}
              <svg viewBox="0 0 80 24" className="w-full h-6" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="ram-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,18 L10,16 L20,14 L30,15 L40,11 L50,13 L60,9 L70,11 L80,8" stroke="#a78bfa" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d="M0,18 L10,16 L20,14 L30,15 L40,11 L50,13 L60,9 L70,11 L80,8 L80,24 L0,24 Z" fill="url(#ram-grad)" />
              </svg>
            </div>

            {/* Disk metric */}
            <div className="rounded-lg bg-[#0d1520] border border-white/[0.05] p-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Disk Usage</div>
                  <div className="text-2xl font-bold text-white mt-0.5">67 <span className="text-sm font-normal text-slate-400">%</span></div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" stroke="#38bdf8" strokeWidth="1.2" />
                    <path d="M7 7 L7 1.5" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
                    <path d="M7 7 L10.9 9.25" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
                    <circle cx="7" cy="7" r="1" fill="#38bdf8" />
                  </svg>
                </div>
              </div>
              {/* Segmented disk bar */}
              <div className="mt-2 space-y-1.5">
                {[
                  { label: "System", pct: 22, color: "bg-sky-400" },
                  { label: "Data",   pct: 45, color: "bg-indigo-400" },
                ].map((seg) => (
                  <div key={seg.label} className="flex items-center gap-2">
                    <span className="text-[9px] text-slate-500 w-10">{seg.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/[0.05]">
                      <div className={`h-full rounded-full ${seg.color}`} style={{ width: `${seg.pct}%` }} />
                    </div>
                    <span className="text-[9px] text-slate-400">{seg.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Alert strip ───────────────────────────────────── */}
          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/25 px-3 py-2 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-yellow-400 shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1.5L1 13.5h14L8 1.5zm0 2.25L13.25 12.5H2.75L8 3.75zM7.25 7v3h1.5V7h-1.5zm0 3.75v1.5h1.5v-1.5h-1.5z" />
            </svg>
            <span className="text-[10px] text-yellow-300 font-mono">
              ALERT: db-primary CPU exceeded 75% threshold (78%)
            </span>
            <span className="ml-auto text-[9px] text-yellow-500/70">12s ago</span>
          </div>

          {/* ── Mini CPU sparkline (full width) ────────────────── */}
          <div className="rounded-lg bg-[#0d1520] border border-white/[0.05] p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Network I/O — web-server-01</span>
              <span className="text-[10px] text-sky-400 font-mono">↑ 1.2 MB/s  ↓ 3.8 MB/s</span>
            </div>
            <svg viewBox="0 0 240 32" className="w-full h-8" preserveAspectRatio="none">
              <defs>
                <linearGradient id="net-in" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="net-out" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Download */}
              <path d="M0,28 L20,22 L40,25 L60,18 L80,20 L100,14 L120,16 L140,10 L160,12 L180,8 L200,11 L220,7 L240,9"
                stroke="#38bdf8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M0,28 L20,22 L40,25 L60,18 L80,20 L100,14 L120,16 L140,10 L160,12 L180,8 L200,11 L220,7 L240,9 L240,32 L0,32 Z"
                fill="url(#net-in)" />
              {/* Upload */}
              <path d="M0,26 L20,24 L40,27 L60,23 L80,25 L100,21 L120,23 L140,19 L160,22 L180,18 L200,20 L220,16 L240,18"
                stroke="#34d399" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>

        </div>

        {/* ── Scan line effect ────────────────────────────────────── */}
        <div className="scan-line" />
      </div>

      {/* ── Floating badge: uptime ───────────────────────────────── */}
      <div className="absolute -bottom-3 -left-4 glass rounded-xl px-3 py-2 flex items-center gap-2 shadow-xl animate-float">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
        <span className="text-xs font-semibold text-white">99.8% Uptime</span>
      </div>

      {/* ── Floating badge: alert count ─────────────────────────── */}
      <div className="absolute -top-3 -right-4 glass rounded-xl px-3 py-2 flex items-center gap-2 shadow-xl animate-float" style={{ animationDelay: "1.5s" }}>
        <svg className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1L1 13.5h14L8 1zm0 9.5a.75.75 0 110 1.5.75.75 0 010-1.5zm-.75-5h1.5v4h-1.5z" />
        </svg>
        <span className="text-xs font-semibold text-white">1 Active Alert</span>
      </div>
    </div>
  );
}
