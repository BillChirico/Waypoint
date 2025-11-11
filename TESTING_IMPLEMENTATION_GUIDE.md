# Testing Implementation Guide

## Quick Start

This guide provides step-by-step instructions for implementing the testing infrastructure outlined in `TESTING_STRATEGY.md`.

## Table of Contents

1. [Installation](#1-installation)
2. [Configuration](#2-configuration)
3. [Creating Test Utilities](#3-creating-test-utilities)
4. [Writing Your First Test](#4-writing-your-first-test)
5. [Running Tests](#5-running-tests)
6. [Example Test Files](#6-example-test-files)
7. [Common Patterns](#7-common-patterns)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Installation

### Step 1: Install Testing Dependencies

```bash
npm install --save-dev \
  @testing-library/jest-native@^5.4.3 \
  @testing-library/react-native@^12.4.3 \
  @types/jest@^29.5.11 \
  jest@^29.7.0 \
  jest-expo@^51.0.0 \
  ts-jest@^29.1.2
```

### Step 2: Verify Installation

```bash
npm list jest jest-expo @testing-library/react-native
```

Expected output should show all packages installed without errors.

---

## 2. Configuration

### Step 1: Create Jest Configuration

Create `jest.config.js` in the project root:

```javascript
module.exports = {
  preset: 'jest-expo',
  
  // Transform files with ts-jest for TypeScript support
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
      },
    }],
  },
  
  // Don't transform these node_modules
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@supabase/.*|lucide-react-native)',
  ],
  
  // Setup files to run after Jest is initialized
  setupFilesAfterEnv: ['<rootDir>/test-utils/setup.ts'],
  
  // Coverage collection configuration
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/__mocks__/**',
    '!**/coverage/**',
    '!**/dist/**',
    '!**/.expo/**',
    '!**/test-utils/**',
    '!app.config.js',
    '!metro.config.js',
    '!jest.config.js',
    '!eslint.config.js',
  ],
  
  // Coverage thresholds
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80,
    },
  },
  
  // Module name mapping for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.{ts,tsx}',
  ],
  
  // Test environment
  testEnvironment: 'node',
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
};
```

### Step 2: Update package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand",
    "test:update": "jest --updateSnapshot"
  }
}
```

### Step 3: Update TypeScript Configuration

Ensure `tsconfig.json` includes test files:

```json
{
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts",
    "nativewind-env.d.ts",
    "__tests__/**/*.ts",
    "__tests__/**/*.tsx"
  ]
}
```

---

## 3. Creating Test Utilities

### Step 1: Create Test Utils Directory

```bash
mkdir -p test-utils __tests__ __mocks__
```

### Step 2: Create Test Setup File

Create `test-utils/setup.ts`:

```typescript
import '@testing-library/jest-native/extend-expect';

// Silence console errors and warnings in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

// Mock React Native's Animated API
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Set up fake timers
jest.useFakeTimers();
```

### Step 3: Create Custom Render Utility

Create `test-utils/test-utils.tsx`:

```typescript
import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

interface AllProvidersProps {
  children: React.ReactNode;
}

const AllProviders: React.FC<AllProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

// Re-export everything
export * from '@testing-library/react-native';

// Override render method
export { customRender as render };
```

### Step 4: Create Mock Data

Create `test-utils/mock-data.ts`:

```typescript
import { User, Session } from '@supabase/supabase-js';
import { Profile, UserRole } from '@/types/database';

export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {
    full_name: 'Test User',
  },
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
};

export const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
};

export const mockProfile: Profile = {
  id: 'test-user-id',
  email: 'test@example.com',
  first_name: 'Test',
  last_initial: 'U',
  role: 'sponsee' as UserRole,
  sobriety_date: '2024-01-01',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  notification_preferences: {
    email_notifications: true,
    push_notifications: true,
  },
};

export const mockSponsorProfile: Profile = {
  ...mockProfile,
  id: 'sponsor-id',
  email: 'sponsor@example.com',
  first_name: 'Sponsor',
  last_initial: 'S',
  role: 'sponsor' as UserRole,
};
```

### Step 5: Create Supabase Mock

Create `__mocks__/@supabase/supabase-js.ts`:

```typescript
export const createClient = jest.fn(() => ({
  auth: {
    getSession: jest.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: {
        subscription: {
          unsubscribe: jest.fn(),
        },
      },
    })),
    signInWithOAuth: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
  })),
}));
```

### Step 6: Create Expo Module Mocks

Create `__mocks__/expo-secure-store.ts`:

```typescript
export const getItemAsync = jest.fn();
export const setItemAsync = jest.fn();
export const deleteItemAsync = jest.fn();
```

Create `__mocks__/expo-auth-session.ts`:

```typescript
export const makeRedirectUri = jest.fn(() => 'http://localhost');
export const useAuthRequest = jest.fn();
export const AuthSessionResult = {};
```

Create `__mocks__/expo-web-browser.ts`:

```typescript
export const maybeCompleteAuthSession = jest.fn();
export const openBrowserAsync = jest.fn();
```

---

## 4. Writing Your First Test

### Example: Testing a Simple Hook

Create `__tests__/hooks/useFrameworkReady.test.ts`:

```typescript
import { renderHook } from '@testing-library/react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

