import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createProductForUser,
  deleteProductForUser,
  getProductsForUser,
  updateProductForUser,
} from './firestoreProductService';

const {
  mockDb,
  mockAddDoc,
  mockCollection,
  mockDeleteDoc,
  mockDoc,
  mockGetDocs,
  mockQuery,
  mockServerTimestamp,
  mockUpdateDoc,
  mockWhere,
} = vi.hoisted(() => ({
  mockDb: { name: 'mock-db' },
  mockAddDoc: vi.fn(),
  mockCollection: vi.fn(),
  mockDeleteDoc: vi.fn(),
  mockDoc: vi.fn(),
  mockGetDocs: vi.fn(),
  mockQuery: vi.fn(),
  mockServerTimestamp: vi.fn(),
  mockUpdateDoc: vi.fn(),
  mockWhere: vi.fn(),
}));

vi.mock('../firebase/firebase', () => ({
  db: mockDb,
}));

vi.mock('firebase/firestore', () => ({
  addDoc: mockAddDoc,
  collection: mockCollection,
  deleteDoc: mockDeleteDoc,
  doc: mockDoc,
  getDocs: mockGetDocs,
  query: mockQuery,
  serverTimestamp: mockServerTimestamp,
  updateDoc: mockUpdateDoc,
  where: mockWhere,
  Timestamp: class {},
}));

const productValues = {
  productName: 'PlayStation 5',
  expectedPrice: 594,
  expectedPriceCurrency: 'DKK',
  url: 'https://example.com/ps5',
  cssSelector: '.price',
};

describe('firestoreProductService', () => {
  beforeEach(() => {
    mockCollection.mockReturnValue('collection-ref');
    mockDoc.mockReturnValue('doc-ref');
    mockWhere.mockReturnValue('where-constraint');
    mockQuery.mockReturnValue('query-ref');
    mockServerTimestamp.mockReturnValue('server-timestamp');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getProductsForUser', () => {
    it('queries productsToCheck filtered by the user field', async () => {
      // Arrange
      mockGetDocs.mockResolvedValue({ docs: [] });

      // Act
      await getProductsForUser('user-123');

      // Assert
      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'productsToCheck');
      expect(mockWhere).toHaveBeenCalledWith('user', '==', 'user-123');
      expect(mockQuery).toHaveBeenCalledWith(
        'collection-ref',
        'where-constraint'
      );
      expect(mockGetDocs).toHaveBeenCalledWith('query-ref');
    });

    it('maps each document to a product including its id', async () => {
      // Arrange
      mockGetDocs.mockResolvedValue({
        docs: [
          { id: 'product-1', data: () => ({ ...productValues }) },
          {
            id: 'product-2',
            data: () => ({ ...productValues, productName: 'Xbox Series X' }),
          },
        ],
      });

      // Act
      const result = await getProductsForUser('user-123');

      // Assert
      expect(result).toEqual([
        { id: 'product-1', ...productValues },
        { id: 'product-2', ...productValues, productName: 'Xbox Series X' },
      ]);
    });

    it('returns an empty array when the user has no products', async () => {
      // Arrange
      mockGetDocs.mockResolvedValue({ docs: [] });

      // Act
      const result = await getProductsForUser('user-123');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('createProductForUser', () => {
    it('adds the product with owner, notification email and timestamps', async () => {
      // Arrange
      const docRef = { id: 'new-product' };
      mockAddDoc.mockResolvedValue(docRef);

      // Act
      const result = await createProductForUser(
        'user-123',
        'jane@example.com',
        productValues
      );

      // Assert
      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'productsToCheck');
      expect(mockAddDoc).toHaveBeenCalledWith('collection-ref', {
        ...productValues,
        user: 'user-123',
        emailNotification: ['jane@example.com'],
        createdTimestamp: 'server-timestamp',
        lastUpdated: 'server-timestamp',
      });
      expect(result).toBe(docRef);
    });
  });

  describe('updateProductForUser', () => {
    it('updates the product document and refreshes lastUpdated', async () => {
      // Arrange
      mockUpdateDoc.mockResolvedValue(undefined);

      // Act
      await updateProductForUser('product-1', { expectedPrice: 499 });

      // Assert
      expect(mockDoc).toHaveBeenCalledWith(
        mockDb,
        'productsToCheck',
        'product-1'
      );
      expect(mockUpdateDoc).toHaveBeenCalledWith('doc-ref', {
        expectedPrice: 499,
        lastUpdated: 'server-timestamp',
      });
    });

    it('rejects when the update fails', async () => {
      // Arrange
      mockUpdateDoc.mockRejectedValue(new Error('permission-denied'));

      // Act
      const result = updateProductForUser('product-1', { expectedPrice: 499 });

      // Assert
      await expect(result).rejects.toThrow('permission-denied');
    });
  });

  describe('deleteProductForUser', () => {
    it('deletes the product document', async () => {
      // Arrange
      mockDeleteDoc.mockResolvedValue(undefined);

      // Act
      await deleteProductForUser('product-1');

      // Assert
      expect(mockDoc).toHaveBeenCalledWith(
        mockDb,
        'productsToCheck',
        'product-1'
      );
      expect(mockDeleteDoc).toHaveBeenCalledWith('doc-ref');
    });
  });
});
