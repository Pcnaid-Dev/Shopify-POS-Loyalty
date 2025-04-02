import { AppProvider } from "@shopify/polaris";
import { Outlet } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris"; // Import Polaris components
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { useEffect } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData, useMatches } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {

  const queryParams = new URL(request.url).searchParams;

  await authenticate.admin(request);
  const programs = [
    { id: 1, name: "Bronze Tier", status: "Enabled" },
    { id: 2, name: "Silver Tier", status: "Disabled" },
  ];
  return json({ programs });
};

export default function Programs() {
  const matches = useMatches();
  const { programs } = useLoaderData<typeof loader>();
  const rootData = matches.find((m) => m.id === "root")?.data as { apiKey: string };
  const apiKey = rootData.apiKey;
  const fetcher = useFetcher();

  useEffect(() => {

    if (fetcher.state === "idle" && fetcher.data) {
      // Update UI or show a notification based on fetcher.data
    }
  }, [fetcher]);

  const handleProgramAction = (programId: number, action: string) => {
    fetcher.submit(
      { programId, action },
      { method: "post", action: "/programs/actions" }
    );
  };



  return (
    <Page
      title="Loyalty Programs"
      primaryAction={{
        content: "Create Program",
        onAction: () => {
          window.location.href = "/programs/create";
        },
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <List>
              {programs.map((program) => (
                <List.Item key={program.id}>
                  <InlineStack>
                    <Box>
                      <Text as="p" variant="bodyMd" fontWeight="bold">
                        {program.name}
                      </Text>
                      <Text as="p" variant="bodySm">
                        Status: {program.status}
                      </Text>
                    </Box>
                    <InlineStack>
                      <Button
                        onClick={() => handleProgramAction(program.id, "enable")}
                        disabled={program.status === "Enabled"}
                      >
                        Enable
                      </Button>
                      <Button
                        onClick={() => handleProgramAction(program.id, "disable")}
                        disabled={program.status === "Disabled"}
                      >
                        Disable
                      </Button>
                      <Button
                        onClick={() => {
                          window.location.href = `/programs/${program.id}/edit`;
                        }}
                      >
                        Edit
                      </Button>
                    </InlineStack>
                  </InlineStack>
                </List.Item>
              ))}
            </List>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const programId = formData.get("programId");
  const action = formData.get("action");

  if (typeof programId !== "string" || typeof action !== "string") {
    throw new Error("Invalid form submission");
  }

  // Implement program actions (e.g., enable/disable, edit) here

  return json({ success: true });
};
