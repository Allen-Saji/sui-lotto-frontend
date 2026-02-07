import { useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { PACKAGE_ID, MODULE_NAME } from "@/lib/constants";
import type { LotteryState } from "@/lib/constants";
import type { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";

export type LotteryWithId = LotteryState & { id: string };

/**
 * Fetches ALL status===0 (undrawn) lottery objects from chain events.
 * Shared base for all lottery list hooks.
 */
async function fetchUndrawLotteries(client: SuiJsonRpcClient): Promise<LotteryWithId[]> {
  const { data: events } = await client.queryEvents({
    query: {
      MoveEventType: `${PACKAGE_ID}::${MODULE_NAME}::LotteryCreatedEvent`,
    },
    order: "descending",
  });

  if (!events || events.length === 0) return [];

  const lotteryIds = events.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e) => (e.parsedJson as any).lottery_id,
  );

  const objects = await client.multiGetObjects({
    ids: lotteryIds,
    options: { showContent: true },
  });

  const results: LotteryWithId[] = [];
  for (const obj of objects) {
    if (obj.data?.content?.dataType !== "moveObject") continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fields = (obj.data.content as any).fields;
    if (!fields || Number(fields.status) !== 0) continue;

    results.push({
      id: obj.data.objectId,
      ticketPrice: BigInt(fields.ticket_price),
      balance: BigInt(fields.balance),
      participants: fields.participants ?? [],
      deadline: BigInt(fields.deadline),
      status: Number(fields.status),
      winners: fields.winners ?? [],
      adminFeeBps: Number(fields.admin_fee_bps),
    });
  }

  return results;
}

/** Active lotteries: status===0 AND deadline in the future */
export function useActiveLotteries() {
  const client = useSuiClient();

  return useQuery({
    queryKey: ["active-lotteries"],
    refetchInterval: 15_000,
    queryFn: async (): Promise<LotteryWithId[]> => {
      const all = await fetchUndrawLotteries(client);
      const now = Date.now();
      return all.filter((l) => Number(l.deadline) > now);
    },
  });
}

/** Admin lotteries: ALL status===0 (includes expired ones admin needs to draw) */
export function useAdminLotteries() {
  const client = useSuiClient();

  return useQuery({
    queryKey: ["admin-lotteries"],
    refetchInterval: 15_000,
    queryFn: async (): Promise<LotteryWithId[]> => {
      return fetchUndrawLotteries(client);
    },
  });
}

/** Refundable lotteries for a wallet: expired + <2 participants + wallet is a participant */
export function useRefundableLotteries(walletAddress: string | undefined) {
  const client = useSuiClient();

  return useQuery({
    queryKey: ["refundable-lotteries", walletAddress],
    enabled: !!walletAddress,
    refetchInterval: 15_000,
    queryFn: async (): Promise<LotteryWithId[]> => {
      const all = await fetchUndrawLotteries(client);
      const now = Date.now();
      return all.filter(
        (l) =>
          Number(l.deadline) <= now &&
          l.participants.length < 2 &&
          l.participants.includes(walletAddress!),
      );
    },
  });
}
