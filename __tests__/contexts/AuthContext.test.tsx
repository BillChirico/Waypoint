/**
 * AuthContext Tests
 * Comprehensive tests for authentication state management
 */

import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { mockProfile } from '@/test-utils';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
      setSession: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// Mock expo-web-browser
jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn(),
  maybeCompleteAuthSession: jest.fn(),
}));

// Mock expo-auth-session
jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(),
}));

// Mock Platform
jest.mock('react-native', () => {
  const RN = jest.requireActual('../../__mocks__/react-native.js');
  return RN;
});

describe('AuthContext', () => {
  const mockSession = {
    access_token: 'test-token',
    refresh_token: 'test-refresh',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: {
      id: mockProfile.id,
      email: mockProfile.email,
      aud: 'authenticated',
      role: 'authenticated',
      created_at: mockProfile.created_at,
      updated_at: mockProfile.updated_at,
      user_metadata: {},
    },
  };

  const mockSupabaseFrom = (returnData: any, returnError: any = null) => {
    const chainable = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: returnData, error: returnError }),
      insert: jest.fn().mockResolvedValue({ data: returnData, error: returnError }),
    };
    (supabase.from as jest.Mock).mockReturnValue(chainable);
    return chainable;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default: no session
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    // Default: auth state change subscription
    (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: {
        subscription: {
          unsubscribe: jest.fn(),
        },
      },
    });
  });

  describe('Provider Initialization', () => {
    it('should start with loading state', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.loading).toBe(true);
    });

    it('should load session on mount if exists', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      mockSupabaseFrom(mockProfile);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.session).toEqual(mockSession);
      expect(result.current.user).toEqual(mockSession.user);
      expect(result.current.profile).toEqual(mockProfile);
    });

    it('should handle no session on mount', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.session).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.profile).toBeNull();
    });

    it('should handle profile fetch error gracefully', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      mockSupabaseFrom(null, new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.profile).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching profile:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('useAuth Hook', () => {
    // Note: The useAuth hook check for undefined context is ineffective since
    // createContext provides a default value. Using without provider returns
    // default values rather than throwing. This could be improved by using
    // createContext with undefined default and proper type guards.
  });

  describe('signIn', () => {
    it('should successfully sign in with email and password', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should throw error on sign in failure', async () => {
      const error = new Error('Invalid credentials');
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        error,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.signIn('test@example.com', 'wrongpassword');
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('signInWithGoogle', () => {
    it('should sign in with Google on web platform', async () => {
      Platform.OS = 'web';
      global.window = { location: { origin: 'http://localhost:3000' } } as any;

      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000',
        },
      });
    });

    it('should sign in with Google on native platform', async () => {
      Platform.OS = 'ios';
      const mockUrl = 'https://accounts.google.com/auth';
      const mockRedirectUri = 'https://example.com/auth/callback'; // Must be valid URL

      (makeRedirectUri as jest.Mock).mockReturnValue(mockRedirectUri);
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: mockUrl },
        error: null,
      });

      const mockAuthResult = {
        type: 'success' as const,
        url: `${mockRedirectUri}?access_token=test-token&refresh_token=test-refresh`,
      };
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue(mockAuthResult);

      (supabase.auth.setSession as jest.Mock).mockResolvedValue({
        data: { user: mockSession.user },
        error: null,
      });

      mockSupabaseFrom(mockProfile);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalledWith(mockUrl, mockRedirectUri);
      expect(supabase.auth.setSession).toHaveBeenCalledWith({
        access_token: 'test-token',
        refresh_token: 'test-refresh',
      });
    });

    it('should throw error on Google sign in failure', async () => {
      Platform.OS = 'web';
      const error = new Error('OAuth failed');
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        error,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.signInWithGoogle();
        })
      ).rejects.toThrow('OAuth failed');
    });
  });

  describe('signUp', () => {
    it('should successfully sign up and create profile', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockSession.user },
        error: null,
      });

      mockSupabaseFrom(mockProfile);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signUp('test@example.com', 'password123', 'Test', 'U');
      });

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });

    it('should throw error on sign up failure', async () => {
      const error = new Error('Email already exists');
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null },
        error,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.signUp('test@example.com', 'password123', 'Test', 'U');
        })
      ).rejects.toThrow('Email already exists');
    });

    it('should throw error on profile creation failure', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockSession.user },
        error: null,
      });

      const profileError = new Error('Profile insert failed');
      mockSupabaseFrom(null, profileError);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.signUp('test@example.com', 'password123', 'Test', 'U');
        })
      ).rejects.toThrow('Profile insert failed');
    });
  });

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      // Start with authenticated state
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      mockSupabaseFrom(mockProfile);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(result.current.profile).toBeNull();
    });

    it('should throw error on sign out failure', async () => {
      const error = new Error('Sign out failed');
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.signOut();
        })
      ).rejects.toThrow('Sign out failed');
    });
  });

  describe('refreshProfile', () => {
    it('should refresh profile when user is authenticated', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // First call returns original profile
      mockSupabaseFrom(mockProfile);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.profile?.first_name).toBe('Test');
      });

      // Update mock to return updated profile on next fetch
      const updatedProfile = { ...mockProfile, first_name: 'Updated' };
      mockSupabaseFrom(updatedProfile);

      await act(async () => {
        await result.current.refreshProfile();
      });

      await waitFor(() => {
        expect(result.current.profile?.first_name).toBe('Updated');
      });
    });

    it('should not fetch profile when user is not authenticated', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshProfile();
      });

      // Should not call from() when no user
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('Auth State Changes', () => {
    it('should handle auth state change to signed in', async () => {
      let authStateCallback: any;
      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(callback => {
        authStateCallback = callback;
        return {
          data: {
            subscription: {
              unsubscribe: jest.fn(),
            },
          },
        };
      });

      mockSupabaseFrom(mockProfile);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simulate sign in via auth state change
      await act(async () => {
        await authStateCallback('SIGNED_IN', mockSession);
      });

      await waitFor(() => {
        expect(result.current.session).toEqual(mockSession);
        expect(result.current.user).toEqual(mockSession.user);
        expect(result.current.profile).toEqual(mockProfile);
      });
    });

    it('should handle auth state change to signed out', async () => {
      let authStateCallback: any;
      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(callback => {
        authStateCallback = callback;
        return {
          data: {
            subscription: {
              unsubscribe: jest.fn(),
            },
          },
        };
      });

      // Start authenticated
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      mockSupabaseFrom(mockProfile);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile);
      });

      // Simulate sign out via auth state change
      await act(async () => {
        await authStateCallback('SIGNED_OUT', null);
      });

      await waitFor(() => {
        expect(result.current.session).toBeNull();
        expect(result.current.user).toBeNull();
        expect(result.current.profile).toBeNull();
      });
    });

    it('should auto-create profile for new OAuth users', async () => {
      let authStateCallback: any;
      (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(callback => {
        authStateCallback = callback;
        return {
          data: {
            subscription: {
              unsubscribe: jest.fn(),
            },
          },
        };
      });

      const oauthSession = {
        ...mockSession,
        user: {
          ...mockSession.user,
          user_metadata: {
            full_name: 'John Doe',
          },
        },
      };

      // First call returns null (no existing profile)
      const chainable = mockSupabaseFrom(null);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simulate OAuth sign in with new user
      await act(async () => {
        await authStateCallback('SIGNED_IN', oauthSession);
      });

      await waitFor(() => {
        expect(chainable.insert).toHaveBeenCalledWith({
          id: oauthSession.user.id,
          email: oauthSession.user.email,
          first_name: 'John',
          last_initial: 'D',
        });
      });
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe from auth state changes on unmount', async () => {
      const unsubscribeMock = jest.fn();
      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: {
          subscription: {
            unsubscribe: unsubscribeMock,
          },
        },
      });

      const { unmount } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });
});
