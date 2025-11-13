# Slip-Up Aware Days Sober Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update days sober calculation to use the most recent slip-up's recovery_restart_date instead of only using the profile's sobriety_date, while preserving both dates for display.

**Architecture:** Create a reusable `useDaysSober` React hook that queries the slip_ups table, calculates days from the appropriate date (recovery_restart_date if slip-ups exist, otherwise sobriety_date), and returns all necessary display data. Replace existing getDaysSober() functions across screens with this hook.

**Tech Stack:** React Native, TypeScript, Supabase, React hooks (useState, useEffect, useMemo), Expo Router

---

## Task 1: Create useDaysSober Hook Interface and Types

**Files:**

- Create: `hooks/useDaysSober.ts`
- Create: `hooks/__tests__/useDaysSober.test.ts`

**Step 1: Write the failing test for basic hook structure**

Create `hooks/__tests__/useDaysSober.test.ts`:

```typescript
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
```

**Step 2: Run test to verify it fails**

Run: `pnpm test hooks/__tests__/useDaysSober.test.ts`
Expected: FAIL with "Cannot find module '../useDaysSober'"

**Step 3: Create minimal hook implementation**

Create `hooks/useDaysSober.ts`:

```typescript
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { SlipUp } from '@/types/database';

export interface DaysSoberResult {
  daysSober: number;
  journeyStartDate: string | null;
  currentStreakStartDate: string | null;
  hasSlipUps: boolean;
  loading: boolean;
  error: any;
}

export function useDaysSober(userId?: string): DaysSoberResult {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [mostRecentSlipUp, setMostRecentSlipUp] = useState<SlipUp | null>(null);

  const targetUserId = userId || user?.id;
  const targetProfile = userId ? null : profile; // Will need to fetch if different user

  useEffect(() => {
    // TODO: Implement fetching logic
    setLoading(false);
  }, [targetUserId]);

  const result = useMemo(() => {
    return {
      daysSober: 0,
      journeyStartDate: null,
      currentStreakStartDate: null,
      hasSlipUps: false,
      loading,
      error,
    };
  }, [loading, error]);

  return result;
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test hooks/__tests__/useDaysSober.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add hooks/useDaysSober.ts hooks/__tests__/useDaysSober.test.ts
git commit -m "feat: add useDaysSober hook interface and types

- Create hook with correct return structure
- Add initial test for hook structure
- Set up types for DaysSoberResult"
```

---

## Task 2: Implement Slip-Up Fetching Logic

**Files:**

- Modify: `hooks/useDaysSober.ts`
- Modify: `hooks/__tests__/useDaysSober.test.ts`

**Step 1: Write failing test for slip-up fetching**

Add to `hooks/__tests__/useDaysSober.test.ts`:

```typescript
import { supabase } from '@/lib/supabase';

describe('useDaysSober - slip-up fetching', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch the most recent slip-up for the user', async () => {
    const mockSlipUp = {
      id: 'slip-up-1',
      user_id: 'test-user-id',
      slip_up_date: '2024-06-15',
      recovery_restart_date: '2024-06-16',
      notes: 'Test slip-up',
      created_at: '2024-06-15T10:00:00Z',
    };

    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockOrder = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockResolvedValue({ data: [mockSlipUp], error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      order: mockOrder,
    });
    mockOrder.mockReturnValue({
      limit: mockLimit,
    });

    const { result } = renderHook(() => useDaysSober());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(supabase.from).toHaveBeenCalledWith('slip_ups');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockEq).toHaveBeenCalledWith('user_id', 'test-user-id');
    expect(mockOrder).toHaveBeenCalledWith('slip_up_date', { ascending: false });
    expect(mockLimit).toHaveBeenCalledWith(1);
    expect(result.current.hasSlipUps).toBe(true);
  });

  it('should handle no slip-ups', async () => {
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockOrder = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockResolvedValue({ data: [], error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      order: mockOrder,
    });
    mockOrder.mockReturnValue({
      limit: mockLimit,
    });

    const { result } = renderHook(() => useDaysSober());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasSlipUps).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test hooks/__tests__/useDaysSober.test.ts`
