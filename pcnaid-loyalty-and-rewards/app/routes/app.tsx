import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useRouteError, useMatches } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/polaris"; // Import Polaris components
import { NavMenu } from "@shopify/app-bridge-react"; // Updated import for NavMenu
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { useEffect } from "react";

import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {

  const url = new URL(request.url);

  await authenticate.admin(request);
  const host = url.searchParams.get("host");

  if (!host) {
    console.error("Host parameter is missing in the URL:", request.url);
    throw new Error("Host parameter must be provided.");
  }

  return json({ host });
};

export default function App() {
  const matches = useMatches();
  const rootData = matches.find((m) => m.id === "root")?.data as { apiKey: string };
  const apiKey = rootData.apiKey;
  const { host } = useLoaderData<typeof loader>();
  

  return (
    <>
          <NavMenu>
            <a href={`/app?host=${host}&embedded=1`} rel="home">Dashboard</a>
            <a href={`/programs?host=${host}&embedded=1`}>Programs</a>
            <a href={`/rewards?host=${host}&embedded=1`}>Rewards</a>
            <a href={`/customers?host=${host}&embedded=1`}>Customers</a>
            <a href={`/reports?host=${host}&embedded=1`}>Reports</a>
          </NavMenu>
          <Outlet />
          </>
  );
}

// Shopify-specific error boundary
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

