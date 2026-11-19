import React, { useEffect, useState } from 'react';

const AppEntrance = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onComplete, 1200); // Handshake with final fade
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[1000] bg-onyx-obsidian flex flex-col items-center justify-center transition-all duration-1000 ${isExiting ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100'}`}>
        {/* The 3D Obsidian Mark (Entrance Edition) */}
        <div className="relative w-48 h-48 mb-16 animate-float">
            <div className="absolute inset-0 bg-onyx-purple/20 blur-[100px] animate-pulse"></div>
            <div className="relative w-full h-full bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 flex items-center justify-center shadow-[0_0_100px_rgba(139,92,246,0.3)] group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-onyx-purple/10 to-transparent"></div>
                
                {/* Rotating Core SVG */}
                <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-[0_0_20px_rgba(139,92,246,0.8)] animate-signature-pulse">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="6" className="opacity-20" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="6" strokeDasharray="100 200" className="animate-[spin_4s_linear_infinite]" />
                    <path d="M35,65 C40,50 50,55 60,65 C70,75 75,60 80,45" fill="none" stroke="#8b5cf6" strokeWidth="8" strokeLinecap="round" />
                </svg>

                {/* Shimmer overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer"></div>
            </div>
        </div>

        {/* Brand Resonance */}
        <div className="text-center space-y-4">
            <h1 className="text-5xl font-black text-white italic tracking-tightest uppercase mb-2">ONYX</h1>
            <div className="flex items-center gap-4 justify-center">
                <span className="h-[1px] w-12 bg-white/10"></span>
                <span className="text-[10px] font-black text-onyx-purple uppercase tracking-[0.8em]">Absolute Grade</span>
                <span className="h-[1px] w-12 bg-white/10"></span>
            </div>
        </div>

        {/* Progress Bar (Simulated Resonance) */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-onyx-purple shadow-[0_0_15px_#8b5cf6] transition-all duration-[2800ms] ease-out w-full origin-left"></div>
        </div>
    </div>
  );
};

export default AppEntrance;