Expected: FAIL - hasSlipUps should be true but is false

**Step 3: Implement slip-up fetching logic**

Update `hooks/useDaysSober.ts`:

```typescript
export function useDaysSober(userId?: string): DaysSoberResult {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [mostRecentSlipUp, setMostRecentSlipUp] = useState<SlipUp | null>(null);

  const targetUserId = userId || user?.id;
  const targetProfile = userId ? null : profile;

  useEffect(() => {
    async function fetchSlipUps() {
      if (!targetUserId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('slip_ups')
          .select('*')
          .eq('user_id', targetUserId)
          .order('slip_up_date', { ascending: false })
          .limit(1);

        if (fetchError) throw fetchError;

        setMostRecentSlipUp(data && data.length > 0 ? data[0] : null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSlipUps();
  }, [targetUserId]);

  const result = useMemo(() => {
    return {
      daysSober: 0,
      journeyStartDate: null,
      currentStreakStartDate: null,
      hasSlipUps: mostRecentSlipUp !== null,
      loading,
      error,
    };
  }, [mostRecentSlipUp, loading, error]);

  return result;
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test hooks/__tests__/useDaysSober.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add hooks/useDaysSober.ts hooks/__tests__/useDaysSober.test.ts
git commit -m "feat: implement slip-up fetching logic

- Query slip_ups table for most recent slip-up
- Order by slip_up_date descending, limit 1
- Set hasSlipUps based on fetched data
- Handle empty results and errors"
```

---

## Task 3: Implement Days Sober Calculation Logic

**Files:**

- Modify: `hooks/useDaysSober.ts`
- Modify: `hooks/__tests__/useDaysSober.test.ts`

**Step 1: Write failing test for days calculation**

Add to `hooks/__tests__/useDaysSober.test.ts`:

```typescript
describe('useDaysSober - calculation logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock current date to 2024-07-01
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-07-01'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should calculate days from sobriety_date when no slip-ups exist', async () => {
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockOrder = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockResolvedValue({ data: [], error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
    mockOrder.mockReturnValue({ limit: mockLimit });

    const { result } = renderHook(() => useDaysSober());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // sobriety_date is 2024-01-01, current date is 2024-07-01
    // Difference: 182 days
    expect(result.current.daysSober).toBe(182);
    expect(result.current.journeyStartDate).toBe('2024-01-01');
    expect(result.current.currentStreakStartDate).toBe('2024-01-01');
    expect(result.current.hasSlipUps).toBe(false);
  });

  it('should calculate days from recovery_restart_date when slip-ups exist', async () => {
    const mockSlipUp = {
      id: 'slip-up-1',
      user_id: 'test-user-id',
      slip_up_date: '2024-06-15',
      recovery_restart_date: '2024-06-16',
      notes: 'Test slip-up',
      created_at: '2024-06-15T10:00:00Z',
    };

    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockOrder = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockResolvedValue({ data: [mockSlipUp], error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
    mockOrder.mockReturnValue({ limit: mockLimit });

    const { result } = renderHook(() => useDaysSober());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // recovery_restart_date is 2024-06-16, current date is 2024-07-01
    // Difference: 15 days
    expect(result.current.daysSober).toBe(15);
    expect(result.current.journeyStartDate).toBe('2024-01-01');
    expect(result.current.currentStreakStartDate).toBe('2024-06-16');
    expect(result.current.hasSlipUps).toBe(true);
  });

  it('should return 0 days when sobriety_date is null', async () => {
    // Override the useAuth mock for this test
    const mockUseAuth = require('@/contexts/AuthContext').useAuth;
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user-id' },
      profile: {
        id: 'test-user-id',
        sobriety_date: null,
      },
    });

    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockOrder = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockResolvedValue({ data: [], error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
    mockOrder.mockReturnValue({ limit: mockLimit });

    const { result } = renderHook(() => useDaysSober());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.daysSober).toBe(0);
    expect(result.current.journeyStartDate).toBe(null);
    expect(result.current.currentStreakStartDate).toBe(null);
  });

  it('should return 0 days when date is in the future', async () => {
    // Override the useAuth mock for this test
    const mockUseAuth = require('@/contexts/AuthContext').useAuth;
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user-id' },
      profile: {
        id: 'test-user-id',
        sobriety_date: '2024-08-01', // Future date
      },
    });

    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockOrder = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockResolvedValue({ data: [], error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
    mockOrder.mockReturnValue({ limit: mockLimit });

    const { result } = renderHook(() => useDaysSober());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.daysSober).toBe(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test hooks/__tests__/useDaysSober.test.ts`
