const steps = [
  {
    number: "01",
    color: "sky",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="M7 7h.01M7 11h.01M10 7h7M10 11h5" />
      </svg>
    ),
    title: "Agents Collect Metrics",
    description:
      "Lightweight software agents are deployed on each machine you want to monitor. They continuously sample CPU load, memory usage, disk utilization, and network I/O, then securely forward the data to the central backend.",
    detail: "Minimal footprint · Configurable interval · Secure transport",
  },
  {
    number: "02",
    color: "indigo",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6" />
        <path d="M2 20h20" />
      </svg>
    ),
    title: "Backend Receives & Stores",
    description:
      "The centralized backend receives metric payloads from all agents, validates and processes them, and persists them in a structured database. Each data point is associated with the correct machine and timestamp.",
    detail: "Time-series storage · Machine association · Data validation",
  },
  {
    number: "03",
    color: "emerald",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
        <path d="M13 13h5M13 17h3" />
      </svg>
    ),
    title: "Dashboard Visualizes Data",
    description:
      "The web dashboard presents live and historical metrics through interactive charts, metric cards, and status indicators. You can switch between machines, inspect trends, and filter by time range.",
    detail: "Live & historical views · Charts & cards · Per-machine detail",
  },
  {
    number: "04",
    color: "yellow",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    title: "Alerts Fire on Thresholds",
    description:
      "You define threshold values for any metric on any machine. When an incoming metric exceeds its limit, the system generates an alert and surfaces it prominently on the dashboard for immediate visibility.",
    detail: "Custom thresholds · Instant detection · Per-metric configuration",
  },
];

const colorMap: Record<string, { ring: string; icon: string; bg: string; badge: string; connector: string }> = {
  sky:    { ring: "ring-sky-400/30",     icon: "text-sky-400",     bg: "bg-sky-400/10",     badge: "bg-sky-400/15 text-sky-300 border-sky-400/25",    connector: "from-sky-400/40 to-indigo-400/20" },
  indigo: { ring: "ring-indigo-400/30",  icon: "text-indigo-400",  bg: "bg-indigo-400/10",  badge: "bg-indigo-400/15 text-indigo-300 border-indigo-400/25", connector: "from-indigo-400/40 to-emerald-400/20" },
  emerald:{ ring: "ring-emerald-400/30", icon: "text-emerald-400", bg: "bg-emerald-400/10", badge: "bg-emerald-400/15 text-emerald-300 border-emerald-400/25", connector: "from-emerald-400/40 to-yellow-400/20" },
  yellow: { ring: "ring-yellow-400/30",  icon: "text-yellow-400",  bg: "bg-yellow-400/10",  badge: "bg-yellow-400/15 text-yellow-300 border-yellow-400/25",  connector: "" },
};

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-[#0d1420] py-24 sm:py-32 relative overflow-hidden">

      {/* Background accent */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(14,165,233,0.05) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ────────────────────────────────────── */}
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-emerald-300 uppercase tracking-wide mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            From agent to dashboard{" "}
            <span className="gradient-text">in four simple steps</span>
          </h2>
          <p className="mt-4 text-base text-slate-400 max-w-2xl mx-auto">
            The platform is designed with a clear and practical flow — from data
            collection on individual machines to visualization and alerting in
            the central dashboard.
          </p>
        </div>

        {/* ── Steps grid ─────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, i) => {
            const c = colorMap[step.color];
            return (
              <div key={step.number} className="relative flex flex-col">
                {/* Connector line (desktop only, not last) */}
                {i < steps.length - 1 && (
                  <div
                    className={`hidden lg:block absolute top-9 left-[calc(50%+36px)] right-[-50%] h-px bg-gradient-to-r ${c.connector} pointer-events-none`}
                  />
                )}

                <div className={`group rounded-2xl border border-white/[0.06] bg-[#111827] p-6 flex flex-col h-full card-hover ring-1 ${c.ring} animate-fade-in-up`}
                  style={{ animationDelay: `${i * 0.1}s` }}>

                  {/* Number + Icon row */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.icon} flex items-center justify-center ring-1 ${c.ring} group-hover:scale-110 transition-transform duration-200`}>
                      {step.icon}
                    </div>
                    <span className={`text-2xl font-black ${c.icon} opacity-30`}>{step.number}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-white mb-2">{step.title}</h3>

                  {/* Description */}
                  <p className="text-sm text-slate-400 leading-relaxed flex-1">{step.description}</p>

                  {/* Detail badge */}
                  <div className={`mt-4 inline-flex self-start px-2.5 py-1 rounded-lg border text-[10px] font-mono font-medium ${c.badge}`}>
                    {step.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Bottom CTA strip ──────────────────────────────────── */}
        <div className="mt-14 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl border border-white/[0.06] bg-[#111827]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-slate-400">Data flows continuously while agents are running</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
