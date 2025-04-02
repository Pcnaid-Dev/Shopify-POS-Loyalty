import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId");

  if (customerId) {
    // Redirect to /points/$customerId, preserving other query parameters
    return redirect(`/points/${customerId}`);
  } else {
    // Handle missing orderId
    return new Response("Customer ID is missing", { status: 400 });
  }
};

export default function Orders() {
  // This component might not render anything since we're redirecting
  return <></>;
}
