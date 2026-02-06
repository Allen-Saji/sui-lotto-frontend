"use client";

import { useLotteryContext } from "@/lib/lottery-context";
import { truncateAddress, mistToSui } from "@/lib/constants";

export function RecentWinners() {
  const { lottery } = useLotteryContext();
  const isCompleted = lottery?.status === 1;
  const winners = isCompleted ? lottery.winners : [];
  const prizePerWinner = isCompleted && winners.length > 0
    ? mistToSui(lottery.balance) * 0.98 / winners.length
    : 0;

  return (
    <section className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold">
          Recent <span className="bg-gradient-to-r from-[#FFB800] to-[#FF2D78] bg-clip-text text-transparent">Winners</span>
        </h2>
        <p className="mt-3 text-white/40 text-sm">
          {isCompleted ? "This round is complete!" : "Winners will appear after the draw"}
        </p>
      </div>

      <div className="glass-card p-8 relative overflow-hidden">
        {/* Confetti pieces */}
        {isCompleted && [...Array(12)].map((_, i) => (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: `${8 + i * 8}%`,
              background: ["#4DA2FF", "#FF2D78", "#39FF14", "#FFB800", "#7B2FBE"][i % 5],
              borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "2px" : "0",
              width: i % 2 === 0 ? "8px" : "6px",
              height: i % 2 === 0 ? "8px" : "10px",
              animationDuration: `${3 + i * 0.4}s`,
              animationDelay: `${i * 0.3}s`,
              opacity: 0.6,
              transform: `rotate(${i * 30}deg)`,
            }}
          />
        ))}

        {winners.length > 0 ? (
          <>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              {winners.map((w, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-4 rounded-2xl"
                  style={{ background: "rgba(255,184,0,0.06)", border: "1px solid rgba(255,184,0,0.15)" }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{ background: i === 0 ? "linear-gradient(135deg, #FFB800, #FF8C00)" : i === 1 ? "linear-gradient(135deg, #C0C0C0, #888)" : "linear-gradient(135deg, #CD7F32, #8B5A2B)" }}
                  >
                    {i === 0 ? "👑" : i === 1 ? "🥈" : "🥉"}
                  </div>
                  <div>
                    <p className="font-mono text-sm font-semibold">{truncateAddress(w)}</p>
                    <p className="text-xs text-white/30 font-mono">+{prizePerWinner.toFixed(2)} SUI</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-xs text-white/20 font-mono">
                Total distributed: {(prizePerWinner * winners.length).toFixed(2)} SUI across {winners.length} winner{winners.length > 1 ? "s" : ""}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <span className="text-4xl block mb-3">🎰</span>
            <p className="text-white/30 font-mono text-sm">Waiting for the draw...</p>
          </div>
        )}
      </div>
    </section>
  );
}
