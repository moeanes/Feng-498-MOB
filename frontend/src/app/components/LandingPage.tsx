import LandingNav from './landing/LandingNav';
import HeroSection from './landing/HeroSection';
import FeaturesSection from './landing/FeaturesSection';
import BenefitsSection from './landing/BenefitsSection';
import HowItWorksSection from './landing/HowItWorksSection';
import CTASection from './landing/CTASection';
import LandingFooter from './landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-blue-500/30 font-sans">
      <LandingNav />
      <main>
        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
