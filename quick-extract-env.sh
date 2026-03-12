#!/bin/bash
# Quick one-liner to extract all env vars from Replit
# Run this in Replit shell: bash quick-extract-env.sh

cat << 'EOF'
# Copy everything below this line to your .env.local file
# =======================================================

EOF

# Database
[ -n "$DATABASE_URL" ] && echo "DATABASE_URL=$DATABASE_URL" || \
  ([ -n "$PGHOST" ] && [ -n "$PGPORT" ] && [ -n "$PGDATABASE" ] && [ -n "$PGUSER" ] && [ -n "$PGPASSWORD" ] && \
   echo "DATABASE_URL=postgresql://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/$PGDATABASE?sslmode=require")

# Auth & Security
[ -n "$JWT_SECRET" ] && echo "JWT_SECRET=$JWT_SECRET"
[ -n "$NEXTAUTH_SECRET" ] && echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
[ -n "$NEXTAUTH_URL" ] && echo "NEXTAUTH_URL=$NEXTAUTH_URL" || echo "NEXTAUTH_URL=http://localhost:3000"
[ -n "$SESSION_SECRET" ] && echo "SESSION_SECRET=$SESSION_SECRET"

# AI
[ -n "$OPENAI_API_KEY" ] && echo "OPENAI_API_KEY=$OPENAI_API_KEY"

# Stripe
[ -n "$STRIPE_SECRET_KEY" ] && echo "STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY"
[ -n "$STRIPE_WEBHOOK_SECRET" ] && echo "STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET"
[ -n "$VITE_STRIPE_PUBLIC_KEY" ] && echo "NEXT_PUBLIC_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY"
[ -n "$STRIPE_PRICE_REGULAR_MONTHLY" ] && echo "STRIPE_PRICE_REGULAR_MONTHLY=$STRIPE_PRICE_REGULAR_MONTHLY"
[ -n "$STRIPE_PRICE_PLUS_MONTHLY" ] && echo "STRIPE_PRICE_PLUS_MONTHLY=$STRIPE_PRICE_PLUS_MONTHLY"
[ -n "$STRIPE_PRICE_ANNUAL" ] && echo "STRIPE_PRICE_ANNUAL=$STRIPE_PRICE_ANNUAL"

# OAuth
[ -n "$GOOGLE_CLIENT_ID" ] && echo "GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID"
[ -n "$GOOGLE_CLIENT_SECRET" ] && echo "GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET"
[ -n "$FACEBOOK_CLIENT_ID" ] && echo "FACEBOOK_CLIENT_ID=$FACEBOOK_CLIENT_ID"
[ -n "$FACEBOOK_CLIENT_SECRET" ] && echo "FACEBOOK_CLIENT_SECRET=$FACEBOOK_CLIENT_SECRET"

cat << 'EOF'

# =======================================================
# End of environment variables
# Copy everything above to .env.local in your project root
EOF


