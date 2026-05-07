import { Link } from "../../navigation";
import HeroIllustration from "./HeroIllustration";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0b1120]">

      {/* ── Background layers ──────────────────────────────────────── */}
      {/* Grid overlay */}
      <div className="absolute inset-0 hero-grid opacity-60 pointer-events-none" />

      {/* Radial glow — top left */}
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)" }}
      />
      {/* Radial glow — bottom right */}
      <div
        className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)" }}
      />

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left: Text ──────────────────────────────────────── */}
          <div>
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 mb-6 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-xs font-semibold text-sky-300 tracking-wide uppercase">
                Centralized Monitoring Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight animate-fade-in-up delay-100">
              Monitor Every{" "}
              <br className="hidden sm:block" />
              Machine from{" "}
              <span className="gradient-text">One Place</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl animate-fade-in-up delay-200">
              Track CPU, memory, disk, and network activity across multiple machines
              in real time. Review historical usage trends and detect critical
              conditions early with intelligent threshold-based alerts.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap gap-3 animate-fade-in-up delay-300">
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-sky-500 hover:bg-sky-400 active:bg-sky-600 transition-all duration-200 shadow-lg shadow-sky-500/25 hover:shadow-sky-400/35 hover:-translate-y-px"
              >
                Get Started
                <svg
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-200 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.09] hover:border-white/20 active:bg-white/[0.04] transition-all duration-200 hover:-translate-y-px"
              >
                Login to Dashboard
              </Link>
            </div>

            {/* Social proof strip */}
            <div className="mt-10 flex items-center gap-5 animate-fade-in-up delay-400">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
                </svg>
                <span className="text-sm text-slate-400">Real-time data</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
                </svg>
                <span className="text-sm text-slate-400">Multi-machine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
                </svg>
                <span className="text-sm text-slate-400">Smart alerts</span>
              </div>
            </div>
          </div>

          {/* ── Right: Illustration ─────────────────────────────── */}
          <div className="flex justify-center lg:justify-end">
            <HeroIllustration />
          </div>
        </div>
      </div>

      {/* ── Bottom fade into next section ─────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #0b1120)" }}
      />
    </section>
  );
}