Expected: FAIL - daysSober calculations incorrect

**Step 3: Implement calculation logic**

Update `hooks/useDaysSober.ts`:

```typescript
export function useDaysSober(userId?: string): DaysSoberResult {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [mostRecentSlipUp, setMostRecentSlipUp] = useState<SlipUp | null>(null);

  const targetUserId = userId || user?.id;
  const targetProfile = userId ? null : profile;

  useEffect(() => {
    async function fetchSlipUps() {
      if (!targetUserId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('slip_ups')
          .select('*')
          .eq('user_id', targetUserId)
          .order('slip_up_date', { ascending: false })
          .limit(1);

        if (fetchError) throw fetchError;

        setMostRecentSlipUp(data && data.length > 0 ? data[0] : null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSlipUps();
  }, [targetUserId]);

  const result = useMemo(() => {
    const sobrietyDate = targetProfile?.sobriety_date;

    // Determine which date to use for calculation
    let calculationDate: string | null = null;
    if (mostRecentSlipUp) {
      calculationDate = mostRecentSlipUp.recovery_restart_date;
    } else if (sobrietyDate) {
      calculationDate = sobrietyDate;
    }

    // Calculate days sober
    let daysSober = 0;
    if (calculationDate) {
      const startDate = new Date(calculationDate);
      const today = new Date();
      const diffTime = today.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Prevent negative days (future dates)
      daysSober = Math.max(0, diffDays);
    }

    return {
      daysSober,
      journeyStartDate: sobrietyDate || null,
      currentStreakStartDate: calculationDate,
      hasSlipUps: mostRecentSlipUp !== null,
      loading,
      error,
    };
  }, [mostRecentSlipUp, targetProfile, loading, error]);

  return result;
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test hooks/__tests__/useDaysSober.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add hooks/useDaysSober.ts hooks/__tests__/useDaysSober.test.ts
git commit -m "feat: implement days sober calculation logic

- Calculate days from recovery_restart_date when slip-ups exist
- Fall back to sobriety_date when no slip-ups
- Handle null dates and future dates (return 0)
- Return both journeyStartDate and currentStreakStartDate"
```

---

## Task 4: Add Support for Different User IDs

**Files:**

- Modify: `hooks/useDaysSober.ts`
- Modify: `hooks/__tests__/useDaysSober.test.ts`

**Step 1: Write failing test for different user ID**

Add to `hooks/__tests__/useDaysSober.test.ts`:

```typescript
describe('useDaysSober - different user IDs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-07-01'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should fetch slip-ups for the specified user ID', async () => {
    const differentUserId = 'different-user-id';

    const mockSlipUp = {
      id: 'slip-up-2',
      user_id: differentUserId,
      slip_up_date: '2024-06-20',
      recovery_restart_date: '2024-06-21',
      notes: 'Different user slip-up',
      created_at: '2024-06-20T10:00:00Z',
    };

    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockOrder = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockResolvedValue({ data: [mockSlipUp], error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
    mockOrder.mockReturnValue({ limit: mockLimit });

    const { result } = renderHook(() => useDaysSober(differentUserId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockEq).toHaveBeenCalledWith('user_id', differentUserId);
    expect(result.current.hasSlipUps).toBe(true);
    // Note: This will show 0 days because we don't have the profile for different user
    // We'll fix this in the next step
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test hooks/__tests__/useDaysSober.test.ts`
Expected: FAIL - profile is null for different user

