# Testing Strategy for 12-Step-Tracker

## Executive Summary

This document outlines the comprehensive testing strategy for the 12-Step-Tracker application, a React Native/Expo TypeScript application. The strategy follows industry best practices and utilizes the latest testing tools as of 2024-2025.

## 1. Testing Philosophy

### Core Principles
- **Test Behavior, Not Implementation**: Focus on what the user sees and does
- **Maintain Independence**: Tests should not depend on each other
- **Fast and Reliable**: Tests should run quickly and produce consistent results
- **Comprehensive Coverage**: Aim for 80%+ code coverage while focusing on critical paths
- **Accessibility First**: Ensure components are accessible and testable

### Testing Pyramid
```
    /\
   /E2E\      (Small number - critical user flows)
  /------\
 /Integration\  (Medium number - component interactions)
/------------\
/   Unit      \  (Large number - individual functions/components)
```

## 2. Testing Stack

### Core Testing Tools

#### 2.1 Jest (v29.7+)
- **Purpose**: Test runner and assertion library
- **Why**: Industry standard, excellent React Native support, built into Expo
- **Features**:
  - Snapshot testing
  - Code coverage reports
  - Parallel test execution
  - Watch mode for development
  - Built-in mocking capabilities

#### 2.2 React Native Testing Library (v12.4+)
- **Purpose**: Component testing utilities
- **Why**: Encourages accessible, user-centric testing patterns
- **Features**:
  - Queries that mirror user behavior
  - Async utilities for handling state updates
  - Fire events to simulate user interactions
  - Accessibility testing support

#### 2.3 @testing-library/react-hooks (v8.0+)
- **Purpose**: Testing custom React hooks in isolation
- **Why**: Enables testing hook logic independently from components
- **Note**: For React 18+, consider using `renderHook` from @testing-library/react

#### 2.4 @testing-library/jest-native (v5.4+)
- **Purpose**: Additional Jest matchers for React Native
- **Features**:
  - `toBeVisible()`, `toBeEnabled()`, `toHaveTextContent()`
  - Style and prop assertions
  - Accessibility matchers

#### 2.5 jest-expo (v51.0+)
- **Purpose**: Expo preset for Jest
- **Why**: Preconfigured for Expo SDK, handles platform-specific modules
- **Features**:
  - Auto-mocking of Expo modules
  - Platform-specific test configuration
  - Asset transformer support

#### 2.6 ts-jest (v29.1+)
- **Purpose**: TypeScript support for Jest
- **Why**: Native TypeScript compilation in tests
- **Features**:
  - Source maps for debugging
  - Type checking in tests
  - Fast incremental builds

### Mocking & Testing Utilities

#### 2.7 MSW (Mock Service Worker) - Optional for API Testing
- **Purpose**: Mock HTTP requests at the network level
- **Why**: More realistic than mocking fetch/axios
- **Use Case**: Testing Supabase API interactions

#### 2.8 @testing-library/user-event (v14.5+)
- **Purpose**: Advanced user interaction simulation
- **Why**: More realistic user events than fireEvent

## 3. Test Coverage Areas

### 3.1 Unit Tests (Priority: HIGH)

#### Context Providers
- **AuthContext** (`contexts/AuthContext.tsx`)
  - User authentication flow
  - Session management
  - Profile fetching and creation
  - Sign in/sign up/sign out
  - Google OAuth flow
  - Error handling

- **ThemeContext** (`contexts/ThemeContext.tsx`)
  - Theme switching (light/dark/system)
  - Theme persistence
  - Color scheme provision
  - System preference detection

#### Custom Hooks
- **useFrameworkReady** (`hooks/useFrameworkReady.ts`)
  - Framework initialization
  - Window callback execution

#### Utility Functions
- **Supabase Client** (`lib/supabase.ts`)
  - Storage adapter (platform-specific)
  - Client initialization
  - Session persistence

### 3.2 Component Tests (Priority: MEDIUM)

#### UI Components
- **TaskCreationModal** (`components/TaskCreationModal.tsx`)
  - Modal open/close
  - Form validation
  - Task creation flow
  - Error states

- **AnimatedBottomNav** (`components/AnimatedBottomNav.tsx`)
  - Navigation rendering
  - Tab switching
  - Animations
  - Active state

### 3.3 Integration Tests (Priority: MEDIUM)

