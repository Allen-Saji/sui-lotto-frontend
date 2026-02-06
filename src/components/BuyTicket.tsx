"use client";

import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useLotteryContext } from "@/lib/lottery-context";
import { useLotteryActions } from "@/hooks/useLotteryActions";
import { mistToSui } from "@/lib/constants";

export function BuyTicket() {
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const account = useCurrentAccount();
  const { lotteryId, lottery, refetch } = useLotteryContext();
  const { buyTicket } = useLotteryActions();

  const ticketPrice = lottery ? mistToSui(lottery.ticketPrice) : 0;
  const isActive = lottery?.status === 0;

  async function handleBuy() {
    if (!lotteryId || !lottery) return;
    setStatus("pending");
    try {
      await buyTicket(lotteryId, lottery.ticketPrice, qty);
      setStatus("success");
      refetch();
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  const buttonLabel = !account
    ? "Connect Wallet First"
    : !lotteryId
      ? "No Active Lottery"
      : !isActive
        ? "Lottery Ended"
        : status === "pending"
          ? "Confirming..."
          : status === "success"
            ? "Purchased!"
            : status === "error"
              ? "Failed — Try Again"
              : `Buy ${qty} Ticket${qty > 1 ? "s" : ""} 🎰`;

  const disabled = !account || !lotteryId || !isActive || status === "pending";

  return (
    <div className="glass-card p-8 flex flex-col">
      <p className="text-sm font-semibold tracking-widest uppercase text-white/40 mb-4 font-mono">Buy Tickets</p>

      {/* Ticket visualization */}
      <div className="ticket-stub p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 font-mono uppercase">SuiLotto</p>
            <p className="text-2xl font-bold mt-1">
              {ticketPrice || "—"} <span className="text-sm text-white/40">SUI / ticket</span>
            </p>
          </div>
          <div className="text-4xl">🎫</div>
        </div>
        <div className="mt-3 flex gap-2">
          {[...Array(Math.min(qty, 5))].map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-[#4DA2FF]" style={{ opacity: 1 - i * 0.15 }} />
          ))}
          {qty > 5 && <span className="text-xs text-white/30 font-mono">+{qty - 5}</span>}
        </div>
      </div>

      {/* Quantity selector */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setQty(Math.max(1, qty - 1))}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold transition-all hover:scale-110"
          style={{ background: "rgba(77,162,255,0.1)", border: "1px solid rgba(77,162,255,0.2)" }}
        >
          −
        </button>
        <span className="text-3xl font-bold font-mono w-16 text-center">{qty}</span>
        <button
          onClick={() => setQty(qty + 1)}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold transition-all hover:scale-110"
          style={{ background: "rgba(77,162,255,0.1)", border: "1px solid rgba(77,162,255,0.2)" }}
        >
          +
        </button>
        <div className="ml-auto text-right">
          <p className="text-xs text-white/40 font-mono">Total</p>
          <p className="text-lg font-bold font-mono text-[#4DA2FF]">
            {(qty * ticketPrice).toFixed(1)} SUI
          </p>
        </div>
      </div>

      {/* Buy button */}
      <button
        onClick={handleBuy}
        disabled={disabled}
        className="buy-button w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