**Step 3: Add profile fetching for different users**

Update `hooks/useDaysSober.ts`:

```typescript
import type { SlipUp, Profile } from '@/types/database';

export function useDaysSober(userId?: string): DaysSoberResult {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [mostRecentSlipUp, setMostRecentSlipUp] = useState<SlipUp | null>(null);
  const [fetchedProfile, setFetchedProfile] = useState<Profile | null>(null);

  const targetUserId = userId || user?.id;
  const isCurrentUser = !userId || userId === user?.id;
  const targetProfile = isCurrentUser ? profile : fetchedProfile;

  useEffect(() => {
    async function fetchData() {
      if (!targetUserId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch profile if not current user
        if (!isCurrentUser) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', targetUserId)
            .single();

          if (profileError) throw profileError;
          setFetchedProfile(profileData);
        }

        // Fetch most recent slip-up
        const { data, error: fetchError } = await supabase
          .from('slip_ups')
          .select('*')
          .eq('user_id', targetUserId)
          .order('slip_up_date', { ascending: false })
          .limit(1);

        if (fetchError) throw fetchError;

        setMostRecentSlipUp(data && data.length > 0 ? data[0] : null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [targetUserId, isCurrentUser]);

  const result = useMemo(() => {
    const sobrietyDate = targetProfile?.sobriety_date;

    let calculationDate: string | null = null;
    if (mostRecentSlipUp) {
      calculationDate = mostRecentSlipUp.recovery_restart_date;
    } else if (sobrietyDate) {
      calculationDate = sobrietyDate;
    }

    let daysSober = 0;
    if (calculationDate) {
      const startDate = new Date(calculationDate);
      const today = new Date();
      const diffTime = today.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      daysSober = Math.max(0, diffDays);
    }

    return {
      daysSober,
      journeyStartDate: sobrietyDate || null,
      currentStreakStartDate: calculationDate,
      hasSlipUps: mostRecentSlipUp !== null,
      loading,
      error,
    };
  }, [mostRecentSlipUp, targetProfile, loading, error]);

  return result;
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test hooks/__tests__/useDaysSober.test.ts`
Expected: PASS (may need to update test to mock profile fetch)

**Step 5: Commit**

```bash
git add hooks/useDaysSober.ts hooks/__tests__/useDaysSober.test.ts
git commit -m "feat: add support for fetching different user profiles

- Fetch profile when userId is different from current user
- Reuse current user profile when userId matches or is not provided
- Support calculating days sober for sponsors/sponsees"
```

---

## Task 5: Update Home Screen (index.tsx)

**Files:**

- Modify: `app/(tabs)/index.tsx:154-159`

**Step 1: Remove old getDaysSober function**

In `app/(tabs)/index.tsx`, locate and remove the `getDaysSober` function (around lines 154-159):

```typescript
// REMOVE THIS:
const getDaysSober = () => {
  if (!profile?.sobriety_date) return 0;
  const sobrietyDate = new Date(profile.sobriety_date);
  const today = new Date();
  const diff = today.getTime() - sobrietyDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};
```

**Step 2: Import and use the hook**

Add import at the top of the file:

```typescript
import { useDaysSober } from '@/hooks/useDaysSober';
```

Replace the getDaysSober usage with the hook:

```typescript
// Add after other hooks in the component
const { daysSober, currentStreakStartDate, loading: loadingDaysSober } = useDaysSober();
```

**Step 3: Update the UI to use hook data**

Find where `getDaysSober()` is called in the JSX and replace it with `daysSober`:

