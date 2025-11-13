/**
 * Integration Test Template
 *
 * This template demonstrates best practices for integration testing - testing
 * complete user workflows that involve multiple components and API interactions.
 *
 * Usage:
 * 1. Copy this template to __tests__/integration/[workflow-name].integration.test.tsx
 * 2. Replace [WorkflowName] with the feature/workflow you're testing
 * 3. Update imports, fixtures, and test cases to match your workflow
 * 4. Remove this header comment
 */

import { render, screen, fireEvent, waitFor } from '@/test-utils';
import { server } from '@/mocks/server';
import { seedDb, resetDb } from '@/mocks/db';
import {
  createSponsor,
  createSponsee,
  createTask,
  createMessage,
  createRelationship,
} from '@/__tests__/fixtures';
// Import the screens/components involved in the workflow
// import { TaskScreen } from '@/app/(tabs)/tasks';
// import { MessageScreen } from '@/app/(tabs)/messages';

/**
 * Integration Test Structure:
 * - Setup MSW server for API mocking
 * - Seed test data before each test
 * - Test complete user workflows
 * - Verify multiple components work together
 * - Test realistic data flows
 */
describe('[WorkflowName] Integration', () => {
  /**
   * MSW Setup
   * - Start server before all tests
   * - Reset handlers and database after each test
   * - Close server after all tests
   */
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
    resetDb();
  });

  afterAll(() => {
    server.close();
  });

  /**
   * Happy Path - Complete Workflow
   * Test the primary success scenario end-to-end
   */
  describe('successful workflow', () => {
    it('should complete [workflow] from start to finish', async () => {
      // ARRANGE: Setup test data
      const sponsor = createSponsor({
        first_name: 'John',
        email: 'sponsor@example.com',
      });
      const sponsee = createSponsee({
        first_name: 'Jane',
        email: 'sponsee@example.com',
      });
      const relationship = createRelationship({
        sponsor_id: sponsor.id,
        sponsee_id: sponsee.id,
        status: 'active',
      });

      // Seed the mock database
      seedDb({
        profiles: new Map([
          [sponsor.id, sponsor],
          [sponsee.id, sponsee],
        ]),
        sponsor_sponsee_relationships: new Map([[relationship.id, relationship]]),
      });

      // ACT: Render the component with authenticated sponsor
      render(<TaskScreen />, {
        withAuth: true,
        authState: { profile: sponsor },
      });

      // STEP 1: Sponsor creates a task
      await waitFor(() => {
        expect(screen.getByText('Create Task')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Create Task'));

      fireEvent.changeText(screen.getByTestId('task-title-input'), 'Complete Step 1');
      fireEvent.changeText(
        screen.getByTestId('task-description-input'),
        'Read the Big Book chapter 1'
      );

      fireEvent.press(screen.getByText('Submit'));

      // STEP 2: Verify task was created
      await waitFor(() => {
        expect(screen.getByText('Complete Step 1')).toBeTruthy();
        expect(screen.getByText('Read the Big Book chapter 1')).toBeTruthy();
      });

      // STEP 3: Verify task appears in sponsee's view
      // Re-render as sponsee
      render(<TaskScreen />, {
        withAuth: true,
        authState: { profile: sponsee },
      });

      await waitFor(() => {
        expect(screen.getByText('Complete Step 1')).toBeTruthy();
        expect(screen.getByText('assigned')).toBeTruthy();
      });

      // STEP 4: Sponsee completes the task
      fireEvent.press(screen.getByText('Complete Step 1'));
      fireEvent.press(screen.getByText('Mark Complete'));

      await waitFor(() => {
        expect(screen.getByText('completed')).toBeTruthy();
      });

      // ASSERT: Verify final state
      // Task should be marked as completed in the database
      const tasks = Array.from((await db.tasks.values()) as any);
      const createdTask = tasks.find((t: any) => t.title === 'Complete Step 1');
      expect(createdTask.status).toBe('completed');
    });
  });

  /**
   * Error Scenarios
   * Test how the workflow handles errors
   */
  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      const sponsor = createSponsor();
      seedDb({
        profiles: new Map([[sponsor.id, sponsor]]),
      });

      // Mock network error
      server.use(
        rest.post('*/rest/v1/tasks', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Internal Server Error' }));
        })
      );

      render(<TaskScreen />, {
        withAuth: true,
        authState: { profile: sponsor },
      });

      fireEvent.press(screen.getByText('Create Task'));
      fireEvent.changeText(screen.getByTestId('task-title-input'), 'Test Task');
      fireEvent.press(screen.getByText('Submit'));

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeTruthy();
      });

      // Verify task was not created
      expect(db.tasks.size).toBe(0);
    });

    it('should handle validation errors', async () => {
      const sponsor = createSponsor();
      seedDb({
        profiles: new Map([[sponsor.id, sponsor]]),
      });

      render(<TaskScreen />, {
        withAuth: true,
        authState: { profile: sponsor },
      });

      fireEvent.press(screen.getByText('Create Task'));
      // Submit without filling required fields
      fireEvent.press(screen.getByText('Submit'));

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeTruthy();
      });
    });

    it('should handle unauthorized access', async () => {
      const sponsor = createSponsor();
      const otherSponsor = createSponsor({ id: 'other-sponsor-id' });
      const task = createTask({
        sponsor_id: otherSponsor.id,
        title: 'Private Task',
      });

      seedDb({
        profiles: new Map([
          [sponsor.id, sponsor],
          [otherSponsor.id, otherSponsor],
        ]),
        tasks: new Map([[task.id, task]]),
      });

      render(<TaskScreen />, {
        withAuth: true,
        authState: { profile: sponsor },
      });

      await waitFor(() => {
        // Sponsor should not see other sponsor's tasks
        expect(screen.queryByText('Private Task')).toBeNull();
      });
    });
  });

  /**
   * Edge Cases
   * Test boundary conditions and unusual scenarios
   */
  describe('edge cases', () => {
    it('should handle empty state', async () => {
      const sponsor = createSponsor();
      seedDb({
        profiles: new Map([[sponsor.id, sponsor]]),
        tasks: new Map(), // No tasks
      });

      render(<TaskScreen />, {
        withAuth: true,
        authState: { profile: sponsor },
      });

      await waitFor(() => {
        expect(screen.getByText(/no tasks/i)).toBeTruthy();
      });
    });

    it('should handle large datasets', async () => {
      const sponsor = createSponsor();
      const tasks = new Map();

      // Create 100 tasks
      for (let i = 0; i < 100; i++) {
        const task = createTask({
          sponsor_id: sponsor.id,
          title: `Task ${i}`,
        });
        tasks.set(task.id, task);
      }

      seedDb({
        profiles: new Map([[sponsor.id, sponsor]]),
        tasks,
      });

      render(<TaskScreen />, {
        withAuth: true,
        authState: { profile: sponsor },
      });

      await waitFor(() => {
        // Verify pagination or virtualization works
        expect(screen.getByText('Task 0')).toBeTruthy();
      });
    });

    it('should handle concurrent updates', async () => {
      const sponsor = createSponsor();
      const task = createTask({
        sponsor_id: sponsor.id,
        title: 'Concurrent Task',
      });

      seedDb({
        profiles: new Map([[sponsor.id, sponsor]]),
        tasks: new Map([[task.id, task]]),
      });

      render(<TaskScreen />, {
        withAuth: true,
        authState: { profile: sponsor },
      });

      // Simulate two users updating the same task simultaneously
      fireEvent.press(screen.getByText('Concurrent Task'));
      fireEvent.press(screen.getByText('Edit'));
      fireEvent.changeText(screen.getByTestId('task-title-input'), 'Updated Title 1');

      // While first update is pending, trigger another update
      fireEvent.changeText(screen.getByTestId('task-title-input'), 'Updated Title 2');
      fireEvent.press(screen.getByText('Save'));

      await waitFor(() => {
        // Last update should win
        expect(screen.getByText('Updated Title 2')).toBeTruthy();
      });
    });
  });

  /**
   * Real-time Updates
   * Test how the workflow handles real-time data changes
   */
  describe('real-time updates', () => {
    it('should update UI when data changes externally', async () => {
      const sponsor = createSponsor();
      const sponsee = createSponsee();
      const task = createTask({
        sponsor_id: sponsor.id,
        sponsee_id: sponsee.id,
        status: 'assigned',
      });

      seedDb({
        profiles: new Map([
          [sponsor.id, sponsor],
          [sponsee.id, sponsee],
        ]),
        tasks: new Map([[task.id, task]]),
      });

      render(<TaskScreen />, {
        withAuth: true,
        authState: { profile: sponsor },
      });

      await waitFor(() => {
        expect(screen.getByText('assigned')).toBeTruthy();
      });

      // Simulate external update (e.g., via Supabase realtime)
      act(() => {
        db.tasks.set(task.id, { ...task, status: 'completed' });
        // Trigger realtime subscription callback
        // (implementation depends on your realtime setup)
      });

      await waitFor(() => {
        expect(screen.getByText('completed')).toBeTruthy();
      });
    });
  });

  /**
   * Multi-Step Workflows
   * Test complex workflows with multiple steps
   */
  describe('multi-step workflows', () => {
    it('should complete sponsor-sponsee relationship flow', async () => {
      const sponsor = createSponsor();
      const sponsee = createSponsee();

      seedDb({
        profiles: new Map([
          [sponsor.id, sponsor],
          [sponsee.id, sponsee],
        ]),
      });

      // STEP 1: Sponsor creates invite code
      render(<InviteScreen />, {
        withAuth: true,
        authState: { profile: sponsor },
      });

      fireEvent.press(screen.getByText('Generate Invite Code'));

      await waitFor(() => {
        expect(screen.getByText(/invite code:/i)).toBeTruthy();
      });

      const inviteCode = screen.getByTestId('invite-code').props.children;

      // STEP 2: Sponsee uses invite code
      render(<JoinScreen />, {
        withAuth: true,
        authState: { profile: sponsee },
      });

      fireEvent.changeText(screen.getByTestId('invite-code-input'), inviteCode);
      fireEvent.press(screen.getByText('Join'));

      // STEP 3: Verify relationship created
      await waitFor(() => {
        expect(screen.getByText('Successfully joined!')).toBeTruthy();
      });

      const relationships = Array.from(db.sponsor_sponsee_relationships.values());
      expect(relationships).toHaveLength(1);
      expect(relationships[0].sponsor_id).toBe(sponsor.id);
      expect(relationships[0].sponsee_id).toBe(sponsee.id);

      // STEP 4: Both users can see the relationship
      render(<ProfileScreen />, {
        withAuth: true,
        authState: { profile: sponsor },
      });

      await waitFor(() => {
        expect(screen.getByText(sponsee.first_name)).toBeTruthy();
      });
    });
  });
});
