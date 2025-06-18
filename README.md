# Pcnaid Loyalty & Rewards for Shopify

A full‑stack Remix application that lets merchants run a points‑based loyalty
programme across Online Store **and** Shopify POS.

| Key stack elements | Details |
|--------------------|---------|
| Framework          | Remix • TypeScript • Vite |
| Shopify SDKs       | @shopify/shopify‑app‑remix, Polaris, App Bridge |
| Datastore          | Prisma ORM (SQLite in dev) |
| POS extension      | `@shopify/ui-extensions[‑react]` |
| Tests              | Playwright (mock scaffolding) |

---

## 1 . Features – **Implemented**

| Domain | What works today | Location |
|--------|------------------|----------|
| **Points ledger** | Table `CustomerPoints` stores the running balance; automatically initialised the first time you ask for a customer’s balance. | `prisma/schema.prisma`, loader `points.$customerId.tsx`  [oai_citation:0‡Shopify Loyalty App.pdf](file-service://file-7HP44smo4EqcQoCPUQiPUq) |
| **Rewards catalogue** | Admin UI to create / edit / toggle reward rules (fixed amount, % off, or free product). | `app/routes/rewards.tsx`  [oai_citation:1‡Shopify Loyalty App.pdf](file-service://file-7HP44smo4EqcQoCPUQiPUq) |
| **Programme config** | Per‑shop “points per dollar” setting. | `app/routes/programs.tsx` |
| **POS extension** | Shows customer balance **inside** POS once a staff member selects/looks up a customer; lists eligible rewards; one‑tap redemption applies cart discount **and** deducts points server‑side. | `extensions/loyalty-extension/*` |
| **Server APIs** | `GET /points/:customerId` (balance + eligible rewards) and `POST /points/:customerId/deduct` (atomic point deduction). | `points.$customerId*.tsx`, `services/redeemedPoints.server.ts` |
| **Webhooks** | Cleans up sessions on `APP_UNINSTALLED`. | `webhooks.app.uninstalled.tsx` |
| **Scaffolding tests** | Playwright shell tests for POS flows. | `tests/pos-extension.test.ts` |

> **Why the POS extension already satisfies “search by phone/email/name”**  
> Shopify POS surfaces a customer search box (phone, email, etc.). Once the
> staff member picks a customer, that customer’s **ID** is injected into the
> extension via the POS API (`api.customer.id`) and the extension renders the
> loyalty UI. No extra code is required.  [oai_citation:2‡Shopify Loyalty App.pdf](file-service://file-7HP44smo4EqcQoCPUQiPUq)

---

## 2. Roadmap – **Yet to be implemented**

| Priority | Gap | Suggested next step |
|----------|-----|---------------------|
| 🔴 | **Automatic point accrual** after each order via `ORDERS_CREATE` webhook. | Hook → calculate points → upsert ledger. |
| 🔴 | **Free‑product reward** redemption flow. | Use Cart API `addLineItem` for `discountType === FREE_PRODUCT`. |
| 🔴 | **Customer‑facing widget** (Online Store) to show balance in My Account. | Theme App Extension or App Proxy. |
| 🟠 | **Analytics charts** on dashboard (currently hard‑coded sample data). | Query Prisma + ShopifyQL; feed into Polaris Charts. |
| 🟠 | **Unit / integration tests** (current tests are mocks). | Replace stubs with real Playwright + POS emulator. |
| 🟡 | **Session‑token auth** for POS → API calls (authenticate via HMAC instead of admin session). | Accept JWT in `Authorization` header. |
| 🟡 | Multi‑currency support for fixed‑amount discounts. | Read shop currency via REST Admin. |

---

## 3. Project layout