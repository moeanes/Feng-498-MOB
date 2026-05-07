import { Link } from "../../navigation";

export default function CTASection() {
  return (
    <section className="bg-[#0d1420] py-24 sm:py-32 relative overflow-hidden">

      {/* Background layers */}
      <div className="absolute inset-0 hero-grid opacity-30 pointer-events-none" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(14,165,233,0.15) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* ── Live status pill ────────────────────────────────────── */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-300">Platform Ready</span>
        </div>

        {/* ── Headline ────────────────────────────────────────────── */}
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.08]">
          Ready to take control of{" "}
          <span className="gradient-text">your infrastructure?</span>
        </h2>

        <p className="mt-5 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Log in to the dashboard and start monitoring your machines in real time.
          Track resource usage, configure alerts, and keep your systems healthy
          — all from one centralized platform.
        </p>

        {/* ── CTA Buttons ─────────────────────────────────────────── */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/login"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold text-white bg-sky-500 hover:bg-sky-400 active:bg-sky-600 transition-all duration-200 shadow-xl shadow-sky-500/25 hover:shadow-sky-400/40 hover:-translate-y-1"
          >
            Login to Dashboard
            <svg
              className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
              viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-bold text-slate-200 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.09] hover:border-white/20 transition-all duration-200 hover:-translate-y-1"
          >
            Explore Features
          </a>
        </div>

        {/* ── Trust indicators ────────────────────────────────────── */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-slate-500">
          {[
            "No subscription required",
            "Lightweight agents",
            "Open architecture",
            "Multi-machine ready",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 14 14" fill="currentColor">
                <path d="M12.28 3.28a.75.75 0 010 1.06l-7 7a.75.75 0 01-1.06 0l-3-3a.75.75 0 011.06-1.06L4.75 9.69l6.47-6.47a.75.75 0 011.06.06z"/>
              </svg>
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
