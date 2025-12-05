# Google OAuth Setup Guide

## Fixing "redirect_uri_mismatch" Error

This error occurs when the redirect URI configured in Google Cloud Console doesn't match what your application is using.

### Current Configuration

Your application uses the redirect URI:
```
http://localhost:3000/api/auth/callback
```
(or whatever `NEXTAUTH_URL` is set to in `.env.local`)

### Steps to Fix

1. **Go to Google Cloud Console**
   - Navigate to: https://console.cloud.google.com/apis/credentials
   - Select your project

2. **Find Your OAuth 2.0 Client ID**
   - Look for the OAuth 2.0 Client ID that matches your `GOOGLE_CLIENT_ID`
   - Click on it to edit

3. **Add Authorized Redirect URIs**
   - In the "Authorized redirect URIs" section, add:
     - `http://localhost:3000/api/auth/callback` (for local development)
     - `https://yourdomain.com/api/auth/callback` (for production, if applicable)

4. **Save Changes**
   - Click "Save"
   - Wait a few minutes for changes to propagate

5. **Verify NEXTAUTH_URL**
   - Check your `.env.local` file
   - Ensure `NEXTAUTH_URL` matches the redirect URI you added:
     ```
     NEXTAUTH_URL=http://localhost:3000
     ```

6. **Restart Your Dev Server**
   - Stop the server (Ctrl+C)
   - Run `npm run dev` again

### Important Notes

- The redirect URI must match **exactly** (including protocol, port, and path)
- Changes in Google Cloud Console can take a few minutes to propagate
- For production, use `https://` and your actual domain
- Never commit `.env.local` to version control

### Troubleshooting

If you still get the error after following these steps:

1. **Double-check the redirect URI**
   - The URI in Google Cloud Console must match exactly
   - Check for trailing slashes, port numbers, and protocol (http vs https)

2. **Check NEXTAUTH_URL**
   - Run: `Get-Content .env.local | Select-String "NEXTAUTH_URL"`
   - Ensure it matches your redirect URI (without the `/api/auth/callback` part)

3. **Clear Browser Cache**
   - Sometimes cached OAuth responses can cause issues
   - Try an incognito/private window

4. **Wait for Propagation**
   - Google Cloud Console changes can take 5-10 minutes to fully propagate
   - Try again after waiting

