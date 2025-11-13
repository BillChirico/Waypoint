# Facebook Sign In Implementation Design

**Date:** 2025-11-12
**Issue:** #22 - Add Facebook Sign In as authentication provider
**Status:** Approved and ready for implementation

## Overview

This document outlines the implementation design for adding Facebook Sign In as an authentication provider alongside the existing email/password and Google OAuth methods. The implementation uses the native SDK approach (`expo-facebook`) for the best user experience on mobile devices.

## Goals

- Enable Facebook authentication on iOS, Android, and Web platforms
- Provide native Facebook app handoff on mobile devices
- Auto-create user profiles for new Facebook sign-ins
- Maintain security and follow Facebook's brand guidelines
- Achieve 80%+ test coverage with TDD approach

## Non-Goals

- Facebook Analytics integration (future enhancement)
- Additional Facebook permissions beyond email and public_profile
- Facebook app review submission (basic permissions don't require review)

## Architecture

### Overall Approach

The implementation mirrors the existing Google OAuth pattern but adapts it for Facebook's native SDK requirements. There are two distinct authentication flows:

#### Web Flow

- Use Supabase's built-in OAuth (`supabase.auth.signInWithOAuth({ provider: 'facebook' })`)
- Browser-based popup/redirect
- Simple implementation matching Google OAuth web pattern

#### Native Flow (iOS/Android)

- Use `expo-facebook` SDK to authenticate with Facebook
- Get Facebook access token from SDK
- Exchange Facebook token with Supabase using `supabase.auth.signInWithIdToken()`
- Handle deep linking for app-to-app handoff
- Auto-create profile on first sign-in

### Files to Modify

1. **contexts/AuthContext.tsx** - Add `signInWithFacebook()` method
2. **app/login.tsx** - Add Facebook Sign In button
3. **app/signup.tsx** - Add Facebook Sign In button
4. **app.json** - Add Facebook plugin and configuration
5. **.env** - Add `EXPO_PUBLIC_FACEBOOK_APP_ID`
6. **package.json** - Add `expo-facebook` dependency
7. **contexts/**tests**/AuthContext.test.tsx** - Add tests for Facebook sign in

### Configuration Strategy

- Facebook App ID stored in environment variable (`EXPO_PUBLIC_FACEBOOK_APP_ID`)
- Loaded into `app.json` via `extra.facebookAppId`
- Facebook SDK initialized on app startup via plugin
- Deep link scheme: `12stepstracker://` (already configured for Google OAuth)

## Detailed Design

### 1. AuthContext Implementation

#### New Method: `signInWithFacebook()`

```typescript
const signInWithFacebook = async () => {
  try {
    if (Platform.OS === 'web') {
      // Web flow: Use Supabase OAuth directly
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: window.location.origin,
          scopes: 'email public_profile',
        },
      });
      if (error) throw error;
    } else {
      // Native flow: Use expo-facebook SDK
      await Facebook.initializeAsync({
        appId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID,
      });

      const result = await Facebook.logInWithReadPermissionsAsync({
        permissions: ['public_profile', 'email'],
      });

      if (result.type === 'success') {
        // Exchange Facebook token with Supabase
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'facebook',
          token: result.token,
        });

        if (error) throw error;

        // Auto-create profile if new user
        if (data.user) {
          await ensureProfileExists(data.user);
        }
      } else if (result.type === 'cancel') {
        // User cancelled - don't throw error, just return
        return;
      } else {
        throw new Error('Facebook sign in failed');
      }
    }
  } catch (error) {
    console.error('Facebook sign in error:', error);
    throw error;
  }
};
```

#### Profile Auto-Creation

Reuse/enhance existing profile creation logic used for Google OAuth:

- Extract name from `user_metadata.full_name`
- Parse into first name and last initial
- Create profile record in database
- Handle edge cases (no name provided, parsing errors)

#### Error Handling

- **User cancellation**: Return gracefully without throwing
- **Permission denial**: Notify user that email permission is required
- **Network errors**: Show appropriate error message
- **Token exchange failures**: Log details and show generic user-facing error

#### Type Updates

```typescript
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>; // NEW
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastInitial: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
```

### 2. UI Implementation

#### Button Design

Following Facebook's brand guidelines:

```typescript
<TouchableOpacity
  onPress={signInWithFacebook}
  disabled={loading}
  style={{
    backgroundColor: '#1877F2', // Facebook brand blue
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    opacity: loading ? 0.6 : 1,
  }}
  accessibilityLabel="Sign in with Facebook"
  accessibilityRole="button"
>
  <Facebook size={20} color="white" style={{ marginRight: 8 }} />
  <Text style={{
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }}>
    Continue with Facebook
  </Text>
</TouchableOpacity>
```

#### Placement

- Position below the Google Sign In button
- Maintain consistent spacing (12px between OAuth buttons)
- Keep "OR" divider between email/password and OAuth options
- Same button size and border radius as Google button

#### Both Screens (login.tsx & signup.tsx)

- Add Facebook button in the OAuth section
- Handle loading states during sign-in
- Display error messages if sign-in fails
- Disable button while authentication is in progress

#### Accessibility

- `accessibilityLabel="Sign in with Facebook"`
- `accessibilityRole="button"`
- Ensure button is keyboard-navigable on web
- Proper focus states and disabled states

### 3. Configuration Files

#### Environment Variables (.env)

```bash
# Existing variables
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# New for Facebook Sign In
EXPO_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
```

Also create `.env.example` with placeholder:

```bash
EXPO_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id-from-developers.facebook.com
```

#### App Configuration (app.json)

```json
{
  "expo": {
    "plugins": [
      [
        "expo-facebook",
        {
          "appID": "EXPO_PUBLIC_FACEBOOK_APP_ID",
          "displayName": "12 Step Tracker",
          "scheme": "fb${EXPO_PUBLIC_FACEBOOK_APP_ID}",
          "advertiserIDCollectionEnabled": false,
          "autoLogAppEventsEnabled": false
        }
      ]
    ],
    "ios": {
      "bundleIdentifier": "com.billchirico.12steptracker"
      // Facebook URL scheme added automatically by plugin
    },
    "android": {
      "package": "com.billchirico.twelvesteptracker"
      // Facebook App ID added automatically to AndroidManifest by plugin
    }
  }
}
```

#### GitHub Secrets (for CI/CD)

Add to repository secrets:

- `EXPO_PUBLIC_FACEBOOK_APP_ID` - Required for CI builds

### 4. Testing Strategy (TDD Approach)

#### Unit Tests

New test file: `contexts/__tests__/AuthContext.test.tsx` (extend existing)

```typescript
describe('signInWithFacebook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('web platform', () => {
    beforeEach(() => {
      Platform.OS = 'web';
    });

    it('should call supabase.auth.signInWithOAuth with facebook provider', async () => {
      // Test implementation
    });

    it('should pass correct redirect URL and scopes', async () => {
      // Test implementation
    });

    it('should handle OAuth errors', async () => {
      // Test implementation
    });
  });

  describe('native platform', () => {
    beforeEach(() => {
      Platform.OS = 'ios';
    });

    it('should initialize Facebook SDK with app ID', async () => {
      // Test implementation
    });

    it('should request correct permissions', async () => {
      // Test implementation
    });

    it('should exchange Facebook token with Supabase', async () => {
      // Test implementation
    });

    it('should auto-create profile for new users', async () => {
      // Test implementation
    });

    it('should handle user cancellation gracefully', async () => {
      // Should not throw error
    });

    it('should handle permission denial', async () => {
      // Test error handling
    });

    it('should handle network errors', async () => {
      // Test error handling
    });

    it('should handle token exchange failures', async () => {
      // Test error handling
    });
  });
});
```

#### Mock Setup

Create `__mocks__/expo-facebook.ts`:

```typescript
export const initializeAsync = jest.fn();
export const logInWithReadPermissionsAsync = jest.fn();
```

Update MSW handlers for Facebook OAuth responses.

#### Integration Tests

- Test login screen with Facebook button rendering
- Test signup screen with Facebook button rendering
- Test full authentication flow end-to-end
- Test navigation after successful sign-in

#### E2E Tests (Maestro - Optional for Phase 4)

Create `.maestro/facebook-signin.yaml`:

- Test Facebook Sign In flow on each platform
- Test profile creation for new users
- Test existing user sign-in

#### Coverage Goals

- Maintain 80%+ overall coverage requirement
- 100% coverage for new `signInWithFacebook` method
- Cover all error paths (cancellation, denial, network)
- Test both web and native platform branches

### 5. Documentation

#### New File: FACEBOOK_SIGNIN_SETUP.md

Comprehensive setup guide including:

1. **Prerequisites**
   - Facebook Developer account
   - Supabase project access
   - App bundle IDs and package names

2. **Facebook Developer Setup**
   - Creating/accessing Facebook App
   - Adding Facebook Login product
   - Configuring platforms (iOS, Android, Web)
   - Getting App ID and App Secret
   - Setting up OAuth redirect URIs

3. **Platform-Specific Configuration**
   - **iOS**: Bundle ID, URL schemes, Info.plist entries
   - **Android**: Package name, key hashes, AndroidManifest
   - **Web**: Site URL, App Domains

4. **Supabase Configuration**
   - Enabling Facebook provider
   - Adding App ID and App Secret
   - Configuring redirect URLs:
     - `https://vzwdsjphpabtxhmffous.supabase.co/auth/v1/callback`
     - `12stepstracker://auth/callback`
     - Development URLs
   - Setting requested permissions: `email`, `public_profile`

5. **Environment Setup**
   - Adding `EXPO_PUBLIC_FACEBOOK_APP_ID` to `.env`
   - GitHub Secrets configuration for CI/CD

6. **Testing Instructions**
   - Testing on each platform
   - Verifying profile creation
   - Testing error scenarios

7. **Troubleshooting Guide**
   - Invalid OAuth redirect URI
   - Missing permissions
   - Key hash mismatches (Android)
   - URL scheme issues (iOS)
   - Facebook app review requirements
   - Data deletion callback requirements

#### Updates to Existing Documentation

**CLAUDE.md:**

```markdown
## Authentication

- Supabase Auth (email/password + Google OAuth + Facebook Sign In)
```

**README.md (if applicable):**

- Add Facebook to list of authentication methods

**.github/CICD.md:**

- Document `EXPO_PUBLIC_FACEBOOK_APP_ID` requirement for CI builds

## Security Considerations

1. **App Secret**: Never expose in client code - only used server-side in Supabase
2. **Token Handling**: Facebook tokens exchanged with Supabase immediately
3. **Permissions**: Only request minimum required (`email`, `public_profile`)
4. **Redirect URIs**: Whitelist only authorized redirect URIs in Facebook App settings
5. **Session Management**: Leverage existing Supabase session handling

## Platform-Specific Considerations

### iOS

- Facebook SDK auto-configures URL schemes via plugin
- Handles Facebook app handoff if installed
- Falls back to browser if Facebook app not installed

### Android

- Key hashes must be configured in Facebook Developer Console
- Separate hashes for debug and release builds
- Facebook App ID added to AndroidManifest by plugin

### Web

- Standard OAuth flow via browser popup/redirect
- No Facebook SDK dependency needed
- Simpler than native implementation

## Dependencies

### New

- `expo-facebook`: ^13.0.0 (Facebook SDK for Expo/React Native)

### Existing (Already Installed)

- `@supabase/supabase-js`: Supabase client with OAuth support
- `expo-web-browser`: For web-based authentication flows
- `expo-auth-session`: For deep linking and redirect URIs

## Implementation Phases

### Phase 1: Setup & Configuration (Developer/DevOps)

- Facebook Developer account and app creation
- Platform configuration (iOS, Android, Web)
- Supabase provider setup
- Environment variable configuration
- **Owner**: Developer (self-service with documentation)

### Phase 2: Code Implementation (This Design)

- Install `expo-facebook` dependency
- Implement `signInWithFacebook` in AuthContext
- Add Facebook buttons to login/signup screens
- Update type definitions
- Configure `app.json`
- **Owner**: Frontend Developer
- **Approach**: TDD with tests alongside implementation

### Phase 3: Documentation

- Create `FACEBOOK_SIGNIN_SETUP.md`
- Update existing documentation
- **Owner**: Developer (part of implementation)

### Phase 4: Testing & QA

- Unit tests (TDD - completed in Phase 2)
- Integration tests
- Manual testing on all platforms
- E2E tests (optional)
- **Owner**: Developer/QA

## Timeline Estimate

- **Dependency Installation**: 15 minutes
- **AuthContext Implementation**: 2-3 hours (with TDD tests)
- **UI Implementation**: 1-2 hours
- **Configuration Files**: 30 minutes
- **Documentation**: 2-3 hours
- **Manual Testing**: 2-3 hours (across platforms)

**Total**: 8-12 hours for full implementation

## Success Criteria

- [ ] Users can sign in with Facebook on iOS, Android, and Web
- [ ] New Facebook users automatically get profiles created
- [ ] Deep linking works correctly for native mobile apps
- [ ] UI matches existing OAuth button design and Facebook brand guidelines
- [ ] Documentation is complete and accurate
- [ ] Tests achieve 80%+ coverage
- [ ] Proper permissions requested (email, public_profile)
- [ ] Error handling covers all edge cases

## Risks & Mitigations

| Risk                                               | Impact | Mitigation                                             |
| -------------------------------------------------- | ------ | ------------------------------------------------------ |
| Facebook SDK configuration complexity              | Medium | Detailed documentation and use of expo-facebook plugin |
| Platform-specific issues (key hashes, URL schemes) | Medium | Comprehensive troubleshooting guide                    |
| User permission denial                             | Low    | Graceful handling and clear messaging                  |
| Token exchange failures                            | Medium | Robust error handling and logging                      |
| Facebook API changes                               | Low    | Pin expo-facebook version, monitor updates             |

## Future Enhancements

- Facebook Analytics integration
- Facebook Graph API for additional user data
- Facebook App Review for advanced permissions (if needed)
- Facebook app events tracking

## References

- [Facebook Login for Apps](https://developers.facebook.com/docs/facebook-login/)
- [Expo Facebook SDK Docs](https://docs.expo.dev/versions/latest/sdk/facebook/)
- [Supabase Facebook OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-facebook)
- [Facebook Brand Guidelines](https://about.meta.com/brand/resources/facebookapp/guidelines/)
- Existing implementation: Google OAuth in `contexts/AuthContext.tsx:119-173`
