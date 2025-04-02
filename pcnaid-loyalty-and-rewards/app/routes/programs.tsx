import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  Text,
  Banner,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { db } from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  
  // Get the shop from the session
  const session = await admin.session;
  const shop = session.shop;
  
  // Find or create program settings for this shop
  let programSettings = await db.programSetting.findUnique({
    where: { shopId: shop }
  });
  
  if (!programSettings) {
    // Default settings
    programSettings = {
      shopId: shop,
      pointsPerDollar: 10,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  return json({ programSettings });
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  
  // Get the shop from the session
  const session = await admin.session;
  const shop = session.shop;
  
  // Get form data
  const formData = await request.formData();
  const pointsPerDollar = parseFloat(formData.get("pointsPerDollar") as string);
  
  // Validate input
  if (isNaN(pointsPerDollar) || pointsPerDollar <= 0) {
    return json({ 
      error: "Points per dollar must be a positive number",
      programSettings: { pointsPerDollar: formData.get("pointsPerDollar") }
    }, { status: 400 });
  }
  
  try {
    // Update or create program settings
    const programSettings = await db.programSetting.upsert({
      where: { shopId: shop },
      update: { 
        pointsPerDollar,
        updatedAt: new Date()
      },
      create: {
        shopId: shop,
        pointsPerDollar,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    return json({ 
      programSettings,
      success: "Loyalty program settings saved successfully"
    });
  } catch (error) {
    console.error("Error saving program settings:", error);
    return json({ 
      error: "Failed to save program settings",
      programSettings: { pointsPerDollar: formData.get("pointsPerDollar") }
    }, { status: 500 });
  }
};

export default function ProgramSettings() {
  const { programSettings, success, error } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit(event.currentTarget, { replace: true });
  };
  
  return (
    <Page title="Loyalty Program Settings">
      <Layout>
        <Layout.Section>
          {error && (
            <Banner status="critical">
              <p>{error}</p>
            </Banner>
          )}
          
          {success && (
            <Banner status="success">
              <p>{success}</p>
            </Banner>
          )}
          
          <Card>
            <form onSubmit={handleSubmit}>
              <FormLayout>
                <Text variant="headingMd" as="h2">
                  Points Configuration
                </Text>
                
                <TextField
                  label="Points per dollar spent"
                  type="number"
                  name="pointsPerDollar"
                  value={String(programSettings.pointsPerDollar)}
                  helpText="How many points customers earn for each dollar spent"
                  autoComplete="off"
                  min="0.1"
                  step="0.1"
                  required
                />
                
                <Button submit primary>
                  Save settings
                </Button>
              </FormLayout>
            </form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
