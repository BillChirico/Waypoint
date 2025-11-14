# 12-Step Tracker

[![CI](https://github.com/billchirico/12-step-tracker/workflows/CI/badge.svg)](https://github.com/billchirico/12-step-tracker/actions)
[![Coverage](https://codecov.io/gh/billchirico/12-step-tracker/branch/main/graph/badge.svg)](https://codecov.io/gh/billchirico/12-step-tracker)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A React Native mobile application for tracking AA recovery progress and facilitating sponsor-sponsee relationships through the 12-step program.

## Overview

12-Step Tracker helps individuals in recovery stay connected with their sponsors, track progress through the 12 steps, complete assigned tasks, and maintain accountability in their recovery journey. The app provides a secure, private platform for sponsors and sponsees to work together through the recovery process.

## Features

- **Sponsor-Sponsee Relationships**: Connect sponsors with sponsees through invite codes
- **Task Management**: Sponsors can assign step-based tasks to sponsees with due dates and tracking
- **Progress Tracking**: Monitor completion of steps and tasks with visual progress indicators
- **Direct Messaging**: Private, secure communication between sponsors and sponsees
- **Step Content**: Access to 12-step program content and reflection prompts
- **Sobriety Tracking**: Track sobriety dates and recovery milestones
- **Relapse Support**: Private relapse tracking and recovery restart functionality
- **Cross-Platform**: Runs on iOS, Android, and web with native performance
- **Secure Authentication**: Multiple sign-in options
  - Email/password authentication
  - Google OAuth (configured)
  - Facebook Sign In (configured)
  - Apple Sign In (planned)
- **Theme Support**: Light and dark mode with system preference detection
- **Error Tracking**: Production error monitoring with Sentry (privacy-first data scrubbing)

## Tech Stack

- **Framework**: Expo 54 with React Native 0.82.1 and React 19
- **Router**: Expo Router v6 (file-based routing with typed routes)
- **Backend**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth with multiple providers
  - Email/password
  - Google OAuth (see [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md))
  - Facebook Sign In (see [FACEBOOK_SIGNIN_SETUP.md](FACEBOOK_SIGNIN_SETUP.md))
  - Apple Sign In (planned, design in `docs/plans/`)
- **Storage**: expo-secure-store (native) / localStorage (web)
- **Language**: TypeScript with strict mode
- **Icons**: lucide-react-native
- **Error Tracking**: Sentry for production error monitoring
- **Testing**: Jest, React Native Testing Library, MSW, Maestro (E2E)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v22 or later recommended)
- **pnpm** (latest version)
- **Expo CLI**: Installed via `npx` or globally
- **For iOS Development** (macOS only):
  - Xcode (latest version)
  - iOS Simulator
  - CocoaPods
- **For Android Development**:
  - Android Studio
  - Android SDK (API 33 or later)
  - Android Emulator or physical device

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/billchirico/12-step-tracker.git
cd 12-step-tracker
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the project root with your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
EXPO_PUBLIC_FACEBOOK_APP_ID=<your-facebook-app-id>  # Optional, for Facebook Sign In
```

### 4. Set Up Supabase

The database schema is located in `supabase/migrations/`. You'll need to:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the migrations in your Supabase project
3. Configure Row Level Security (RLS) policies as defined in the migrations

### 5. Start Development Server

```bash
pnpm dev
```

Starts the Expo development server with telemetry disabled. Scan the QR code with Expo Go app or use a simulator.

## Development Commands

### Running the App

```bash
# Start development server
pnpm dev

# Run on iOS Simulator (macOS only)
pnpm ios

# Run on Android Emulator
pnpm android

# Run on web
pnpm web
```

### Code Quality

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Format code
pnpm format

# Check formatting
pnpm format:check
```

### Building

```bash
# Build for web
pnpm build:web

# Build for Android (EAS)
eas build --platform android --profile preview

# Build for iOS (EAS)
eas build --platform ios --profile preview
```

## Testing

The project uses comprehensive testing with unit tests, integration tests, and E2E tests. See [docs/TESTING.md](docs/TESTING.md) for detailed testing guide and best practices.

### Quick Start

```bash
# Run all tests
pnpm test

# Run tests in watch mode (for development)
pnpm test:watch

# Run tests with coverage report
pnpm test -- --coverage

# Run E2E tests with Maestro
pnpm maestro
```

### Test Structure

- **Unit Tests**: Jest + React Native Testing Library
- **Integration Tests**: Multi-component and flow testing
- **E2E Tests**: Maestro flows for critical user journeys
- **Coverage**: 80% minimum enforced in CI

### Coverage Requirements

The project enforces **80% minimum code coverage**:

- Statements: 80%
- Branches: 80%
- Functions: 80%
- Lines: 80%

Coverage is tracked in CI and reported to [Codecov](https://codecov.io).

## Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) for Git hooks with [lint-staged](https://github.com/lint-staged/lint-staged) to ensure code quality before commits.

**Pre-commit Hook**: Automatically runs on every commit to:

- Format code: Prettier auto-formats **all** staged files
- Lint and fix: ESLint auto-fixes staged JavaScript/TypeScript files
- Auto-stage: Fixed files are automatically added back to staging

The hooks run only on **staged files**, keeping commits fast (typically <1 second).

**Note**: Pre-commit hooks do NOT run TypeScript type checking (too slow). Run `pnpm typecheck` manually before pushing, or let CI catch type errors.

## CI/CD Pipeline

This project uses GitHub Actions for automated testing and multi-platform builds.

### Workflow Overview

The CI pipeline runs on every push to `main`/`develop` and on all pull requests:

1. **Lint, Format, and Type Check** - Validates code quality, formatting, and TypeScript types
2. **Unit Tests** - Runs test suite with coverage reporting
3. **Build for Web** - Creates production web build
4. **Build for Android** - Triggers EAS build for Android (preview profile)
5. **Build for iOS** - Triggers EAS build for iOS (preview profile)

### Key Features

- **Concurrency Control**: Automatically cancels outdated workflow runs when new commits are pushed
- **Dependency Caching**: Uses pnpm cache for faster builds
- **Parallel Builds**: All three platforms build simultaneously
- **EAS Integration**: Mobile builds run on EAS infrastructure (not GitHub runners)
- **Build Artifacts**: Web builds stored as GitHub artifacts for 7 days
- **Coverage Reporting**: Test coverage uploaded to Codecov

### Claude Code Review

Pull requests automatically trigger an AI-powered code review workflow that:

- Updates in real-time with a sticky comment tracking review progress
- Cancels outdated reviews when new commits are pushed
- Provides comprehensive analysis of TypeScript types, ESLint rules, and Prettier formatting
- Detects common issues like `any` types, console.logs, and TODO comments

### Required GitHub Secrets

Configure these in repository settings (Settings → Secrets and variables → Actions):

| Secret Name                     | Description                      | How to Get It                                                                                         |
| ------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`      | Your Supabase project URL        | From your Supabase project settings                                                                   |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key      | From your Supabase project API settings                                                               |
| `EXPO_TOKEN`                    | Expo access token for EAS builds | Run `eas login && eas whoami` or create at https://expo.dev/accounts/[account]/settings/access-tokens |
| `CODECOV_TOKEN`                 | Codecov upload token             | From https://codecov.io (optional, for private repos)                                                 |

### Monitoring Builds

**GitHub Actions**: Repository → Actions tab (view workflow runs, download web artifacts)

**EAS Mobile Builds**: https://expo.dev/accounts/[account]/projects/12-step-tracker/builds

Mobile builds are triggered by CI but complete asynchronously on EAS infrastructure. Check the Expo dashboard for build status, logs, and to download APK/IPA files.

## Error Tracking

This project uses [Sentry](https://sentry.io) for production error monitoring and crash reporting.

### Features

- **Privacy-first**: Automatically scrubs sensitive recovery data (messages, sobriety dates, personal information)
- **Production-only**: Sentry is disabled in development to avoid noise
- **Full observability**: Error tracking, performance monitoring, and crash reporting
- **Source maps**: Automatic upload via EAS builds for readable stack traces
- **User context**: Tracks user ID and role for better debugging (no PII)

### Setup

See [docs/SENTRY_SETUP.md](docs/SENTRY_SETUP.md) for complete setup instructions including:

- Creating a Sentry account and project
- Configuring environment variables
- Setting up EAS secrets
- Configuring GitHub Actions

### Environment Variables

For production builds:

```env
EXPO_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
SENTRY_ORG=<your-sentry-org>
SENTRY_PROJECT=<your-sentry-project>
SENTRY_AUTH_TOKEN=<your-sentry-auth-token>
```

## Project Structure

```
12-Step-Tracker/
├── app/                    # Expo Router file-based routing
│   ├── (tabs)/            # Tab-based navigation (main app)
│   ├── _layout.tsx        # Root layout with auth navigation
│   ├── login.tsx          # Login screen
│   ├── signup.tsx         # Sign up screen
│   └── onboarding.tsx     # Role selection for new users
├── components/            # Reusable React components
├── contexts/              # React Context providers
│   ├── AuthContext.tsx    # Authentication state and methods
│   └── ThemeContext.tsx   # Theme management (light/dark)
├── lib/                   # Utility libraries
│   └── supabase.ts        # Supabase client configuration
├── types/                 # TypeScript type definitions
│   └── database.ts        # Database schema types
├── supabase/              # Supabase migrations and config
│   └── migrations/        # Database schema migrations
├── __tests__/             # Test files
├── test-utils/             # Testing utilities and fixtures
└── assets/                # Images, fonts, and other static files
```

## Authentication Flow

The app enforces a strict navigation flow:

1. **Unauthenticated users** → `/login`
2. **Authenticated but no profile** → `/onboarding`
3. **Authenticated with incomplete profile** → `/onboarding`
4. **Fully set up users** → `/(tabs)` (main app)

## OAuth and Social Sign In Setup

The app supports multiple authentication providers beyond email/password:

### Google OAuth

Google Sign-In is integrated but requires additional configuration. See [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) for detailed setup instructions including:

- Google Cloud Console configuration
- Supabase provider setup
- OAuth redirect URIs
- Mobile deep linking configuration

### Facebook Sign In

Facebook Sign In is integrated but requires additional configuration. See [FACEBOOK_SIGNIN_SETUP.md](FACEBOOK_SIGNIN_SETUP.md) for detailed setup instructions including:

- Facebook App creation and configuration
- Supabase provider setup
- Native app configuration (iOS/Android)
- Environment variable setup

### Apple Sign In

Apple Sign In design is complete and implementation is planned. See `docs/plans/2025-11-12-apple-signin-design.md` for the implementation plan.

**App Details**:

- Bundle ID (iOS): `com.billchirico.12steptracker`
- Package name (Android): `com.billchirico.twelvesteptracker`
- Deep link scheme: `12stepstracker://`

## EAS Build

This project is configured for Expo Application Services (EAS) builds:

```bash
# Development build
eas build --profile development --platform [ios|android]

# Preview build (used by CI/CD)
eas build --profile preview --platform [ios|android]

# Production build
eas build --profile production --platform [ios|android]

# Build for both platforms
eas build --profile preview --platform all
```

**EAS Project ID**: `4652ad8b-2e44-4270-8612-64c4587219d8`

### Build Profiles

The project includes three build profiles configured in `eas.json`:

- **development**: Development client with internal distribution for testing
- **preview**: Internal distribution for CI/CD and QA testing (uses Release configuration)
- **production**: Production builds with auto-increment version numbers

## Database Schema

The database includes the following main tables:

- **profiles**: User information, roles, sobriety dates, preferences
- **sponsor_sponsee_relationships**: Sponsor-sponsee connections
- **tasks**: Step-based assignments
- **messages**: Direct messaging
- **steps_content**: 12-step program content
- **notifications**: In-app notifications
- **invite_codes**: Sponsor invitation system
- **relapses**: Private relapse tracking

All tables are secured with Row Level Security (RLS) policies ensuring proper data access control.

## Contributing

This is a private project for recovery support. If you're contributing, please ensure:

- All code passes TypeScript type checking (`pnpm typecheck`)
- Code follows the linting rules (`pnpm lint`)
- Code is properly formatted (`pnpm format:check` or run `pnpm format`)
- Test thoroughly on both iOS and Android platforms
- Respect user privacy and data security
- Write tests for new features (80% coverage minimum)

## Additional Documentation

- **[CLAUDE.md](CLAUDE.md)** - Detailed project architecture, MCP server usage, and code patterns
- **[GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)** - Google OAuth configuration guide
- **[FACEBOOK_SIGNIN_SETUP.md](FACEBOOK_SIGNIN_SETUP.md)** - Facebook Sign In configuration guide
- **[docs/TESTING.md](docs/TESTING.md)** - Comprehensive testing guide and best practices
- **[docs/README.md](docs/README.md)** - User guides and developer documentation
- **[.github/CICD.md](.github/CICD.md)** - Comprehensive CI/CD documentation
- **[.github/GIT_HOOKS.md](.github/GIT_HOOKS.md)** - Git hooks setup and troubleshooting guide
- **[docs/SENTRY_SETUP.md](docs/SENTRY_SETUP.md)** - Sentry error tracking setup guide
- **`supabase/migrations/`** - Database schema and RLS policies
- **`docs/plans/`** - Design documents for features (including Apple Sign In)

## License

Private and confidential. All rights reserved.
