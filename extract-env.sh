#!/bin/bash

# Script to extract environment variables from Replit and create .env.local file
# Run this in your Replit shell to get all the env variables

echo "# Environment Variables for M.AASIRI Next.js App"
echo "# Generated from Replit on $(date)"
echo ""
echo "# ============================================="
echo "# REQUIRED - Database Configuration"
echo "# ============================================="
echo ""

# Database URL - construct from PG variables if DATABASE_URL doesn't exist
if [ -n "$DATABASE_URL" ]; then
    echo "DATABASE_URL=$DATABASE_URL"
else
    # Construct DATABASE_URL from individual PG variables
    if [ -n "$PGHOST" ] && [ -n "$PGPORT" ] && [ -n "$PGDATABASE" ] && [ -n "$PGUSER" ] && [ -n "$PGPASSWORD" ]; then
        echo "DATABASE_URL=postgresql://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/$PGDATABASE?sslmode=require"
    else
        echo "# DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require"
        echo "# Or set individual PG variables:"
        [ -n "$PGHOST" ] && echo "PGHOST=$PGHOST" || echo "# PGHOST="
        [ -n "$PGPORT" ] && echo "PGPORT=$PGPORT" || echo "# PGPORT=5432"
        [ -n "$PGDATABASE" ] && echo "PGDATABASE=$PGDATABASE" || echo "# PGDATABASE="
        [ -n "$PGUSER" ] && echo "PGUSER=$PGUSER" || echo "# PGUSER="
        [ -n "$PGPASSWORD" ] && echo "PGPASSWORD=$PGPASSWORD" || echo "# PGPASSWORD="
    fi
fi

echo ""
echo "# ============================================="
echo "# REQUIRED - Authentication & Security"
echo "# ============================================="
echo ""

[ -n "$JWT_SECRET" ] && echo "JWT_SECRET=$JWT_SECRET" || echo "# JWT_SECRET="
[ -n "$NEXTAUTH_SECRET" ] && echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET" || echo "# NEXTAUTH_SECRET="
[ -n "$NEXTAUTH_URL" ] && echo "NEXTAUTH_URL=$NEXTAUTH_URL" || echo "# NEXTAUTH_URL=http://localhost:3000"
[ -n "$SESSION_SECRET" ] && echo "SESSION_SECRET=$SESSION_SECRET" || echo "# SESSION_SECRET="

echo ""
echo "# ============================================="
echo "# REQUIRED - AI Configuration"
echo "# ============================================="
echo ""

[ -n "$OPENAI_API_KEY" ] && echo "OPENAI_API_KEY=$OPENAI_API_KEY" || echo "# OPENAI_API_KEY="

echo ""
echo "# ============================================="
echo "# REQUIRED - Stripe Configuration"
echo "# ============================================="
echo ""

[ -n "$STRIPE_SECRET_KEY" ] && echo "STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY" || echo "# STRIPE_SECRET_KEY="
[ -n "$STRIPE_WEBHOOK_SECRET" ] && echo "STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET" || echo "# STRIPE_WEBHOOK_SECRET="
[ -n "$VITE_STRIPE_PUBLIC_KEY" ] && echo "NEXT_PUBLIC_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY" || echo "# NEXT_PUBLIC_STRIPE_PUBLIC_KEY="

echo ""
echo "# ============================================="
echo "# OPTIONAL - Stripe Price IDs"
echo "# ============================================="
echo ""

[ -n "$STRIPE_PRICE_REGULAR_MONTHLY" ] && echo "STRIPE_PRICE_REGULAR_MONTHLY=$STRIPE_PRICE_REGULAR_MONTHLY" || echo "# STRIPE_PRICE_REGULAR_MONTHLY="
[ -n "$STRIPE_PRICE_PLUS_MONTHLY" ] && echo "STRIPE_PRICE_PLUS_MONTHLY=$STRIPE_PRICE_PLUS_MONTHLY" || echo "# STRIPE_PRICE_PLUS_MONTHLY="
[ -n "$STRIPE_PRICE_ANNUAL" ] && echo "STRIPE_PRICE_ANNUAL=$STRIPE_PRICE_ANNUAL" || echo "# STRIPE_PRICE_ANNUAL="

echo ""
echo "# ============================================="
echo "# OPTIONAL - OAuth Configuration"
echo "# ============================================="
echo ""

[ -n "$GOOGLE_CLIENT_ID" ] && echo "GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID" || echo "# GOOGLE_CLIENT_ID="
[ -n "$GOOGLE_CLIENT_SECRET" ] && echo "GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET" || echo "# GOOGLE_CLIENT_SECRET="
[ -n "$FACEBOOK_CLIENT_ID" ] && echo "FACEBOOK_CLIENT_ID=$FACEBOOK_CLIENT_ID" || echo "# FACEBOOK_CLIENT_ID="
[ -n "$FACEBOOK_CLIENT_SECRET" ] && echo "FACEBOOK_CLIENT_SECRET=$FACEBOOK_CLIENT_SECRET" || echo "# FACEBOOK_CLIENT_SECRET="

echo ""
echo "# ============================================="
echo "# Notes:"
echo "# - Replace all # commented empty values with actual values"
echo "# - For local development, set NEXTAUTH_URL=http://localhost:3000"
echo "# - Generate NEXTAUTH_SECRET with: openssl rand -base64 32"
echo "# - Generate JWT_SECRET with: openssl rand -base64 32"
echo "# ============================================="


