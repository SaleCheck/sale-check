import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getUserDoc, updateUserDoc } from './firestoreUserService';

const { mockDb, mockDoc, mockGetDoc, mockServerTimestamp, mockSetDoc } =
  vi.hoisted(() => ({
    mockDb: { name: 'mock-db' },
    mockDoc: vi.fn(),
    mockGetDoc: vi.fn(),
    mockServerTimestamp: vi.fn(),
    mockSetDoc: vi.fn(),
  }));

vi.mock('../firebase/firebase', () => ({
  db: mockDb,
}));

vi.mock('firebase/firestore', () => ({
  doc: mockDoc,
  getDoc: mockGetDoc,
  serverTimestamp: mockServerTimestamp,
  setDoc: mockSetDoc,
}));

describe('firestoreUserService', () => {
  beforeEach(() => {
    mockDoc.mockReturnValue('doc-ref');
    mockServerTimestamp.mockReturnValue('server-timestamp');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserDoc', () => {
    it('reads the document from the users collection', async () => {
      // Arrange
      mockGetDoc.mockResolvedValue({ exists: () => false });

      // Act
      await getUserDoc('user-123');

      // Assert
      expect(mockDoc).toHaveBeenCalledWith(mockDb, 'users', 'user-123');
      expect(mockGetDoc).toHaveBeenCalledWith('doc-ref');
    });

    it('returns the user data when the document exists', async () => {
      // Arrange
      const userData = {
        uid: 'user-123',
        email: 'jane@example.com',
        firstName: 'Jane',
      };
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => userData,
      });

      // Act
      const result = await getUserDoc('user-123');

      // Assert
      expect(result).toEqual(userData);
    });

    it('returns null when the document does not exist', async () => {
      // Arrange
      mockGetDoc.mockResolvedValue({ exists: () => false });

      // Act
      const result = await getUserDoc('user-123');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('updateUserDoc', () => {
    it('merges the data and lastUpdated timestamp into the user document', async () => {
      // Arrange
      mockSetDoc.mockResolvedValue(undefined);
      const data = { displayName: 'Jane Doe', firstName: 'Jane' };

      // Act
      await updateUserDoc('user-123', data);

      // Assert
      expect(mockDoc).toHaveBeenCalledWith(mockDb, 'users', 'user-123');
      expect(mockSetDoc).toHaveBeenCalledWith(
        'doc-ref',
        { ...data, lastUpdated: 'server-timestamp' },
        { merge: true }
      );
    });

    it('rejects when the write fails', async () => {
      // Arrange
      mockSetDoc.mockRejectedValue(new Error('permission-denied'));

      // Act
      const result = updateUserDoc('user-123', { firstName: 'Jane' });

      // Assert
      await expect(result).rejects.toThrow('permission-denied');
    });
  });
});
