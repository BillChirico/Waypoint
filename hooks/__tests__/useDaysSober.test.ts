import { renderHook, waitFor } from '@testing-library/react-native';
import { useDaysSober } from '../useDaysSober';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
    profile: {
      id: 'test-user-id',
      sobriety_date: '2024-01-01',
    },
  }),
}));

describe('useDaysSober', () => {
  it('should return the correct structure', () => {
    const { result } = renderHook(() => useDaysSober());

    expect(result.current).toHaveProperty('daysSober');
    expect(result.current).toHaveProperty('journeyStartDate');
    expect(result.current).toHaveProperty('currentStreakStartDate');
    expect(result.current).toHaveProperty('hasSlipUps');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
  });
});
