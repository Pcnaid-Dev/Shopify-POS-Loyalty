# Shopify Loyalty & Rewards App

A comprehensive loyalty and rewards solution for Shopify merchants, designed to boost customer retention and engagement. This application allows merchants to create a customizable points-based rewards program that seamlessly integrates with their Shopify store and POS system.

## Key Features
- **Points for Purchases:** Automatically reward customers with points for every dollar they spend.
- **Customizable Rewards:** Create a variety of rewards, such as percentage discounts, fixed amount discounts, and free shipping.
- **Customer Account Integration:** A floating widget on the storefront allows customers to view their point balance and redeem rewards.
- **Merchant Admin UI:** An easy-to-use interface within the Shopify Admin for configuring the loyalty program, managing rewards, and viewing customer data.
- **Shopify POS Extension:** Enables merchants to manage customer loyalty directly from the Point of Sale interface.

---

## Project Status

### Implemented Features

* **Merchant Admin Panel:**
    * Configuration of basic point-earning rules (e.g., points per dollar spent).
    * Creation and management of rewards (fixed amount, percentage discount).
    * A dashboard to view enrolled customers and their point balances.
* **Storefront UI Widget:**
    * Displays the customer's current point balance when logged in.
    * Allows customers to see available rewards.
    * Generates discount codes for redeemed rewards that can be applied at checkout.
* **Core Points Logic:**
    * An API endpoint that receives Shopify order creation webhooks.
    * A system to calculate and add points to a customer's account after a purchase is completed.

### Roadmap (Yet to be Implemented)

* **Advanced Rewards:**
    * Free shipping rewards.
    * Free product rewards.
    * Tiered loyalty levels (e.g., Bronze, Silver, Gold) with different earning rates.
* **Email Notifications:**
    * Automated emails to notify customers of point balance changes and earned rewards.
* **Shopify POS Extension (High Priority):**
    * **Customer Lookup:** Merchants will be able to search for a customer in the POS system using their **name, email, or phone number**.
    * **Points & Rewards Display:** Once a customer is associated with the sale, the POS UI will display their current point balance and a list of available rewards they are eligible for. These reward options are based on rules set by the merchant in the Admin UI.
    * **One-Click Redemption:** The merchant can select one of the available rewards directly within the POS interface.
    * **Automatic Cart Updates:** Upon selection, the reward will be automatically applied to the cart as a discount or line item, reflecting the change in the total price before payment.
* **Advanced Analytics:**
    * A comprehensive analytics dashboard for merchants to track the ROI of the loyalty program, view redemption rates, and identify top customers.

---

## Tech Stack
* **Backend:** Node.js with Express.js (or Ruby on Rails)
* **Frontend:** React.js, Polaris
* **Database:** PostgreSQL
* **Shopify Integration:** Shopify App CLI, Shopify API (Admin, Storefront, and POS Extension APIs)

---

## Getting Started

### Prerequisites
- Node.js and npm
- A Shopify Partner account and development store
- Shopify CLI

### Installation
1.  Clone the repository: `git clone [URL]`
2.  Install dependencies: `npm install`
3.  Set up your `.env` file with Shopify API keys.
4.  Run the application: `npm run dev`
5.  Deploy the app to a hosting service (e.g., Heroku, Fly.io) and install it on your development store.
