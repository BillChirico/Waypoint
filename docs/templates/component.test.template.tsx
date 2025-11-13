/**
 * Component Test Template
 *
 * This template demonstrates best practices for testing React Native components.
 *
 * Usage:
 * 1. Copy this template to __tests__/components/[ComponentName].test.tsx
 * 2. Replace [ComponentName] with your actual component name
 * 3. Update imports and test cases to match your component's behavior
 * 4. Remove this header comment
 */

import { render, screen, fireEvent, waitFor } from '@/test-utils';
import { [ComponentName] } from '@/components/[ComponentName]';
// Import fixtures if needed
// import { createProfile } from '@/__tests__/fixtures';

/**
 * Test Suite Structure:
 * - Group related tests using describe blocks
 * - Use clear, descriptive test names with "should" pattern
 * - Test user-visible behavior, not implementation details
 */
describe('[ComponentName]', () => {
  /**
   * Rendering Tests
   * - Verify component renders with required props
   * - Test different states and variations
   */
  describe('rendering', () => {
    it('should render with default props', () => {
      render(<[ComponentName] />);

      // Use user-centric queries (getByText, getByRole, getByLabelText)
      expect(screen.getByText('Expected Text')).toBeTruthy();
    });

    it('should render with custom props', () => {
      render(<[ComponentName] title="Custom Title" />);

      expect(screen.getByText('Custom Title')).toBeTruthy();
    });

    it('should render in loading state', () => {
      render(<[ComponentName] loading={true} />);

      // Use testID for elements without text
      expect(screen.getByTestId('loading-spinner')).toBeTruthy();
    });

    it('should render in error state', () => {
      render(<[ComponentName] error="Something went wrong" />);

      expect(screen.getByText('Something went wrong')).toBeTruthy();
    });
  });

  /**
   * Interaction Tests
   * - Test user interactions (press, input, scroll)
   * - Verify callbacks are called correctly
   */
  describe('interactions', () => {
    it('should call onPress when button is pressed', () => {
      const onPress = jest.fn();
      render(<[ComponentName] onPress={onPress} />);

      fireEvent.press(screen.getByText('Press Me'));

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should update input value when text is entered', () => {
      const onChangeText = jest.fn();
      render(<[ComponentName] onChangeText={onChangeText} />);

      fireEvent.changeText(screen.getByTestId('text-input'), 'Hello');

      expect(onChangeText).toHaveBeenCalledWith('Hello');
    });

    it('should handle multiple interactions', async () => {
      const onSubmit = jest.fn();
      render(<[ComponentName] onSubmit={onSubmit} />);

      // Perform multiple actions
      fireEvent.changeText(screen.getByTestId('input'), 'Test Value');
      fireEvent.press(screen.getByText('Submit'));

      // Wait for async operations if needed
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith('Test Value');
      });
    });
  });

  /**
   * Context Integration Tests
   * - Test components that depend on context providers
   * - Verify theme, auth, or other context usage
   */
  describe('with context', () => {
    it('should render with theme context', () => {
      render(<[ComponentName] />, { themeMode: 'dark' });

      // Verify theme-specific rendering
      const element = screen.getByTestId('themed-element');
      expect(element.props.style).toMatchObject({
        backgroundColor: expect.any(String),
      });
    });

    it('should render with auth context', () => {
      const profile = createProfile({ first_name: 'John' });

      render(<[ComponentName] />, {
        withAuth: true,
        authState: { profile },
      });

      expect(screen.getByText('Hello, John')).toBeTruthy();
    });
  });

  /**
   * Accessibility Tests
   * - Verify proper accessibility labels and roles
   * - Test screen reader support
   */
  describe('accessibility', () => {
    it('should have proper accessibility label', () => {
      render(<[ComponentName] />);

      const button = screen.getByLabelText('Submit Form');
      expect(button).toBeTruthy();
    });

    it('should have proper accessibility role', () => {
      render(<[ComponentName] />);

      const button = screen.getByRole('button');
      expect(button).toBeTruthy();
    });

    it('should have accessibility hint', () => {
      render(<[ComponentName] />);

      const element = screen.getByA11yHint('Tap to submit the form');
      expect(element).toBeTruthy();
    });
  });

  /**
   * Edge Cases and Error Handling
   * - Test boundary conditions
   * - Verify error states
   */
  describe('edge cases', () => {
    it('should handle empty data gracefully', () => {
      render(<[ComponentName] data={[]} />);

      expect(screen.getByText('No data available')).toBeTruthy();
    });

    it('should handle very long text', () => {
      const longText = 'A'.repeat(1000);
      render(<[ComponentName] text={longText} />);

      // Verify component doesn't crash
      expect(screen.getByText(longText)).toBeTruthy();
    });

    it('should disable interactions when disabled prop is true', () => {
      const onPress = jest.fn();
      render(<[ComponentName] onPress={onPress} disabled={true} />);

      fireEvent.press(screen.getByTestId('button'));

      expect(onPress).not.toHaveBeenCalled();
    });
  });

  /**
   * Snapshot Testing (Optional)
   * - Use sparingly, only for stable UI components
   * - Update snapshots intentionally, not automatically
   */
  describe('snapshots', () => {
    it('should match snapshot', () => {
      const { toJSON } = render(<[ComponentName] />);

      expect(toJSON()).toMatchSnapshot();
    });
  });
});
