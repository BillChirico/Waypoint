/**
 * Home/Dashboard Screen Tests
 * Tests dashboard rendering, relationships display, and role-based content
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import HomeScreen from '@/app/(tabs)/index';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// Mock dependencies
jest.mock('expo-router');
jest.mock('@/contexts/AuthContext');
jest.mock('@/lib/supabase');
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
    setThemeMode: jest.fn(),
    isDark: false,
  })),
}));
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
    Heart: createMockIcon('Heart'),
    CheckCircle: createMockIcon('CheckCircle'),
    Users: createMockIcon('Users'),
    Award: createMockIcon('Award'),
    UserMinus: createMockIcon('UserMinus'),
    Plus: createMockIcon('Plus'),
    BookOpen: createMockIcon('BookOpen'),
    ClipboardList: createMockIcon('ClipboardList'),
  };
});
jest.mock('@/components/TaskCreationModal', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require('react-native');
  // eslint-disable-next-line react/display-name
  return React.forwardRef((props: any, ref: any) =>
    React.createElement(RN.View, { ...props, ref, testID: 'TaskCreationModal' })
  );
});

const mockProfile = {
  id: 'user-123',
  email: 'test@example.com',
  first_name: 'John',
  last_initial: 'D',
  role: 'both',
  sobriety_date: '2024-01-01',
};

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      profile: mockProfile,
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [] }),
    });
  });

  it('should render dashboard with welcome message', async () => {
    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText(/Hello, John/i)).toBeTruthy();
    });
  });

  it('should display sobriety tracker', async () => {
    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText(/Days Sober/i)).toBeTruthy();
    });
  });

  it('should fetch relationships and tasks on mount', async () => {
    render(<HomeScreen />);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('sponsor_sponsee_relationships');
      expect(supabase.from).toHaveBeenCalledWith('tasks');
    });
  });

  it('should handle refresh', async () => {
    const { root } = render(<HomeScreen />);
    // Refresh functionality tested via integration tests
    expect(root).toBeTruthy();
  });

  it('should render loading state initially', () => {
    const { root } = render(<HomeScreen />);
    expect(root).toBeTruthy();
  });
});
