import { db } from "../db.server";

// [START get-redeemed-points.query]
export async function getRedeemedPoints(customerId: string): Promise<number> {
  const record = await db.redeemedPoints.findUnique({
    where: { customerId },
  });
  return record ? record.pointsRedeemed : 0;
}
// [END get-redeemed-points.query]

// [START add-redeemed-points.query]
export async function addRedeemedPoints(
  customerId: string,
  points: number,
): Promise<void> {
  await db.redeemedPoints.upsert({
    where: { customerId },
    update: { pointsRedeemed: { increment: points } },
    create: { customerId, pointsRedeemed: points },
  });
}
// [END add-redeemed-points.query]

// [START update-customer-points.query]
export async function updateCustomerPoints(
  customerId: string,
  pointsToDeduct: number,
): Promise<{ updatedPointsTotal: number }> {
  // Use a transaction to ensure data consistency
  const result = await db.$transaction(async (tx) => {
    // Get current points balance
    const customerPoints = await tx.customerPoints.findUnique({
      where: { customerId },
    });

    if (!customerPoints) {
      throw new Error(`Customer ${customerId} not found in points database`);
    }

    if (customerPoints.pointsBalance < pointsToDeduct) {
      throw new Error(`Insufficient points balance for customer ${customerId}`);
    }

    // Update customer points balance
    const updatedCustomerPoints = await tx.customerPoints.update({
      where: { customerId },
      data: { pointsBalance: { decrement: pointsToDeduct } },
    });

    // Record the redeemed points
    await tx.redeemedPoints.upsert({
      where: { customerId },
      update: { pointsRedeemed: { increment: pointsToDeduct } },
      create: { customerId, pointsRedeemed: pointsToDeduct },
    });

    return { updatedPointsTotal: updatedCustomerPoints.pointsBalance };
  });

  return result;
}
// [END update-customer-points.query]