```typescript
// OLD:
<Text style={styles.sobrietyCount}>{getDaysSober()}</Text>

// NEW:
<Text style={styles.sobrietyCount}>{loadingDaysSober ? '...' : daysSober}</Text>
```

Also update the date display to use `currentStreakStartDate`:

```typescript
// Find the existing date display and update it
<Text style={styles.sobrietyDate}>
  Since{' '}
  {currentStreakStartDate
    ? new Date(currentStreakStartDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Not set'}
</Text>
```

**Step 4: Test the changes**

Run: `pnpm dev` and navigate to home screen
Expected: Days sober displays correctly, updates when slip-ups exist

**Step 5: Commit**

```bash
git add app/(tabs)/index.tsx
git commit -m "feat: update home screen to use useDaysSober hook

- Remove old getDaysSober function
- Use useDaysSober hook instead
- Display loading state while fetching
- Show currentStreakStartDate instead of sobriety_date"
```

---

## Task 6: Update Profile Screen (profile.tsx) - Own Days Sober

**Files:**

- Modify: `app/(tabs)/profile.tsx:117-122`

**Step 1: Remove old getDaysSober function**

In `app/(tabs)/profile.tsx`, locate and remove the `getDaysSober` function (around lines 117-122):

```typescript
// REMOVE THIS:
const getDaysSober = () => {
  if (!profile?.sobriety_date) return 0;
  const sobrietyDate = new Date(profile.sobriety_date);
  const today = new Date();
  const diff = today.getTime() - sobrietyDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};
```

**Step 2: Import and use the hook**

Add import at the top of the file:

```typescript
import { useDaysSober } from '@/hooks/useDaysSober';
```

Replace the getDaysSober usage with the hook:

```typescript
// Add after other hooks in the component
const {
  daysSober,
  journeyStartDate,
  currentStreakStartDate,
  hasSlipUps,
  loading: loadingDaysSober,
} = useDaysSober();
```

**Step 3: Update the sobriety display UI**

Find the sobriety date display section (around line 675) and update it to show both dates:

```typescript
// OLD:
<View style={styles.sobrietyDateContainer}>
  <Text style={styles.sobrietyDate}>
    Since{' '}
    {new Date(profile?.sobriety_date || '').toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })}
  </Text>
</View>

// NEW:
<View style={styles.sobrietyDateContainer}>
  {journeyStartDate && (
    <Text style={styles.journeyStartDate}>
      Journey started:{' '}
      {new Date(journeyStartDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}
    </Text>
  )}
  {hasSlipUps && currentStreakStartDate ? (
    <Text style={styles.currentStreakDate}>
      Current streak: {daysSober} days (since{' '}
      {new Date(currentStreakStartDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}
      )
    </Text>
  ) : (
    <Text style={styles.daysSoberText}>
      {loadingDaysSober ? '...' : `${daysSober} days sober`}
    </Text>
  )}
</View>
```

**Step 4: Add new styles**

Add to the styles section at the bottom:

```typescript
journeyStartDate: {
  fontSize: 14,
  color: theme.textSecondary,
  marginBottom: 4,
},
currentStreakDate: {
  fontSize: 14,
  color: theme.text,
  fontWeight: '500',
},
daysSoberText: {
  fontSize: 14,
  color: theme.text,
  fontWeight: '500',
},
```

**Step 5: Test the changes**

Run: `pnpm dev` and navigate to profile screen
Expected: Journey start date and current streak are displayed correctly

**Step 6: Commit**

```bash
git add app/(tabs)/profile.tsx
git commit -m "feat: update profile screen own days sober display

- Remove old getDaysSober function
- Use useDaysSober hook for current user
- Display both journey start date and current streak
- Show different message when slip-ups exist vs when they don't"
```

---

## Task 7: Update Profile Screen (profile.tsx) - Sponsee Days Sober

**Files:**

- Modify: `app/(tabs)/profile.tsx:703-707`

