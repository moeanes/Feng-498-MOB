import LoginForm from './login/LoginForm';
import LoginSidePanel from './login/LoginSidePanel';
import { PulseWatchLogo } from './shared/Logo';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 font-sans">
      {/* Mobile Header (Hidden on Desktop) */}
      <div className="md:hidden p-6 border-b border-white/5 flex items-center justify-between">
        <PulseWatchLogo />
        <a href="/" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
          Back to home
        </a>
      </div>

      {/* Auth Form Form Interface  */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 z-10 w-full lg:w-1/2">
        <div className="w-full max-w-[440px]">
          {/* Desktop Logo & Back Link */}
          <div className="hidden md:flex flex-col gap-6 mb-12">
            <a href="/" className="text-sm font-medium text-slate-400 hover:text-white transition-colors inline-flex w-fit">
              &larr; Back to home
            </a>
            <PulseWatchLogo />
          </div>

          <LoginForm />
        </div>
      </div>

      {/* Promotional Side Panel - Desktop Only */}
      <LoginSidePanel />
    </div>
  );
}
