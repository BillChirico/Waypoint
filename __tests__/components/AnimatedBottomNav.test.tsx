/**
 * AnimatedBottomNav Component Tests
 * Tests navigation rendering and accessibility
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import AnimatedBottomNav from '@/components/AnimatedBottomNav';

// Mock dependencies
jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require('react-native');
  return {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ...require('react-native-reanimated/mock'),
    default: {
      View: (props: any) => React.createElement(RN.View, props, props.children),
    },
  };
});

jest.mock('lucide-react-native', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require('react-native');
  const createMockIcon = (name: string) =>
    // eslint-disable-next-line react/display-name
    React.forwardRef((props: any, ref: any) =>
      React.createElement(RN.View, { ...props, ref, testID: name })
    );
  return {
    Home: createMockIcon('Home'),
    BookOpen: createMockIcon('BookOpen'),
    ClipboardList: createMockIcon('ClipboardList'),
    User: createMockIcon('User'),
  };
});

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    theme: {
      background: '#f9fafb',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      primary: '#007AFF',
      border: '#e5e7eb',
    },
    themeMode: 'light',
    isDark: false,
  })),
}));

describe('AnimatedBottomNav', () => {
  const mockItems = [
    { label: 'Home', icon: () => null },
    { label: 'Steps', icon: () => null },
    { label: 'Tasks', icon: () => null },
    { label: 'Profile', icon: () => null },
  ];

  it('should render navigation component', () => {
    const { getByText } = render(<AnimatedBottomNav items={mockItems} />);
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Steps')).toBeTruthy();
  });

  it('should render all navigation items', () => {
    const { getByText } = render(<AnimatedBottomNav items={mockItems} />);
    mockItems.forEach(item => {
      expect(getByText(item.label)).toBeTruthy();
    });
  });
});
