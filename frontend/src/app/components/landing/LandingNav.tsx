"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PulseWatchLogo } from "../shared/Logo";

const navLinks = [
  { label: "Features",    href: "#features"    },
  { label: "How It Works",href: "#how-it-works" },
  { label: "Benefits",    href: "#benefits"     },
];

export default function LandingNav() {
  const [scrolled,       setScrolled]       = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [activeSection,  setActiveSection]  = useState("");

  /* ── Scroll shadow ───────────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Active section tracking ─────────────────────────────────── */
  useEffect(() => {
    const ids = navLinks.map((l) => l.href.replace("#", ""));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  /* ── Close mobile menu on route ─────────────────────────────── */
  const handleNavClick = () => setMobileOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0b1120]/95 backdrop-blur-md border-b border-white/[0.06] shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">

          {/* ── Logo ─────────────────────────────────────────── */}
          <a href="/" className="flex items-center gap-3 group">
            <PulseWatchLogo size={32} />
            <span className="text-white font-bold text-lg tracking-tight group-hover:text-sky-400 transition-colors">
              PulseWatch
            </span>
          </a>

          {/* ── Desktop Links ─────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const id = link.href.replace("#", "");
              const isActive = activeSection === id;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-sky-400 bg-sky-400/10"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* ── Desktop CTA ───────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/login"
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-sky-500 hover:bg-sky-400 active:bg-sky-600 transition-all duration-200 shadow-md shadow-sky-500/20 hover:shadow-sky-400/30 hover:-translate-y-px"
            >
              Login
            </a>
          </div>

          {/* ── Mobile Hamburger ──────────────────────────────── */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
            aria-label="Toggle navigation menu"
          >
            <span className="block w-5 h-0.5 bg-current mb-1 transition-all duration-200" />
            <span className={`block w-5 h-0.5 bg-current mb-1 transition-all duration-200 ${mobileOpen ? "opacity-0" : ""}`} />
            <span className="block w-5 h-0.5 bg-current transition-all duration-200" />
          </button>
        </div>

        {/* ── Mobile Menu ───────────────────────────────────────── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileOpen ? "max-h-80 opacity-100 pb-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="pt-2 space-y-1 border-t border-white/[0.06]">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2">
              <a
                href="/login"
                onClick={handleNavClick}
                className="block text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-sky-500 hover:bg-sky-400 transition-colors"
              >
                Login
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
