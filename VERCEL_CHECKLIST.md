# Vercel Deployment Checklist

## Before Deployment

### 1. Environment Variables Setup
- [ ] Generate NEXTAUTH_SECRET: `openssl rand -base64 32`
- [ ] Generate JWT_SECRET: `openssl rand -base64 32`
- [ ] Get DATABASE_URL from Neon/Supabase
- [ ] Configure Google OAuth (Client ID & Secret)
- [ ] Configure Facebook OAuth (Client ID & Secret)
- [ ] Get OPENAI_API_KEY
- [ ] Get Stripe keys (Secret Key, Webhook Secret, Price IDs)

### 2. Database
- [ ] Neon database created and accessible
- [ ] Database schema migrated
- [ ] Connection string tested

### 3. Code Preparation
- [ ] All dependencies in package.json
- [ ] Build succeeds locally: `npm run build`
- [ ] No TypeScript errors
- [ ] Environment variables in .env.example documented

## Deployment Steps

### Quick Deploy (Recommended)
1. [ ] Push code to GitHub/GitLab/Bitbucket
2. [ ] Go to https://vercel.com/new
3. [ ] Import your repository
4. [ ] Add all environment variables
5. [ ] Click Deploy

### CLI Deploy
```bash
vercel login
vercel --prod
```

## After Deployment

### 1. Update OAuth Redirect URIs
- [ ] Google Console: Add `https://YOUR-APP.vercel.app/api/auth/callback/google`
- [ ] Facebook App: Add `https://YOUR-APP.vercel.app/api/auth/callback/facebook`

### 2. Configure Stripe Webhook
- [ ] Add webhook endpoint: `https://YOUR-APP.vercel.app/api/stripe/webhook`
- [ ] Select events: checkout.session.completed, customer.subscription.*
- [ ] Copy webhook secret to Vercel env vars

### 3. Update Environment Variables
- [ ] Set NEXTAUTH_URL to `https://YOUR-APP.vercel.app`
- [ ] Redeploy after env var changes

### 4. Testing
- [ ] Homepage loads
- [ ] User registration works
- [ ] Login with email/password works
- [ ] Google OAuth works
- [ ] Facebook OAuth works
- [ ] CV creation works
- [ ] PDF export works
- [ ] AI features work
- [ ] Stripe checkout works

## Common Issues

### Build Fails
- Check Vercel build logs
- Run `npm run build` locally to debug
- Ensure all env vars are set

### API Routes 500 Error
- Check Vercel function logs
- Verify DATABASE_URL is correct
- Check JWT_SECRET is set

### OAuth Not Working
- Verify redirect URIs match exactly
- Check client IDs and secrets
- Ensure NEXTAUTH_URL is correct

### Stripe Webhook Fails
- Verify webhook secret matches
- Check endpoint URL is correct
- Review Stripe dashboard logs

## Useful Links
- Vercel Dashboard: https://vercel.com/dashboard
- Deployment Logs: https://vercel.com/[your-project]/deployments
- Environment Variables: https://vercel.com/[your-project]/settings/environment-variables