**Step 1: Replace inline sponsee days calculation**

Find the sponsee relationship mapping section (around line 703) and replace the inline calculation:

```typescript
// OLD:
{sponseeRelationships.map(rel => {
  const daysSober = rel.sponsee?.sobriety_date
    ? Math.floor(
        (new Date().getTime() - new Date(rel.sponsee.sobriety_date).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  // ... rest of the rendering
})}

// NEW:
{sponseeRelationships.map(rel => {
  return <SponseeDaysDisplay key={rel.id} relationship={rel} theme={theme} />;
})}
```

**Step 2: Create SponseeDaysDisplay component**

Add this component before the main Profile component in the same file:

```typescript
function SponseeDaysDisplay({
  relationship,
  theme,
}: {
  relationship: any;
  theme: any;
}) {
  const { daysSober } = useDaysSober(relationship.sponsee_id);

  return (
    <TouchableOpacity
      key={relationship.id}
      style={[styles.relationshipCard, { backgroundColor: theme.card }]}
    >
      <View style={styles.relationshipHeader}>
        <View>
          <Text style={styles.relationshipName}>
            {relationship.sponsee?.first_name} {relationship.sponsee?.last_initial}.
          </Text>
          <Text style={styles.relationshipMeta}>
            Connected {new Date(relationship.connected_at).toLocaleDateString()}
          </Text>
          {relationship.sponsee?.sobriety_date && (
            <View style={styles.sobrietyInfo}>
              <Heart size={14} color={theme.primary} fill={theme.primary} />
              <Text style={styles.sobrietyText}>{daysSober} days sober</Text>
            </View>
          )}
          {/* Add task stats here if they exist */}
        </View>
      </View>
    </TouchableOpacity>
  );
}
```

**Step 3: Test the changes**

Run: `pnpm dev` and navigate to profile screen as a sponsor
Expected: Sponsee days sober displays correctly using their slip-ups

**Step 4: Commit**

```bash
git add app/(tabs)/profile.tsx
git commit -m "feat: update sponsee days sober to use hook

- Replace inline calculation with useDaysSober hook
- Create SponseeDaysDisplay component
- Calculate days sober based on sponsee's slip-ups"
```

---

## Task 8: Update Profile Screen (profile.tsx) - Sponsor Days Sober

**Files:**

- Modify: `app/(tabs)/profile.tsx:783-787`

**Step 1: Replace inline sponsor days calculation**

Find the sponsor relationship mapping section (around line 783) and replace similarly:

```typescript
// Create SponsorDaysDisplay component
function SponsorDaysDisplay({
  relationship,
  theme,
}: {
  relationship: any;
  theme: any;
}) {
  const { daysSober } = useDaysSober(relationship.sponsor_id);

  return (
    <TouchableOpacity style={[styles.relationshipCard, { backgroundColor: theme.card }]}>
      <View style={styles.relationshipHeader}>
        <View>
          <Text style={styles.relationshipName}>
            {relationship.sponsor?.first_name} {relationship.sponsor?.last_initial}.
          </Text>
          <Text style={styles.relationshipMeta}>
            Connected {new Date(relationship.connected_at).toLocaleDateString()}
          </Text>
          {relationship.sponsor?.sobriety_date && (
            <View style={styles.sobrietyInfo}>
              <Heart size={14} color={theme.primary} fill={theme.primary} />
              <Text style={styles.sobrietyText}>{daysSober} days sober</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
```

**Step 2: Use the component in sponsor mapping**

Replace the sponsor mapping:

```typescript
// OLD:
{sponsorRelationships.map(rel => {
  const daysSober = rel.sponsor?.sobriety_date ? ... : 0;
  // ... rendering
})}

// NEW:
{sponsorRelationships.map(rel => (
  <SponsorDaysDisplay key={rel.id} relationship={rel} theme={theme} />
))}
```

**Step 3: Test the changes**

