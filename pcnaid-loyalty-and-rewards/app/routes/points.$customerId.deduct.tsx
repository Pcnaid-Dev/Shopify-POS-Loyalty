import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { updateCustomerPoints } from "../services/redeemedPoints.server";
import { authenticate } from "app/shopify.server";

// [START points.deduct.action]
export const action: ActionFunction = async ({ request, params }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  // 1. Authenticate the request
  try {
    await authenticate.admin(request);
  } catch (error) {
    console.error("Authentication failed:", error);
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Get the customer ID from the params
  const { customerId } = params;

  if (!customerId) {
    return json({ error: "Customer ID is required" }, { status: 400 });
  }

  try {
    const { pointsToDeduct } = await request.json();
    
    if (!pointsToDeduct || typeof pointsToDeduct !== 'number' || pointsToDeduct <= 0) {
      return json({ error: "Valid pointsToDeduct value is required" }, { status: 400 });
    }

    // Use the new updateCustomerPoints function to handle point deduction
    const result = await updateCustomerPoints(customerId, pointsToDeduct);

    return json(
      { 
        message: "Points deducted successfully", 
        updatedPointsTotal: result.updatedPointsTotal 
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Authorization, Content-Type",
        },
      }
    );
  } catch (error) {
    console.error("Error deducting points:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return json(
      { error: errorMessage },
      { 
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Authorization, Content-Type",
        },
      }
    );
  }
};
// [END points.deduct.action]