describe('useFrameworkReady', () => {
  beforeEach(() => {
    // Clear any previous mock calls
    jest.clearAllMocks();
  });

  it('should call window.frameworkReady when it exists', () => {
    // Arrange
    const mockFrameworkReady = jest.fn();
    window.frameworkReady = mockFrameworkReady;

    // Act
    renderHook(() => useFrameworkReady());

    // Assert
    expect(mockFrameworkReady).toHaveBeenCalled();
  });

  it('should not throw when window.frameworkReady is undefined', () => {
    // Arrange
    delete window.frameworkReady;

    // Act & Assert
    expect(() => {
      renderHook(() => useFrameworkReady());
    }).not.toThrow();
  });
});
```

### Run Your First Test

```bash
npm test -- useFrameworkReady
```

---

## 5. Running Tests

### Run All Tests
```bash
npm test
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

Coverage report will be in `coverage/lcov-report/index.html`

### Run Specific Test File
```bash
npm test -- AuthContext
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="should sign in"
```

### Debug Tests
```bash
npm run test:debug
```

Then open `chrome://inspect` in Chrome and click "inspect"

---

## 6. Example Test Files

### Example 1: Testing Supabase Adapter

Create `__tests__/lib/supabase.test.ts`:

```typescript
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Mock expo-secure-store
jest.mock('expo-secure-store');

describe('Supabase Storage Adapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getItem', () => {
    it('should use localStorage on web platform', async () => {
      Platform.OS = 'web';
      const mockGetItem = jest.fn(() => 'test-value');
      Storage.prototype.getItem = mockGetItem;

      const { supabase } = require('@/lib/supabase');
      
      // Test would require accessing the adapter, 
      // which is internal to the client
      // This is a simplified example
    });

    it('should use SecureStore on native platforms', async () => {
      Platform.OS = 'ios';
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('test-value');

      const { supabase } = require('@/lib/supabase');
      
      // Test adapter usage
    });
  });
});
```

### Example 2: Testing Context Provider

Create `__tests__/contexts/ThemeContext.test.tsx`:

```typescript
import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide default theme', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBeDefined();
    expect(result.current.isDark).toBeDefined();
  });

  it('should toggle theme mode', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    const initialMode = result.current.theme;

    await act(async () => {
      // Assuming there's a toggleTheme or setThemeMode function
      // result.current.setThemeMode('dark');
    });

    // Assert theme changed
  });
});
```

### Example 3: Testing Component

Create `__tests__/components/TaskCreationModal.test.tsx`:

```typescript
import React from 'react';
import { render, fireEvent, screen } from '../test-utils/test-utils';
import { TaskCreationModal } from '@/components/TaskCreationModal';

describe('TaskCreationModal', () => {
  const mockOnClose = jest.fn();
  const mockOnCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when visible', () => {
    render(
      <TaskCreationModal
        visible={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
      />
    );

    // Use accessible queries when possible
    expect(screen.getByText(/create task/i)).toBeVisible();
  });

  it('should not render when not visible', () => {
    render(
      <TaskCreationModal
        visible={false}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
      />
    );

    expect(screen.queryByText(/create task/i)).toBeNull();
  });

  it('should call onClose when cancel is pressed', () => {
    render(
      <TaskCreationModal
        visible={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
      />
    );

    fireEvent.press(screen.getByText(/cancel/i));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onCreate with form data when submitted', () => {
    render(
      <TaskCreationModal
        visible={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
      />
    );

    // Fill in form fields
    fireEvent.changeText(
      screen.getByPlaceholderText(/task title/i),
      'Complete Step 1'
    );

    fireEvent.press(screen.getByText(/create/i));

    expect(mockOnCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Complete Step 1',
      })
    );
  });
});
```

