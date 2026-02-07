"use client";

import { useLotteryContext } from "@/lib/lottery-context";
import { truncateAddress, mistToSui } from "@/lib/constants";

const PAST_WINNERS = [
  { address: "0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2", prize: 24.5, round: "#12" },
  { address: "0xf0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9", prize: 24.5, round: "#12" },
  { address: "0x1234abcd5678ef901234abcd5678ef901234abcd5678ef901234abcd5678ef90", prize: 24.5, round: "#12" },
  { address: "0xdeadbeef1234567890abcdef1234567890abcdef1234567890abcdef12345678", prize: 18.2, round: "#11" },
  { address: "0xcafebabe9876543210fedcba9876543210fedcba9876543210fedcba98765432", prize: 18.2, round: "#11" },
];

export function RecentWinners() {
  const { lottery } = useLotteryContext();
  const isCompleted = lottery?.status === 1;
  const liveWinners = isCompleted ? lottery.winners : [];
  const prizePerWinner = isCompleted && liveWinners.length > 0
    ? mistToSui(lottery.balance) * 0.98 / liveWinners.length
    : 0;

  const hasLiveWinners = liveWinners.length > 0;

  return (
    <section className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold">
          Recent <span className="bg-gradient-to-r from-[#FFB800] to-[#FF2D78] bg-clip-text text-transparent">Winners</span>
        </h2>
        <p className="mt-3 text-white/40 text-sm">
          {hasLiveWinners ? "This round is complete!" : "Lucky winners from past rounds"}
        </p>
      </div>

      <div className="glass-card p-8 relative overflow-hidden">
        {/* Confetti pieces */}
        {[...Array(12)].map((_, i) => (
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

        {hasLiveWinners ? (
          <>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              {liveWinners.map((w, i) => (
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
                Total distributed: {(prizePerWinner * liveWinners.length).toFixed(2)} SUI across {liveWinners.length} winner{liveWinners.length > 1 ? "s" : ""}
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            {PAST_WINNERS.map((w, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-3 rounded-xl transition-all hover:scale-[1.01]"
                style={{
                  background: i < 3 ? "rgba(255,184,0,0.04)" : "rgba(77,162,255,0.03)",
                  border: `1px solid ${i < 3 ? "rgba(255,184,0,0.10)" : "rgba(77,162,255,0.08)"}`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0"
                  style={{
                    background: i === 0 ? "linear-gradient(135deg, #FFB800, #FF8C00)"
                      : i === 1 ? "linear-gradient(135deg, #C0C0C0, #888)"
                      : i === 2 ? "linear-gradient(135deg, #CD7F32, #8B5A2B)"
                      : "linear-gradient(135deg, rgba(77,162,255,0.2), rgba(123,47,190,0.2))",
                  }}
                >
                  {i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🎰"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-semibold">{truncateAddress(w.address)}</p>
                  <p className="text-[10px] text-white/25 font-mono">Round {w.round}</p>
                </div>
                <p className="text-sm font-bold font-mono text-[#39FF14] shrink-0">
                  +{w.prize} SUI
                </p>
              </div>
            ))}
            <p className="text-[10px] text-white/15 font-mono text-center mt-2">
              Past lottery rounds
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
