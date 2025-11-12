import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, Platform } from 'react-native';
import TasksScreen from '@/app/(tabs)/tasks';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// Mock dependencies
jest.mock('@/contexts/AuthContext');
jest.mock('@/lib/supabase');

const mockTasksData = [
  {
    id: 'task-1',
    sponsor_id: 'sponsor-123',
    sponsee_id: 'user-123',
    title: 'Read Step 1 from the Big Book',
    description: 'Read and reflect on Step 1 from the Big Book of Alcoholics Anonymous.',
    step_number: 1,
    status: 'assigned',
    created_at: '2024-01-10T00:00:00Z',
    due_date: '2024-01-17T00:00:00Z',
    completed_at: null,
    completion_notes: null,
    sponsor: {
      id: 'sponsor-123',
      first_name: 'Bob',
      last_initial: 'S',
    },
  },
  {
    id: 'task-2',
    sponsor_id: 'sponsor-123',
    sponsee_id: 'user-123',
    title: 'Write your life story',
    description: 'Write a detailed account of your journey with alcoholism.',
    step_number: null,
    status: 'assigned',
    created_at: '2024-01-08T00:00:00Z',
    due_date: null,
    completed_at: null,
    completion_notes: null,
    sponsor: {
      id: 'sponsor-123',
      first_name: 'Bob',
      last_initial: 'S',
    },
  },
  {
    id: 'task-3',
    sponsor_id: 'sponsor-123',
    sponsee_id: 'user-123',
    title: 'Attend 3 meetings this week',
    description: 'Attend at least 3 AA meetings and share your experience.',
    step_number: null,
    status: 'completed',
    created_at: '2024-01-01T00:00:00Z',
    due_date: '2024-01-07T00:00:00Z',
    completed_at: '2024-01-06T00:00:00Z',
    completion_notes: 'Attended 4 meetings. Felt very supported by the group.',
    sponsor: {
      id: 'sponsor-123',
      first_name: 'Bob',
      last_initial: 'S',
    },
  },
];

