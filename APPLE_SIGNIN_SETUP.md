# Apple Sign In Setup Guide

This guide walks through configuring Apple Sign In for the 12-Step Tracker app.

## Prerequisites

- Apple Developer account (paid $99/year membership)
- Access to Supabase project dashboard
- Bundle ID: `com.billchirico.12steptracker`

## Part 1: Apple Developer Console Setup

### Step 1: Enable Sign in with Apple Capability

1. Go to [Apple Developer Console](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select **Identifiers** from the left menu
4. Find and select your App ID: `com.billchirico.12steptracker`
5. Scroll to **Sign in with Apple** capability
6. Check the box to enable it
7. Click **Save**

### Step 2: Create Services ID

1. In **Identifiers**, click the **+** button
2. Select **Services IDs**, click **Continue**
3. Fill in:
   - **Description:** 12-Step Tracker Sign In
   - **Identifier:** `com.billchirico.12steptracker.signin` (must be unique)
4. Click **Continue**, then **Register**

### Step 3: Configure Services ID

1. Select the Services ID you just created
2. Check **Sign in with Apple**
3. Click **Configure** next to it
4. Set **Primary App ID** to: `com.billchirico.12steptracker`
5. Under **Website URLs**:
   - **Domains:** `vzwdsjphpabtxhmffous.supabase.co`
   - **Return URLs:** `https://vzwdsjphpabtxhmffous.supabase.co/auth/v1/callback`
6. Click **Add** to add the domain/return URL
7. Click **Save**, then **Continue**, then **Done**

### Step 4: Generate Private Key

1. Navigate to **Keys** in the left menu
2. Click the **+** button
3. Fill in:
   - **Key Name:** 12-Step Tracker Apple Sign In Key
4. Check **Sign in with Apple**
5. Click **Configure** next to it
6. Select your Primary App ID: `com.billchirico.12steptracker`
7. Click **Save**
8. Click **Continue**, then **Register**
9. **Download the key file** (.p8) - you can only download it once!
10. Note the **Key ID** shown (e.g., `ABC123DEFG`)

### Step 5: Find Your Team ID

1. Go to **Membership** in the left menu
2. Note your **Team ID** (e.g., `XYZ987TEAM`)

## Part 2: Supabase Configuration

### Step 1: Enable Apple Provider

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **12-Step Tracker**
3. Navigate to **Authentication** → **Providers**
4. Find **Apple** in the list
5. Toggle **Enable Sign in with Apple**

### Step 2: Configure Apple Provider

Fill in the following fields:

- **Services ID:** `com.billchirico.12steptracker.signin` (from Apple Step 2)
- **Team ID:** Your Team ID from Apple (e.g., `XYZ987TEAM`)
- **Key ID:** Your Key ID from Apple (e.g., `ABC123DEFG`)
- **Private Key:** Paste the contents of your .p8 file

To get the private key contents:

```bash
cat /path/to/downloaded/AuthKey_ABC123DEFG.p8
```

### Step 3: Configure Redirect URLs

In the **Redirect URLs** section, ensure these are configured:

**Production:**

- `https://vzwdsjphpabtxhmffous.supabase.co/auth/v1/callback`

**Native (Deep Link):**

- `12stepstracker://auth/callback`

**Development (optional):**

- `http://localhost:8081/auth/callback`
- `http://localhost:19006/auth/callback`

Click **Save** to apply changes.

## Part 3: Testing the Configuration

### Web Testing

1. Start the web dev server: `pnpm dev`
2. Open http://localhost:8081
3. Click **Sign in with Apple** button
4. Verify Apple Sign In popup appears
5. Complete sign-in flow
6. Verify you're redirected back and logged in

### Native Testing (iOS)

1. Build development client: `eas build --platform ios --profile development`
2. Install on device
3. Launch app
4. Click **Sign in with Apple** button
5. Verify Apple Sign In sheet appears
6. Complete sign-in flow
7. Verify you're redirected back and logged in

### Native Testing (Android)

1. Build development client: `eas build --platform android --profile development`
2. Install on device
3. Launch app
4. Click **Sign in with Apple** button
5. Verify web view with Apple Sign In appears
6. Complete sign-in flow
7. Verify you're redirected back and logged in

## Troubleshooting

### "Invalid Client" Error

**Cause:** Services ID mismatch or not properly configured in Supabase.

**Fix:**

1. Verify Services ID in Supabase matches exactly: `com.billchirico.12steptracker.signin`
2. Verify Services ID is configured for Sign in with Apple in Apple Developer Console
3. Verify Primary App ID is set correctly

### Redirect URI Mismatch

**Cause:** Return URLs in Apple Developer Console don't match Supabase callback URL.

**Fix:**

1. Go to Apple Developer Console → Services ID → Configure
2. Verify **Return URLs** includes: `https://vzwdsjphpabtxhmffous.supabase.co/auth/v1/callback`
3. Ensure no trailing slashes or typos

### Private Key Error

**Cause:** Invalid or incorrectly formatted private key in Supabase.

**Fix:**

1. Re-download the .p8 file (if you still have it) or generate a new key
2. Copy the entire contents including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
3. Paste into Supabase without modifications

### Email Not Provided

**Cause:** Apple allows users to hide their email address.

**Solution:** This is expected behavior. The app handles this in `createOAuthProfileIfNeeded`:

- If user hides email, Apple provides a relay email: `*@privaterelay.appleid.com`
- Profile creation logic handles missing or relay emails gracefully
- User can update email in profile settings later

### Deep Linking Not Working (Native)

**Cause:** App scheme not properly configured.

**Fix:**

1. Verify `app.json` includes scheme: `12stepstracker`
2. Rebuild the native app
3. Test deep link: `xcrun simctl openurl booted "12stepstracker://auth/callback?access_token=test"`

## Platform-Specific Notes

### iOS

- **App Store Requirement:** Apps offering third-party sign-in (Google, Facebook) MUST offer Apple Sign In
- **Capability:** Ensure Sign in with Apple is enabled in app capabilities
- **Simulator vs Device:** Sign in with Apple works on both, but device testing recommended
- **Deep Linking:** Uses scheme `12stepstracker://` configured in `app.json`

### Android

- **Web View Flow:** Apple Sign In on Android uses web view (not native)
- **Redirect URIs:** Must match exactly (case-sensitive)
- **Testing:** Physical device recommended over emulator

### Web

- **Browser Support:** Modern browsers (Chrome, Safari, Firefox, Edge)
- **Localhost:** Works for development with configured redirect URI
- **Production:** Use HTTPS redirect URI from Supabase

## Security Considerations

- **Private Key:** Never commit .p8 file to version control
- **Key Rotation:** Regenerate key annually or if compromised
- **Services ID:** Keep consistent across environments
- **Relay Email:** Respect user's privacy choice to hide email

## References

- [Apple Sign In Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple)
- [Supabase Apple Auth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-apple)
- [expo-auth-session Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)
