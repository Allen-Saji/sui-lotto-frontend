"use client";

import { useState } from "react";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useQueryClient } from "@tanstack/react-query";
import { useLotteryActions } from "@/hooks/useLotteryActions";
import { useAdminLotteries, type LotteryWithId } from "@/hooks/useActiveLotteries";
import { useCountdown } from "@/hooks/useCountdown";
import { PACKAGE_ID, mistToSui, suiToMist, truncateAddress, getExpectedWinnerCount } from "@/lib/constants";
import { WalletButton } from "@/components/WalletButton";
import Link from "next/link";

export default function AdminPage() {
  const account = useCurrentAccount();

  const { data: ownedObjects } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address ?? "",
      filter: { StructType: `${PACKAGE_ID}::lottery::AdminCap` },
    },
    { enabled: !!account?.address }
  );

  const isAdmin = (ownedObjects?.data?.length ?? 0) > 0;

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(180deg, #06060F 0%, #0a0e1a 40%, #0d0820 70%, #06060F 100%)" }}
    >
      {/* Background orbs */}
      <div className="bg-orb" style={{ width: 500, height: 500, top: -150, right: -150, background: "radial-gradient(circle, rgba(123,47,190,0.12), transparent 70%)" }} />
      <div className="bg-orb delay-2000" style={{ width: 400, height: 400, bottom: "20%", left: -100, background: "radial-gradient(circle, rgba(77,162,255,0.10), transparent 70%)" }} />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <Link href="/" className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ background: "linear-gradient(135deg, #4DA2FF, #7B2FBE)" }}
          >
            <span className="text-xl">🎰</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            <span className="text-[#4DA2FF]">Sui</span>
            <span className="text-white">Lotto</span>
            <span className="text-xs font-mono text-white/30 ml-2">ADMIN</span>
          </span>
        </Link>
        <WalletButton />
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {!account ? (
          <div className="glass-card p-12 text-center">
            <span className="text-5xl block mb-4">🔐</span>
            <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
            <p className="text-white/40">Connect your admin wallet to access the panel.</p>
          </div>
        ) : !isAdmin ? (
          <div className="glass-card p-12 text-center">
            <span className="text-5xl block mb-4">⛔</span>
            <h2 className="text-2xl font-bold mb-2">Not Authorized</h2>
            <p className="text-white/40 font-mono text-sm">{truncateAddress(account.address)}</p>
            <p className="text-white/30 mt-2 text-sm">This wallet does not hold the AdminCap.</p>
          </div>
        ) : (
          <AdminPanel />
        )}
      </div>
    </div>
  );
}

function AdminPanel() {
  const { createLottery, isPending } = useLotteryActions();
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const queryClient = useQueryClient();

  return (
    <div className="space-y-8">
      {/* Status toast */}
      {status && (
        <div
          className="rounded-xl px-5 py-3 text-sm font-mono"
          style={{
            background: status.type === "success" ? "rgba(57,255,20,0.08)" : "rgba(255,45,120,0.08)",
            border: `1px solid ${status.type === "success" ? "rgba(57,255,20,0.3)" : "rgba(255,45,120,0.3)"}`,
            color: status.type === "success" ? "#39FF14" : "#FF2D78",
          }}
        >
          {status.message}
        </div>
      )}

      {/* Create Lottery */}
      <CreateLotteryForm
        onCreated={(id) => {
          queryClient.invalidateQueries({ queryKey: ["admin-lotteries"] });
          setStatus({ type: "success", message: `Lottery created: ${truncateAddress(id)}` });
        }}
        onError={(msg) => setStatus({ type: "error", message: msg })}
        createLottery={createLottery}
        isPending={isPending}
      />

      {/* All undrawn lotteries */}
      <AdminLotteryGrid
        onSuccess={(msg) => setStatus({ type: "success", message: msg })}
        onError={(msg) => setStatus({ type: "error", message: msg })}
      />
    </div>
  );
}

/* ───── Create Lottery Form ───── */

