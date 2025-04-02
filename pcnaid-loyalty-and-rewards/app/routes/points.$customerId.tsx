import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import { fetchCustomerTotal } from "./fetchCustomer";
import { getRedeemedPoints } from "../services/redeemedPoints.server";
import { db } from "../db.server";

// [START points.loader]
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  // 1. Authenticate the request
  await authenticate.admin(request);

  // 2. Get the customer ID from the params
  const { customerId } = params;

  if (!customerId) {
    throw new Response("Customer ID is required", { status: 400 });
  }

  try {
    // 3. Find or create customer points record
    let customerPoints = await db.customerPoints.findUnique({
      where: { customerId }
    });

    // If customer doesn't have a points record yet, calculate from orders and create one
    if (!customerPoints) {
      // Fetch the customer total from orders
      const orderTotal = await fetchCustomerTotal(request, customerId);
      
      // Calculate points (10 points per dollar spent)
      const calculatedPoints = orderTotal ? Math.floor(orderTotal * 10) : 0;
      
      // Get any previously redeemed points
      const totalRedeemedPoints = await getRedeemedPoints(customerId);
      
      // Calculate current balance
      const pointsBalance = calculatedPoints - totalRedeemedPoints;
      
      // Create a new customer points record
      customerPoints = await db.customerPoints.create({
        data: {
          customerId,
          pointsBalance: pointsBalance > 0 ? pointsBalance : 0
        }
      });
    }

    // 4. Fetch active reward rules
    const rewardRules = await db.rewardRule.findMany({
      where: { isActive: true }
    });

    // 5. Filter eligible rewards based on points balance
    const eligibleRewards = rewardRules.filter(
      reward => customerPoints!.pointsBalance >= reward.pointsRequired
    );

    return json(
      { 
        totalPoints: customerPoints.pointsBalance,
        eligibleRewards
      },
      {
        headers: {
          // Allow requests from all origins (or specify your client origin)
          "Access-Control-Allow-Origin": "*",
          // Allow specific headers if necessary
          "Access-Control-Allow-Headers": "Authorization, Content-Type",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching customer points:", error);
    return json(
      { error: "Failed to fetch customer points" },
      { status: 500 }
    );
  }
};
// [END points.loader]
export default null;
