/**
 * LoginSidePanel — decorative left panel shown on md+ screens.
 * Contains animated monitoring visuals and feature highlights.
 * Purely presentational — no auth logic.
 */
export default function LoginSidePanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between login-panel-bg relative overflow-hidden p-10 xl:p-12">

      {/* ── Background grid ───────────────────────────────────────── */}
      <div className="absolute inset-0 hero-grid opacity-40 pointer-events-none" />

      {/* ── Radial glows ──────────────────────────────────────────── */}
      <div
        className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(52,211,153,0.10) 0%, transparent 70%)" }}
      />

      {/* ── Logo / Brand ──────────────────────────────────────────── */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="url(#side-logo-grad)" />
            <polyline points="3,16 8,16 10,10 13,22 16,8 19,20 22,14 24,16 29,16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="16" cy="8" r="1.5" fill="#34d399" />
            <defs>
              <linearGradient id="side-logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-xl font-bold text-white tracking-tight">PulseWatch</span>
        </div>
        <p className="text-sm text-slate-400">Centralized System Monitoring</p>
      </div>

      {/* ── Animated mini-dashboard ───────────────────────────────── */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-8">
        <div className="w-full max-w-xs">

          {/* Machine status cards */}
          <div className="space-y-3 mb-4">
            {[
              { name: "web-server-01",  cpu: 42, mem: 61, status: "ok"   },
              { name: "db-primary",     cpu: 78, mem: 83, status: "warn" },
              { name: "analytics-node", cpu: 31, mem: 48, status: "ok"   },
            ].map((machine, i) => (
              <div
                key={machine.name}
                className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-3.5 backdrop-blur-sm animate-fade-in-up"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${machine.status === "ok" ? "bg-emerald-400" : "bg-yellow-400 animate-pulse"}`} />
                    <span className="text-xs font-mono text-slate-300">{machine.name}</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    machine.status === "ok"
                      ? "bg-emerald-400/15 text-emerald-400"
                      : "bg-yellow-400/15 text-yellow-400"
                  }`}>
                    {machine.status === "ok" ? "HEALTHY" : "WARNING"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "CPU", value: machine.cpu, color: machine.cpu > 70 ? "bg-yellow-400" : "bg-sky-400" },
                    { label: "MEM", value: machine.mem, color: machine.mem > 75 ? "bg-rose-400"   : "bg-purple-400" },
                  ].map((metric) => (
                    <div key={metric.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] text-slate-500 font-mono">{metric.label}</span>
                        <span className="text-[10px] text-slate-300 font-mono">{metric.value}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/[0.07]">
                        <div
                          className={`h-full rounded-full ${metric.color} metric-bar`}
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Alert indicator */}
          <div className="rounded-xl border border-yellow-500/25 bg-yellow-500/10 p-3 flex items-start gap-2.5 animate-fade-in delay-500">
            <svg className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1.5L1 13.5h14L8 1.5zm0 2.25L13.25 12.5H2.75L8 3.75zM7.25 7v3h1.5V7h-1.5zm0 3.75v1.5h1.5v-1.5h-1.5z" />
            </svg>
            <div>
              <p className="text-[10px] text-yellow-300 font-mono leading-snug">
                db-primary CPU above threshold
              </p>
              <p className="text-[10px] text-yellow-600 mt-0.5">Threshold: 75% · Current: 78%</p>
            </div>
          </div>

          {/* Live indicator */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono text-slate-500">Live data · updating every 5s</span>
          </div>
        </div>
      </div>

      {/* ── Bottom feature list ───────────────────────────────────── */}
      <div className="relative z-10 space-y-3">
        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-4">
          What you get
        </p>
        {[
          "Real-time resource monitoring across all machines",
          "Historical usage trends and time-series charts",
          "Instant alerts when thresholds are exceeded",
          "Per-machine health status at a glance",
        ].map((item) => (
          <div key={item} className="flex items-start gap-2.5">
            <svg className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
            </svg>
            <span className="text-xs text-slate-400 leading-relaxed">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
