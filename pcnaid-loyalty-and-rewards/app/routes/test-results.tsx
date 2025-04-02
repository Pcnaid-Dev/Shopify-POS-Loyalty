import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  Banner,
  Button,
  List,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { db } from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  // Test database queries
  try {
    // Check CustomerPoints
    const customerPoints = await db.customerPoints.findMany();
    
    // Check RewardRules
    const rewardRules = await db.rewardRule.findMany();
    
    // Check ProgramSettings (if exists)
    let programSettings = [];
    try {
      programSettings = await db.$queryRaw`SELECT * FROM ProgramSetting`;
    } catch (e) {
      // Table might not exist yet
    }
    
    return json({ 
      success: true,
      customerPoints,
      rewardRules,
      programSettings,
      testsRun: true
    });
  } catch (error) {
    console.error("Error testing database:", error);
    return json({ 
      error: "Database test failed. Make sure you've run migrations and seeded test data.",
      testsRun: true
    });
  }
};

export default function TestResults() {
  const { 
    success, 
    error, 
    customerPoints = [], 
    rewardRules = [], 
    programSettings = [],
    testsRun = false
  } = useLoaderData<typeof loader>();
  
  return (
    <Page title="Test Results">
      <Layout>
        <Layout.Section>
          {error && (
            <Banner status="critical">
              <p>{error}</p>
            </Banner>
          )}
          
          {success && (
            <Banner status="success">
              <p>Database tests completed successfully!</p>
            </Banner>
          )}
          
          <Card title="Test Results">
            <Card.Section>
              <Text variant="headingMd" as="h2">
                Database Test Results
              </Text>
              
              {testsRun ? (
                <>
                  <Card.Section title="CustomerPoints Records">
                    {customerPoints.length > 0 ? (
                      <List type="bullet">
                        {customerPoints.map((point: any, index: number) => (
                          <List.Item key={index}>
                            Customer ID: {point.customerId}, Points: {point.pointsBalance}
                          </List.Item>
                        ))}
                      </List>
                    ) : (
                      <Text>No customer points records found.</Text>
                    )}
                  </Card.Section>
                  
                  <Card.Section title="RewardRules">
                    {rewardRules.length > 0 ? (
                      <List type="bullet">
                        {rewardRules.map((rule: any, index: number) => (
                          <List.Item key={index}>
                            {rule.name}: {rule.pointsRequired} points, 
                            {rule.discountType === "PERCENTAGE" ? 
                              ` ${rule.discountValue}% off` : 
                              ` $${rule.discountValue} off`}
                          </List.Item>
                        ))}
                      </List>
                    ) : (
                      <Text>No reward rules found.</Text>
                    )}
                  </Card.Section>
                  
                  <Card.Section title="Program Settings">
                    {programSettings.length > 0 ? (
                      <List type="bullet">
                        {programSettings.map((setting: any, index: number) => (
                          <List.Item key={index}>
                            Shop: {setting.shopId}, Points Per Dollar: {setting.pointsPerDollar}
                          </List.Item>
                        ))}
                      </List>
                    ) : (
                      <Text>No program settings found.</Text>
                    )}
                  </Card.Section>
                </>
              ) : (
                <Text>Tests have not been run yet.</Text>
              )}
            </Card.Section>
            
            <Card.Section>
              <Text>
                To continue testing:
              </Text>
              <List type="bullet">
                <List.Item>
                  Go to the <Button url="/test">Test Utilities</Button> page to seed test data
                </List.Item>
                <List.Item>
                  Check the <Button url="/programs">Program Settings</Button> page
                </List.Item>
                <List.Item>
                  Manage <Button url="/rewards">Reward Rules</Button>
                </List.Item>
              </List>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