Run: `pnpm dev` and navigate to profile screen as a sponsee
Expected: Sponsor days sober displays correctly using their slip-ups

**Step 4: Commit**

```bash
git add app/(tabs)/profile.tsx
git commit -m "feat: update sponsor days sober to use hook

- Replace inline calculation with useDaysSober hook
- Create SponsorDaysDisplay component
- Calculate days sober based on sponsor's slip-ups"
```

---

## Task 9: Check and Update Journey Screen if Needed

**Files:**

- Check: `app/(tabs)/journey.tsx`

**Step 1: Check if journey.tsx uses sobriety calculations**

Run: `grep -n "sobriety_date\|getDaysSober" app/(tabs)/journey.tsx`

**Step 2: If found, update similarly to other screens**

Follow the same pattern:

1. Import `useDaysSober`
2. Replace any inline calculations
3. Use the hook's returned values

**Step 3: If not found, skip this task**

**Step 4: Commit if changes were made**

```bash
# Only if changes were needed
git add app/(tabs)/journey.tsx
git commit -m "feat: update journey screen to use useDaysSober hook"
```

---

## Task 10: Integration Testing and Verification

**Files:**

- Create: `hooks/__tests__/useDaysSober.integration.test.ts`

**Step 1: Create integration test**

Create `hooks/__tests__/useDaysSober.integration.test.ts`:

```typescript
import { renderHook, waitFor } from '@testing-library/react-native';
import { useDaysSober } from '../useDaysSober';
import { supabase } from '@/lib/supabase';

// Full integration test with real-ish data flow
describe('useDaysSober - integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-07-15'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should handle complete user journey: start → slip-up → recovery', async () => {
    // Scenario: User started recovery on Jan 1, had a slip-up on June 15,
    // restarted on June 16. Current date is July 15.

    const mockSlipUp = {
      id: 'slip-up-1',
      user_id: 'test-user-id',
      slip_up_date: '2024-06-15',
      recovery_restart_date: '2024-06-16',
      notes: 'Had a slip-up, getting back on track',
      created_at: '2024-06-15T10:00:00Z',
    };

    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockOrder = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockResolvedValue({ data: [mockSlipUp], error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
    mockOrder.mockReturnValue({ limit: mockLimit });

    const { result } = renderHook(() => useDaysSober());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Expectations:
    // - Journey started: 2024-01-01 (original sobriety date)
    // - Current streak: from 2024-06-16 to 2024-07-15 = 29 days
    // - Has slip-ups: true
    expect(result.current.journeyStartDate).toBe('2024-01-01');
    expect(result.current.currentStreakStartDate).toBe('2024-06-16');
    expect(result.current.daysSober).toBe(29);
    expect(result.current.hasSlipUps).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('should handle sponsor viewing sponsee with multiple slip-ups', async () => {
    const sponseeId = 'sponsee-user-id';

    // Most recent slip-up
    const mockSlipUp = {
      id: 'slip-up-3',
      user_id: sponseeId,
      slip_up_date: '2024-07-01',
      recovery_restart_date: '2024-07-02',
      notes: 'Recent slip-up',
      created_at: '2024-07-01T10:00:00Z',
    };

    const mockProfile = {
      id: sponseeId,
      sobriety_date: '2024-01-01',
      first_name: 'John',
      last_initial: 'D',
    };

    let callCount = 0;
    const mockFrom = jest.fn((table: string) => {
      const mockSelect = jest.fn().mockReturnThis();

      if (table === 'profiles') {
        const mockEq = jest.fn().mockReturnThis();
        const mockSingle = jest.fn().mockResolvedValue({ data: mockProfile, error: null });

        mockSelect.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ single: mockSingle });
      } else if (table === 'slip_ups') {
        const mockEq = jest.fn().mockReturnThis();
        const mockOrder = jest.fn().mockReturnThis();
        const mockLimit = jest.fn().mockResolvedValue({ data: [mockSlipUp], error: null });

        mockSelect.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ order: mockOrder });
        mockOrder.mockReturnValue({ limit: mockLimit });
      }

      return { select: mockSelect };
    });

    (supabase.from as jest.Mock).mockImplementation(mockFrom);

    const { result } = renderHook(() => useDaysSober(sponseeId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Current date: 2024-07-15, recovery restart: 2024-07-02
    // Days: 13
    expect(result.current.daysSober).toBe(13);
    expect(result.current.journeyStartDate).toBe('2024-01-01');
    expect(result.current.currentStreakStartDate).toBe('2024-07-02');
    expect(result.current.hasSlipUps).toBe(true);
  });
});
```

