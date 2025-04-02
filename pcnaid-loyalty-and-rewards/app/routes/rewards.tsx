import { useEffect } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris"; // Import Polaris components
import React, { Component } from "react";
import { useLoaderData, useMatches } from "@remix-run/react";

import {
  Page,
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

export const loader = async ({ request }: LoaderFunctionArgs) => {

  await authenticate.admin(request);
  const rewards = [
    { id: 1, name: "Free Coffee", points: 100 },
    { id: 2, name: "Discount Code", points: 50 },
  ];
  return json({ rewards });
};


  export default function Rewards() {
    const matches = useMatches();
    const { rewards } = useLoaderData<typeof loader>();
    const rootData = matches.find((m) => m.id === "root")?.data as { apiKey: string };
    const apiKey = rootData.apiKey;

  interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  enabled: boolean;
}

  const RewardsPage: React.FC = () => {
  const [rewards, setRewards] = React.useState<Reward[]>([]);
  const [isCreating, setIsCreating] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [selectedReward, setSelectedReward] = React.useState<Reward | null>(
    null
  );

  useEffect(() => {
    // Fetch rewards data from your backend API here
    // Example:
    // fetch('/api/rewards')
    //   .then(res => res.json())
    //   .then(data => setRewards(data));
    setRewards([
      {
        id: "1",
        name: "Free Coffee",
        description: "Enjoy a free coffee on us!",
        pointsCost: 100,
        enabled: true,
      },
      {
        id: "2",
        name: "10% Discount",
        description: "Get 10% off your next purchase.",
        pointsCost: 500,
        enabled: false,
      },
    ]);
  }, []);

  const handleCreateReward = () => {
    setIsCreating(true);
  };

  const handleEditReward = (reward: Reward) => {
    setSelectedReward(reward);
    setIsEditing(true);
  };

  const handleEnableDisableReward = (reward: Reward) => {
    // Update reward status in your backend API here
    // Example:
    // fetch(`/api/rewards/${reward.id}`, {
    //   method: 'PATCH',
    //   body: JSON.stringify({ enabled: !reward.enabled }),
    // })
    //   .then(res => res.json())
    //   .then(data => {
    //     // Update rewards state
    //   });
    setRewards(
      rewards.map((r) =>
        r.id === reward.id ? { ...r, enabled: !r.enabled } : r
      )
    );
  };

  return (
    <Page>
      <TitleBar title="Rewards" />
      <Card>
        <BlockStack>
          <Box>
            <InlineStack>
              <Button onClick={handleCreateReward}>
                Create Reward
              </Button>
            </InlineStack>
          </Box>
          <List>
            {rewards.map((reward) => (
              <List.Item key={reward.id}>
                <InlineStack>
                  <Text as="h3" fontWeight="bold">
                    {reward.name}
                  </Text>
                  <Text as="p">{reward.description}</Text>
                  <Text as="span">Points Cost: {reward.pointsCost}</Text>
                  <Button onClick={() => handleEditReward(reward)} size="slim">
                    Edit
                  </Button>
                  {reward.enabled ? (
                    <Button onClick={() => handleEnableDisableReward(reward)} size="slim">
                      Disable
                    </Button>
                  ) : (
                    <Button onClick={() => handleEnableDisableReward(reward)} size="slim">
                      Enable
                    </Button>
                  )}
                </InlineStack>
              </List.Item>
            ))}
          </List>
        </BlockStack>
      </Card>
    </Page>
  );
};

}
