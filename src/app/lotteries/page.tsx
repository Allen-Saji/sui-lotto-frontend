"use client";

import { useState } from "react";
import Link from "next/link";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useActiveLotteries, useRefundableLotteries, type LotteryWithId } from "@/hooks/useActiveLotteries";
import { useLotteryActions } from "@/hooks/useLotteryActions";
import { useCountdown } from "@/hooks/useCountdown";
import { mistToSui, getExpectedWinnerCount, truncateAddress } from "@/lib/constants";
import { Header } from "@/components/Header";

/* ───── Mini Countdown ───── */
function MiniCountdown({ deadline }: { deadline: number }) {
  const { d, h, m, s } = useCountdown(deadline);
  const isUrgent = d === 0 && h < 6;

  return (
    <div className="flex items-center gap-1.5">
      {[
        { v: d, l: "d" },
        { v: h, l: "h" },
        { v: m, l: "m" },
        { v: s, l: "s" },
      ].map(({ v, l }) => (
        <div key={l} className="flex items-center gap-0.5">
          <span
            className="font-mono font-bold text-sm tabular-nums"
            style={{ color: isUrgent ? "#FF2D78" : "#4DA2FF" }}
          >
            {String(v).padStart(2, "0")}
          </span>
          <span className="text-[10px] text-white/30 font-mono">{l}</span>
        </div>
      ))}
    </div>
  );
}

/* ───── Lottery Card ───── */
function LotteryCard({ lottery }: { lottery: LotteryWithId }) {
  const [qty, setQty] = useState(1);
  const [buyStatus, setBuyStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const account = useCurrentAccount();
  const { buyTicket } = useLotteryActions();

  const pool = mistToSui(lottery.balance);
  const price = mistToSui(lottery.ticketPrice);
  const tickets = lottery.participants.length;
  const uniquePlayers = new Set(lottery.participants).size;
  const expectedWinners = getExpectedWinnerCount(tickets);

  // Visual fill — 100 tickets = "full" bar
  const fillPct = Math.min((tickets / 100) * 100, 100);

  // Tier color based on ticket count
  const tierColor =
    tickets >= 100 ? "#39FF14" : tickets >= 10 ? "#FF2D78" : tickets >= 6 ? "#7B2FBE" : "#4DA2FF";

  async function handleBuy() {
    if (!account) return;
    setBuyStatus("pending");
    try {
      await buyTicket(lottery.id, lottery.ticketPrice, qty);
      setBuyStatus("success");
      setTimeout(() => setBuyStatus("idle"), 2500);
    } catch {
      setBuyStatus("error");
      setTimeout(() => setBuyStatus("idle"), 2500);
    }
  }

  const buttonLabel = !account
    ? "Connect Wallet"
    : buyStatus === "pending"
      ? "Confirming..."
      : buyStatus === "success"
        ? "Purchased!"
        : buyStatus === "error"
          ? "Failed"
          : `Buy ${qty} Ticket${qty > 1 ? "s" : ""}`;

  return (
    <div
      className="glass-card p-6 flex flex-col gap-5 animate-slide-up"
      style={{ animationFillMode: "backwards" }}
    >
      {/* Top row: status badge + countdown */}
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider"
          style={{
            background: `${tierColor}15`,
            border: `1px solid ${tierColor}40`,
            color: tierColor,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: tierColor }}
          />
          Live
        </div>
        <MiniCountdown deadline={Number(lottery.deadline)} />
      </div>

      {/* Prize pool */}
      <div className="text-center py-3">
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1.5">
          Prize Pool
        </p>
        <div className="flex items-baseline justify-center gap-2">
          <span
            className="text-4xl font-black font-mono neon-text"
            style={{ color: "#4DA2FF" }}
          >
            {pool.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
          <span className="text-sm font-bold text-white/30">SUI</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Price", value: `${price} SUI`, icon: "🎫" },
          { label: "Players", value: uniquePlayers.toString(), icon: "👥" },
          { label: "Winners", value: expectedWinners.toString(), icon: "🏆" },
        ].map(({ label, value, icon }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 py-2.5 rounded-xl"
            style={{
              background: "rgba(77,162,255,0.04)",
              border: "1px solid rgba(77,162,255,0.08)",
            }}
          >
            <span className="text-xs">{icon}</span>
            <span className="text-xs font-bold font-mono text-white/90">{value}</span>
            <span className="text-[9px] font-mono text-white/30 uppercase">{label}</span>
          </div>
        ))}
      </div>

      {/* Participation bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono text-white/30">
            {tickets} ticket{tickets !== 1 ? "s" : ""} sold
          </span>
          <span className="text-[10px] font-mono" style={{ color: tierColor }}>
            {expectedWinners} winner{expectedWinners !== 1 ? "s" : ""} tier
          </span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(77,162,255,0.08)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.max(fillPct, 2)}%`,
              background: `linear-gradient(90deg, ${tierColor}, ${tierColor}80)`,
              boxShadow: `0 0 12px ${tierColor}40`,
            }}
          />
        </div>
      </div>

      {/* Quantity + Buy */}
      <div className="flex items-center gap-3 mt-auto">
        <div
          className="flex items-center gap-2 rounded-xl px-1"
          style={{
            background: "rgba(77,162,255,0.06)",
            border: "1px solid rgba(77,162,255,0.12)",
          }}
        >
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="w-8 h-8 flex items-center justify-center text-sm font-bold text-white/50 hover:text-white transition-colors"
          >
            −
          </button>
          <span className="text-sm font-bold font-mono w-6 text-center">{qty}</span>
          <button
            onClick={() => setQty(qty + 1)}
            className="w-8 h-8 flex items-center justify-center text-sm font-bold text-white/50 hover:text-white transition-colors"
          >
            +
          </button>
        </div>

        <button
          onClick={handleBuy}
          disabled={!account || buyStatus === "pending"}
          className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            background:
              buyStatus === "success"
                ? "linear-gradient(135deg, #39FF14, #39FF1480)"
                : buyStatus === "error"
                  ? "linear-gradient(135deg, #FF2D78, #FF2D7880)"
                  : "linear-gradient(135deg, #4DA2FF, #7B2FBE)",
            boxShadow:
              buyStatus === "success"
                ? "0 4px 20px rgba(57,255,20,0.25)"
                : buyStatus === "error"
                  ? "0 4px 20px rgba(255,45,120,0.25)"
                  : "0 4px 20px rgba(77,162,255,0.2)",
          }}
        >
          {buttonLabel}
        </button>
      </div>

      {/* Cost hint */}
      <p className="text-[10px] font-mono text-white/20 text-center -mt-2">
        Total: {(qty * price).toFixed(2)} SUI
      </p>
    </div>
  );
}

