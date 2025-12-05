# Gmail API OAuth Setup Guide

## Fixing "redirect_uri_mismatch" Error in OAuth Playground

When generating a Gmail API refresh token using OAuth Playground, you need to add the OAuth Playground redirect URI to your OAuth client configuration.

### Steps to Fix

1. **Go to Google Cloud Console**
   - Navigate to: https://console.cloud.google.com/apis/credentials
   - Select your project

2. **Find Your OAuth 2.0 Client ID for Gmail**
   - Look for the OAuth 2.0 Client ID that matches your `GMAIL_CLIENT_ID` from `.env.local`
   - **OR** find the client ID shown in the error: `325223188010-rddhqk3efed4e1ufkucqalflqujmunc1.apps.googleusercontent.com`
   - Click on it to edit

3. **Add OAuth Playground Redirect URI**
   - In the "Authorized redirect URIs" section, add:
     - `https://developers.google.com/oauthplayground`
   - This is required for OAuth Playground to work with your OAuth client

4. **Save Changes**
   - Click "Save"
   - Wait a few minutes for changes to propagate (usually 1-5 minutes)

5. **Generate Refresh Token in OAuth Playground**
   - Go to: https://developers.google.com/oauthplayground
   - Click the gear icon (⚙️) in the top right corner
   - Check "Use your own OAuth credentials"
   - Enter your `GMAIL_CLIENT_ID` and `GMAIL_CLIENT_SECRET` from `.env.local`
   - In the left panel, find and select: `https://www.googleapis.com/auth/gmail.send`
   - Click "Authorize APIs"
   - Complete the Google sign-in flow
   - Click "Exchange authorization code for tokens"
   - Copy the "Refresh token" value
   - Update `GMAIL_REFRESH_TOKEN` in your `.env.local` file

6. **Restart Your Dev Server**
   - Stop the server (Ctrl+C)
   - Run `npm run dev` again

### Important Notes

- The OAuth client used for Gmail API (`GMAIL_CLIENT_ID`) can be the same or different from the one used for authentication (`GOOGLE_CLIENT_ID`)
- If you're using the same OAuth client for both, make sure it has both redirect URIs:
  - `https://developers.google.com/oauthplayground` (for OAuth Playground)
  - `http://localhost:3000/api/auth/callback` (for your app's authentication)
- Changes in Google Cloud Console can take a few minutes to propagate
- Never commit `.env.local` to version control

### Troubleshooting

If you still get the error after following these steps:

1. **Verify the OAuth Client**
   - Make sure you're editing the correct OAuth client (the one matching `GMAIL_CLIENT_ID`)
   - Check that the Client ID and Secret in `.env.local` match what's in Google Cloud Console

2. **Check Redirect URI Format**
   - The URI must be exactly: `https://developers.google.com/oauthplayground`
   - No trailing slashes, no variations

3. **Wait for Propagation**
   - Google Cloud Console changes can take 5-10 minutes to fully propagate
   - Try again after waiting a few minutes

4. **Clear Browser Cache**
   - Sometimes cached OAuth responses can cause issues
   - Try an incognito/private window

5. **Verify Gmail API is Enabled**
   - Go to: https://console.cloud.google.com/apis/library
   - Search for "Gmail API"
   - Make sure it's enabled for your project

