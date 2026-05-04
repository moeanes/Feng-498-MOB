const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-sky-400/20",
    title: "Real-Time Monitoring",
    description:
      "Lightweight agents continuously collect CPU, RAM, disk, and network metrics from each machine and push them to the central platform with minimal delay.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <polyline points="8 21 12 17 16 21" />
        <path d="M7 8l3 3 2-2 3 4" />
      </svg>
    ),
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
    title: "Historical Resource Tracking",
    description:
      "Browse and analyze past usage patterns with time-series data stored for each monitored machine, so you can spot trends and plan capacity proactively.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
    title: "Threshold-Based Alerts",
    description:
      "Define custom thresholds for any metric on any machine. When a value exceeds its limit, the system generates an alert immediately so you can act fast.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
        <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
        <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
        <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
        <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
      </svg>
    ),
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    title: "Centralized Visibility",
    description:
      "One unified dashboard gives you a complete picture of all your machines. No need to log into individual systems — everything is aggregated in one view.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="8" height="8" rx="1.5" />
        <rect x="14" y="2" width="8" height="8" rx="1.5" />
        <rect x="2" y="14" width="8" height="8" rx="1.5" />
        <rect x="14" y="14" width="8" height="8" rx="1.5" />
      </svg>
    ),
    color: "text-indigo-400",
    bg: "bg-indigo-400/10",
    border: "border-indigo-400/20",
    title: "Multi-Machine Support",
    description:
      "Scale your monitoring effortlessly. Add new machines by deploying an agent — the platform automatically associates incoming data with the correct host.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    border: "border-rose-400/20",
    title: "Practical & User-Friendly",
    description:
      "Designed for clarity over complexity. Clean charts, intuitive status cards, and a structured layout make it easy to understand system health at a glance.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-[#0b1120] py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ──────────────────────────────────────── */}
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-xs font-semibold text-sky-300 uppercase tracking-wide mb-4">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Everything you need to{" "}
            <span className="gradient-text">monitor your infrastructure</span>
          </h2>
          <p className="mt-4 text-base text-slate-400 max-w-2xl mx-auto">
            Built for labs, offices, and academic environments where you need
            practical observability without the overhead of enterprise tooling.
          </p>
        </div>

        {/* ── Feature grid ────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`group relative rounded-2xl border bg-[#111827] p-6 card-hover animate-fade-in-up ${feature.border}`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.bg} ${feature.color} mb-5 border ${feature.border} transition-transform group-hover:scale-110 duration-200`}>
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-white mb-2 group-hover:text-sky-300 transition-colors">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-400 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover glow dot */}
              <div className={`absolute top-4 right-4 w-1.5 h-1.5 rounded-full ${feature.color.replace("text-", "bg-")} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
