import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User, UserCredential } from 'firebase/auth';
import { useAuthUser, useLogin, useLogout, useSignup } from './useAuth';
import {
  loginWithEmailAndPwd,
  logout,
  signUpWithEmailAndPwd,
  subscribeToAuthStateChanges,
  updateUserAuthProfile,
} from '../services/authService';
import { updateUserDoc } from '../services/firestoreUserService';
import { uploadUserAvatar } from '../services/storageUserServce';

vi.mock('../services/authService', () => ({
  loginWithEmailAndPwd: vi.fn(),
  logout: vi.fn(),
  signUpWithEmailAndPwd: vi.fn(),
  subscribeToAuthStateChanges: vi.fn(),
  updateUserAuthProfile: vi.fn(),
}));

vi.mock('../services/firestoreUserService', () => ({
  updateUserDoc: vi.fn(),
}));

vi.mock('../services/storageUserServce', () => ({
  uploadUserAvatar: vi.fn(),
}));

const testUser = { uid: 'user-123', email: 'jane@example.com' } as User;

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(signUpWithEmailAndPwd).mockResolvedValue({
      user: testUser,
    } as UserCredential);
  });

  describe('useAuthUser', () => {
    it('starts loading, then exposes the user from the auth callback', () => {
      // Arrange
      let authCallback: (user: User | null) => void = () => {};
      vi.mocked(subscribeToAuthStateChanges).mockImplementation((callback) => {
        authCallback = callback;
        return vi.fn();
      });
      const { result } = renderHook(() => useAuthUser());
      expect(result.current).toEqual({ user: null, loading: true });

      // Act
      act(() => authCallback(testUser));

      // Assert
      expect(result.current).toEqual({ user: testUser, loading: false });
    });

    it('unsubscribes on unmount', () => {
      // Arrange
      const unsubscribe = vi.fn();
      vi.mocked(subscribeToAuthStateChanges).mockReturnValue(unsubscribe);
      const { unmount } = renderHook(() => useAuthUser());

      // Act
      unmount();

      // Assert
      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('useLogin', () => {
    it('logs in with the given credentials', async () => {
      // Arrange
      const { result } = renderHook(() => useLogin(), { wrapper });

      // Act
      await act(() =>
        result.current.mutateAsync({
          email: 'jane@example.com',
          password: 'secret123',
        })
      );

      // Assert
      expect(loginWithEmailAndPwd).toHaveBeenCalledWith(
        'jane@example.com',
        'secret123'
      );
    });
  });

  describe('useSignup', () => {
    const signupArgs = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'secret123',
    };

    it('creates the account and saves the profile without an avatar', async () => {
      // Arrange
      const { result } = renderHook(() => useSignup(), { wrapper });

      // Act
      const user = await act(() =>
        result.current.mutateAsync({ ...signupArgs, avatarFile: null })
      );

      // Assert
      expect(user).toBe(testUser);
      expect(uploadUserAvatar).not.toHaveBeenCalled();
      expect(updateUserAuthProfile).toHaveBeenCalledWith(testUser, {
        displayName: 'Jane Doe',
        photoURL: null,
      });
      expect(updateUserDoc).toHaveBeenCalledWith('user-123', {
        displayName: 'Jane Doe',
        firstName: 'Jane',
        lastName: 'Doe',
      });
    });

    it('uploads the avatar and stores its URL', async () => {
      // Arrange
      const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
      vi.mocked(uploadUserAvatar).mockResolvedValue(
        'https://example.com/avatar.png'
      );
      const { result } = renderHook(() => useSignup(), { wrapper });

      // Act
      await act(() =>
        result.current.mutateAsync({ ...signupArgs, avatarFile: file })
      );

      // Assert
      expect(uploadUserAvatar).toHaveBeenCalledWith('user-123', file);
      expect(updateUserAuthProfile).toHaveBeenCalledWith(testUser, {
        displayName: 'Jane Doe',
        photoURL: 'https://example.com/avatar.png',
      });
      expect(updateUserDoc).toHaveBeenCalledWith('user-123', {
        displayName: 'Jane Doe',
        firstName: 'Jane',
        lastName: 'Doe',
        photoURL: 'https://example.com/avatar.png',
      });
    });
  });

  describe('useLogout', () => {
    it('signs the user out', async () => {
      // Arrange
      const { result } = renderHook(() => useLogout(), { wrapper });

      // Act
      act(() => result.current.mutate());

      // Assert
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(logout).toHaveBeenCalledTimes(1);
    });
  });
});
