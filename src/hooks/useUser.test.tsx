import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from 'firebase/auth';
import {
  useUpdateAvatar,
  useUpdateUserProfile,
  useUserDoc,
  userKeys,
} from './useUser';
import { updateUserAuthProfile } from '../services/authService';
import { getUserDoc, updateUserDoc } from '../services/firestoreUserService';
import { uploadUserAvatar } from '../services/storageUserServce';

vi.mock('../services/authService', () => ({
  updateUserAuthProfile: vi.fn(),
}));

vi.mock('../services/firestoreUserService', () => ({
  getUserDoc: vi.fn(),
  updateUserDoc: vi.fn(),
}));

vi.mock('../services/storageUserServce', () => ({
  uploadUserAvatar: vi.fn(),
}));

const testUser = { uid: 'user-123', email: 'jane@example.com' } as User;

let queryClient: QueryClient;

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  describe('useUserDoc', () => {
    it('does not fetch without a uid', () => {
      // Arrange
      // (no separate setup needed)

      // Act
      const { result } = renderHook(() => useUserDoc(undefined), { wrapper });

      // Assert
      expect(result.current.fetchStatus).toBe('idle');
      expect(getUserDoc).not.toHaveBeenCalled();
    });

    it('fetches the user document for the uid', async () => {
      // Arrange
      const userData = { uid: 'user-123', email: 'jane@example.com' };
      vi.mocked(getUserDoc).mockResolvedValue(userData);

      // Act
      const { result } = renderHook(() => useUserDoc('user-123'), {
        wrapper,
      });

      // Assert
      await waitFor(() => expect(result.current.data).toEqual(userData));
      expect(getUserDoc).toHaveBeenCalledWith('user-123');
    });
  });

  describe('useUpdateUserProfile', () => {
    it('saves the name to auth and the user document, then refreshes it', async () => {
      // Arrange
      const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
      const { result } = renderHook(() => useUpdateUserProfile(testUser), {
        wrapper,
      });

      // Act
      await act(() =>
        result.current.mutateAsync({ firstName: 'Jane', lastName: 'Smith' })
      );

      // Assert
      expect(updateUserAuthProfile).toHaveBeenCalledWith(testUser, {
        displayName: 'Jane Smith',
      });
      expect(updateUserDoc).toHaveBeenCalledWith('user-123', {
        displayName: 'Jane Smith',
        firstName: 'Jane',
        lastName: 'Smith',
      });
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: userKeys.detail('user-123'),
      });
    });

    it('rejects without an authenticated user', async () => {
      // Arrange
      const { result } = renderHook(() => useUpdateUserProfile(null), {
        wrapper,
      });

      // Act
      const update = act(() =>
        result.current.mutateAsync({ firstName: 'Jane', lastName: 'Smith' })
      );

      // Assert
      await expect(update).rejects.toThrow('No authenticated user');
      expect(updateUserDoc).not.toHaveBeenCalled();
    });
  });

  describe('useUpdateAvatar', () => {
    it('uploads the avatar, saves its URL, then refreshes the user', async () => {
      // Arrange
      const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
      const photoURL = 'https://example.com/new-avatar.png';
      vi.mocked(uploadUserAvatar).mockResolvedValue(photoURL);
      const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
      const { result } = renderHook(() => useUpdateAvatar(testUser), {
        wrapper,
      });

      // Act
      await act(() => result.current.mutateAsync(file));

      // Assert
      expect(uploadUserAvatar).toHaveBeenCalledWith('user-123', file);
      expect(updateUserAuthProfile).toHaveBeenCalledWith(testUser, {
        photoURL,
      });
      expect(updateUserDoc).toHaveBeenCalledWith('user-123', { photoURL });
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: userKeys.detail('user-123'),
      });
    });
  });
});
