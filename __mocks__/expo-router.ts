/**
 * Mock Expo Router for testing
 * Provides jest.fn() mocks for all routing methods
 */

export const useRouter = jest.fn(() => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
}));

export const useSegments = jest.fn(() => []);
export const usePathname = jest.fn(() => '/');
export const useLocalSearchParams = jest.fn(() => ({}));
export const useGlobalSearchParams = jest.fn(() => ({}));

export const Stack = {
  Screen: jest.fn(),
};

export const Tabs = {
  Screen: jest.fn(),
};

export const Link = jest.fn(({ children }) => children);
export const Redirect = jest.fn();
export const router = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
};
