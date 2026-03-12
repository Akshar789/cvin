# Admin Access Guide - View User Data

## How to Access User Data as Owner

### Option 1: Admin Panel (Web Interface)

**URL:** `/admin`

**Requirements:**
- You must have an account with `subscriptionTier = 'admin'`

**What you can see:**
- Total number of users
- Total CVs created
- Number of premium (paid) users
- Number of free users

**How to create an admin account:**

1. Register normally at `/auth/register`
2. Access the database and update your account (see below)

### Option 2: Database Direct Access (Owner View)

Use the Replit Database tool to run these SQL queries:

**View all registered users:**
```sql
SELECT 
  id,
  email,
  username,
  full_name,
  subscription_tier,
  created_at
FROM users
ORDER BY created_at DESC
LIMIT 50;
```

**Make yourself an admin:**
```sql
UPDATE users 
SET subscription_tier = 'admin' 
WHERE email = 'your@email.com';
```

**View user statistics:**
```sql
SELECT subscription_tier, COUNT(*) as count
FROM users
GROUP BY subscription_tier;
```

## Current Testing Results

✅ **Registration:** Working - email-based signup
✅ **Login:** Working - JWT authentication  
✅ **User data stored:** Confirmed in database
✅ **Admin panel:** Coded and ready (requires admin tier)
❌ **Payments:** Need Stripe product setup (see STRIPE_SETUP.md)

## Security Notes

- Passwords are hashed with bcrypt (never plain text)
- Admin requires `subscriptionTier = 'admin'`
- Non-admin users redirected from `/admin`
