import { prisma } from '../lib/prisma';

export async function awardCarrots(userId: string, amount: number): Promise<void> {
  if (amount <= 0) {
    return;
  }

  try {
    const updated = await prisma.profile.update({
      where: { userId },
      data: {
        // @ts-expect-error Prisma client may require regenerate after schema change.
        carrotBalance: { increment: amount },
      },
    });

    const profile = updated as unknown as { carrotBalance?: number };
    const newBalance = profile.carrotBalance ?? 0;
    console.log(`[Rewards] Added ${amount} carrots to user ${userId}. New balance: ${newBalance}`);
  } catch (error) {
    // If profile does not exist, skip gracefully
    if (String(error).includes('Record to update not found')) {
      console.warn(`[Rewards] User profile not found for ${userId}, cannot award carrots`);
      return;
    }

    console.error(`[Rewards] Failed to award carrots to ${userId}:`, error);
    throw error;
  }
}
