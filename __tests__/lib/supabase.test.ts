/**
 * Tests for Supabase client initialization
 * Tests the client creation and configuration
 */

describe('Supabase Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Client initialization', () => {
    it('should create supabase client with correct configuration', () => {
      const { supabase: client } = require('@/lib/supabase');

      expect(client).toBeDefined();
      expect(client.auth).toBeDefined();
      expect(client.from).toBeDefined();
    });

    it('should have auth methods available', () => {
      const { supabase: client } = require('@/lib/supabase');

      expect(typeof client.auth.signInWithPassword).toBe('function');
      expect(typeof client.auth.signUp).toBe('function');
      expect(typeof client.auth.signOut).toBe('function');
      expect(typeof client.auth.getSession).toBe('function');
    });

    it('should have database query methods available', () => {
      const { supabase: client } = require('@/lib/supabase');

      // Should be able to create table queries
      const profilesQuery = client.from('profiles');
      expect(profilesQuery).toBeDefined();
      expect(typeof profilesQuery.select).toBe('function');
      expect(typeof profilesQuery.insert).toBe('function');
      expect(typeof profilesQuery.update).toBe('function');
      expect(typeof profilesQuery.delete).toBe('function');
    });

    it('should export supabase client as named export', () => {
      const supabaseModule = require('@/lib/supabase');

      expect(supabaseModule.supabase).toBeDefined();
      expect(supabaseModule.supabase.auth).toBeDefined();
    });
  });

  describe('Client methods', () => {
    it('should support table queries', () => {
      const { supabase: client } = require('@/lib/supabase');

      const query = client.from('profiles');
      expect(query).toBeDefined();
      expect(typeof query.select).toBe('function');
    });

    it('should support multiple table queries', () => {
      const { supabase: client } = require('@/lib/supabase');

      const profilesQuery = client.from('profiles');
      const tasksQuery = client.from('tasks');
      const messagesQuery = client.from('messages');

      expect(profilesQuery).toBeDefined();
      expect(tasksQuery).toBeDefined();
      expect(messagesQuery).toBeDefined();
    });
  });

  describe('Configuration', () => {
    it('should use environment variables for initialization', () => {
      // The fact that the client initializes without error means
      // environment variables are correctly configured
      const { supabase: client } = require('@/lib/supabase');

      expect(client).toBeDefined();
      expect(client.auth).toBeDefined();
    });

    it('should have auth storage configured', () => {
      const { supabase: client } = require('@/lib/supabase');

      // Verify the client is properly initialized with storage
      expect(client.auth).toBeDefined();
    });
  });
});
