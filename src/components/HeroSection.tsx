"use client";

import { useLotteryContext } from "@/lib/lottery-context";

export function HeroSection() {
  const { lottery, lotteryId } = useLotteryContext();
  const isActive = lottery?.status === 0;

  return (
    <section className="relative z-10 flex flex-col items-center text-center pt-16 md:pt-24 pb-12 px-6">
      {/* Badge */}
      <div
        className="animate-slide-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
        style={{
          background: isActive ? "rgba(57, 255, 20, 0.08)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${isActive ? "rgba(57, 255, 20, 0.2)" : "rgba(255,255,255,0.1)"}`,
          color: isActive ? "#39FF14" : "#888",
        }}
      >
        <span className={`w-2 h-2 rounded-full ${isActive ? "bg-[#39FF14] animate-pulse" : "bg-white/30"}`} />
        {!lotteryId ? "No Active Lottery" : isActive ? "Live Now" : "Round Complete"}
      </div>

      {/* Title */}
      <h1 className="animate-slide-up delay-100 text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]" style={{ opacity: 0 }}>
        <span className="block bg-gradient-to-r from-[#4DA2FF] via-[#7B2FBE] to-[#FF2D78] bg-clip-text text-transparent">
          SuiLotto
        </span>
      </h1>

      <p className="animate-slide-up delay-200 mt-5 text-lg md:text-xl font-medium text-white/50 max-w-md" style={{ opacity: 0 }}>
        Your luck lives on-chain. Provably fair, multi-winner lottery powered by Sui.
      </p>

      {/* Scroll hint */}
      <div className="animate-slide-up delay-500 mt-10 flex flex-col items-center gap-2 text-white/20" style={{ opacity: 0 }}>
        <span className="text-xs font-mono tracking-widest uppercase">Scroll</span>
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none" className="animate-bounce">
          <rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="2" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
}