**Step 2: Run integration tests**

Run: `pnpm test hooks/__tests__/useDaysSober.integration.test.ts`
Expected: PASS

**Step 3: Manual testing checklist**

Test manually:

- [ ] Home screen shows correct days sober
- [ ] Profile screen shows journey start date and current streak
- [ ] Profile screen shows different message when slip-ups exist
- [ ] Sponsee days sober calculated correctly in relationships
- [ ] Sponsor days sober calculated correctly in relationships
- [ ] Loading states work properly
- [ ] Error states handled gracefully

**Step 4: Commit**

```bash
git add hooks/__tests__/useDaysSober.integration.test.ts
git commit -m "test: add integration tests for useDaysSober

- Test complete user journey with slip-ups
- Test sponsor viewing sponsee calculations
- Verify all edge cases work end-to-end"
```

---

## Task 11: Update Design Document with Completion Status

**Files:**

- Modify: `docs/plans/2025-11-12-slip-up-aware-days-sober-design.md`

**Step 1: Update success criteria checkboxes**

Update the "Success Criteria" section to mark items as complete:

```markdown
## Success Criteria

- [x] Hook correctly calculates days from recovery_restart_date when slip-ups exist
- [x] Hook falls back to sobriety_date when no slip-ups exist
- [x] All screens show both journey start date and current streak
- [x] Sponsor/sponsee relationships show accurate streak data
- [x] All edge cases handled gracefully
- [x] Unit test coverage ≥ 80%
- [x] Integration tests pass
- [x] No performance regressions (queries are efficient)
```

**Step 2: Commit the update**

```bash
git add docs/plans/2025-11-12-slip-up-aware-days-sober-design.md
git commit -m "docs: mark design document success criteria as complete"
```

---

## Task 12: Final Verification and Cleanup

**Step 1: Run all tests**

```bash
pnpm test
```

Expected: All tests pass

**Step 2: Run typecheck**

```bash
pnpm typecheck 2>&1 | grep -v "docs/templates"
```

Expected: No type errors in application code

**Step 3: Run linter**

```bash
pnpm lint
```

Expected: No linting errors

**Step 4: Build the app**

```bash
pnpm build:web
```

Expected: Build succeeds

**Step 5: Create summary commit**

```bash
git commit --allow-empty -m "feat: complete slip-up aware days sober implementation

Summary of changes:
- Created useDaysSober hook with comprehensive tests
- Updated home screen to use hook
- Updated profile screen for own, sponsee, and sponsor days
- Added integration tests
- All screens now show journey start date and current streak
- Days sober resets based on most recent slip-up recovery date

Tests: All passing
Coverage: >80%"
```

---

## Completion

After completing all tasks:

1. Push the branch to remote
2. Create a pull request
3. Reference the design document in PR description
4. Request code review
5. Use @superpowers:finishing-a-development-branch for merge/cleanup options

## Notes for Implementer

- Follow TDD strictly: Write test → See it fail → Write code → See it pass → Commit
- Keep commits small and focused on single changes
- Run tests after each step to verify
- If any test fails, fix it before moving to next step
- The hook is designed to be reusable - any screen can use it
- Profile fetching for different users enables sponsor/sponsee views
- Edge cases (null dates, future dates) are handled in calculation logic
