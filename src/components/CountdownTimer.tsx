"use client";

import { useCountdown } from "@/hooks/useCountdown";
import { useLotteryContext } from "@/lib/lottery-context";

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="countdown-digit animate-countdown-bounce">{String(value).padStart(2, "0")}</div>
      <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">{label}</span>
    </div>
  );
}

export function CountdownTimer() {
  const { lottery } = useLotteryContext();
  const deadline = lottery ? Number(lottery.deadline) : Date.now() + 86_400_000;
  const countdown = useCountdown(deadline);

  return (
    <div className="glass-card p-8 flex flex-col items-center justify-center">
      <p className="text-sm font-semibold tracking-widest uppercase text-white/40 mb-6 font-mono">Draw Countdown</p>
      <div className="flex items-center gap-3 md:gap-4">
        <CountdownUnit value={countdown.d} label="Days" />
        <span className="text-3xl font-bold text-white/20 -mt-6">:</span>
        <CountdownUnit value={countdown.h} label="Hrs" />
        <span className="text-3xl font-bold text-white/20 -mt-6">:</span>
        <CountdownUnit value={countdown.m} label="Min" />
        <span className="text-3xl font-bold text-white/20 -mt-6">:</span>
        <CountdownUnit value={countdown.s} label="Sec" />
      </div>
      <p className="mt-6 text-xs text-white/30 font-mono">
        98% of pool goes to winners
      </p>
    </div>
  );
}