/* ───── Skeleton Card ───── */
function SkeletonCard({ delay }: { delay: number }) {
  return (
    <div
      className="glass-card p-6 flex flex-col gap-5 animate-slide-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-16 h-5 rounded-full animate-shimmer"
          style={{
            background:
              "linear-gradient(90deg, rgba(77,162,255,0.05), rgba(77,162,255,0.12), rgba(77,162,255,0.05))",
            backgroundSize: "200% 100%",
          }}
        />
        <div
          className="w-28 h-4 rounded animate-shimmer"
          style={{
            background:
              "linear-gradient(90deg, rgba(77,162,255,0.05), rgba(77,162,255,0.12), rgba(77,162,255,0.05))",
            backgroundSize: "200% 100%",
          }}
        />
      </div>
      <div className="text-center py-3">
        <div
          className="w-20 h-3 rounded mx-auto mb-3 animate-shimmer"
          style={{
            background:
              "linear-gradient(90deg, rgba(77,162,255,0.05), rgba(77,162,255,0.10), rgba(77,162,255,0.05))",
            backgroundSize: "200% 100%",
          }}
        />
        <div
          className="w-36 h-10 rounded-lg mx-auto animate-shimmer"
          style={{
            background:
              "linear-gradient(90deg, rgba(77,162,255,0.05), rgba(77,162,255,0.12), rgba(77,162,255,0.05))",
            backgroundSize: "200% 100%",
          }}
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-16 rounded-xl animate-shimmer"
            style={{
              background:
                "linear-gradient(90deg, rgba(77,162,255,0.03), rgba(77,162,255,0.08), rgba(77,162,255,0.03))",
              backgroundSize: "200% 100%",
              animationDelay: `${i * 150}ms`,
            }}
          />
        ))}
      </div>
      <div
        className="h-1.5 rounded-full animate-shimmer"
        style={{
          background:
            "linear-gradient(90deg, rgba(77,162,255,0.05), rgba(77,162,255,0.10), rgba(77,162,255,0.05))",
          backgroundSize: "200% 100%",
        }}
      />
      <div
        className="h-11 rounded-xl animate-shimmer"
        style={{
          background:
            "linear-gradient(90deg, rgba(77,162,255,0.05), rgba(77,162,255,0.12), rgba(77,162,255,0.05))",
          backgroundSize: "200% 100%",
        }}
      />
    </div>
  );
}

/* ───── Empty State ───── */
function EmptyState() {
  return (
    <div className="glass-card p-12 md:p-16 text-center max-w-lg mx-auto animate-slide-up">
      <div
        className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center animate-float"
        style={{
          background: "linear-gradient(135deg, rgba(77,162,255,0.1), rgba(123,47,190,0.1))",
          border: "1px solid rgba(77,162,255,0.15)",
        }}
      >
        <span className="text-3xl">🎰</span>
      </div>
      <h3 className="text-xl font-bold mb-2">No Active Lotteries</h3>
      <p className="text-sm text-white/40 font-mono leading-relaxed">
        There are no live lottery rounds right now. Check back soon or follow us for updates when new
        rounds launch.
      </p>
      <Link
        href="/"
        className="inline-block mt-6 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
        style={{
          background: "linear-gradient(135deg, rgba(77,162,255,0.15), rgba(123,47,190,0.15))",
          border: "1px solid rgba(77,162,255,0.25)",
        }}
      >
        Back to Home
      </Link>
    </div>
  );
}

