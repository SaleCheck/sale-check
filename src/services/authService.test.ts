import { afterEach, describe, expect, it, vi } from 'vitest';
import type { User } from 'firebase/auth';
import {
  loginWithEmailAndPwd,
  logout,
  signUpWithEmailAndPwd,
  subscribeToAuthStateChanges,
  updateUserAuthProfile,
} from './authService';

const {
  mockAuth,
  mockCreateUserWithEmailAndPassword,
  mockOnAuthStateChanged,
  mockSignInWithEmailAndPassword,
  mockSignOut,
  mockUpdateProfile,
} = vi.hoisted(() => ({
  mockAuth: { name: 'mock-auth' },
  mockCreateUserWithEmailAndPassword: vi.fn(),
  mockOnAuthStateChanged: vi.fn(),
  mockSignInWithEmailAndPassword: vi.fn(),
  mockSignOut: vi.fn(),
  mockUpdateProfile: vi.fn(),
}));

vi.mock('../firebase/firebase', () => ({
  auth: mockAuth,
}));

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  onAuthStateChanged: mockOnAuthStateChanged,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  signOut: mockSignOut,
  updateProfile: mockUpdateProfile,
}));

describe('authService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('subscribeToAuthStateChanges', () => {
    it('registers the callback on the auth instance and returns the unsubscribe function', () => {
      // Arrange
      const callback = vi.fn();
      const unsubscribe = vi.fn();
      mockOnAuthStateChanged.mockReturnValue(unsubscribe);

      // Act
      const result = subscribeToAuthStateChanges(callback);

      // Assert
      expect(mockOnAuthStateChanged).toHaveBeenCalledWith(mockAuth, callback);
      expect(result).toBe(unsubscribe);
    });
  });

  describe('logout', () => {
    it('signs out of the auth instance', async () => {
      // Arrange
      mockSignOut.mockResolvedValue(undefined);

      // Act
      await logout();

      // Assert
      expect(mockSignOut).toHaveBeenCalledWith(mockAuth);
    });
  });

  describe('loginWithEmailAndPwd', () => {
    it('signs in with the given credentials and returns the user credential', async () => {
      // Arrange
      const credential = { user: { uid: 'user-123' } };
      mockSignInWithEmailAndPassword.mockResolvedValue(credential);

      // Act
      const result = await loginWithEmailAndPwd('jane@example.com', 'secret');

      // Assert
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth,
        'jane@example.com',
        'secret'
      );
      expect(result).toBe(credential);
    });

    it('rejects when sign in fails', async () => {
      // Arrange
      mockSignInWithEmailAndPassword.mockRejectedValue(
        new Error('auth/invalid-credential')
      );

      // Act
      const result = loginWithEmailAndPwd('jane@example.com', 'wrong');

      // Assert
      await expect(result).rejects.toThrow('auth/invalid-credential');
    });
  });

  describe('signUpWithEmailAndPwd', () => {
    it('creates a user with the given credentials and returns the user credential', async () => {
      // Arrange
      const credential = { user: { uid: 'user-123' } };
      mockCreateUserWithEmailAndPassword.mockResolvedValue(credential);

      // Act
      const result = await signUpWithEmailAndPwd('jane@example.com', 'secret');

      // Assert
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth,
        'jane@example.com',
        'secret'
      );
      expect(result).toBe(credential);
    });
  });

  describe('updateUserAuthProfile', () => {
    it('updates the given user with the profile data', async () => {
      // Arrange
      const user = { uid: 'user-123' } as User;
      const data = {
        displayName: 'Jane Doe',
        photoURL: 'https://example.com/avatar.png',
      };
      mockUpdateProfile.mockResolvedValue(undefined);

      // Act
      await updateUserAuthProfile(user, data);

      // Assert
      expect(mockUpdateProfile).toHaveBeenCalledWith(user, data);
    });
  });
});
