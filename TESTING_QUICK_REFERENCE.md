# Testing Quick Reference

A cheat sheet for writing tests in the 12-Step-Tracker project.

## Running Tests

```bash
# Run all tests
npm test

# Watch mode (re-run on changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Run specific test file
npm test -- AuthContext

# Run tests matching pattern
npm test -- --testNamePattern="should sign in"

# Update snapshots
npm run test:update

# Debug tests
npm run test:debug
```

## Test File Structure

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  beforeEach(() => {
    // Setup before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup after each test
    jest.clearAllTimers();
  });

  it('should do something', () => {
    // Arrange
    const mockFn = jest.fn();
    
    // Act
    render(<MyComponent onPress={mockFn} />);
    fireEvent.press(screen.getByText('Button'));
    
    // Assert
    expect(mockFn).toHaveBeenCalled();
  });
});
```

## Common Queries

```typescript
// ✅ Preferred - Accessible to all users
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Email')
screen.getByPlaceholderText('Enter email')
screen.getByText('Welcome')

// ⚠️ Use sparingly - Last resort
screen.getByTestId('custom-element')

// Query variants
getBy...    // Throws if not found
queryBy...  // Returns null if not found
findBy...   // Async, waits for element (returns Promise)

// Multiple elements
getAllBy...
queryAllBy...
findAllBy...
```

## Common Matchers

```typescript
// Jest matchers
expect(value).toBe(5);
expect(value).toEqual({ name: 'Test' });
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith('arg');
expect(fn).toHaveBeenCalledTimes(2);
expect(array).toContain('item');
expect(value).toBeDefined();
expect(value).toBeNull();
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// React Native Testing Library matchers
expect(element).toBeVisible();
expect(element).toBeEnabled();
expect(element).toBeDisabled();
expect(element).toHaveTextContent('text');
expect(element).toHaveStyle({ color: 'red' });
```

## Mocking

### Mock Functions

```typescript
// Create mock
const mockFn = jest.fn();

// Mock implementation
const mockFn = jest.fn(() => 'return value');

// Mock resolved value (async)
const mockFn = jest.fn().mockResolvedValue({ data: 'test' });

// Mock rejected value (async)
const mockFn = jest.fn().mockRejectedValue(new Error('Failed'));

// Check calls
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn.mock.calls.length).toBe(2);
```

### Mock Modules

```typescript
// Mock entire module
jest.mock('@/lib/supabase');

// Mock with implementation
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signIn: jest.fn(),
    },
  },
}));

// Mock module in specific test
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// Access mock
import { useRouter } from 'expo-router';
(useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
```

### Mock Supabase

```typescript
import { supabase } from '@/lib/supabase';

// Mock successful query
(supabase.from as jest.Mock).mockReturnValue({
  select: jest.fn().mockResolvedValue({
    data: [{ id: 1, name: 'Test' }],
    error: null,
  }),
});

// Mock error
(supabase.from as jest.Mock).mockReturnValue({
  select: jest.fn().mockResolvedValue({
    data: null,
    error: new Error('Database error'),
  }),
});

// Mock auth
(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
  data: { user: mockUser, session: mockSession },
  error: null,
});
```

## Async Testing

```typescript
// Wait for element to appear
const element = await screen.findByText('Loaded');

// Wait for specific condition
await waitFor(() => {
  expect(screen.getByText('Success')).toBeVisible();
});

// Wait with options
await waitFor(() => {
  expect(screen.getByText('Success')).toBeVisible();
}, { timeout: 3000 });

// Test async hook
const { result, waitForNextUpdate } = renderHook(() => useMyHook());
await waitForNextUpdate();
expect(result.current.data).toBeDefined();
```

## User Events

```typescript
// Press button
fireEvent.press(screen.getByText('Submit'));

// Change text input
fireEvent.changeText(
  screen.getByPlaceholderText('Email'),
  'test@example.com'
);

// Scroll
fireEvent.scroll(scrollView, {
  nativeEvent: {
    contentOffset: { y: 100 },
  },
});

// Focus/Blur
fireEvent.focus(input);
fireEvent.blur(input);
```

## Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react-native';

describe('useMyHook', () => {
  it('should update state', () => {
    const { result } = renderHook(() => useMyHook());
    
    act(() => {
      result.current.updateValue('new value');
    });
    
    expect(result.current.value).toBe('new value');
  });

  it('should work with context', () => {
    const wrapper = ({ children }) => (
      <MyProvider>{children}</MyProvider>
    );
    
    const { result } = renderHook(() => useMyHook(), { wrapper });
    
    expect(result.current).toBeDefined();
  });
});
```

## Testing Components with Context