/* ───── Refund Card ───── */
function RefundCard({ lottery }: { lottery: LotteryWithId }) {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const { claimRefund } = useLotteryActions();

  async function handleRefund() {
    setStatus("pending");
    try {
      await claimRefund(lottery.id);
      setStatus("success");
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2500);
    }
  }

  const pool = mistToSui(lottery.balance);
  const price = mistToSui(lottery.ticketPrice);

  return (
    <div
      className="glass-card p-5 flex flex-col gap-4"
      style={{
        border: "1px solid rgba(255,184,0,0.3)",
        boxShadow: "0 0 20px rgba(255,184,0,0.06)",
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-white/40 truncate flex-1">
          {truncateAddress(lottery.id)}
        </span>
        <span
          className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider"
          style={{
            background: "rgba(255,184,0,0.1)",
            border: "1px solid rgba(255,184,0,0.3)",
            color: "#FFB800",
          }}
        >
          Expired
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Your Stake", value: `${price} SUI`, icon: "🎫" },
          { label: "Pool", value: `${pool.toFixed(2)} SUI`, icon: "💰" },
          { label: "Players", value: lottery.participants.length.toString(), icon: "👥" },
        ].map(({ label, value, icon }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 py-2.5 rounded-xl"
            style={{
              background: "rgba(255,184,0,0.04)",
              border: "1px solid rgba(255,184,0,0.08)",
            }}
          >
            <span className="text-xs">{icon}</span>
            <span className="text-xs font-bold font-mono text-white/90">{value}</span>
            <span className="text-[9px] font-mono text-white/30 uppercase">{label}</span>
          </div>
        ))}
      </div>

      {/* Refund button */}
      <button
        onClick={handleRefund}
        disabled={status === "pending" || status === "success"}
        className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        style={{
          background: status === "success"
            ? "linear-gradient(135deg, #39FF14, #39FF1480)"
            : status === "error"
              ? "linear-gradient(135deg, #FF2D78, #FF2D7880)"
              : "linear-gradient(135deg, #FFB800, #FF8C00)",
          boxShadow: status === "success"
            ? "0 4px 20px rgba(57,255,20,0.25)"
            : "0 4px 20px rgba(255,184,0,0.2)",
        }}
      >
        {status === "pending"
          ? "Claiming..."
          : status === "success"
            ? "Refunded!"
            : status === "error"
              ? "Failed — Retry"
              : "Claim Refund"}
      </button>
    </div>
  );
}

/* ───── Refund Section ───── */
function RefundSection() {
  const account = useCurrentAccount();
  const { data: refundable } = useRefundableLotteries(account?.address);

  if (!account || !refundable || refundable.length === 0) return null;

  return (
    <div className="mt-16 animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-black mb-2">
          <span style={{ color: "#FFB800" }}>Claim</span> Refunds
        </h2>
        <p className="text-sm text-white/35 font-mono max-w-md mx-auto">
          These lotteries expired without enough participants. Claim your SUI back.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {refundable.map((lottery) => (
          <RefundCard key={lottery.id} lottery={lottery} />
        ))}
      </div>
    </div>
  );
}

/* ───── Page ───── */
export default function LotteriesPage() {
  const { data: lotteries, isLoading } = useActiveLotteries();

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #06060F 0%, #0a0e1a 40%, #0d0820 70%, #06060F 100%)",
      }}
    >
      {/* Background orbs */}
      <div
        className="bg-orb"
        style={{
          width: 500,
          height: 500,
          top: -100,
          right: -150,
          background: "radial-gradient(circle, rgba(77,162,255,0.10), transparent 70%)",
        }}
      />
      <div
        className="bg-orb delay-2000"
        style={{
          width: 400,
          height: 400,
          top: "50%",
          left: -120,
          background: "radial-gradient(circle, rgba(123,47,190,0.08), transparent 70%)",
        }}
      />
      <div
        className="bg-orb delay-3000"
        style={{
          width: 350,
          height: 350,
          bottom: "5%",
          right: "15%",
          background: "radial-gradient(circle, rgba(255,45,120,0.06), transparent 70%)",
        }}
      />

      <Header />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            <span className="neon-text" style={{ color: "#4DA2FF" }}>
              Active
            </span>{" "}
            Lotteries
          </h1>
          <p className="text-sm md:text-base text-white/35 font-mono max-w-md mx-auto">
            Browse &amp; join live lottery rounds on Sui
          </p>
          {lotteries && lotteries.length > 0 && (
            <div
              className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full text-xs font-mono"
              style={{
                background: "rgba(57,255,20,0.06)",
                border: "1px solid rgba(57,255,20,0.15)",
                color: "#39FF14",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
              {lotteries.length} live round{lotteries.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <SkeletonCard key={i} delay={i * 120} />
            ))}
          </div>
        ) : !lotteries || lotteries.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lotteries.map((lottery, i) => (
              <div
                key={lottery.id}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <LotteryCard lottery={lottery} />
              </div>
            ))}
          </div>
        )}

        {/* Refund section */}
        <RefundSection />
      </div>
    </div>
  );
}