#### Authentication Flow
- Complete sign-up process
- Login with email/password
- Google OAuth integration
- Session persistence
- Profile creation

#### Navigation Flow
- Unauthenticated → Login
- Authenticated without profile → Onboarding
- Complete profile → Main app tabs

### 3.4 E2E Tests (Priority: LOW - Future Enhancement)
- Full user journeys using Detox or Maestro
- Critical path testing
- Platform-specific flows

## 4. Project Structure

```
12-Step-Tracker/
├── __tests__/                    # Test files
│   ├── contexts/
│   │   ├── AuthContext.test.tsx
│   │   └── ThemeContext.test.tsx
│   ├── hooks/
│   │   └── useFrameworkReady.test.ts
│   ├── lib/
│   │   └── supabase.test.ts
│   ├── components/
│   │   ├── TaskCreationModal.test.tsx
│   │   └── AnimatedBottomNav.test.tsx
│   └── integration/
│       ├── auth-flow.test.tsx
│       └── navigation.test.tsx
├── __mocks__/                    # Manual mocks
│   ├── @supabase/
│   │   └── supabase-js.ts
│   ├── expo-secure-store.ts
│   ├── expo-auth-session.ts
│   └── expo-web-browser.ts
├── test-utils/                   # Test utilities
│   ├── test-utils.tsx           # Custom render with providers
│   ├── mock-data.ts             # Mock data generators
│   └── setup.ts                 # Test setup file
└── jest.config.js               # Jest configuration
```

## 5. Configuration

### 5.1 Jest Configuration (`jest.config.js`)

```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@supabase/.*)',
  ],
  setupFilesAfterEnv: ['<rootDir>/test-utils/setup.ts'],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/coverage/**',
    '!**/dist/**',
    '!**/.expo/**',
    '!app.config.js',
    '!metro.config.js',
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.{ts,tsx}',
  ],
};
```

### 5.2 Test Setup File (`test-utils/setup.ts`)

```typescript
import '@testing-library/jest-native/extend-expect';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};

// Mock timers if needed
jest.useFakeTimers();
```

