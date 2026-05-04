"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PulseWatchLogo } from "@/components/shared/Logo";

// ─────────────────────────────────────────────────────────────────────────────
// AUTH INTEGRATION NOTE
// ─────────────────────────────────────────────────────────────────────────────
// This component currently implements MOCK authentication.
// Any non-empty email + password combination is accepted.
//
// TO INTEGRATE FIREBASE AUTH LATER:
//   1. Install: npm install firebase
//   2. Create: src/lib/firebase.ts  (initializeApp + getAuth)
//   3. Replace the mock block below (marked with TODO: FIREBASE) with:
//        import { signInWithEmailAndPassword } from "firebase/auth";
//        import { auth } from "@/lib/firebase";
//        await signInWithEmailAndPassword(auth, email, password);
//   4. Handle FirebaseError codes (auth/user-not-found, auth/wrong-password, etc.)
//   5. Remove the demo-mode banner once real auth is active.
//
// ROUTE PROTECTION NOTE:
//   After integrating Firebase, add a middleware or layout-level auth check
//   at src/middleware.ts to protect /dashboard and any other authenticated routes.
//   Check the Firebase ID token or session cookie and redirect to /login if absent.
// ─────────────────────────────────────────────────────────────────────────────

interface FormState {
  email:    string;
  password: string;
  remember: boolean;
}

interface FieldError {
  email?:    string;
  password?: string;
}

export default function LoginForm() {
  const router = useRouter();

  const [form,     setForm]     = useState<FormState>({ email: "", password: "", remember: false });
  const [errors,   setErrors]   = useState<FieldError>({});
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  /* ── Field change handler ──────────────────────────────────── */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    // Clear field error on change
    if (name in errors) setErrors((prev) => ({ ...prev, [name]: undefined }));
    setApiError(null);
  };

  /* ── Client-side validation ────────────────────────────────── */
  const validate = (): boolean => {
    const newErrors: FieldError = {};
    if (!form.email.trim())    newErrors.email    = "Email or username is required.";
    if (!form.password.trim()) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ── Form submit ───────────────────────────────────────────── */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError(null);

    try {
      // ── TODO: FIREBASE — Replace this block with Firebase auth ──────────
      // MOCK AUTH: Simulate a short network delay, then accept any credentials.
      // This block should be completely replaced when integrating Firebase.
      await new Promise<void>((resolve) => setTimeout(resolve, 800));
      // ── END MOCK AUTH ───────────────────────────────────────────────────

      // On successful sign-in, redirect to the dashboard.
      // This router.push call stays the same after Firebase integration —
      // just ensure it runs after a confirmed successful auth, not before.
      router.push("/dashboard");

    } catch {
      // ── TODO: FIREBASE — Map Firebase error codes to user-friendly messages ──
      // Example after Firebase integration:
      //   if (err.code === "auth/user-not-found") setApiError("No account found with this email.");
      //   else if (err.code === "auth/wrong-password") setApiError("Incorrect password.");
      //   else setApiError("Sign in failed. Please try again.");
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center w-full max-w-sm mx-auto px-6 py-10 lg:py-0">

      {/* ── Mobile logo (hidden on desktop — side panel shows it there) ── */}
      <div className="flex lg:hidden items-center gap-3 mb-8">
        <PulseWatchLogo size={32} />
        <span className="text-lg font-bold text-white">PulseWatch</span>
      </div>

      {/* ── Heading ─────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Sign in to your account
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Access the monitoring dashboard to manage your machines.
        </p>
      </div>

      {/* ── Demo mode banner ────────────────────────────────────── */}
      {/* TODO: FIREBASE — Remove this banner once real authentication is active */}
      <div className="mb-6 rounded-xl border border-sky-500/25 bg-sky-500/10 p-4 flex gap-3">
        <svg className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.75 10.5h-1.5v-4.5h1.5v4.5zm0-6h-1.5v-1.5h1.5v1.5z"/>
        </svg>
        <div>
          <p className="text-xs font-semibold text-sky-300 mb-0.5">Demo Mode</p>
          <p className="text-xs text-sky-400/80 leading-relaxed">
            Authentication is currently in demo mode. Enter any non-empty email
            and password to access the dashboard.
          </p>
        </div>
      </div>

      {/* ── API / Auth error ────────────────────────────────────── */}
      {apiError && (
        <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 flex items-start gap-2.5 animate-fade-in">
          <svg className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4.5h1.5l-.25 5h-1l-.25-5zm1.5 6.5a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
          </svg>
          <p className="text-sm text-rose-400">{apiError}</p>
        </div>
      )}

      {/* ── Login form ──────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">

        {/* Email / Username */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
            Email or Username
          </label>
          <input
            id="email"
            name="email"
            type="text"
            autoComplete="username email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={`w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border text-white text-sm placeholder-slate-600 transition-all duration-200 focus-ring focus:outline-none ${
              errors.email
                ? "border-rose-500/60 bg-rose-500/5"
                : "border-white/[0.09] hover:border-white/20 focus:border-sky-500/60"
            }`}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
              <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 1a5 5 0 100 10A5 5 0 006 1zm-.5 3h1v3.5h-1V4zm.5 5a.75.75 0 110-1.5.75.75 0 010 1.5z"/>
              </svg>
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
              Password
            </label>
            {/* TODO: FIREBASE — Wire this to Firebase's sendPasswordResetEmail */}
            <button
              type="button"
              className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
              onClick={() => {
                // Placeholder — will trigger Firebase password reset after integration
                alert("Password reset will be available after Firebase integration.");
              }}
            >
              Forgot password?
            </button>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className={`w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border text-white text-sm placeholder-slate-600 transition-all duration-200 focus-ring focus:outline-none ${
              errors.password
                ? "border-rose-500/60 bg-rose-500/5"
                : "border-white/[0.09] hover:border-white/20 focus:border-sky-500/60"
            }`}
          />
          {errors.password && (
            <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
              <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 1a5 5 0 100 10A5 5 0 006 1zm-.5 3h1v3.5h-1V4zm.5 5a.75.75 0 110-1.5.75.75 0 010 1.5z"/>
              </svg>
              {errors.password}
            </p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              checked={form.remember}
              onChange={handleChange}
              className="sr-only peer"
            />
            <label
              htmlFor="remember"
              className="w-4 h-4 rounded border border-white/[0.15] bg-white/[0.06] peer-checked:bg-sky-500 peer-checked:border-sky-500 cursor-pointer flex items-center justify-center transition-all duration-150"
            >
              {form.remember && (
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="currentColor">
                  <path d="M8.5 2L4 7.5 1.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              )}
            </label>
          </div>
          <label htmlFor="remember" className="text-sm text-slate-400 cursor-pointer select-none">
            Remember me for 30 days
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-sky-500 hover:bg-sky-400 active:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-sky-500/20 hover:shadow-sky-400/30 hover:-translate-y-px flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in…
            </>
          ) : (
            <>
              Sign In
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>
      </form>

      {/* ── Back to landing ─────────────────────────────────────── */}
      <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-200 transition-colors group"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
            viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <path d="M13 8H3M7 4L3 8l4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