```typescript
// Use custom render from test-utils
import { render } from '@/test-utils/test-utils';

it('should render with providers', () => {
  render(<MyComponent />);
  // AuthProvider and ThemeProvider are automatically wrapped
});

// Or create custom wrapper
const wrapper = ({ children }) => (
  <AuthProvider>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </AuthProvider>
);

render(<MyComponent />, { wrapper });
```

## Common Patterns

### Test Component Rendering

```typescript
it('should render correctly', () => {
  render(<MyComponent title="Test" />);
  expect(screen.getByText('Test')).toBeVisible();
});
```

### Test Button Click

```typescript
it('should call handler on click', () => {
  const onPress = jest.fn();
  render(<Button onPress={onPress} />);
  
  fireEvent.press(screen.getByText('Click me'));
  
  expect(onPress).toHaveBeenCalledTimes(1);
});
```

### Test Form Submission

```typescript
it('should submit form data', () => {
  const onSubmit = jest.fn();
  render(<LoginForm onSubmit={onSubmit} />);
  
  fireEvent.changeText(
    screen.getByPlaceholderText('Email'),
    'test@example.com'
  );
  fireEvent.changeText(
    screen.getByPlaceholderText('Password'),
    'password123'
  );
  fireEvent.press(screen.getByText('Login'));
  
  expect(onSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123',
  });
});
```

### Test Error State

```typescript
it('should display error message', async () => {
  (supabase.auth.signIn as jest.Mock).mockRejectedValue(
    new Error('Invalid credentials')
  );
  
  render(<LoginForm />);
  fireEvent.press(screen.getByText('Login'));
  
  await waitFor(() => {
    expect(screen.getByText('Invalid credentials')).toBeVisible();
  });
});
```

### Test Loading State

```typescript
it('should show loading indicator', () => {
  render(<DataComponent />);
  expect(screen.getByTestId('loading-spinner')).toBeVisible();
});

it('should hide loading after data loads', async () => {
  render(<DataComponent />);
  
  await waitFor(() => {
    expect(screen.queryByTestId('loading-spinner')).toBeNull();
  });
});
```

### Test Navigation

```typescript
import { useRouter } from 'expo-router';

jest.mock('expo-router');

it('should navigate on success', async () => {
  const mockPush = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  
  render(<LoginScreen />);
  // ... perform login
  
  await waitFor(() => {
    expect(mockPush).toHaveBeenCalledWith('/(tabs)');
  });
});
```

## Mock Data

```typescript
// Use mock data from test-utils
import { mockUser, mockSession, mockProfile } from '@/test-utils/mock-data';

it('should use mock user', () => {
  (supabase.auth.getUser as jest.Mock).mockResolvedValue({
    data: { user: mockUser },
    error: null,
  });
  // ... test
});
```

## Debugging Tests

```typescript
// Print component tree
import { debug } from '@testing-library/react-native';

const { debug } = render(<MyComponent />);
debug(); // Prints component tree to console

// Print specific element
screen.debug(screen.getByText('Test'));

// Log mock calls
console.log(mockFn.mock.calls);

// Use debugger
it('should debug', () => {
  debugger; // Stops here when running npm run test:debug
  // ...
});
```

## Best Practices

✅ **DO**
- Test behavior, not implementation
- Use accessible queries (getByRole, getByLabelText)
- Write descriptive test names
- Mock external dependencies
- Clean up after tests
- Test edge cases and error states
- Keep tests isolated and independent

❌ **DON'T**
- Test implementation details
- Rely on snapshots for everything
- Make tests depend on each other
- Use excessive waitFor timeouts
- Ignore console warnings
- Test third-party libraries
- Create flaky tests

## Troubleshooting

### Test Timeout
```typescript
// Increase timeout for specific test
it('slow test', async () => {
  // ...
}, 10000); // 10 seconds

// Or use waitFor with timeout
await waitFor(() => {
  expect(element).toBeVisible();
}, { timeout: 5000 });
```

### Module Not Found
```bash
# Clear Jest cache
npx jest --clearCache

# Check moduleNameMapper in jest.config.js
```

### Act Warning
```typescript
// Wrap state updates in act()
await act(async () => {
  result.current.updateValue('new');
});
```

### Platform-Specific Tests
```typescript
import { Platform } from 'react-native';

beforeEach(() => {
  Platform.OS = 'ios'; // or 'android' or 'web'
});
```

## Coverage Reports

```bash
# Generate coverage
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html

# Coverage in CI
npm run test:ci
```

## Resources

- [Testing Strategy](./TESTING_STRATEGY.md)
- [Implementation Guide](./TESTING_IMPLEMENTATION_GUIDE.md)
- [Jest Docs](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
