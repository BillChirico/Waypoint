/**
 * Mock Expo SecureStore for testing
 * Provides in-memory storage for testing authentication persistence
 */

const storage: Record<string, string> = {};

export const setItemAsync = jest.fn(async (key: string, value: string): Promise<void> => {
  storage[key] = value;
});

export const getItemAsync = jest.fn(async (key: string): Promise<string | null> => {
  return storage[key] || null;
});

export const deleteItemAsync = jest.fn(async (key: string): Promise<void> => {
  delete storage[key];
});
