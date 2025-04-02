import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  Banner,
  Button,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { createProgramSettingModel, seedTestData } from "../services/testUtils.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return json({ status: "ready" });
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  const formData = await request.formData();
  const action = formData.get("action") as string;
  
  try {
    if (action === "create_program_setting_model") {
      const result = await createProgramSettingModel();
      return json({ success: result.success, message: "ProgramSetting model created" });
    } else if (action === "seed_test_data") {
      const result = await seedTestData();
      return json({ 
        success: result.success, 
        message: "Test data seeded successfully",
        testCustomerId: result.testCustomerId
      });
    }
    
    return json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in test action:", error);
    return json({ error: "Test action failed" }, { status: 500 });
  }
};

export default function TestPage() {
  const { status, success, error, message, testCustomerId } = useLoaderData<typeof loader>();
  
  return (
    <Page title="Test Utilities">
      <Layout>
        <Layout.Section>
          {error && (
            <Banner status="critical">
              <p>{error}</p>
            </Banner>
          )}
          
          {success && (
            <Banner status="success">
              <p>{message}</p>
              {testCustomerId && (
                <p>Test Customer ID: {testCustomerId}</p>
              )}
            </Banner>
          )}
          
          <Card>
            <Card.Section>
              <Text variant="headingMd" as="h2">
                Database Setup
              </Text>
              <Text>
                Use these utilities to set up test data for the loyalty program.
              </Text>
              <div style={{ marginTop: "1rem" }}>
                <form method="post">
                  <input type="hidden" name="action" value="create_program_setting_model" />
                  <Button submit>Create ProgramSetting Model</Button>
                </form>
              </div>
            </Card.Section>
            
            <Card.Section>
              <Text variant="headingMd" as="h2">
                Seed Test Data
              </Text>
              <Text>
                Create test customer points and reward rules for testing.
              </Text>
              <div style={{ marginTop: "1rem" }}>
                <form method="post">
                  <input type="hidden" name="action" value="seed_test_data" />
                  <Button submit primary>Seed Test Data</Button>
                </form>
              </div>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
