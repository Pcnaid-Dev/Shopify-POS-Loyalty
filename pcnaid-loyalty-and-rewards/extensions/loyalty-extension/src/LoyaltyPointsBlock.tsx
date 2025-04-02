import React, { useState, useEffect } from "react";

import {
  reactExtension,
  POSBlock,
  Text,
  POSBlockRow,
  useApi,
  Button,
  useToast,
} from "@shopify/ui-extensions-react/point-of-sale";

import { applyDiscount } from "./applyDiscount";

// For development purposes, we'll use a local server
export const serverUrl =
  "https://hrs-macintosh-graph-testimonials.trycloudflare.com";

const LoyaltyPointsBlock = () => {
  // [START loyalty-points-block.api]
  // Initialize API
  const api = useApi<"pos.customer-details.block.render">();
  const customerId = api.customer.id;
  const [pointsTotal, setPointsTotal] = useState<number | null>(null);
  const [eligibleRewards, setEligibleRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  // [END loyalty-points-block.api]

  // Fetch customer points and eligible rewards
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!customerId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Get the session token
        const sessionToken = await api.session.getSessionToken();

        const response = await fetch(`${serverUrl}/points/${customerId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error Response Text:", errorText);
          throw new Error(`Failed to fetch customer data: ${errorText}`);
        }

        const data = await response.json();

        if (typeof data.totalPoints === "number") {
          setPointsTotal(data.totalPoints);
        } else {
          console.error("No points available in the response.");
          setError("Could not retrieve points balance");
        }

        if (Array.isArray(data.eligibleRewards)) {
          setEligibleRewards(data.eligibleRewards);
        } else {
          console.error("No eligible rewards in the response.");
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
        setError("Failed to load loyalty data");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [api, customerId]);

  // Handle applying a reward
  const handleApplyReward = async (reward: any) => {
    try {
      // Determine discount type and value
      const discountType = reward.discountType === "PERCENTAGE" ? "Percentage" : "FixedAmount";
      const discountValue = reward.discountValue;
      const pointsRequired = reward.pointsRequired;
      
      // Apply the discount to the cart
      await applyDiscount(
        api,
        customerId,
        discountValue,
        pointsRequired,
        setPointsTotal,
        discountType
      );
      
      // Show success message
      toast.show(`Reward applied: ${reward.name}`);
      
      // Update eligible rewards based on new points balance
      setEligibleRewards(prev => 
        prev.filter(r => (pointsTotal! - pointsRequired) >= r.pointsRequired)
      );
    } catch (error) {
      console.error("Error applying reward:", error);
      toast.show("Failed to apply reward", { error: true });
    }
  };

  if (loading) {
    return (
      <POSBlock>
        <POSBlockRow>
          <Text>Loading loyalty data...</Text>
        </POSBlockRow>
      </POSBlock>
    );
  }

  if (error) {
    return (
      <POSBlock>
        <POSBlockRow>
          <Text color="TextWarning">{error}</Text>
        </POSBlockRow>
      </POSBlock>
    );
  }

  if (pointsTotal === null) {
    return (
      <POSBlock>
        <POSBlockRow>
          <Text color="TextWarning">No loyalty data available for this customer.</Text>
        </POSBlockRow>
      </POSBlock>
    );
  }

  return (
    <POSBlock>
      <POSBlockRow>
        <Text variant="headingLarge" color="TextSuccess">
          Points Balance: {pointsTotal}
        </Text>
      </POSBlockRow>
      
      {eligibleRewards.length > 0 ? (
        <>
          <POSBlockRow>
            <Text variant="headingSmall">Available Rewards:</Text>
          </POSBlockRow>
          {eligibleRewards.map((reward, index) => (
            <POSBlockRow key={`${reward.id}-${index}`}>
              <Button
                title={`${reward.name} (${reward.pointsRequired} points)`}
                type="primary"
                onPress={() => handleApplyReward(reward)}
              />
            </POSBlockRow>
          ))}
        </>
      ) : (
        <POSBlockRow>
          <Text variant="headingSmall" color="TextWarning">
            No available rewards.
          </Text>
        </POSBlockRow>
      )}
    </POSBlock>
  );
};

// Render the LoyaltyPointsBlock component at the appropriate target
export default reactExtension("pos.customer-details.block.render", () => (
  <LoyaltyPointsBlock />
));
