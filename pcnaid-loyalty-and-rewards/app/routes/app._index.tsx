import { useEffect } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris"; // Import Polaris components
import { json } from "@remix-run/node";
import { useLoaderData, useMatches } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  InlineStack,
  List,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {

  
  await authenticate.admin(request);

  // Replace with actual API calls to fetch data
  const metrics = {
    total_points_awarded: 10000,
    total_points_redeemed: 7500,
    active_customers: 120,
    top_reward: "Free Coffee",
  };

  const charts = {
    monthly_redemption_trends: [
      { month: "January", value: 200 },
      { month: "February", value: 250 },
      { month: "March", value: 300 },
    ],
    customer_growth: [
      { month: "January", value: 100 },
      { month: "February", value: 120 },
      { month: "March", value: 150 },
    ],
  };



  return json({ metrics, charts });
};


export default function Dashboard() {
  const matches = useMatches();
  const { metrics, charts } = useLoaderData<typeof loader>();
  const rootData = matches.find((m) => m.id === "root")?.data as { apiKey: string };
  const apiKey = rootData.apiKey;
  

  useEffect(() => {

  }, []);

  const navigateTo = (url: string) => {
    window.location.href = url;
  };

  

  return (
    <Page title="Loyalty & Rewards Dashboard">
      <TitleBar title="Loyalty & Rewards Dashboard" />
      <Layout>
        <Layout.Section>
          <Text as="p" variant="bodyMd">
            Overview of the loyalty program performance. Key metrics like total
            points awarded, redeemed, active customers, and most popular
            rewards. Quick links to important actions (e.g., "Create Reward" or
            "View Customer Details").
          </Text>
        </Layout.Section>

        {/* Key Metrics Section */}
        <Layout.Section>
          <Card>
            <InlineStack>
              <Text as="h3" variant="headingMd">
                Total Points Awarded: {metrics.total_points_awarded}
              </Text>
              <Text as="h3" variant="headingMd">
                Total Points Redeemed: {metrics.total_points_redeemed}
              </Text>
              <Text as="h3" variant="headingMd">
                Active Customers: {metrics.active_customers}
              </Text>
              <Text as="h3" variant="headingMd">
                Top Reward: {metrics.top_reward}
              </Text>
            </InlineStack>
          </Card>
        </Layout.Section>

        {/* Charts Section */}
        <Layout.Section>
          <Card>
            <Text as="h3" variant="headingMd">Monthly Redemption Trends</Text>
            <List>
              {charts.monthly_redemption_trends.map(({ month, value }) => (
                <List.Item key={month}>
                  {month}: {value} redemptions
                </List.Item>
              ))}
            </List>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <Text as="h3" variant="headingMd">Customer Growth Over Time</Text>
            <List>
              {charts.customer_growth.map(({ month, value }) => (
                <List.Item key={month}>
                  {month}: {value} new customers
                </List.Item>
              ))}
            </List>
          </Card>
        </Layout.Section>

        {/* Quick Links Section */}
        <Layout.Section>
          <InlineStack>
            <Button onClick={() => navigateTo("/rewards/new")}>Add Reward</Button>
            <Button onClick={() => navigateTo("/customers")}>View Customers</Button>
            <Button onClick={() => navigateTo("/settings")}>Program Settings</Button>
          </InlineStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
