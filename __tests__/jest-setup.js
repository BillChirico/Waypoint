/**
 * Custom Jest setup to avoid React Native's ESM setup file
 * This provides the minimal setup needed for testing without React Native's jest/setup.js
 */

// Set global test environment flags
global.IS_REACT_ACT_ENVIRONMENT = true;
global.IS_REACT_NATIVE_TEST_ENVIRONMENT = true;

// Mock console.error to reduce noise
const originalError = console.error;
console.error = (...args) => {
  // Filter out known React warnings during tests
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render') || args[0].includes('Warning: useLayoutEffect'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};
