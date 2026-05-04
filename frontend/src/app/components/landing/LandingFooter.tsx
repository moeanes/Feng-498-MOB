import { Link } from "react-router-dom";
import { PulseWatchLogo } from "../shared/Logo";

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#080e1a] border-t border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Main footer grid ──────────────────────────────────── */}
        <div className="py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="/" className="flex items-center gap-3 mb-4 group">
              <PulseWatchLogo size={30} />
              <span className="text-white font-bold text-base group-hover:text-sky-400 transition-colors">
                PulseWatch
              </span>
            </a>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              A centralized system monitoring platform designed to track resource
              usage across multiple machines from one web dashboard.
            </p>
            {/* Status dot */}
            <div className="mt-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-500">All systems operational</span>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
              Platform
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Features",     href: "#features"     },
                { label: "How It Works", href: "#how-it-works" },
                { label: "Benefits",     href: "#benefits"     },
                { label: "Dashboard",    href: "/dashboard"    },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-500 hover:text-slate-200 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
              Account
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Login",             href: "/login" },
                { label: "Access Dashboard",  href: "/login" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-500 hover:text-slate-200 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Project info */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
              Project
            </h4>
            <ul className="space-y-3">
              <li className="text-sm text-slate-500">Academic / Research Project</li>
              <li className="text-sm text-slate-500">Systems Monitoring Platform</li>
              <li className="text-sm text-slate-500">University Capstone</li>
            </ul>
          </div>

        </div>

        {/* ── Bottom bar ────────────────────────────────────────── */}
        <div className="py-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">
            © {currentYear} PulseWatch. Built as part of a university systems monitoring project.
          </p>
          <p className="text-xs text-slate-600">
            Centralized System Monitoring Platform · Demo Version
          </p>
        </div>

      </div>
    </footer>
  );
}
