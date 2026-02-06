"use client";

import { useLotteryContext } from "@/lib/lottery-context";
import { mistToSui, getExpectedWinnerCount } from "@/lib/constants";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { StatPill } from "./StatPill";

export function PrizePool() {
  const { lottery, isLoading } = useLotteryContext();
  const account = useCurrentAccount();

  const pool = lottery ? mistToSui(lottery.balance) : 0;
  const tickets = lottery?.participants.length ?? 0;
  const uniquePlayers = lottery ? new Set(lottery.participants).size : 0;
  const myTickets = lottery && account
    ? lottery.participants.filter((p) => p === account.address).length
    : 0;
  const expectedWinners = getExpectedWinnerCount(tickets);

  return (
    <section id="pool" className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24">
      <div className="glass-card p-8 md:p-12 text-center">
        {/* Decorative ring */}
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full animate-spin-slow opacity-20"
          style={{ border: "2px dashed rgba(77,162,255,0.4)" }}
        />

        <p className="text-sm font-semibold tracking-widest uppercase text-white/40 mb-3 font-mono">Current Prize Pool</p>

        {/* Big number */}
        <div className="flex items-center justify-center gap-3">
          <div className="animate-pulse-glow">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="#4DA2FF" strokeWidth="2.5" />
              <path d="M20 8v8l6 4" stroke="#4DA2FF" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="20" cy="20" r="3" fill="#4DA2FF" />
            </svg>
          </div>
          <span
            className="text-5xl md:text-7xl font-black font-mono neon-text"
            style={{ color: "#4DA2FF" }}
          >
            {isLoading ? "..." : pool.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
          <span className="text-2xl md:text-3xl font-bold text-white/40 self-end mb-2">SUI</span>
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <StatPill label="Tickets Sold" value={tickets.toString()} />
          <StatPill label="Players" value={uniquePlayers.toString()} />
          <StatPill label="Your Tickets" value={myTickets.toString()} accent />
          <StatPill label="Winners" value={expectedWinners.toString()} />
        </div>
      </div>
    </section>
  );
}
