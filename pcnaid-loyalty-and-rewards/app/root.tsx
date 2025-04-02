import { LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
} from "@remix-run/react";
import { useEffect } from "react";
import { AppProvider } from "@shopify/polaris"; // Import Polaris components

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log("Environment SHOPIFY_API_KEY:", process.env.SHOPIFY_API_KEY);
  console.log("Loader executed with API Key and Host.");

  const apiKey = process.env.SHOPIFY_API_KEY;

  if (!apiKey) {
    console.error("SHOPIFY_API_KEY is missing in the environment variables.");
    throw new Error("SHOPIFY_API_KEY must be defined.");
  }

  console.log("API Key:", apiKey,);

  return json({ apiKey });
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  useEffect(() => {
    if (!apiKey ) {
      console.error("Missing App Bridge parameters: apiKey or host.");
      return;
    }
    console.log("Initializing App Bridge with API Key:", apiKey );
  }, [apiKey]);

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="shopify-api-key" content={apiKey} />
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
      <AppProvider i18n={{}}>
        <Outlet />
      </AppProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
