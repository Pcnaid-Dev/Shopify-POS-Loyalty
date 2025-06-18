# AGENTS.md (for OpenAI Codex)

This document outlines the architecture of the Shopify Loyalty & Rewards App in terms of its software agents and components.

## System Overview

The application is composed of several interconnected agents responsible for managing loyalty data, processing rules, and rendering user interfaces for both merchants and customers. The system is designed to interact with Shopify's APIs (Admin, Storefront, and POS) to provide a seamless experience.

---

## Implemented Agents & Components

### 1. `AdminUIAgent`
* **Purpose:** Provides the primary interface for merchants within the Shopify Admin.
* **Functionality:**
    * Renders the configuration pages using React and Shopify Polaris.
    * Allows merchants to set the point-to-dollar earning ratio.
    * Handles the creation and editing of basic reward types (fixed amount, percentage).
    * Displays a list of customers and their associated point balances by fetching data from the `CustomerDataAgent`.

### 2. `PointsAgent`
* **Purpose:** Manages the logic for earning and spending points.
* **Functionality:**
    * Listens for Shopify's `orders/create` webhook to be notified of new purchases.
    * Parses order data to calculate the number of points earned based on the rules set by the `AdminUIAgent`.
    * Communicates with the `CustomerDataAgent` to update a customer's point total.

### 3. `StorefrontWidgetAgent`
* **Purpose:** Manages the customer-facing loyalty interface on the online store.
* **Functionality:**
    * Injects a floating widget into the Shopify theme.
    * Uses the Storefront API to identify the logged-in customer.
    * Fetches and displays the customer's point balance from the `CustomerDataAgent`.
    * When a customer chooses to redeem points, it requests a corresponding discount code from the `RedemptionAgent` and displays it to the user.

### 4. `CustomerDataAgent`
* **Purpose:** Acts as the single source of truth for all customer loyalty data.
* **Functionality:**
    * Maintains a database linking Shopify Customer IDs to point balances.
    * Provides API endpoints for creating, reading, updating, and deleting customer point records.
    * Responds to data requests from the `AdminUIAgent`, `PointsAgent`, `StorefrontWidgetAgent`, and the future `PointOfSaleExtensionAgent`.

---

## Future Agents & Components (To Be Implemented)

### 1. `PointOfSaleExtensionAgent` (High Priority)
* **Purpose:** To integrate the loyalty program directly into the Shopify POS UI for in-person sales.
* **Architecture:** This will be a Shopify POS UI Extension built with the official extension framework.
* **Core Logic:**
    1.  **`CustomerLookup` Module:** When a merchant adds a customer to a sale in the POS, this module will activate. It will use the customer's **name, email, or phone number** to query the `CustomerDataAgent` for their loyalty information.
    2.  **`RewardsDisplay` Module:** On successful lookup, this module will fetch the customer's point balance and the list of available redemption rules from the backend. It will then render a component in the POS UI that displays the customer's points and a list of rewards they can "cash out" (e.g., "$10 Off," "20% Off Order").
    3.  **`CartIntegration` Module:** When a merchant clicks a reward from the displayed list, this module will be triggered. It will make a call to the Shopify POS App SDK's `Cart` API to apply the corresponding discount to the cart. The discount will immediately be reflected in the subtotal, ready for payment. The module will also send a request to the `PointsAgent` to deduct the spent points from the customer's balance.

### 2. `EmailNotificationAgent`
* **Purpose:** To handle all customer-facing email communication.
* **Functionality:**
    * Will integrate with a third-party email service (e.g., SendGrid).
    * Will be triggered by the `PointsAgent` to send an email when a customer's points balance is updated.
    * Will allow merchants to customize email templates.