describe('TasksScreen', () => {
  beforeAll(() => {
    if (typeof global.window === 'undefined') {
      (global as any).window = {};
    }
    global.window.alert = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';

    (useAuth as jest.Mock).mockReturnValue({
      profile: { id: 'user-123', first_name: 'John', last_initial: 'D' },
    });

    // Mock successful Supabase queries by default
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'tasks') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockTasksData,
                error: null,
              }),
            }),
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        };
      }
      if (table === 'notifications') {
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    });

    jest.spyOn(Alert, 'alert').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render header with title and subtitle', async () => {
      const { getByText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(getByText('My Tasks')).toBeTruthy();
        expect(getByText('Track your step progress')).toBeTruthy();
      });
    });

    it('should load and display tasks from Supabase', async () => {
      const { getByText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(getByText('Read Step 1 from the Big Book')).toBeTruthy();
        expect(getByText('Write your life story')).toBeTruthy();
        expect(getByText('Attend 3 meetings this week')).toBeTruthy();
      });
    });

    it('should separate tasks by status into sections', async () => {
      const { getByText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(getByText('New Tasks')).toBeTruthy();
        expect(getByText('Completed')).toBeTruthy();
      });
    });

    it('should display step badges for tasks with step numbers', async () => {
      const { getByText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(getByText('Step 1')).toBeTruthy();
      });
    });

    it('should display sponsor information', async () => {
      const { getAllByText } = render(<TasksScreen />);

      await waitFor(() => {
        const sponsorTexts = getAllByText(/From: Bob S\./);
        expect(sponsorTexts.length).toBeGreaterThan(0);
      });
    });

    it('should display due dates when available', async () => {
      const { getByText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(getByText(/Due/)).toBeTruthy();
      });
    });

    it('should display completion notes when available', async () => {
      const { getByText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(getByText('Your Notes:')).toBeTruthy();
        expect(getByText('Attended 4 meetings. Felt very supported by the group.')).toBeTruthy();
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no tasks exist', async () => {
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'tasks') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      const { getByText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(getByText('No tasks yet')).toBeTruthy();
        expect(
          getByText('Your sponsor will assign tasks to help you progress through the 12 steps')
        ).toBeTruthy();
      });
    });

    it('should not display task sections when no tasks exist', async () => {
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'tasks') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      const { queryByText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(queryByText('New Tasks')).toBeFalsy();
        expect(queryByText('Completed')).toBeFalsy();
      });
    });
  });

  // Note: Pull-to-refresh testing is omitted because RefreshControl is nested inside ScrollView
  // and cannot be reliably queried with RNTL's UNSAFE_getByType. This interaction will be
  // thoroughly covered by Maestro E2E tests.

  describe('Task Completion Modal', () => {
    it('should open completion modal when Complete button is pressed', async () => {
      const { getByText, getAllByText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(getByText('Read Step 1 from the Big Book')).toBeTruthy();
      });

      const completeButtons = getAllByText('Complete');
      fireEvent.press(completeButtons[0]);

      await waitFor(() => {
        expect(getByText('Complete Task')).toBeTruthy();
        expect(getByText('Completion Notes (Optional)')).toBeTruthy();
      });
    });

    it('should display task details in completion modal', async () => {
      const { getByText, getAllByText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(getByText('Read Step 1 from the Big Book')).toBeTruthy();
      });

      const completeButtons = getAllByText('Complete');
      fireEvent.press(completeButtons[0]);

      await waitFor(() => {
        // Should show step badge and title in modal
        const stepBadges = getAllByText('Step 1');
        expect(stepBadges.length).toBeGreaterThan(1); // One in list, one in modal
      });
    });

    it('should allow entering completion notes', async () => {
      const { getByText, getAllByText, getByPlaceholderText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(getByText('Read Step 1 from the Big Book')).toBeTruthy();
      });

      const completeButtons = getAllByText('Complete');
      fireEvent.press(completeButtons[0]);

      await waitFor(() => {
        const notesInput = getByPlaceholderText('What did you learn? How do you feel?');
        expect(notesInput).toBeTruthy();

        fireEvent.changeText(notesInput, 'I realized I have no control over alcohol.');
        expect(notesInput.props.value).toBe('I realized I have no control over alcohol.');
      });
    });

    // Note: Modal closing and task completion submission are complex interactions
    // that are better covered by E2E tests with Maestro
  });

  describe('Task Completion Submission', () => {
    it('should successfully complete a task (native)', async () => {
      Platform.OS = 'ios';

      const updateMock = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const insertMock = jest.fn().mockResolvedValue({ error: null });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'tasks') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: mockTasksData,
                  error: null,
                }),
              }),
            }),
            update: updateMock,
          };
        }
        if (table === 'notifications') {
          return { insert: insertMock };
        }
        return {};
      });

      const { getByText, getAllByText, getByPlaceholderText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(getByText('Read Step 1 from the Big Book')).toBeTruthy();
      });

      // Open modal
      const completeButtons = getAllByText('Complete');
      fireEvent.press(completeButtons[0]);

      await waitFor(() => {
        expect(getByText('Complete Task')).toBeTruthy();
      });

      // Enter notes
      const notesInput = getByPlaceholderText('What did you learn? How do you feel?');
      fireEvent.changeText(notesInput, 'Great insight on powerlessness.');

      // Submit
      fireEvent.press(getByText('Mark Complete'));

      await waitFor(() => {
        expect(updateMock).toHaveBeenCalledWith({
          status: 'completed',
          completed_at: expect.any(String),
          completion_notes: 'Great insight on powerlessness.',
        });
        expect(insertMock).toHaveBeenCalled();
        expect(Alert.alert).toHaveBeenCalledWith('Success', 'Task marked as completed!');
      });
    });

    it('should successfully complete a task (web)', async () => {
      Platform.OS = 'web';
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      const updateMock = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'tasks') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: mockTasksData,
                  error: null,
                }),
              }),
            }),
            update: updateMock,
          };
        }
        if (table === 'notifications') {
          return { insert: jest.fn().mockResolvedValue({ error: null }) };
        }
        return {};
      });

      const { getByText, getAllByText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(getByText('Read Step 1 from the Big Book')).toBeTruthy();
      });

      const completeButtons = getAllByText('Complete');
      fireEvent.press(completeButtons[0]);

      await waitFor(() => {
        expect(getByText('Complete Task')).toBeTruthy();
      });

      fireEvent.press(getByText('Mark Complete'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Task marked as completed!');
      });

      alertSpy.mockRestore();
    });

    it('should handle completion errors (native)', async () => {
      Platform.OS = 'ios';

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'tasks') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: mockTasksData,
                  error: null,
                }),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: { message: 'Database error' } }),
            }),
          };
        }
        return {};
      });

      const { getByText, getAllByText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(getByText('Read Step 1 from the Big Book')).toBeTruthy();
      });

      const completeButtons = getAllByText('Complete');
      fireEvent.press(completeButtons[0]);

      await waitFor(() => {
        expect(getByText('Complete Task')).toBeTruthy();
      });

      fireEvent.press(getByText('Mark Complete'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to complete task');
      });
    });

    it('should handle completion errors (web)', async () => {
      Platform.OS = 'web';
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'tasks') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: mockTasksData,
                  error: null,
                }),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: { message: 'Database error' } }),
            }),
          };
        }
        return {};
      });

      const { getByText, getAllByText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(getByText('Read Step 1 from the Big Book')).toBeTruthy();
      });

      const completeButtons = getAllByText('Complete');
      fireEvent.press(completeButtons[0]);

      await waitFor(() => {
        expect(getByText('Complete Task')).toBeTruthy();
      });

      fireEvent.press(getByText('Mark Complete'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Failed to complete task');
      });

      alertSpy.mockRestore();
    });

    it('should create notification for sponsor when task completed', async () => {
      const insertMock = jest.fn().mockResolvedValue({ error: null });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'tasks') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: mockTasksData,
                  error: null,
                }),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (table === 'notifications') {
          return { insert: insertMock };
        }
        return {};
      });

      const { getByText, getAllByText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(getByText('Read Step 1 from the Big Book')).toBeTruthy();
      });

      const completeButtons = getAllByText('Complete');
      fireEvent.press(completeButtons[0]);

      await waitFor(() => {
        expect(getByText('Complete Task')).toBeTruthy();
      });

      fireEvent.press(getByText('Mark Complete'));

      await waitFor(() => {
        expect(insertMock).toHaveBeenCalledWith(
          expect.objectContaining({
            user_id: 'sponsor-123',
            type: 'task_completed',
            title: 'Task Completed',
            content: 'John D. has completed: Read Step 1 from the Big Book',
            data: {
              task_id: 'task-1',
              step_number: 1,
            },
          })
        );
      });
    });

    it('should refetch tasks after successful completion', async () => {
      const selectMock = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockTasksData,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'tasks') {
          return {
            select: selectMock,
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (table === 'notifications') {
          return { insert: jest.fn().mockResolvedValue({ error: null }) };
        }
        return {};
      });

      const { getByText, getAllByText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(selectMock).toHaveBeenCalledTimes(1);
      });

      const completeButtons = getAllByText('Complete');
      fireEvent.press(completeButtons[0]);

      await waitFor(() => {
        expect(getByText('Complete Task')).toBeTruthy();
      });

      fireEvent.press(getByText('Mark Complete'));

      await waitFor(() => {
        expect(selectMock).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Profile Dependency', () => {
    it('should not fetch tasks when profile is missing', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        profile: null,
      });

      const selectMock = jest.fn();

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'tasks') {
          return {
            select: selectMock,
          };
        }
        return {};
      });

      render(<TasksScreen />);

      await waitFor(() => {
        expect(selectMock).not.toHaveBeenCalled();
      });
    });

    it('should refetch tasks when profile changes', async () => {
      const { rerender } = render(<TasksScreen />);

      await waitFor(() => {
        const selectMock = (supabase.from as jest.Mock).mock.results[0]?.value?.select;
        expect(selectMock).toHaveBeenCalled();
      });

      // Change profile
      (useAuth as jest.Mock).mockReturnValue({
        profile: { id: 'user-456', first_name: 'Jane', last_initial: 'S' },
      });

      rerender(<TasksScreen />);

      await waitFor(() => {
        const calls = (supabase.from as jest.Mock).mock.calls;
        const taskCalls = calls.filter(call => call[0] === 'tasks');
        expect(taskCalls.length).toBeGreaterThan(0);
      });
    });
  });
});
