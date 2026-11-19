const Logo = ({ size = 200, className = "" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Circular Brand Background */}
        <circle
          cx="100"
          cy="100"
          r="92"
          fill="url(#ice-glacier-bg)"
          stroke="var(--onyx-border)"
          strokeWidth="1.5"
          className="backdrop-blur-md"
        />

        {/* High-End Refractive "O" Base (Liquid Glass) */}
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="2 10"
          className="animate-spin-slow opacity-20"
        />
        <circle
          cx="100"
          cy="100"
          r="82"
          fill="none"
          stroke="url(#onyx-core-gradient)"
          strokeWidth="6"
          strokeLinecap="round"
          className="opacity-90 animate-signature-pulse"
        />

        {/* The "Big O" (Pixar-Inspired Glass Anchor) */}
        {/* Glow Background Layer */}
        <text
          x="100"
          y="138"
          textAnchor="middle"
          className="text-[140px] font-black opacity-60"
          style={{
            fontFamily: 'Outfit, sans-serif',
            filter: 'url(#glass-blur)',
            fill: 'none',
            stroke: 'url(#onyx-core-gradient)',
            strokeWidth: '8px'
          }}
        >
          O
        </text>
        {/* Sharp Foreground Layer */}
        <text
          x="100"
          y="138"
          textAnchor="middle"
          className="text-[140px] font-black drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
          style={{
            fontFamily: 'Outfit, sans-serif',
            fill: 'none',
            stroke: 'url(#onyx-core-gradient)',
            strokeWidth: '4px'
          }}
        >
          O
        </text>

        {/* The Pixar "nyx" (Ink Fluid Flow) */}
        <path
          id="nyx-flow-logo"
          d="M82,118 C88,105 98,105 105,118 C112,130 118,130 128,110 C132,100 140,110 145,120"
          fill="none"
          stroke="url(#signature-ink)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-signature-write"
        />

        {/* Animated Flare Pen Tip (High Res) */}
        <circle r="2.5" fill="#fff" className="animate-flare-burn shadow-[0_0_20px_#fff]">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path="M82,118 C88,105 98,105 105,118 C112,130 118,130 128,110 C132,100 140,110 145,120"
          />
        </circle>

        <defs>
          <filter id="glass-blur"><feGaussianBlur stdDeviation="1.5" /></filter>
          <linearGradient id="ice-glacier-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--onyx-deep)" />
            <stop offset="100%" stopColor="var(--onyx-bg)" />
          </linearGradient>
          <linearGradient id="onyx-core-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="signature-ink" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default Logo;
