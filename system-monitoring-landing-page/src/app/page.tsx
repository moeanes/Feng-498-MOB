import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";

/**
 * Landing Page — /
 *
 * Fully static marketing page for the PulseWatch monitoring platform.
 * No database queries here — only layout and UI components.
 * The dashboard is kept completely separate (see /dashboard route).
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b1120]">
      {/* Fixed top navigation */}
      <LandingNav />

      {/* Main content sections */}
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <BenefitsSection />
        <CTASection />
      </main>

      {/* Site footer */}
      <LandingFooter />
    </div>
  );
}
