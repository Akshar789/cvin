# Vercel Deployment Guide

## Prerequisites
1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed: `npm i -g vercel`
3. All environment variables ready

## Step 1: Prepare Environment Variables
Copy `.env.example` to `.env.local` and fill in all values:
- DATABASE_URL (use Neon, Supabase, or Vercel Postgres)
- NEXTAUTH_URL (will be your Vercel domain)
- NEXTAUTH_SECRET (generate with: `openssl rand -base64 32`)
- JWT_SECRET (generate with: `openssl rand -base64 32`)
- OAuth credentials (Google, Facebook)
- OPENAI_API_KEY
- Stripe keys and price IDs

## Step 2: Database Setup
Your app uses Neon PostgreSQL. Make sure:
1. Your Neon database is created
2. Run migrations: `npm run db:push` (if you have this script)
3. DATABASE_URL is properly configured

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)
1. Go to https://vercel.com/new
2. Import your Git repository (GitHub, GitLab, or Bitbucket)
3. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next
4. Add all environment variables from `.env.example`
5. Click "Deploy"

### Option B: Deploy via CLI
```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## Step 4: Configure Environment Variables in Vercel
In your Vercel project dashboard:
1. Go to Settings → Environment Variables
2. Add all variables from `.env.example`
3. Important: Set NEXTAUTH_URL to your production domain (e.g., https://your-app.vercel.app)

## Step 5: Update OAuth Redirect URIs
Update your OAuth app settings:
- Google: Add `https://your-app.vercel.app/api/auth/callback/google`
- Facebook: Add `https://your-app.vercel.app/api/auth/callback/facebook`

## Step 6: Configure Stripe Webhook
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy webhook secret to STRIPE_WEBHOOK_SECRET

## Important Notes

### Puppeteer/Chromium
The app uses `@sparticuz/chromium` which is optimized for serverless environments like Vercel. No additional configuration needed.

### File Size Limits
- Vercel has a 50MB deployment size limit
- API routes have a 4.5MB response limit
- Functions timeout at 60 seconds (configured in vercel.json)

### Database Connection Pooling
Using `@neondatabase/serverless` with WebSocket connections is perfect for Vercel's serverless functions.

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `dependencies` (not `devDependencies`)
- Verify TypeScript has no errors: `npm run build` locally

### API Routes Timeout
- Increase function timeout in vercel.json (max 60s on Pro plan)
- Optimize database queries
- Consider using Vercel Edge Functions for faster responses

### Environment Variables Not Working
- Redeploy after adding/changing environment variables
- Check variable names match exactly (case-sensitive)
- Ensure no trailing spaces in values

## Post-Deployment Checklist
- [ ] Test user registration/login
- [ ] Test OAuth providers (Google, Facebook)
- [ ] Test CV creation and PDF export
- [ ] Test Stripe checkout flow
- [ ] Test AI features (OpenAI integration)
- [ ] Check all API routes respond correctly
- [ ] Monitor error logs in Vercel dashboard

## Useful Commands
```bash
# View deployment logs
vercel logs

# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback

# Pull environment variables locally
vercel env pull
```

## Support
- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
