import { useEffect } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris"; // Import Polaris components
import { json } from "@remix-run/node";
import { useLoaderData, useMatches } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Card,
  List,
  Layout,
  Text,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";


export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const customers = [
    { id: "1", name: "John Doe" },
    { id: "2", name: "Jane Smith" },
  ];
  return json({ customers });
};

export default function CustomersPage() {
  const matches = useMatches();
  const { customers } = useLoaderData<typeof loader>();
  const rootData = matches.find((m) => m.id === "root")?.data as { apiKey: string };
  const apiKey = rootData.apiKey;
  const fetcher = useFetcher<{ customers: { id: string; name: string }[] }>();

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      // Handle fetcher data, e.g., update customer list
    }
  }, [fetcher]);

  const handleSearch = (searchTerm: string) => {
    fetcher.submit({ searchTerm }, { method: "get", action: "/customers" });
  };

  const handleFilterChange = (filter: string) => {
    fetcher.submit({ filter }, { method: "get", action: "/customers" });
  };



  return (
    <Page
      title="Customers"
      primaryAction={{
        content: "New Customer",
        onAction: () => {
          // Handle new customer action
        },
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <InlineStack>
              <input
                type="text"
                placeholder="Search customers"
                onChange={(e) => handleSearch(e.target.value)}
              />
              <select onChange={(e) => handleFilterChange(e.target.value)}>
                <option value="">All customers</option>
              </select>
            </InlineStack>
            <List>
              {fetcher?.data?.customers?.map((customer) => (
                <List.Item key={customer.id}>
                  <Text as="p" variant="bodyMd">
                    {customer.name}
                  </Text>
                </List.Item>
              ))}
            </List>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export function CustomerDetailsPage() {
  
  
  
  return (
    <Page title="Customer Details">
      <Layout>
        <Layout.Section>
          <Text as="h2">Points History</Text>
        </Layout.Section>
        <Layout.Section>
          <Text as="h2">Transactions</Text>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
