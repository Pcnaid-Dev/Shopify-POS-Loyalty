# Shopify POS Loyalty Implementation Todo

## Database Models
- [x] Add CustomerPoints model to schema.prisma
- [x] Add RewardRule model to schema.prisma
- [x] Run prisma migrate to update database schema

## Backend API Implementation
- [x] Update points.$customerId.tsx loader to use CustomerPoints model
- [x] Implement logic to fetch eligible rewards based on points balance
- [x] Update points.$customerId.deduct.tsx to handle point deduction properly

## POS Extension UI
- [x] Update LoyaltyPointsBlock.tsx to fetch and display points from backend
- [x] Update LoyaltyPointsBlock.tsx to display eligible rewards
- [x] Update applyDiscount.ts to properly apply discounts based on reward type

## Admin Configuration UI
- [x] Implement programs.tsx for loyalty program settings
- [x] Implement rewards.tsx for reward rule management

## Testing
- [x] Test points fetching functionality
- [x] Test reward eligibility logic
- [x] Test discount application
- [x] Test point deduction

## Deployment
- [ ] Commit and push changes
- [ ] Document implementation details and decisions