function CreateLotteryForm({
  onCreated,
  onError,
  createLottery,
  isPending,
}: {
  onCreated: (id: string) => void;
  onError: (msg: string) => void;
  createLottery: (price: bigint, deadline: bigint) => Promise<{ digest: string; lotteryId: string | null }>;
  isPending: boolean;
}) {
  const [price, setPrice] = useState("0.5");
  const [hours, setHours] = useState("24");

  async function handleCreate() {
    try {
      const priceMist = suiToMist(parseFloat(price));
      const deadlineMs = BigInt(Date.now() + parseFloat(hours) * 3600 * 1000);
      const result = await createLottery(priceMist, deadlineMs);

      if (result.lotteryId) {
        onCreated(result.lotteryId);
      } else {
        onError(`Lottery created (tx: ${result.digest.slice(0, 12)}...) but could not find object ID.`);
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to create lottery");
    }
  }

  return (
    <div className="glass-card p-8">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="text-2xl">🎲</span> Create New Lottery
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-mono text-white/40 uppercase tracking-wider mb-2">
            Ticket Price (SUI)
          </label>
          <input
            type="number"
            step="0.1"
            min="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-3 rounded-xl font-mono text-lg bg-white/5 border border-white/10 focus:border-[#4DA2FF]/50 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-white/40 uppercase tracking-wider mb-2">
            Duration (hours)
          </label>
          <input
            type="number"
            step="1"
            min="1"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full px-4 py-3 rounded-xl font-mono text-lg bg-white/5 border border-white/10 focus:border-[#4DA2FF]/50 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-white/30 font-mono mb-4">
        <span>Price: {price} SUI ({suiToMist(parseFloat(price) || 0).toString()} MIST)</span>
        <span>Deadline: {new Date(Date.now() + parseFloat(hours || "0") * 3600 * 1000).toLocaleString()}</span>
      </div>

      <button
        onClick={handleCreate}
        disabled={isPending}
        className="buy-button w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Creating..." : "Create Lottery"}
      </button>
    </div>
  );
}

/* ───── Admin Lottery Grid ───── */

function AdminLotteryGrid({
  onSuccess,
  onError,
}: {
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const { data: lotteries, isLoading } = useAdminLotteries();

  // Sort: drawable-first (expired + ≥2 participants), then by deadline asc
  const sorted = lotteries?.slice().sort((a, b) => {
    const now = Date.now();
    const aDrawable = Number(a.deadline) <= now && a.participants.length >= 2;
    const bDrawable = Number(b.deadline) <= now && b.participants.length >= 2;
    if (aDrawable !== bDrawable) return aDrawable ? -1 : 1;
    return Number(a.deadline) - Number(b.deadline);
  });

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">📊</span> All Lotteries
        {sorted && sorted.length > 0 && (
          <span className="text-sm font-mono text-white/30 font-normal">({sorted.length})</span>
        )}
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="glass-card p-6 h-52 animate-shimmer"
              style={{
                background: "linear-gradient(90deg, rgba(77,162,255,0.03), rgba(77,162,255,0.08), rgba(77,162,255,0.03))",
                backgroundSize: "200% 100%",
              }}
            />
          ))}
        </div>
      ) : !sorted || sorted.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-white/30 font-mono text-sm">No undrawn lotteries found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map((lottery) => (
            <AdminLotteryCard
              key={lottery.id}
              lottery={lottery}
              onSuccess={onSuccess}
              onError={onError}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ───── Admin Lottery Card ───── */

function AdminLotteryCard({
  lottery,
  onSuccess,
  onError,
}: {
  lottery: LotteryWithId;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const { drawWinner, isPending } = useLotteryActions();
  const queryClient = useQueryClient();
  const [drawing, setDrawing] = useState(false);

  const now = Date.now();
  const deadlinePassed = Number(lottery.deadline) <= now;
  const canDraw = deadlinePassed && lottery.participants.length >= 2;

  const pool = mistToSui(lottery.balance);
  const price = mistToSui(lottery.ticketPrice);
  const tickets = lottery.participants.length;
  const expectedWinners = getExpectedWinnerCount(tickets);

  async function handleDraw() {
    setDrawing(true);
    try {
      const result = await drawWinner(lottery.id);
      queryClient.invalidateQueries({ queryKey: ["admin-lotteries"] });
      onSuccess(`Draw complete for ${truncateAddress(lottery.id)}! Tx: ${result.digest.slice(0, 12)}...`);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Draw failed");
    } finally {
      setDrawing(false);
    }
  }

  return (
    <div
      className="glass-card p-5 flex flex-col gap-4"
      style={canDraw ? {
        border: "1px solid rgba(255,184,0,0.3)",
        boxShadow: "0 0 20px rgba(255,184,0,0.06)",
      } : undefined}
    >
      {/* Top row: ID + status */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-white/40 truncate flex-1">
          {truncateAddress(lottery.id)}
        </span>
        {deadlinePassed ? (
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
        ) : (
          <MiniCountdown deadline={Number(lottery.deadline)} />
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <StatCard label="Pool" value={`${pool.toFixed(2)} SUI`} />
        <StatCard label="Tickets" value={tickets.toString()} />
        <StatCard label="Price" value={`${price} SUI`} />
        <StatCard label="Winners" value={expectedWinners.toString()} />
      </div>

      {/* Draw button */}
      <button
        onClick={handleDraw}
        disabled={!canDraw || isPending || drawing}
        className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        style={{
          background: canDraw
            ? "linear-gradient(135deg, #FFB800, #FF8C00)"
            : "linear-gradient(135deg, rgba(77,162,255,0.15), rgba(123,47,190,0.15))",
          boxShadow: canDraw ? "0 4px 20px rgba(255,184,0,0.2)" : "none",
        }}
      >
        {drawing
          ? "Drawing..."
          : !deadlinePassed
            ? "Waiting for deadline..."
            : tickets < 2
              ? "Need 2+ participants"
              : "Draw Winners"}
      </button>
    </div>
  );
}

/* ───── Mini Countdown ───── */

function MiniCountdown({ deadline }: { deadline: number }) {
  const { d, h, m, s } = useCountdown(deadline);

  return (
    <div className="flex items-center gap-1">
      {[
        { v: d, l: "d" },
        { v: h, l: "h" },
        { v: m, l: "m" },
        { v: s, l: "s" },
      ].map(({ v, l }) => (
        <div key={l} className="flex items-center gap-0.5">
          <span className="font-mono font-bold text-xs tabular-nums text-[#4DA2FF]">
            {String(v).padStart(2, "0")}
          </span>
          <span className="text-[9px] text-white/30 font-mono">{l}</span>
        </div>
      ))}
    </div>
  );
}

/* ───── Stat Card ───── */

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/8">
      <p className="text-[9px] font-mono text-white/40 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold font-mono mt-0.5">{value}</p>
    </div>
  );
}
