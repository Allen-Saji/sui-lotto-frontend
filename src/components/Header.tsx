"use client";

import Link from "next/link";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { PACKAGE_ID } from "@/lib/constants";
import { WalletButton } from "./WalletButton";

export function Header() {
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
    <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
      <Link href="/" className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl animate-wiggle"
          style={{ background: "linear-gradient(135deg, #4DA2FF, #7B2FBE)", animationDuration: "4s" }}
        >
          <span className="text-xl" role="img" aria-label="ticket">🎰</span>
        </div>
        <span className="text-xl font-extrabold tracking-tight">
          <span className="text-[#4DA2FF]">Sui</span>
          <span className="text-white">Lotto</span>
        </span>
      </Link>

      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
        <Link href="/lotteries" className="hover:text-white transition-colors">Lotteries</Link>
        <Link href="/#tiers" className="hover:text-white transition-colors">Winner Tiers</Link>
        <Link href="/#how" className="hover:text-white transition-colors">How It Works</Link>
        {isAdmin && (
          <Link href="/admin" className="text-[#FFB800] hover:text-[#FFD060] transition-colors">
            Admin
          </Link>
        )}
      </nav>

      <WalletButton />
    </header>
  );
}
