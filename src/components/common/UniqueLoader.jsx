const UniqueLoader = () => {
  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black/60 backdrop-blur-3xl animate-fade-in pointer-events-auto">
      
      {/* Absolute Cinematic Backdrop */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15)_0%,transparent_70%)] animate-pulse"></div>

      {/* The Signature "Anthology Core" SVG (Master Centered) */}
      <div className="relative w-[350px] h-[350px] flex items-center justify-center translate-y-[-10%] scale-110 sm:scale-150">
        <svg 
          viewBox="0 0 200 200" 
          className="w-full h-full drop-shadow-[0_0_50px_rgba(139,92,246,0.4)]"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* High-End Refractive "O" Base (Liquid Glass) */}
          <circle 
            cx="100" 
            cy="100" 
            r="85" 
            fill="none" 
            stroke="white" 
            strokeWidth="0.5" 
            strokeDasharray="2 10" 
            className="animate-spin-slow opacity-10"
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
          <text 
            x="100" 
            y="138" 
            textAnchor="middle" 
            className="text-[140px] font-black fill-white drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
            style={{ fontFamily: 'Outfit, sans-serif', filter: 'url(#glass-blur)' }}
          >
            O
          </text>

          {/* The Pixar "nyx" (Ink Fluid Flow) */}
          <path 
            id="nyx-flow"
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
              dur="2.5s" 
              repeatCount="indefinite" 
              path="M82,118 C88,105 98,105 105,118 C112,130 118,130 128,110 C132,100 140,110 145,120" 
            />
          </circle>

          <defs>
            <filter id="glass-blur"><feGaussianBlur stdDeviation="1.5"/></filter>
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

      <div className="mt-16 text-center">
          <div className="flex items-center gap-4 mb-4">
              <span className="w-12 h-[1px] bg-white/10"></span>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.6em]">Anthology Core</span>
              <span className="w-12 h-[1px] bg-white/10"></span>
          </div>
          <div className="w-56 h-[2px] bg-white/5 rounded-full overflow-hidden mx-auto relative">
             <div className="h-full bg-onyx-purple w-1/3 animate-loading-bar shadow-[0_0_15px_rgba(139,92,246,1)]"></div>
          </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .animate-loading-bar { animation: loading-bar 2s cubic-bezier(0.65, 0, 0.35, 1) infinite; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 15s linear infinite; transform-origin: center; }
        @keyframes draw-signature {
          0% { stroke-dashoffset: 300; opacity: 0; }
          20% { opacity: 1; }
          60% { stroke-dashoffset: 0; opacity: 1; }
          90% { stroke-dashoffset: 0; opacity: 0; }
          100% { stroke-dashoffset: 300; opacity: 0; }
        }
        .animate-signature-write {
          stroke-dasharray: 300;
          stroke-dashoffset: 300;
          animation: draw-signature 2.5s ease-in-out infinite;
        }
        @keyframes pulse-logo { 0%, 100% { opacity: 0.9; stroke-width: 6; } 50% { opacity: 1; stroke-width: 8; } }
        .animate-signature-pulse { animation: pulse-logo 2s ease-in-out infinite; }
        @keyframes flare-burn { 0%, 100% { filter: blur(3px) brightness(1); r: 2.5; } 50% { filter: blur(10px) brightness(4); r: 4; } }
        .animate-flare-burn { animation: flare-burn 1.25s infinite; }
      `}} />
    </div>
  );
};

export default UniqueLoader;