---

## 7. Common Patterns

### Pattern 1: Mocking Async Operations

```typescript
it('should handle async data fetching', async () => {
  const mockData = { id: 1, name: 'Test' };
  
  (supabase.from as jest.Mock).mockReturnValue({
    select: jest.fn().mockResolvedValue({
      data: mockData,
      error: null,
    }),
  });

  const { result, waitForNextUpdate } = renderHook(() => useData());

  await waitForNextUpdate();

  expect(result.current.data).toEqual(mockData);
});
```

### Pattern 2: Testing Error States

```typescript
it('should handle errors gracefully', async () => {
  const mockError = new Error('Network error');
  
  (supabase.from as jest.Mock).mockReturnValue({
    select: jest.fn().mockRejectedValue(mockError),
  });

  const { result, waitForNextUpdate } = renderHook(() => useData());

  await waitForNextUpdate();

  expect(result.current.error).toEqual(mockError);
  expect(result.current.data).toBeNull();
});
```

### Pattern 3: Testing User Interactions

```typescript
it('should update state on user input', () => {
  const { getByTestId } = render(<LoginForm />);
  
  const emailInput = getByTestId('email-input');
  
  fireEvent.changeText(emailInput, 'test@example.com');
  
  expect(emailInput.props.value).toBe('test@example.com');
});
```

### Pattern 4: Testing Navigation

```typescript
import { useRouter } from 'expo-router';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

it('should navigate to home on success', () => {
  const mockPush = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

  const { getByText } = render(<LoginScreen />);
  
  fireEvent.press(getByText('Login'));

  expect(mockPush).toHaveBeenCalledWith('/(tabs)');
});
```

---

## 8. Troubleshooting

### Issue: Transform Errors

**Error**: `SyntaxError: Unexpected token`

**Solution**: Add the problematic package to `transformIgnorePatterns`:

```javascript
transformIgnorePatterns: [
  'node_modules/(?!(your-package-name|other-packages)/)',
]
```

### Issue: Module Resolution

**Error**: `Cannot find module '@/...'`

**Solution**: Verify `moduleNameMapper` in jest.config.js:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
}
```

### Issue: Async Timeout

**Error**: `Timeout - Async callback was not invoked`

**Solution**: Use proper async utilities:

```typescript
// Bad
setTimeout(() => expect(value).toBe(true), 1000);

// Good
await waitFor(() => {
  expect(value).toBe(true);
}, { timeout: 2000 });
```

### Issue: Mock Not Working

**Problem**: Mock is not being applied

**Solution**: 
1. Check mock path matches actual module path
2. Clear jest cache: `npx jest --clearCache`
3. Ensure mock is hoisted: use `jest.mock()` at top of file

### Issue: React 19 Warnings

**Error**: Warnings about act() or async updates

**Solution**: Wrap state updates in `act()`:

```typescript
import { act } from '@testing-library/react-native';

await act(async () => {
  // Your async code here
});
```

### Issue: Platform-Specific Code

**Problem**: Tests fail for platform-specific logic

**Solution**: Mock Platform.OS:

```typescript
import { Platform } from 'react-native';

beforeEach(() => {
  Platform.OS = 'ios'; // or 'android' or 'web'
});
```

---

## Next Steps

1. **Install dependencies** following Section 1
2. **Set up configuration** following Section 2
3. **Create test utilities** following Section 3
4. **Write your first test** following Section 4
5. **Review example tests** in Section 6
6. **Run tests** and verify setup

For comprehensive testing strategy and patterns, refer to `TESTING_STRATEGY.md`.

For questions or issues, consult the troubleshooting section or reach out to the team.

Happy Testing! 🎉
