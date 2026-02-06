/* ───── Types ───── */

export type Tier = {
  range: string;
  winners: number;
  share: string;
  color: string;
  icon: string;
};

export type Ball = {
  num: number;
  color: string;
  x: string;
  y: string;
  delay: string;
  anim: string;
};

export type LotteryState = {
  ticketPrice: bigint;
  balance: bigint;
  participants: string[];
  deadline: bigint;
  status: number;
  winners: string[];
  adminFeeBps: number;
};

/* ───── Contract Config ───── */

export const PACKAGE_ID =
  "0xb686b3d681fceeeca283a24cbb790c2aa0f3fa568bf1e3e2603ba456fc368634";
export const ADMIN_CAP_ID =
  "0x3a334f4f140047935cc6fb06d7935a75a3787106b43bf21baf09659acd6605d7";
export const MODULE_NAME = "lottery";

export const SUI_CLOCK_ID = "0x6";
export const SUI_RANDOM_ID = "0x8";

/** 1 SUI = 1_000_000_000 MIST */
export const MIST_PER_SUI = BigInt(1_000_000_000);

/* ───── Static UI Data ───── */

export const TIERS: Tier[] = [
  { range: "2–5", winners: 1, share: "100%", color: "#4DA2FF", icon: "🎯" },
  { range: "6–9", winners: 2, share: "50%", color: "#7B2FBE", icon: "🎲" },
  { range: "10–99", winners: 3, share: "33.3%", color: "#FF2D78", icon: "🔥" },
  { range: "100+", winners: 5, share: "20%", color: "#39FF14", icon: "💎" },
];

export const BALLS: Ball[] = [
  {
    num: 7,
    color: "#4DA2FF",
    x: "8%",
    y: "18%",
    delay: "0s",
    anim: "animate-float",
  },
  {
    num: 21,
    color: "#FF2D78",
    x: "82%",
    y: "12%",
    delay: "1.2s",
    anim: "animate-float-reverse",
  },
  {
    num: 42,
    color: "#7B2FBE",
    x: "88%",
    y: "55%",
    delay: "0.6s",
    anim: "animate-float",
  },
  {
    num: 13,
    color: "#39FF14",
    x: "5%",
    y: "62%",
    delay: "2s",
    anim: "animate-float-reverse",
  },
  {
    num: 36,
    color: "#FFB800",
    x: "70%",
    y: "78%",
    delay: "0.9s",
    anim: "animate-float",
  },
  {
    num: 9,
    color: "#4DA2FF",
    x: "25%",
    y: "80%",
    delay: "1.8s",
    anim: "animate-float-reverse",
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Connect Wallet",
    desc: "Link your Sui wallet to get started",
    icon: "🔗",
    color: "#4DA2FF",
  },
  {
    step: "02",
    title: "Buy Tickets",
    desc: "Choose how many tickets to purchase with SUI",
    icon: "🎫",
    color: "#7B2FBE",
  },
  {
    step: "03",
    title: "Wait for Draw",
    desc: "Countdown hits zero and the magic happens",
    icon: "⏳",
    color: "#FF2D78",
  },
  {
    step: "04",
    title: "Win Prizes!",
    desc: "On-chain randomness picks the lucky winners",
    icon: "🏆",
    color: "#39FF14",
  },
];

export const TRUST_BADGES = [
  {
    icon: "🔐",
    title: "Provably Fair",
    desc: "Sui's native VRF ensures randomness no one can manipulate",
  },
  {
    icon: "⛓️",
    title: "Fully On-Chain",
    desc: "All lottery state, funds, and draws happen on the Sui blockchain",
  },
  {
    icon: "💸",
    title: "98% to Winners",
    desc: "Only 2% protocol fee — the rest goes directly to lucky winners",
  },
];

/* ───── Helpers ───── */

export function mistToSui(mist: bigint): number {
  return Number(mist) / Number(MIST_PER_SUI);
}

export function suiToMist(sui: number): bigint {
  return BigInt(Math.round(sui * Number(MIST_PER_SUI)));
}

export function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function getExpectedWinnerCount(ticketCount: number): number {
  if (ticketCount >= 100) return 5;
  if (ticketCount >= 10) return 3;
  if (ticketCount >= 6) return 2;
  if (ticketCount >= 2) return 1;
  return 0;
}
