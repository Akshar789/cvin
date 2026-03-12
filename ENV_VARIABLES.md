# Environment Variables Guide

This document lists all environment variables required for the M.AASIRI Next.js application.

## How to Extract from Replit

1. **In your Replit shell, run:**
   ```bash
   bash extract-env.sh > .env.local
   ```

2. **Or manually extract each variable:**
   ```bash
   env | grep -E "(DATABASE_URL|JWT_SECRET|NEXTAUTH|OPENAI|STRIPE|GOOGLE|FACEBOOK|PG)" > env-vars.txt
   ```

3. **Copy the values and create `.env.local` file in your project root**

## Required Environment Variables

### Database Configuration
- **`DATABASE_URL`** (Required) - PostgreSQL connection string
  - Format: `postgresql://user:password@host:port/database?sslmode=require`
  - OR use individual variables: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`

### Authentication & Security
- **`JWT_SECRET`** (Required) - Secret key for JWT token signing
  - Generate with: `openssl rand -base64 32`
- **`NEXTAUTH_SECRET`** (Required) - Secret for NextAuth.js
  - Generate with: `openssl rand -base64 32`
- **`NEXTAUTH_URL`** (Required for production) - Base URL of your application
  - Local: `http://localhost:3000`
  - Production: `https://your-domain.com`
- **`SESSION_SECRET`** (Optional) - Additional session secret if used

### AI Configuration
- **`OPENAI_API_KEY`** (Required) - OpenAI API key for AI features
  - Get from: https://platform.openai.com/api-keys

### Stripe Configuration
- **`STRIPE_SECRET_KEY`** (Required) - Stripe secret key
  - Format: `sk_test_...` or `sk_live_...`
- **`STRIPE_WEBHOOK_SECRET`** (Required) - Stripe webhook signing secret
  - Format: `whsec_...`
  - Get from: Stripe Dashboard → Developers → Webhooks
- **`NEXT_PUBLIC_STRIPE_PUBLIC_KEY`** (Required for frontend) - Stripe publishable key
  - Format: `pk_test_...` or `pk_live_...`
  - Note: In Replit this might be `VITE_STRIPE_PUBLIC_KEY`, rename to `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`

### Stripe Price IDs (Optional but Recommended)
- **`STRIPE_PRICE_REGULAR_MONTHLY`** - Price ID for Regular tier ($9.99/month)
- **`STRIPE_PRICE_PLUS_MONTHLY`** - Price ID for Plus tier ($19.99/month)
- **`STRIPE_PRICE_ANNUAL`** - Price ID for Annual tier ($99/year)
- Get from: Stripe Dashboard → Products → Copy Price ID

### OAuth Configuration (Optional)
- **`GOOGLE_CLIENT_ID`** - Google OAuth client ID
- **`GOOGLE_CLIENT_SECRET`** - Google OAuth client secret
- **`FACEBOOK_CLIENT_ID`** - Facebook App ID
- **`FACEBOOK_CLIENT_SECRET`** - Facebook App Secret

## Quick Setup Commands for Replit

Run these commands in your Replit shell to extract all variables:

```bash
# Extract all environment variables
env | grep -E "(DATABASE_URL|JWT_SECRET|NEXTAUTH|OPENAI|STRIPE|GOOGLE|FACEBOOK|PG|SESSION)" | sort

# Or use the extraction script
bash extract-env.sh
```

## Creating .env.local File

1. Copy the output from the extraction script
2. Create `.env.local` in your project root:
   ```bash
   touch .env.local
   ```
3. Paste the environment variables
4. Fill in any missing values marked with `#`

## Verification

After setting up your `.env.local` file, verify the server starts correctly:

```bash
npm run dev
```

The server should start without errors. If you see errors about missing environment variables, check the error message and ensure all required variables are set.

## Security Notes

- **Never commit `.env.local` to git** (it's already in `.gitignore`)
- **Never share your secrets publicly**
- **Use different keys for development and production**
- **Rotate secrets if they're ever exposed**


