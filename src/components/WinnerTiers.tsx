"use client";

import { TIERS, getExpectedWinnerCount } from "@/lib/constants";
import { useLotteryContext } from "@/lib/lottery-context";

export function WinnerTiers() {
  const { lottery } = useLotteryContext();
  const tickets = lottery?.participants.length ?? 0;
  const currentWinners = getExpectedWinnerCount(tickets);

  return (
    <section id="tiers" className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold">
          Winner <span className="bg-gradient-to-r from-[#4DA2FF] to-[#FF2D78] bg-clip-text text-transparent">Tiers</span>
        </h2>
        <p className="mt-3 text-white/40 max-w-md mx-auto text-sm">More players, more winners. The number of winners scales with ticket count.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {TIERS.map((tier, i) => (
          <div key={i} className="tier-step glass-card p-6 text-center group">
            <div className="tier-glow" style={{ background: `linear-gradient(135deg, ${tier.color}22, transparent)`, border: `1px solid ${tier.color}44` }} />
            <span className="text-3xl mb-3 block">{tier.icon}</span>
            <p className="font-mono text-xs text-white/40 uppercase tracking-wider mb-1">Tickets</p>
            <p className="text-xl font-bold" style={{ color: tier.color }}>{tier.range}</p>
            <div className="my-3 h-px w-8 mx-auto" style={{ background: `${tier.color}44` }} />
            <p className="text-3xl font-black">{tier.winners}</p>
            <p className="text-xs text-white/50 mt-1">winner{tier.winners > 1 ? "s" : ""}</p>
            <p className="mt-2 text-xs font-mono text-white/30">{tier.share} each</p>
          </div>
        ))}
      </div>

      {/* Current tier indicator */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-mono"
          style={{ background: "rgba(255,45,120,0.08)", border: "1px solid rgba(255,45,120,0.2)" }}
        >
          <span className="w-2 h-2 rounded-full bg-[#FF2D78] animate-pulse" />
          <span className="text-white/60">
            {tickets > 0
              ? <>Currently at <strong className="text-[#FF2D78]">{tickets} tickets</strong> — {currentWinners} winner{currentWinners !== 1 ? "s" : ""} tier</>
              : "No tickets sold yet"
            }
          </span>
        </div>
      </div>
    </section>
  );
}
