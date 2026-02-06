import { useSuiClientQuery } from "@mysten/dapp-kit";
import type { LotteryState } from "@/lib/constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseFields(fields: any): LotteryState {
  return {
    ticketPrice: BigInt(fields.ticket_price),
    balance: BigInt(fields.balance),
    participants: fields.participants ?? [],
    deadline: BigInt(fields.deadline),
    status: Number(fields.status),
    winners: fields.winners ?? [],
    adminFeeBps: Number(fields.admin_fee_bps),
  };
}

export function useLottery(lotteryId: string | null) {
  const { data, isLoading, error, refetch } = useSuiClientQuery(
    "getObject",
    {
      id: lotteryId!,
      options: { showContent: true },
    },
    {
      enabled: !!lotteryId,
      refetchInterval: 10_000,
    }
  );

  let lottery: LotteryState | null = null;

  if (data?.data?.content?.dataType === "moveObject") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fields = (data.data.content as any).fields;
    if (fields) {
      lottery = parseFields(fields);
    }
  }

  return { lottery, isLoading, error, refetch };
}
