# Firebase Google Authentication Setup Guide

## Problem: Redirect URL Mismatch Error

When using Google Sign-In with Firebase Authentication, you may encounter a "redirect_uri_mismatch" error. This happens when the redirect URLs in your Google Cloud Console don't match the URLs your application is using.

## Solution Steps

### Step 1: Update Google Cloud Console OAuth Configuration

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project: `thigha-e3340` (project-880282854095)

2. **Navigate to OAuth Configuration**
   - Go to **APIs & Services** → **Credentials**
   - Find your OAuth 2.0 Client ID for Web Application
   - Click on it to edit

3. **Update Authorized JavaScript Origins**
   Add these origins:
   ```
   http://localhost:3000
   http://localhost:5173
   https://thigha-e3340.web.app
   https://thigha-e3340.firebaseapp.com
   ```

4. **Update Authorized Redirect URIs**
   Add these redirect URIs:
   ```
   http://localhost:3000/__/auth/handler
   http://localhost:5173/__/auth/handler
   https://thigha-e3340.web.app/__/auth/handler
   https://thigha-e3340.firebaseapp.com/__/auth/handler
   ```

### Step 2: Firebase Console Configuration

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `thigha-e3340`

2. **Authentication Settings**
   - Go to **Authentication** → **Sign-in method**
   - Enable **Google** provider
   - Add your project's support email: `abuzer.social@gmail.com`

3. **Authorized Domains**
   Make sure these domains are added:
   ```
   localhost
   thigha-e3340.web.app
   thigha-e3340.firebaseapp.com
   ```

### Step 3: Environment-Specific URLs

**For Development:**
- Local development: `http://localhost:5173`
- Vite dev server: `http://localhost:3000`

**For Production:**
- Firebase Hosting: `https://thigha-e3340.web.app`
- Firebase App Domain: `https://thigha-e3340.firebaseapp.com`

### Step 4: Test the Configuration

1. **Clear Browser Cache**
   - Clear all browser data for your domain
   - Or use incognito/private browsing

2. **Test Google Sign-In**
   - Try the Google Sign-In button
   - Check browser console for any errors
   - Verify the redirect URL in the error message

### Step 5: Common Issues and Solutions

**Issue 1: "redirect_uri_mismatch"**
- **Solution**: Ensure all your application URLs are added to Google Cloud Console OAuth settings

**Issue 2: "invalid_client"**
- **Solution**: Check that your OAuth client ID matches the one in Firebase Console

**Issue 3: "access_denied"**
- **Solution**: Verify that Google Sign-In is enabled in Firebase Console

**Issue 4: CORS errors**
- **Solution**: Make sure your domain is added to Firebase Authorized Domains

### Step 6: Firebase Configuration (Already Updated)

Your Firebase configuration is now using direct values instead of environment variables:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBTPeXYbHB1Z4K3UK8VW79xgpyc28kG-CI",
  authDomain: "thigha-e3340.firebaseapp.com",
  projectId: "thigha-e3340",
  storageBucket: "thigha-e3340.firebasestorage.app",
  messagingSenderId: "880282854095",
  appId: "1:880282854095:web:c2d49a97e9c9149c8ccdba",
  measurementId: "G-G0P1GX5Y2X"
};
```

### Step 7: Verification Checklist

- [ ] Google Cloud Console OAuth client has correct redirect URIs
- [ ] Firebase Console has Google Sign-In enabled
- [ ] Authorized domains include your application URLs
- [ ] Firebase configuration uses correct project ID
- [ ] Browser cache is cleared
- [ ] No CORS errors in browser console

### Step 8: Testing URLs

Test these URLs to ensure they work:
- Development: `http://localhost:5173`
- Production: `https://thigha-e3340.web.app`

## Important Notes

1. **Firebase vs Google Cloud**: Firebase Authentication uses Google Cloud OAuth under the hood, but you only need to configure the redirect URLs in Google Cloud Console.

2. **Environment Variables**: The configuration now uses direct values to avoid Google Cloud dependencies.

3. **Security**: Make sure to only add the domains you actually use to prevent unauthorized access.

4. **Testing**: Always test in both development and production environments.

## Troubleshooting

If you still get errors:

1. **Check Browser Console**: Look for specific error messages
2. **Verify URLs**: Ensure the URLs in your OAuth configuration match exactly
3. **Clear Cache**: Clear browser cache and try again
4. **Check Firebase Console**: Verify Google Sign-In is properly configured
5. **Test Different Browsers**: Try in different browsers to isolate the issue

## Support

If you continue to have issues, check:
- Firebase Console → Authentication → Sign-in method
- Google Cloud Console → APIs & Services → Credentials
- Browser Developer Tools → Console for error messages
