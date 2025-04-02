import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit, Link } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  IndexTable,
  Text,
  Button,
  EmptyState,
  Badge,
  ButtonGroup,
  Modal,
  FormLayout,
  TextField,
  Select,
  Banner,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { db } from "../db.server";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  // Fetch all reward rules
  const rewardRules = await db.rewardRule.findMany({
    orderBy: { pointsRequired: 'asc' }
  });
  
  return json({ rewardRules });
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  const formData = await request.formData();
  const action = formData.get("action") as string;
  
  try {
    // Handle different actions
    if (action === "create" || action === "update") {
      const name = formData.get("name") as string;
      const pointsRequired = parseInt(formData.get("pointsRequired") as string);
      const discountType = formData.get("discountType") as string;
      const discountValue = parseFloat(formData.get("discountValue") as string);
      const isActive = formData.get("isActive") === "true";
      const productId = formData.get("productId") as string || null;
      
      // Validate inputs
      if (!name || name.trim() === "") {
        return json({ error: "Reward name is required" }, { status: 400 });
      }
      
      if (isNaN(pointsRequired) || pointsRequired <= 0) {
        return json({ error: "Points required must be a positive number" }, { status: 400 });
      }
      
      if (!discountType || !["PERCENTAGE", "FIXED_AMOUNT", "FREE_PRODUCT"].includes(discountType)) {
        return json({ error: "Invalid discount type" }, { status: 400 });
      }
      
      if (isNaN(discountValue) || discountValue <= 0) {
        return json({ error: "Discount value must be a positive number" }, { status: 400 });
      }
      
      if (discountType === "PERCENTAGE" && discountValue > 100) {
        return json({ error: "Percentage discount cannot exceed 100%" }, { status: 400 });
      }
      
      if (discountType === "FREE_PRODUCT" && !productId) {
        return json({ error: "Product ID is required for free product rewards" }, { status: 400 });
      }
      
      if (action === "create") {
        // Create new reward rule
        await db.rewardRule.create({
          data: {
            name,
            pointsRequired,
            discountType: discountType as any,
            discountValue,
            isActive,
            productId
          }
        });
        
        return json({ success: "Reward created successfully" });
      } else {
        // Update existing reward rule
        const id = parseInt(formData.get("id") as string);
        
        await db.rewardRule.update({
          where: { id },
          data: {
            name,
            pointsRequired,
            discountType: discountType as any,
            discountValue,
            isActive,
            productId
          }
        });
        
        return json({ success: "Reward updated successfully" });
      }
    } else if (action === "delete") {
      const id = parseInt(formData.get("id") as string);
      
      await db.rewardRule.delete({
        where: { id }
      });
      
      return json({ success: "Reward deleted successfully" });
    } else if (action === "toggle") {
      const id = parseInt(formData.get("id") as string);
      const isActive = formData.get("isActive") === "true";
      
      await db.rewardRule.update({
        where: { id },
        data: { isActive: !isActive }
      });
      
      return json({ success: `Reward ${isActive ? 'deactivated' : 'activated'} successfully` });
    }
    
    return json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error managing rewards:", error);
    return json({ error: "Failed to process reward action" }, { status: 500 });
  }
};

