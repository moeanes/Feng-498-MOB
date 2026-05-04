import type { Metadata } from "next";
import LoginForm from "@/components/login/LoginForm";
import LoginSidePanel from "@/components/login/LoginSidePanel";

export const metadata: Metadata = {
  title: "Sign In — PulseWatch",
  description: "Sign in to access the PulseWatch system monitoring dashboard.",
};

/**
 * Login Page — /login
 *
 * Two-column layout:
 *  - Left (lg+): animated side panel with monitoring visuals
 *  - Right: login form with mock auth
 *
 * FIREBASE INTEGRATION GUIDE:
 *  The actual auth logic lives in: src/components/login/LoginForm.tsx
 *  Look for the "TODO: FIREBASE" comments in that file for exact integration points.
 *
 * ROUTE PROTECTION NOTE:
 *  Once Firebase is integrated, protect /dashboard by adding middleware at
 *  src/middleware.ts that checks the Firebase session and redirects here if unauth.
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0b1120] flex">

      {/* ── Left: Decorative side panel (desktop only) ─────────── */}
      <div className="hidden lg:block lg:w-[45%] xl:w-[42%] shrink-0">
        <LoginSidePanel />
      </div>

      {/* ── Vertical divider ────────────────────────────────────── */}
      <div className="hidden lg:block w-px bg-white/[0.05] shrink-0" />

      {/* ── Right: Login form ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center relative">

        {/* Background subtle grid */}
        <div className="absolute inset-0 hero-grid opacity-20 pointer-events-none" />

        {/* Subtle glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)" }}
        />

        {/* Form wrapper */}
        <div className="relative z-10 w-full max-w-sm px-6 py-10 animate-fade-in-up">
          <LoginForm />
        </div>

        {/* Bottom footer note */}
        <p className="absolute bottom-6 text-xs text-slate-700 text-center px-4">
          © {new Date().getFullYear()} PulseWatch · University Systems Monitoring Project · Demo Mode
        </p>
      </div>

    </div>
  );
}
