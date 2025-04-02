Goal: Display customer points and available rewards in the POS Customer Details block, and allow merchants to apply selected rewards to the cart.

Current State:

Project structure based on Shopify Remix template is in place.
POS UI Extension (loyalty-extension) targeting pos.customer-details.block.render exists.
Basic database setup with Prisma (Session, RedeemedPoints) is present.
Backend routes and Admin UI pages are mostly placeholders.
POS Extension UI (LoyaltyPointsBlock.tsx) and discount logic (applyDiscount.ts) exist but need implementation.


Step-by-Step Implementation Plan - Part 1:

Define Database Models (pcnaid-loyalty-and-rewards/prisma/schema.prisma):

Action: Add models to store essential loyalty data:
CustomerPoints: To track points for each Shopify Customer. Include fields like customerId (String, unique), pointsBalance (Int), createdAt, updatedAt.
RewardRule: To define available rewards. Include fields like name (String), pointsRequired (Int), discountType (Enum: e.g., PERCENTAGE, FIXED_AMOUNT, FREE_PRODUCT), discountValue (Float or Int depending on type), potentially productId (String, if it's a free product reward), isActive (Boolean).
Action: Run npx prisma migrate dev --name add_loyalty_models (or similar) after defining the models to update your database schema.
Implement Backend API Endpoint for Points/Rewards:

File: pcnaid-loyalty-and-rewards/app/routes/points.$customerId.tsx (or create a new dedicated API route like app/routes/api.pos.customer-data.$customerId.tsx).
Action: Implement the loader function in this route.
Use authenticate.admin(request) or authenticate.public(request) (depending on how you handle POS calls - often session token based). Initially, you might need a less strict method for POS calls, potentially using an API key or validating a token passed from the extension. Research Shopify's recommended way to authenticate backend calls from a POS UI Extension.
Extract the customerId from the route parameters.
Use Prisma (db.customerPoints.findUnique, db.rewardRule.findMany) to query the database for the customer's pointsBalance and all active RewardRules.
Filter the reward rules to find those the customer is eligible for based on their pointsBalance.
Return the pointsBalance and the list of eligibleRewards as JSON.
Implement POS Extension UI - Fetch & Display (pcnaid-loyalty-and-rewards/extensions/loyalty-extension/src/LoyaltyPointsBlock.tsx):

Action: Use hooks from @shopify/ui-extensions-react/pos:
useApi('pos'): Get POS-specific context.
useCustomer(): Get the currently selected customer in POS. Returns null if no customer is selected.
useState (from React): To store fetched points and rewards.
useEffect (from React): To trigger data fetching when the customer changes.
Action: Inside useEffect, check if customer from useCustomer() is available. If yes:
Construct the URL for your backend endpoint (Step 2), including the customer.id.
Use fetch to call your backend endpoint. You might need to handle authentication headers here if required by your backend setup.
Parse the JSON response and update the component's state with the points and eligible rewards.
Action: Render the UI using components from @shopify/ui-extensions-react/pos:
Use BlockStack, Text, Heading to display the customer's points balance.
Map over the eligibleRewards state variable. For each reward, render a Button component displaying the reward name/details (e.g., "10% Off", "$5 Discount"). Set the onPress prop for the next step. Handle the case where there are no points or no eligible rewards.
Implement POS Extension Logic - Apply Discount (pcnaid-loyalty-and-rewards/extensions/loyalty-extension/src/applyDiscount.ts):

Action: Create a function (e.g., applyRewardToCart) that accepts the details of the selected reward (type, value).
Action: Inside this function, use the useCartActions() hook from @shopify/ui-extensions-react/pos.
Action: Based on the reward.discountType, call the appropriate function from useCartActions():
PERCENTAGE: cartActions.applyCustomDiscount({ type: 'percentage', value: reward.discountValue, title: reward.name })
FIXED_AMOUNT: cartActions.applyCustomDiscount({ type: 'fixedAmount', amount: reward.discountValue, title: reward.name })
(Future: FREE_PRODUCT would involve cartActions.applyCartLinesChange to add the product and potentially another custom discount to make it free).
Action: Return a status or handle errors from the cart actions.
Connect UI to Logic (pcnaid-loyalty-and-rewards/extensions/loyalty-extension/src/LoyaltyPointsBlock.tsx):

Action: In the onPress handler for each reward Button created in Step 3:
Call the applyRewardToCart function (from Step 4), passing the specific reward details.
Optionally, show feedback to the merchant (e.g., using useToast() from the POS UI extensions API) indicating success or failure.
Trigger the logic to deduct points (Step 6).
Implement Backend Logic for Point Deduction:

File: pcnaid-loyalty-and-rewards/app/routes/points.$customerId.deduct.tsx (this route already seems to exist, use its action function) or create a new route/action.
Action: Implement the action function.
Authenticate the request.
Parse the request body to get customerId and pointsToDeduct (or the rewardId used).
Use Prisma (db.customerPoints.update) to decrease the customer's pointsBalance. Important: Handle potential race conditions or ensure atomicity if needed (e.g., using Prisma transactions).
Use Prisma (db.redeemedPoints.create) to log the redemption event (customer ID, points redeemed, timestamp, potentially order/cart ID if available).
Return a success or error response as JSON.
Action: Modify the onPress handler in LoyaltyPointsBlock.tsx (Step 5) to call fetch on this backend action after the cart discount is successfully applied (Step 4).
Implement Admin Configuration UI (Optional but Recommended):

Files: pcnaid-loyalty-and-rewards/app/routes/programs.tsx, pcnaid-loyalty-and-rewards/app/routes/rewards.tsx, etc.
Action: Build out these pages using @shopify/polaris components.
Create forms for merchants to:
Define how points are earned (e.g., points per dollar spent - this might require webhook handling like orders/paid).
Create and manage RewardRules (connecting to backend action functions that use Prisma to create/update/delete rules).
Testing:

Action: Deploy the app and extension to a development store (npm run deploy).
Action: Enable the POS channel in your development store and add the POS UI Extension to the appropriate surface (Customer Details).
Action: Use the Shopify POS app (desktop or mobile) logged into your development store. Add items, select a customer (ensure they have points in your DB), check if the extension loads, displays points/rewards, and test applying rewards to the cart. Verify points are deducted correctly.
This step-by-step process addresses the core requirements by building out the database, backend APIs, POS extension UI/logic, and the crucial connection between them using Shopify's POS UI Extension tools.

Step-by-Step Implementation Plan - Part 2:

Goal: Enhance the Shopify POS Loyalty App to include points earning, robust configuration, better error handling, and improved usability.

Building On: The previous guide focused on setting up models, backend APIs for fetching/deducting points, and the core POS UI for displaying/redeeming points. Assume those steps (or their equivalents) are being worked on or completed.

Enhanced Step-by-Step Implementation Plan:

Implement Points Earning via Webhooks:

Goal: Automatically award points when a customer pays for an order.
File to Create: pcnaid-loyalty-and-rewards/app/routes/webhooks.orders.paid.tsx
Action:
Verify shopify.app.toml subscribes to the orders/paid topic (your snippet confirms it does) and ensure the webhook URI points to a general handler like /webhooks (the Remix template often routes webhooks.<topic> based on filenames).
In the new file (webhooks.orders.paid.tsx), implement the action function.
Use import { authenticate } from "../shopify.server"; and call await authenticate.webhook(request); to verify the incoming request is a valid webhook from Shopify. Handle potential errors during authentication.
Extract the order data (especially customer.id and total_price) from the validated webhook payload. Check if a customer ID exists.
Configuration Needed: Fetch the points earning rule (e.g., points per dollar) you'll define in Step 2. For now, you could hardcode a rule (e.g., 1 point per dollar spent).
Calculate points earned based on the rule and total_price.
Use Prisma (db.customerPoints.upsert) to find the customer's points record by customerId or create it if it doesn't exist, and update (increment) their pointsBalance. Handle potential database errors gracefully within a try...catch.
Log successful processing or any errors encountered.
Return a 200 OK response to Shopify using json({ success: true }).
Implement Detailed Admin UI for Configuration:

Goal: Allow merchants to configure how points are earned and define the rewards available.
(A) Program Settings Page:
File: pcnaid-loyalty-and-rewards/app/routes/app.programs.tsx (or create a dedicated app.settings.tsx).
Model: Define a ProgramSetting model in prisma/schema.prisma (e.g., fields: shopId String @id, pointsPerDollar Float, createdAt DateTime @default(now()), updatedAt DateTime @updatedAt). Run prisma migrate dev.
Loader: In programs.tsx, implement a loader function. Use authenticate.admin(request), then fetch the current settings (db.programSetting.findUnique({ where: { shopId } })). Return the settings data.
UI: Use Polaris components (Page, Card, Form, TextField, Button). Create a form to display and edit settings like "Points awarded per dollar spent".
Action: Implement an action function. Authenticate, validate the form input, and use Prisma (db.programSetting.upsert) to save the updated settings. Handle success/error feedback using actionData.
(B) Reward Rules Management Page:
File: pcnaid-loyalty-and-rewards/app/routes/app.rewards.tsx.
Loader: Authenticate, fetch all existing RewardRule records (db.rewardRule.findMany()). Return the list.
UI: Use Polaris Page, Card, Button ("Create Reward"), and IndexTable (or DataTable) to display the fetched reward rules (Name, Points Required, Discount, Actions like Edit/Delete). Use EmptyState if no rules exist.
(C) Create/Edit Reward Page/Modal:
File(s): Create new routes like app.rewards.new.tsx and app.rewards.$rewardId.edit.tsx, or implement using a Polaris Modal triggered from the app.rewards.tsx page.
Loader (for Edit): Authenticate, fetch the specific RewardRule by ID from the route param.
UI: Create a Form with fields for name, pointsRequired, discountType (Select component), discountValue (TextField or NumberField). Populate with loader data if editing.
Action: Implement an action function. Authenticate, validate input, use Prisma (db.rewardRule.create or db.rewardRule.update). Redirect back to the rewards list on success. Implement deletion logic if adding delete buttons.
Integrate Robust Error Handling:

Goal: Improve app stability and provide better user feedback on errors.
Action (Apply across multiple files):
Backend (API Endpoints, Webhooks, Actions): Wrap critical logic (database calls, external API calls, complex calculations) in try...catch blocks. Log errors using console.error or a dedicated logging service. Return appropriate HTTP status codes and error messages (e.g., throw json({ error: 'Database unavailable' }, { status: 500 });).
POS Extension (LoyaltyPointsBlock.tsx, applyDiscount.ts): Check response.ok and handle errors from fetch calls to your backend. Use try...catch for asynchronous operations. Use the useToast() hook (from @shopify/ui-extensions-react/pos) to display user-friendly messages for both success ("Reward applied!") and failure ("Couldn't load points. Please try again.", "Failed to apply reward."). Handle loading states clearly (e.g., show a Spinner while fetching).
Admin UI (Loaders, Actions, Components): Utilize Remix's ErrorBoundary for route-level errors. Check actionData and loaderData for errors returned by your backend functions and display them using Polaris components like Banner (for page-level errors) or InlineError (for form field errors). Add client-side validation to forms for quicker feedback.
Address Potential Edge Cases:

Goal: Handle less common scenarios gracefully.
Action (Consider and implement checks where needed):
Webhook (orders/paid): Ensure the logic correctly handles orders with no customer attached, zero/negative total value, or potential duplicate webhook deliveries (e.g., check if points for that order ID have already been awarded, although Shopify aims for at-least-once delivery, idempotency is good practice). Use upsert for CustomerPoints to handle new customers smoothly.
POS Redemption: Consider what happens if the network fails after applying the discount but before confirming point deduction with your backend (potentially add a retry mechanism or a reconciliation process). Handle cases where the customer is deselected in POS after data is loaded. If high concurrency is expected, use database transactions in the point deduction backend endpoint (Step 6 of the previous guide) to prevent race conditions.
Data Integrity: Ensure points cannot go below zero during redemption.
Enhance Security (POS Extension <-> Backend Communication):

Goal: Ensure backend API endpoints called by the POS extension are properly secured.
Action:
Method: Shopify's recommended approach is typically using session tokens. Investigate using the session token provided by the POS UI extensions API (useApi('pos').session.getSessionToken()) if available and documented for backend calls.
Implementation:
(Frontend - LoyaltyPointsBlock.tsx): When using fetch to call your backend API (e.g., /points/$customerId), obtain the token and include it in the Authorization header (e.g., Authorization: Bearer <token>).
(Backend - e.g., points.$customerId.tsx loader): Modify your authentication. Instead of authenticate.admin, you'll likely need a custom setup or leverage a Shopify library function (if available for this context) that can validate this POS-originated session token against the current shop's session. This verifies the request is coming from a legitimate POS session for an installed shop. This is a critical security step and requires consulting current Shopify documentation. If session tokens prove difficult, an API key stored per shop (generated during auth/install) passed via headers is a fallback, but less standard.
Refine UI/UX and Styling:

Goal: Improve the overall user experience and visual presentation.
Action:
POS Extension: Use layout components (BlockStack, InlineStack, Layout from @shopify/ui-extensions-react/pos) for consistent spacing and structure. Ensure clear visual states for loading, success, and errors. Keep the UI clean and focused, as space is limited.
Admin UI: Adhere to Polaris design principles. Use Frame, Navigation, and TopBar for a standard embedded app experience. Employ EmptyState components gracefully. Use helpText on form fields. Ensure responsiveness. Test the UI flow for creating rewards and changing settings to ensure it's intuitive.

