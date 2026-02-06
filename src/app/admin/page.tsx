"use client";

import { useState } from "react";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useLotteryActions } from "@/hooks/useLotteryActions";
import { useLotteryContext } from "@/lib/lottery-context";
import { PACKAGE_ID, ADMIN_CAP_ID, mistToSui, suiToMist, truncateAddress, getExpectedWinnerCount } from "@/lib/constants";
import { WalletButton } from "@/components/WalletButton";
import Link from "next/link";

export default function AdminPage() {
  const account = useCurrentAccount();

  // Check if connected wallet owns the AdminCap
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

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
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
  const { lotteryId, setLotteryId, lottery, isLoading, refetch } = useLotteryContext();
  const { createLottery, drawWinner, isPending } = useLotteryActions();
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

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
          setLotteryId(id);
          setStatus({ type: "success", message: `Lottery created: ${truncateAddress(id)}` });
        }}
        onError={(msg) => setStatus({ type: "error", message: msg })}
        createLottery={createLottery}
        isPending={isPending}
        hasActiveLottery={!!lottery && lottery.status === 0}
      />

      {/* Active Lottery */}
      {lotteryId && (
        <ActiveLottery
          lotteryId={lotteryId}
          lottery={lottery}
          isLoading={isLoading}
          refetch={refetch}
          drawWinner={drawWinner}
          isPending={isPending}
          onSuccess={(msg) => setStatus({ type: "success", message: msg })}
          onError={(msg) => setStatus({ type: "error", message: msg })}
        />
      )}

      {/* Manual Lottery ID */}
      <ManualLotteryId lotteryId={lotteryId} setLotteryId={setLotteryId} />
    </div>
  );
}

/* ───── Create Lottery Form ───── */

function CreateLotteryForm({
  onCreated,
  onError,
  createLottery,
  isPending,
  hasActiveLottery,
}: {
  onCreated: (id: string) => void;
  onError: (msg: string) => void;
  createLottery: (price: bigint, deadline: bigint) => Promise<{ digest: string; lotteryId: string | null }>;
  isPending: boolean;
  hasActiveLottery: boolean;
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
        onError(`Lottery created (tx: ${result.digest.slice(0, 12)}...) but could not find object ID. Check the explorer and set it manually.`);
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

      {hasActiveLottery && (
        <div className="mb-4 rounded-lg px-4 py-2 text-xs font-mono"
          style={{ background: "rgba(255,184,0,0.08)", border: "1px solid rgba(255,184,0,0.2)", color: "#FFB800" }}
        >
          A lottery is currently active. Creating a new one will be a separate round.
        </div>
      )}

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

/* ───── Active Lottery Panel ───── */

function ActiveLottery({
  lotteryId,
  lottery,
  isLoading,
  refetch,
  drawWinner,
  isPending,
  onSuccess,
  onError,
}: {
  lotteryId: string;
  lottery: import("@/lib/constants").LotteryState | null;
  isLoading: boolean;
  refetch: () => void;
  drawWinner: (id: string) => Promise<{ digest: string }>;
  isPending: boolean;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const deadlinePassed = lottery ? Date.now() > Number(lottery.deadline) : false;
  const isActive = lottery?.status === 0;
  const isCompleted = lottery?.status === 1;

  async function handleDraw() {
    try {
      const result = await drawWinner(lotteryId);
      onSuccess(`Draw complete! Tx: ${result.digest.slice(0, 12)}...`);
      refetch();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Draw failed");
    }
  }

  return (
    <div className="glass-card p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">📊</span> Lottery Status
        </h2>
        <button
          onClick={() => refetch()}
          className="text-xs font-mono text-[#4DA2FF] hover:text-[#6BB5FF] transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Lottery ID */}
      <div className="mb-4 px-4 py-2 rounded-lg bg-white/5 font-mono text-xs text-white/50 break-all">
        ID: {lotteryId}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-white/30 font-mono text-sm">Loading lottery data...</div>
      ) : !lottery ? (
        <div className="text-center py-8 text-white/30 font-mono text-sm">Lottery not found. Check the ID.</div>
      ) : (
        <>
          {/* Status badge */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: isActive ? "rgba(57,255,20,0.08)" : "rgba(77,162,255,0.08)",
                border: `1px solid ${isActive ? "rgba(57,255,20,0.3)" : "rgba(77,162,255,0.3)"}`,
                color: isActive ? "#39FF14" : "#4DA2FF",
              }}
            >
              <span className={`w-2 h-2 rounded-full ${isActive ? "bg-[#39FF14] animate-pulse" : "bg-[#4DA2FF]"}`} />
              {isActive ? "Active" : "Completed"}
            </div>
            {deadlinePassed && isActive && (
              <span className="text-xs font-mono text-[#FFB800]">Deadline passed</span>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label="Pool" value={`${mistToSui(lottery.balance).toFixed(2)} SUI`} />
            <StatCard label="Tickets" value={lottery.participants.length.toString()} />
            <StatCard label="Price" value={`${mistToSui(lottery.ticketPrice)} SUI`} />
            <StatCard label="Winners" value={
              isCompleted
                ? lottery.winners.length.toString()
                : getExpectedWinnerCount(lottery.participants.length).toString()
            } />
          </div>

          {/* Deadline */}
          <div className="mb-6 text-xs font-mono text-white/40">
            Deadline: {new Date(Number(lottery.deadline)).toLocaleString()}
          </div>

          {/* Winners list (if completed) */}
          {isCompleted && lottery.winners.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2">Winners</p>
              <div className="space-y-1">
                {lottery.winners.map((w, i) => (
                  <div key={i} className="px-3 py-2 rounded-lg bg-white/5 font-mono text-xs text-white/60">
                    {i + 1}. {truncateAddress(w)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Draw button */}
          {isActive && (
            <button
              onClick={handleDraw}
              disabled={isPending || !deadlinePassed || lottery.participants.length < 2}
              className="buy-button w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending
                ? "Drawing..."
                : !deadlinePassed
                  ? "Waiting for deadline..."
                  : lottery.participants.length < 2
                    ? "Need 2+ participants"
                    : "Draw Winners"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

/* ───── Manual Lottery ID Input ───── */

function ManualLotteryId({
  lotteryId,
  setLotteryId,
}: {
  lotteryId: string | null;
  setLotteryId: (id: string) => void;
}) {
  const [input, setInput] = useState(lotteryId ?? "");

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
        <span>🔗</span> Set Lottery ID Manually
      </h3>
      <p className="text-xs text-white/30 mb-3">
        Paste the Lottery object ID from the explorer after creating a round.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="0x..."
          className="flex-1 px-4 py-2.5 rounded-xl font-mono text-sm bg-white/5 border border-white/10 focus:border-[#4DA2FF]/50 focus:outline-none transition-colors"
        />
        <button
          onClick={() => input.startsWith("0x") && setLotteryId(input)}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, rgba(77,162,255,0.15), rgba(123,47,190,0.15))",
            border: "1px solid rgba(77,162,255,0.3)",
          }}
        >
          Set
        </button>
      </div>
    </div>
  );
}

/* ───── Stat Card ───── */

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/8">
      <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold font-mono mt-1">{value}</p>
    </div>
  );
}
