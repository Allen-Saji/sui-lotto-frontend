"use client";

import { useState } from "react";
import { ConnectModal, useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import { truncateAddress } from "@/lib/constants";

export function WalletButton() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [open, setOpen] = useState(false);

  if (account) {
    return (
      <button
        onClick={() => disconnect()}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105"
        style={{
          background: "linear-gradient(135deg, rgba(57,255,20,0.1), rgba(77,162,255,0.1))",
          border: "1px solid rgba(57,255,20,0.3)",
        }}
      >
        <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
        <span className="font-mono">{truncateAddress(account.address)}</span>
      </button>
    );
  }

  return (
    <ConnectModal
      trigger={
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105"
          style={{
            background: "linear-gradient(135deg, rgba(77,162,255,0.15), rgba(123,47,190,0.15))",
            border: "1px solid rgba(77,162,255,0.3)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
            <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
            <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
          </svg>
          Connect Wallet
        </button>
      }
      open={open}
      onOpenChange={setOpen}
    />
  );
}