export default function RewardManagement() {
  const { rewardRules, success, error } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReward, setCurrentReward] = useState<any>(null);
  const [formState, setFormState] = useState({
    name: "",
    pointsRequired: "",
    discountType: "FIXED_AMOUNT",
    discountValue: "",
    isActive: true,
    productId: ""
  });
  
  const handleOpenModal = (reward: any = null) => {
    if (reward) {
      setCurrentReward(reward);
      setFormState({
        name: reward.name,
        pointsRequired: String(reward.pointsRequired),
        discountType: reward.discountType,
        discountValue: String(reward.discountValue),
        isActive: reward.isActive,
        productId: reward.productId || ""
      });
    } else {
      setCurrentReward(null);
      setFormState({
        name: "",
        pointsRequired: "",
        discountType: "FIXED_AMOUNT",
        discountValue: "",
        isActive: true,
        productId: ""
      });
    }
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmitForm = () => {
    const formData = new FormData();
    
    if (currentReward) {
      formData.append("action", "update");
      formData.append("id", String(currentReward.id));
    } else {
      formData.append("action", "create");
    }
    
    formData.append("name", formState.name);
    formData.append("pointsRequired", formState.pointsRequired);
    formData.append("discountType", formState.discountType);
    formData.append("discountValue", formState.discountValue);
    formData.append("isActive", String(formState.isActive));
    formData.append("productId", formState.productId);
    
    submit(formData, { method: "post" });
    handleCloseModal();
  };
  
  const handleDeleteReward = (id: number) => {
    if (confirm("Are you sure you want to delete this reward?")) {
      const formData = new FormData();
      formData.append("action", "delete");
      formData.append("id", String(id));
      submit(formData, { method: "post" });
    }
  };
  
  const handleToggleActive = (id: number, isActive: boolean) => {
    const formData = new FormData();
    formData.append("action", "toggle");
    formData.append("id", String(id));
    formData.append("isActive", String(isActive));
    submit(formData, { method: "post" });
  };
  
  const discountTypeOptions = [
    { label: "Fixed Amount ($)", value: "FIXED_AMOUNT" },
    { label: "Percentage (%)", value: "PERCENTAGE" },
    { label: "Free Product", value: "FREE_PRODUCT" }
  ];
  
  const formatDiscountValue = (type: string, value: number) => {
    if (type === "PERCENTAGE") {
      return `${value}%`;
    } else if (type === "FIXED_AMOUNT") {
      return `$${value.toFixed(2)}`;
    } else {
      return "Free Product";
    }
  };
  
  return (
    <Page
      title="Reward Management"
      primaryAction={{
        content: "Create Reward",
        onAction: () => handleOpenModal()
      }}
    >
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
          
          {rewardRules.length === 0 ? (
            <Card>
              <EmptyState
                heading="No rewards created yet"
                action={{
                  content: "Create Reward",
                  onAction: () => handleOpenModal()
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Create rewards for your customers to redeem with their loyalty points.</p>
              </EmptyState>
            </Card>
          ) : (
            <Card>
              <IndexTable
                itemCount={rewardRules.length}
                headings={[
                  { title: "Reward Name" },
                  { title: "Points Required" },
                  { title: "Discount" },
                  { title: "Status" },
                  { title: "Actions" }
                ]}
                selectable={false}
              >
                {rewardRules.map((reward, index) => (
                  <IndexTable.Row id={String(reward.id)} key={reward.id} position={index}>
                    <IndexTable.Cell>
                      <Text variant="bodyMd" fontWeight="bold">
                        {reward.name}
                      </Text>
                    </IndexTable.Cell>
                    <IndexTable.Cell>{reward.pointsRequired}</IndexTable.Cell>
                    <IndexTable.Cell>
                      {formatDiscountValue(reward.discountType, reward.discountValue)}
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <Badge status={reward.isActive ? "success" : "critical"}>
                        {reward.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <ButtonGroup>
                        <Button onClick={() => handleOpenModal(reward)}>Edit</Button>
                        <Button 
                          onClick={() => handleToggleActive(reward.id, reward.isActive)}
                        >
                          {reward.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button 
                          destructive 
                          onClick={() => handleDeleteReward(reward.id)}
                        >
                          Delete
                        </Button>
                      </ButtonGroup>
                    </IndexTable.Cell>
                  </IndexTable.Row>
                ))}
              </IndexTable>
            </Card>
          )}
        </Layout.Section>
      </Layout>
      
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={currentReward ? "Edit Reward" : "Create Reward"}
        primaryAction={{
          content: currentReward ? "Save Changes" : "Create Reward",
          onAction: handleSubmitForm
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: handleCloseModal
          }
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Reward Name"
              value={formState.name}
              onChange={(value) => handleInputChange("name", value)}
              autoComplete="off"
              required
            />
            
            <TextField
              label="Points Required"
              type="number"
              value={formState.pointsRequired}
              onChange={(value) => handleInputChange("pointsRequired", value)}
              autoComplete="off"
              min="1"
              required
            />
            
            <Select
              label="Discount Type"
              options={discountTypeOptions}
              value={formState.discountType}
              onChange={(value) => handleInputChange("discountType", value)}
              required
            />
            
            <TextField
              label={formState.discountType === "PERCENTAGE" ? "Discount Percentage" : "Discount Amount"}
              type="number"
              value={formState.discountValue}
              onChange={(value) => handleInputChange("discountValue", value)}
              autoComplete="off"
              min="0.01"
              step="0.01"
              suffix={formState.discountType === "PERCENTAGE" ? "%" : "$"}
              required
            />
            
            {formState.discountType === "FREE_PRODUCT" && (
              <TextField
                label="Product ID"
                value={formState.productId}
                onChange={(value) => handleInputChange("productId", value)}
                autoComplete="off"
                helpText="Enter the Shopify Product ID for the free product"
                required
              />
            )}
            
            <Select
              label="Status"
              options={[
                { label: "Active", value: "true" },
                { label: "Inactive", value: "false" }
              ]}
              value={String(formState.isActive)}
              onChange={(value) => handleInputChange("isActive", value === "true")}
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
