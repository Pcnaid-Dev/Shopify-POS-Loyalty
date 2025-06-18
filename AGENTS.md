---

### AGENTS.md  _(place at `/AGENTS.md`)_

```markdown
# OpenAI Codex Agent Guide – Pcnaid Loyalty & Rewards

This document tells automated agents **where to read, where to write,
and the contracts they must honour**.  
It doubles as a checklist for unfinished work (see *Work‑queue*).

---

## 1. Repository contracts

| Concern | Rules |
|---------|-------|
| **Type‑safety** | All runtime code is TypeScript 4.9+. No `any` in new PRs. |
| **Data layer** | Only touch DB through the generated Prisma client. Migrations go in `prisma/migrations/*` and must update `schema.prisma`. |
| **Auth** | Admin UI routes → `authenticate.admin`.  Public API for POS → **MUST** validate `sessionToken` using `/admin/oauth/access_scopes.json` once implemented. |
| **Testing** | Every new feature needs at least one Playwright or Vitest test. |
| **Formatting** | `pnpm format` (Prettier) must leave repo clean. |
| **Commits** | Conventional Commits (`feat: …`, `fix: …`, etc.). |

---

## 2. Folder roles

| Path | Agent responsibility |
|------|----------------------|
| `app/routes/**` | React/Remix pages & API routes. |
| `app/services/**` | Pure functions – shareable between web and extension. |
| `extensions/loyalty-extension/**` | POS UI logic; use `@shopify/ui-extensions-react`. |
| `prisma/**` | Schema + migrations + seeds. |
| `tests/**` | E2E and integration tests. |

---

## 3. Work‑queue (open tasks)

| ID | Description | Suggested agent flow |
|----|-------------|----------------------|
| **W‑1** | *ORDERS_CREATE webhook* – add points automatically. | 1️⃣ Generate route `webhooks.orders.create.tsx` → 2️⃣ query order total via GraphQL → 3️⃣ upsert `CustomerPoints`. |
| **W‑2** | *Free‑product redemption* in POS. | Extend `applyDiscount.ts`: branch `discountType === "FREE_PRODUCT"` → `api.cart.addLineItem({productId, quantity:1})`. |
| **W‑3** | Harden API auth for POS calls. | Verify POS `sessionToken` with Admin REST `GET /shop.json`. |
| **W‑4** | Replace mock Playwright tests with real device emulator tests. | Use `shopify-cli pos` emulator once GA. |
| **W‑5** | Analytics widgets. | Add Remix loader → Prisma aggregations → feed Polaris `<LineChart />`. |

Agents should mark a task **DONE** in this table when a PR is merged.

---

## 4. Code generation hints

* When you need a new migration, run  
  `pnpx prisma migrate dev --name <slug>` and commit the generated folder.
* For new UI Extension targets, also update
  `extensions/loyalty-extension/shopify.extension.toml`.
* Use `@shopify/cli extensions register` to create a new extension skeleton.

---

## 5. Smoke‑test script

Agents can quickly verify end‑to‑end flow with:

```bash
# Seed demo data
curl -X POST -d "action=seed_test_data" http://localhost:3000/test

# POS simulation (assumes emulator)
pnpm ts-node scripts/simulate-pos.ts  # future task

# 6. Lint & build checkpoints

# full CI locally
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build

All four commands must exit 0 before pushing.

