# Stripe Payment Integration Setup Guide

## Prerequisites
- Stripe account (sign up at https://stripe.com)
- Stripe API keys (available in your Stripe Dashboard)

## Step 1: Create Stripe Products & Prices

1. **Login to Stripe Dashboard** → https://dashboard.stripe.com
2. **Navigate to Products** → Click "Products" in the left menu
3. **Create Products** for each subscription tier:

### Regular Tier ($9.99/month)
- Click "+ Add Product"
- **Name:** CVPro Regular
- **Description:** Unlimited basic features with GPT-4o-mini
- **Pricing:** 
  - Price: $9.99
  - Billing period: Monthly
  - Click "Save product"
- **Copy the Price ID** (starts with `price_`) → Example: `price_1ABC2DEF3GHI4JKL`

### Plus Tier ($19.99/month)
- Create product: "CVPro Plus"
- Description: "Advanced features with GPT-4o"
- Price: $19.99/month
- Copy the Price ID

### Annual Tier ($99/year)
- Create product: "CVPro Annual"  
- Description: "All Plus features, 58% savings"
- Price: $99.00
- Billing period: Yearly
- Copy the Price ID

## Step 2: Configure Environment Variables

Add these to your Replit Secrets (or `.env` file):

```bash
# Existing Stripe keys
STRIPE_SECRET_KEY=sk_test_... # Already configured
VITE_STRIPE_PUBLIC_KEY=pk_test_... # Already configured

# NEW: Add Price IDs from Step 1
STRIPE_PRICE_REGULAR_MONTHLY=price_1ABC2DEF3GHI4JKL
STRIPE_PRICE_PLUS_MONTHLY=price_2ABC2DEF3GHI4JKL
STRIPE_PRICE_ANNUAL=price_3ABC2DEF3GHI4JKL
```

## Step 3: Set Up Webhook

1. In Stripe Dashboard → **Developers** → **Webhooks**
2. Click "+ Add endpoint"
3. **Endpoint URL:** `https://your-replit-url.repl.co/api/stripe/webhook`
4. **Events to listen:** 
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. **Copy the Signing Secret** (starts with `whsec_`)
6. Add to secrets: `STRIPE_WEBHOOK_SECRET=whsec_...`

## Step 4: Test Payment Flow

1. Use Stripe test cards: https://stripe.com/docs/testing
   - Success: `4242 4242 4242 4242`
   - Requires authentication: `4000 0025 0000 3155`
2. Any future expiry date (e.g., 12/34)
3. Any 3-digit CVC (e.g., 123)
4. Any ZIP code

## Step 5: Go Live

1. Switch from Test mode to Live mode in Stripe Dashboard
2. Create live products (same as Step 1)
3. Update secrets with **live** keys:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `VITE_STRIPE_PUBLIC_KEY=pk_live_...`
   - Live price IDs

## Current Status

⚠️ **Action Required:** Your Stripe products/prices are not yet created.

Until you complete Steps 1-2, users will see this error when trying to subscribe:
```
"Failed to create checkout session"
Error: No such price: 'price_professional_monthly'
```

## Quick Start (5 minutes)

1. Go to: https://dashboard.stripe.com/products
2. Create 3 products with monthly/yearly pricing
3. Copy the 3 price IDs
4. Add them to Replit Secrets
5. Restart your application

Done! Payments will work.
