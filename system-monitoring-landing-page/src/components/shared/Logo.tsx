interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * PulseWatch SVG Logo — a stylized pulse/heartbeat wave inside a rounded square.
 * Uses brand colors: sky-blue primary, emerald-green accent.
 */
export function PulseWatchLogo({ size = 32, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="PulseWatch logo"
    >
      {/* Rounded square background */}
      <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />

      {/* Pulse / heartbeat waveform */}
      <polyline
        points="3,16 8,16 10,10 13,22 16,8 19,20 22,14 24,16 29,16"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Dot at peak */}
      <circle cx="16" cy="8" r="1.5" fill="#34d399" />

      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Full horizontal lockup: logo icon + wordmark
 */
export function PulseWatchWordmark({ size = 32, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <PulseWatchLogo size={size} />
      <span
        style={{ fontSize: size * 0.55 }}
        className="font-bold tracking-tight text-white"
      >
        PulseWatch
      </span>
    </div>
  );
}
