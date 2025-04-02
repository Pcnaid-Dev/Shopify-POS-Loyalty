import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris"; // Import Polaris components
import { useLoaderData, useMatches } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  List,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {

  await authenticate.admin(request);
  const reports = [
    { id: 1, name: "Monthly Summary", status: "Generated" },
    { id: 2, name: "Weekly Overview", status: "Pending" },
  ];
  return json({ reports });
};

export default function Reports() {
  const matches = useMatches();
  const { reports } = useLoaderData<typeof loader>();
  const rootData = matches.find((m) => m.id === "root")?.data as { apiKey: string };
  const apiKey = rootData.apiKey;

  // Placeholder for chart data
  const chartData = {
    customerEngagement: [
      { month: "Jan", value: 100 },
      { month: "Feb", value: 120 },
      { month: "Mar", value: 150 },
    ],
    programROI: [
      { program: "Program A", roi: 2.5 },
      { program: "Program B", roi: 1.8 },
    ],
  };



  return (
    <Page title="Reports">
      <TitleBar title="Reports" />
      <Layout>
        <Layout.Section>
          <Card>
            <Text as="h2">Customer Engagement</Text>
            <List type="bullet">
              {chartData.customerEngagement.map((item) => (
                <List.Item key={item.month}>
                  {item.month}: {item.value}
                </List.Item>
              ))}
            </List>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <Text as="h2">Program ROI</Text>
            <List type="bullet">
              {chartData.programROI.map((item) => (
                <List.Item key={item.program}>
                  {item.program}: {item.roi}
                </List.Item>
              ))}
            </List>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <Text as="h2">High-Performing Rewards</Text>
            <Text as="p">Content for High-Performing Rewards</Text>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <Text as="h2">Retention Rates</Text>
            <Text as="p">Content for Retention Rates</Text>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <Text as="h2">Revenue Driven by Loyalty Members</Text>
            <Text as="p">Content for Revenue Driven by Loyalty Members</Text>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
