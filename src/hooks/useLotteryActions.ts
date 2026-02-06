import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, MODULE_NAME, ADMIN_CAP_ID, SUI_CLOCK_ID, SUI_RANDOM_ID } from "@/lib/constants";

const TARGET = `${PACKAGE_ID}::${MODULE_NAME}`;

export function useLotteryActions() {
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const client = useSuiClient();

  async function createLottery(ticketPriceMist: bigint, deadlineMs: bigint) {
    const tx = new Transaction();

    tx.moveCall({
      target: `${TARGET}::create_lottery`,
      arguments: [
        tx.object(ADMIN_CAP_ID),
        tx.pure.u64(ticketPriceMist),
        tx.pure.u64(deadlineMs),
        tx.object(SUI_CLOCK_ID),
      ],
    });

    const result = await signAndExecute({ transaction: tx });

    // Wait for the transaction to be indexed, then query for created objects
    await client.waitForTransaction({ digest: result.digest });
    const txResponse = await client.getTransactionBlock({
      digest: result.digest,
      options: { showEffects: true },
    });

    const created = txResponse.effects?.created;
    const sharedObj = created?.find(
      (obj) => obj.owner && typeof obj.owner === "object" && "Shared" in obj.owner,
    );

    return { digest: result.digest, lotteryId: sharedObj?.reference?.objectId ?? null };
  }

  async function buyTicket(lotteryId: string, ticketPriceMist: bigint, qty: number) {
    const tx = new Transaction();

    for (let i = 0; i < qty; i++) {
      const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64(ticketPriceMist)]);
      tx.moveCall({
        target: `${TARGET}::buy_ticket`,
        arguments: [
          tx.object(lotteryId),
          payment,
          tx.object(SUI_CLOCK_ID),
        ],
      });
    }

    return signAndExecute({ transaction: tx });
  }

  async function drawWinner(lotteryId: string) {
    const tx = new Transaction();

    tx.moveCall({
      target: `${TARGET}::draw_winner`,
      arguments: [
        tx.object(lotteryId),
        tx.object(ADMIN_CAP_ID),
        tx.object(SUI_RANDOM_ID),
        tx.object(SUI_CLOCK_ID),
      ],
    });

    return signAndExecute({ transaction: tx });
  }

  async function claimRefund(lotteryId: string) {
    const tx = new Transaction();

    tx.moveCall({
      target: `${TARGET}::claim_refund`,
      arguments: [
        tx.object(lotteryId),
        tx.object(SUI_CLOCK_ID),
      ],
    });

    return signAndExecute({ transaction: tx });
  }

  return { createLottery, buyTicket, drawWinner, claimRefund, isPending };
}
