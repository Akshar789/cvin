# OAuth Setup Guide for CVPro

This guide will help you configure Google and Facebook OAuth authentication for CVPro.

## Required Environment Variables

Add the following environment variables to your Replit project secrets:

```
NEXTAUTH_URL=https://your-replit-domain.replit.app
NEXTAUTH_SECRET=<generate-a-secure-random-string>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
FACEBOOK_CLIENT_ID=<your-facebook-app-id>
FACEBOOK_CLIENT_SECRET=<your-facebook-app-secret>
```

## Step 1: Generate NEXTAUTH_SECRET

Run this command in the Shell to generate a secure random secret:

```bash
openssl rand -base64 32
```

Copy the output and add it as `NEXTAUTH_SECRET` in your Replit secrets.

## Step 2: Set NEXTAUTH_URL

Set `NEXTAUTH_URL` to your Replit app URL (e.g., `https://your-app.replit.app`).

**Important**: This must match the URL where your app is deployed.

## Step 3: Configure Google OAuth

### 3.1 Create Google OAuth Application

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Configure:
   - **Name**: CVPro
   - **Authorized JavaScript origins**: 
     - `https://your-app.replit.app`
   - **Authorized redirect URIs**:
     - `https://your-app.replit.app/api/auth/callback/google`
7. Click **Create**

### 3.2 Add Google Credentials to Replit

Copy the **Client ID** and **Client Secret** and add them to Replit secrets:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## Step 4: Configure Facebook OAuth

### 4.1 Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select **Consumer** as app type
4. Enter app details:
   - **App Name**: CVPro
   - **Contact Email**: Your email
5. Click **Create App**

### 4.2 Add Facebook Login Product

1. In your app dashboard, click **Add Product**
2. Find **Facebook Login** and click **Set Up**
3. Select **Web** platform
4. Enter your site URL: `https://your-app.replit.app`

### 4.3 Configure OAuth Redirect URIs

1. Go to **Facebook Login** → **Settings**
2. Add Valid OAuth Redirect URIs:
   - `https://your-app.replit.app/api/auth/callback/facebook`
3. Save changes

### 4.4 Get App Credentials

1. Go to **Settings** → **Basic**
2. Copy **App ID** and **App Secret**
3. Add them to Replit secrets:
   - `FACEBOOK_CLIENT_ID` (use App ID)
   - `FACEBOOK_CLIENT_SECRET` (use App Secret)

### 4.5 Make App Public (For Production)

1. In **Settings** → **Basic**, toggle **App Mode** to **Live**
2. Complete the required information (Privacy Policy, Terms of Service, etc.)

**Note**: For development, keep in Development mode and add test users in **Roles** → **Test Users**.

## Step 5: Verify Setup

1. Restart your Replit application (workflow will auto-restart)
2. Go to `/auth/login` or `/auth/register`
3. Click the Google or Facebook button
4. You should be redirected to the OAuth provider
5. After authentication, you'll be redirected back and logged in

## Troubleshooting

### Error: "redirect_uri_mismatch"
- **Cause**: The redirect URI doesn't match what's configured in Google/Facebook
- **Fix**: Ensure the redirect URI in your OAuth app matches exactly:
  - Google: `https://your-app.replit.app/api/auth/callback/google`
  - Facebook: `https://your-app.replit.app/api/auth/callback/facebook`

### Error: "Invalid client"
- **Cause**: Client ID or Secret is incorrect
- **Fix**: Double-check your credentials in Replit secrets

### Error: "Failed to complete sign in"
- **Cause**: Session sync failed (network/server issue)
- **Fix**: Click the "Retry" button to attempt sync again

### Users stuck after OAuth login
- **Cause**: Browser blocking localStorage or cookies
- **Fix**: Ensure third-party cookies are enabled, or use incognito mode for testing

## How It Works

CVPro uses a hybrid authentication system:

1. **NextAuth.js** handles OAuth authentication with Google/Facebook
2. **JWT tokens** power the existing dashboard and protected routes
3. **Bridge system** connects NextAuth sessions to JWT authentication:
   - User logs in with Google/Facebook
   - NextAuth creates session
   - `/api/auth/sync-session` endpoint generates JWT token
   - JWT stored in localStorage
   - User accesses dashboard with JWT

This approach maintains compatibility with the existing authentication system while adding OAuth support.

## Security Notes

- Never commit secrets to version control
- Use Replit's built-in secrets management
- Rotate secrets regularly
- Use HTTPS in production (Replit handles this automatically)
- Keep OAuth apps in Development mode until ready for production

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set correctly
3. Ensure redirect URIs match exactly
4. Check that OAuth apps are configured correctly
5. Restart the Replit application after adding secrets