### 5.3 Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
  }
}
```

## 6. Testing Patterns

### 6.1 Component Testing Pattern

```typescript
import { render, screen, fireEvent } from '@testing-library/react-native';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render with default props', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeVisible();
  });

  it('should handle user interaction', () => {
    const onPress = jest.fn();
    render(<MyComponent onPress={onPress} />);
    
    fireEvent.press(screen.getByText('Button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

### 6.2 Context Testing Pattern

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

describe('AuthContext', () => {
  it('should provide auth state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
  });
});
```

### 6.3 Hook Testing Pattern

```typescript
import { renderHook } from '@testing-library/react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

describe('useFrameworkReady', () => {
  it('should call window.frameworkReady', () => {
    const mockFrameworkReady = jest.fn();
    window.frameworkReady = mockFrameworkReady;
    
    renderHook(() => useFrameworkReady());
    
    expect(mockFrameworkReady).toHaveBeenCalled();
  });
});
```

### 6.4 Async Testing Pattern

```typescript
import { render, screen, waitFor } from '@testing-library/react-native';

it('should load data asynchronously', async () => {
  render(<DataComponent />);
  
  expect(screen.getByText('Loading...')).toBeVisible();
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeVisible();
  });
});
```

## 7. Mocking Strategy

### 7.1 Supabase Mocking

```typescript
// __mocks__/@supabase/supabase-js.ts
export const createClient = jest.fn(() => ({
  auth: {
    getSession: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
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

### 7.2 Expo Module Mocking

```typescript
// __mocks__/expo-secure-store.ts
export const getItemAsync = jest.fn();
export const setItemAsync = jest.fn();
export const deleteItemAsync = jest.fn();
```

### 7.3 React Native Mocking

```typescript
// Auto-mocked by jest-expo, but can be customized
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
```

## 8. Continuous Integration

### 8.1 GitHub Actions Workflow

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:ci
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## 9. Best Practices Checklist

### Writing Tests
- [ ] Use descriptive test names (should/when/given format)
- [ ] Follow AAA pattern (Arrange, Act, Assert)
- [ ] Test one thing per test case
- [ ] Use data-testid sparingly (prefer accessible queries)
- [ ] Mock external dependencies
- [ ] Clean up after tests (timers, subscriptions)
- [ ] Use meaningful assertions
- [ ] Test edge cases and error states

### Code Coverage
- [ ] Maintain 80%+ overall coverage
- [ ] Focus on critical paths (auth, data persistence)
- [ ] Don't chase 100% coverage blindly
- [ ] Review coverage reports regularly

### Performance
- [ ] Keep tests fast (<100ms per test ideally)
- [ ] Use beforeEach/afterEach for setup/teardown
- [ ] Avoid unnecessary waits
- [ ] Run tests in parallel when possible

### Maintenance
- [ ] Update tests when refactoring code
- [ ] Remove obsolete tests
- [ ] Keep mock data realistic
- [ ] Document complex test scenarios

## 10. Dependencies

### Production Dependencies (None)
Testing dependencies should be dev-only.

### Development Dependencies

```json
{
  "devDependencies": {
    "@testing-library/jest-native": "^5.4.3",
    "@testing-library/react-native": "^12.4.3",
    "@types/jest": "^29.5.11",
    "jest": "^29.7.0",
    "jest-expo": "^51.0.0",
    "ts-jest": "^29.1.2"
  }
}
```

### Version Compatibility Matrix

| Tool | Version | Expo SDK | React Native | React |
|------|---------|----------|--------------|-------|
| jest-expo | 51.0.0 | 54.x | 0.81.x | 19.x |
| @testing-library/react-native | 12.4.3 | ✓ | 0.81.x | 19.x |
| @testing-library/jest-native | 5.4.3 | ✓ | ✓ | ✓ |
| jest | 29.7.0 | ✓ | ✓ | ✓ |
| ts-jest | 29.1.2 | ✓ | ✓ | ✓ |

## 11. Migration Path

### Phase 1: Foundation (Week 1)
1. Install testing dependencies
2. Configure Jest and TypeScript
3. Create test utilities and mocks
4. Set up CI/CD pipeline

### Phase 2: Core Tests (Week 2-3)
1. Write tests for utility functions
2. Write tests for custom hooks
3. Write tests for context providers

### Phase 3: Component Tests (Week 4)
1. Write tests for simple components
2. Write tests for complex components
3. Write integration tests

### Phase 4: Optimization (Week 5)
1. Improve coverage
2. Refactor slow tests
3. Document testing patterns
4. Team training

## 12. Resources

### Official Documentation
- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Expo Testing Guide](https://docs.expo.dev/develop/unit-testing/)

### Community Resources
- [React Native Testing Best Practices](https://github.com/react-native-community/discussions-and-proposals)
- [Testing TypeScript React Apps](https://www.typescriptlang.org/docs/handbook/react.html)

## 13. Success Metrics

### Quantitative Metrics
- Code coverage: 80%+ overall
- Test execution time: <60 seconds for full suite
- Test reliability: 99%+ pass rate on CI
- Bug detection: Catch 70%+ of bugs before production

### Qualitative Metrics
- Developer confidence in refactoring
- Reduced debugging time
- Faster onboarding for new developers
- Better code design through testability

## 14. Troubleshooting Guide

### Common Issues

#### Transform Errors
**Problem**: `SyntaxError: Unexpected token`
**Solution**: Add package to `transformIgnorePatterns` in jest.config.js

#### Module Not Found
**Problem**: Cannot resolve module '@/...'
**Solution**: Ensure `moduleNameMapper` in jest.config.js matches tsconfig.json paths

#### Async Timeout
**Problem**: Tests timeout on async operations
**Solution**: Use `waitFor` with proper timeout, check mock implementations

#### Platform-Specific Code
**Problem**: Tests fail on web-specific or native-specific code
**Solution**: Use `Platform.OS` checks and conditional mocking

## 15. Future Enhancements

### Short-term (3-6 months)
- Visual regression testing with Chromatic
- Accessibility audit automation
- Performance benchmarking tests

### Long-term (6-12 months)
- E2E testing with Maestro or Detox
- Contract testing for Supabase API
- Load testing for database queries
- Mutation testing with Stryker

## Conclusion

This testing strategy provides a comprehensive, maintainable, and scalable approach to testing the 12-Step-Tracker application. By following industry best practices and using modern tools, we ensure high code quality, reduce bugs, and increase developer productivity.

The strategy is designed to be implemented incrementally, starting with the most critical components and expanding coverage over time. Regular reviews and updates will ensure the testing approach evolves with the application and the testing ecosystem.
