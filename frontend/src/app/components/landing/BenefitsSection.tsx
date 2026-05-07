const benefits = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12l3 3 5-5" />
      </svg>
    ),
    title: "Simpler than enterprise tools",
    description:
      "No sprawling configuration, no steep learning curve. PulseWatch focuses on what matters: resource visibility and alerts, without the bloat of tools built for thousand-node clusters.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    title: "Built for small & medium environments",
    description:
      "Ideal for university labs, small offices, academic setups, and development teams that need practical observability without enterprise overhead or licensing costs.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14M15.54 8.46a5 5 0 010 7.07M8.46 8.46a5 5 0 000 7.07" />
      </svg>
    ),
    title: "Centralized monitoring hub",
    description:
      "All your machines, one dashboard. No need to jump between servers or install per-machine dashboards — everything flows to a single, always-accessible web interface.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="M7 8h10M7 12h6" />
      </svg>
    ),
    title: "Practical and accessible interface",
    description:
      "Designed for real users, not just sys-admins. The interface uses clear charts, status cards, and color-coded indicators so anyone on the team can understand system health instantly.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    title: "Clean, maintainable codebase",
    description:
      "Built with modern frontend and backend practices — component-based UI, structured API layer, and clear separation of concerns — making it easy to extend, maintain, and hand off.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: "Secure and structured by design",
    description:
      "Authenticated access controls who can see the dashboard. The architecture is ready for production hardening — Firebase auth integration, role-based access, and HTTPS enforcement.",
  },
];

export default function BenefitsSection() {
  return (
    <section id="benefits" className="bg-[#0b1120] py-24 sm:py-32 relative overflow-hidden">

      {/* Background accent */}
      <div
        className="absolute -top-40 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Two-column layout ──────────────────────────────────── */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-start">

          {/* Left: sticky header */}
          <div className="lg:col-span-4 mb-12 lg:mb-0 lg:sticky lg:top-24">
            <span className="inline-block px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-emerald-300 uppercase tracking-wide mb-4">
              Why Choose PulseWatch
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-[1.1]">
              Monitoring that{" "}
              <span className="gradient-text">actually fits your scale</span>
            </h2>
            <p className="mt-4 text-base text-slate-400 leading-relaxed">
              PulseWatch is purpose-built for environments where simplicity,
              clarity, and practical utility matter more than feature sprawl.
            </p>

            {/* Stat row */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { value: "< 1%", label: "Agent CPU overhead" },
                { value: "∞",   label: "Machines supported" },
                { value: "Real-time", label: "Data latency" },
                { value: "One",  label: "Dashboard to rule them all" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-[#111827] p-4">
                  <div className="text-xl font-black gradient-text">{stat.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5 leading-snug">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: benefit cards */}
          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-5">
            {benefits.map((benefit, i) => (
              <div
                key={benefit.title}
                className="group rounded-2xl border border-white/[0.06] bg-[#111827] p-5 card-hover animate-fade-in-up"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-9 h-9 rounded-xl bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-emerald-300 transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Comparison table ────────────────────────────────────── */}
        <div className="mt-20">
          <h3 className="text-center text-lg font-bold text-white mb-8">
            How PulseWatch compares
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Capability</th>
                  <th className="py-3 px-4 text-sky-400 font-bold text-center">PulseWatch</th>
                  <th className="py-3 px-4 text-slate-500 font-medium text-center">Prometheus + Grafana</th>
                  <th className="py-3 px-4 text-slate-500 font-medium text-center">Datadog / Dynatrace</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cap: "Easy setup for small teams",   pw: true,  pg: false, dd: false },
                  { cap: "Centralized web dashboard",     pw: true,  pg: true,  dd: true  },
                  { cap: "Threshold-based alerts",        pw: true,  pg: true,  dd: true  },
                  { cap: "Historical data visualization", pw: true,  pg: true,  dd: true  },
                  { cap: "Zero licensing cost",           pw: true,  pg: true,  dd: false },
                  { cap: "Low configuration overhead",    pw: true,  pg: false, dd: false },
                  { cap: "Multi-machine support",         pw: true,  pg: true,  dd: true  },
                ].map((row, i) => (
                  <tr
                    key={row.cap}
                    className={`border-b border-white/[0.04] ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}
                  >
                    <td className="py-3 px-4 text-slate-300">{row.cap}</td>
                    {[row.pw, row.pg, row.dd].map((val, j) => (
                      <td key={j} className="py-3 px-4 text-center">
                        {val ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-400/15 text-emerald-400">
                            <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3">
                              <path d="M10.28 2.28L4 8.56 1.72 6.28a1 1 0 00-1.44 1.44l3 3a1 1 0 001.44 0l7-7a1 1 0 00-1.44-1.44z"/>
                            </svg>
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-700/50 text-slate-600">
                            <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3">
                              <path d="M9.78 2.22a.75.75 0 010 1.06L7.06 6l2.72 2.72a.75.75 0 01-1.06 1.06L6 7.06 3.28 9.78a.75.75 0 01-1.06-1.06L4.94 6 2.22 3.28a.75.75 0 011.06-1.06L6 4.94l2.72-2.72a.75.75 0 011.06 0z"/>
                            </svg>
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
