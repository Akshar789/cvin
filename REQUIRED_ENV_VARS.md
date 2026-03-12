# Required Environment Variables Summary

Based on your codebase analysis, here are the environment variables your Next.js app needs:

## ✅ Available in Replit (from your screenshot)

From the Replit secrets interface, you have:
- ✅ SESSION_SECRET
- ✅ DATABASE_URL (or PG* variables)
- ✅ PGDATABASE
- ✅ PGHOST
- ✅ PGPORT
- ✅ PGUSER
- ✅ PGPASSWORD
- ✅ STRIPE_SECRET_KEY
- ✅ VITE_STRIPE_PUBLIC_KEY (needs to be renamed to NEXT_PUBLIC_STRIPE_PUBLIC_KEY)
- ✅ JWT_SECRET
- ✅ OPENAI_API_KEY
- ✅ FACEBOOK_CLIENT_ID
- ✅ FACEBOOK_CLIENT_SECRET
- ✅ GOOGLE_CLIENT_ID
- ✅ GOOGLE_CLIENT_SECRET
- ✅ NEXTAUTH_SECRET
- ✅ NEXTAUTH_URL

## ❌ Potentially Missing (Check if these exist)

- ❓ STRIPE_WEBHOOK_SECRET - Required for Stripe webhooks
- ❓ STRIPE_PRICE_REGULAR_MONTHLY - Optional but recommended
- ❓ STRIPE_PRICE_PLUS_MONTHLY - Optional but recommended
- ❓ STRIPE_PRICE_ANNUAL - Optional but recommended

## 🔧 Quick Extraction Commands

Run these in your Replit shell to extract all variables:

```bash
# Method 1: Use the extraction script
bash extract-env.sh > .env.local

# Method 2: Manual extraction
echo "DATABASE_URL=$DATABASE_URL" >> .env.local
echo "JWT_SECRET=$JWT_SECRET" >> .env.local
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET" >> .env.local
echo "NEXTAUTH_URL=$NEXTAUTH_URL" >> .env.local
echo "OPENAI_API_KEY=$OPENAI_API_KEY" >> .env.local
echo "STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY" >> .env.local
echo "STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET" >> .env.local
echo "NEXT_PUBLIC_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY" >> .env.local
echo "GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID" >> .env.local
echo "GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET" >> .env.local
echo "FACEBOOK_CLIENT_ID=$FACEBOOK_CLIENT_ID" >> .env.local
echo "FACEBOOK_CLIENT_SECRET=$FACEBOOK_CLIENT_SECRET" >> .env.local

# If DATABASE_URL doesn't exist, construct it from PG variables:
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL=postgresql://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/$PGDATABASE?sslmode=require" >> .env.local
fi
```

## 📝 Next Steps

1. **Run the extraction script in Replit:**
   ```bash
   bash extract-env.sh
   ```

2. **Copy the output and create `.env.local` in your local project**

3. **Check for missing variables:**
   - STRIPE_WEBHOOK_SECRET (if you're using Stripe webhooks)
   - Stripe Price IDs (if you want to use real pricing)

4. **For local development, update NEXTAUTH_URL:**
   ```
   NEXTAUTH_URL=http://localhost:3000
   ```

5. **Test the server:**
   ```bash
   npm run dev
   ```

## ⚠️ Important Notes

- `VITE_STRIPE_PUBLIC_KEY` from Replit should be renamed to `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` for Next.js
- If `DATABASE_URL` doesn't exist in Replit, the script will construct it from `PG*` variables
- Make sure `.env.local` is in your `.gitignore` (it should be by default)


