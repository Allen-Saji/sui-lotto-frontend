"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useLottery } from "@/hooks/useLottery";
import type { LotteryState } from "@/lib/constants";

type LotteryContextType = {
  lotteryId: string | null;
  setLotteryId: (id: string) => void;
  lottery: LotteryState | null;
  isLoading: boolean;
  refetch: () => void;
};

const LotteryContext = createContext<LotteryContextType>({
  lotteryId: null,
  setLotteryId: () => {},
  lottery: null,
  isLoading: false,
  refetch: () => {},
});

export function LotteryProvider({ children }: { children: React.ReactNode }) {
  const [lotteryId, setLotteryIdRaw] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("suilotto_lottery_id");
    }
    return null;
  });

  const setLotteryId = useCallback((id: string) => {
    setLotteryIdRaw(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("suilotto_lottery_id", id);
    }
  }, []);

  const { lottery, isLoading, refetch } = useLottery(lotteryId);

  return (
    <LotteryContext.Provider value={{ lotteryId, setLotteryId, lottery, isLoading, refetch }}>
      {children}
    </LotteryContext.Provider>
  );
}

export function useLotteryContext() {
  return useContext(LotteryContext);
}
