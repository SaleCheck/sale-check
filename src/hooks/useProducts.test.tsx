import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from 'firebase/auth';
import type { DocumentReference } from 'firebase/firestore';
import {
  productKeys,
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from './useProducts';
import {
  createProductForUser,
  deleteProductForUser,
  getProductsForUser,
  updateProductForUser,
} from '../services/firestoreProductService';
import { uploadProductImage } from '../services/storageUserServce';

vi.mock('../services/firestoreProductService', () => ({
  createProductForUser: vi.fn(),
  deleteProductForUser: vi.fn(),
  getProductsForUser: vi.fn(),
  updateProductForUser: vi.fn(),
}));

vi.mock('../services/storageUserServce', () => ({
  uploadProductImage: vi.fn(),
}));

const testUser = { uid: 'user-123', email: 'jane@example.com' } as User;

const values = {
  productName: 'PlayStation 5',
  expectedPrice: '594',
  expectedPriceCurrency: 'DKK',
  url: 'https://example.com/ps5',
  cssSelector: '.price',
};

const imageFile = new File(['img'], 'ps5.png', { type: 'image/png' });

let queryClient: QueryClient;

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.mocked(createProductForUser).mockResolvedValue({
      id: 'new-product',
    } as DocumentReference);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useProducts', () => {
    it('fetches the products for the uid', async () => {
      // Arrange
      vi.mocked(getProductsForUser).mockResolvedValue([]);

      // Act
      const { result } = renderHook(() => useProducts('user-123'), {
        wrapper,
      });

      // Assert
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(getProductsForUser).toHaveBeenCalledWith('user-123');
    });
  });

  describe('useCreateProduct', () => {
    it('creates the product with a numeric price and refreshes the list', async () => {
      // Arrange
      const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
      const { result } = renderHook(() => useCreateProduct(testUser), {
        wrapper,
      });

      // Act
      await act(() =>
        result.current.mutateAsync({ values, productImageFile: null })
      );

      // Assert
      expect(createProductForUser).toHaveBeenCalledWith(
        'user-123',
        'jane@example.com',
        { ...values, expectedPrice: 594 }
      );
      expect(uploadProductImage).not.toHaveBeenCalled();
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: productKeys.list('user-123'),
      });
    });

    it('uploads the image and stores its URL on the new product', async () => {
      // Arrange
      vi.mocked(uploadProductImage).mockResolvedValue(
        'https://example.com/ps5.png'
      );
      const { result } = renderHook(() => useCreateProduct(testUser), {
        wrapper,
      });

      // Act
      await act(() =>
        result.current.mutateAsync({ values, productImageFile: imageFile })
      );

      // Assert
      expect(uploadProductImage).toHaveBeenCalledWith('new-product', imageFile);
      expect(updateProductForUser).toHaveBeenCalledWith('new-product', {
        imageUrl: 'https://example.com/ps5.png',
      });
    });

    it('still succeeds when the image upload fails', async () => {
      // Arrange
      vi.mocked(uploadProductImage).mockRejectedValue(new Error('Upload'));
      const { result } = renderHook(() => useCreateProduct(testUser), {
        wrapper,
      });

      // Act
      await act(() =>
        result.current.mutateAsync({ values, productImageFile: imageFile })
      );

      // Assert
      expect(updateProductForUser).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        'Image upload failed:',
        expect.any(Error)
      );
    });
  });

  describe('useUpdateProduct', () => {
    it('updates the product with a numeric price and refreshes the list', async () => {
      // Arrange
      const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
      const { result } = renderHook(() => useUpdateProduct('user-123'), {
        wrapper,
      });

      // Act
      await act(() =>
        result.current.mutateAsync({
          productId: 'product-1',
          values,
          productImageFile: null,
        })
      );

      // Assert
      expect(updateProductForUser).toHaveBeenCalledWith('product-1', {
        ...values,
        expectedPrice: 594,
      });
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: productKeys.list('user-123'),
      });
    });

    it('includes the uploaded image URL in the update', async () => {
      // Arrange
      vi.mocked(uploadProductImage).mockResolvedValue(
        'https://example.com/ps5.png'
      );
      const { result } = renderHook(() => useUpdateProduct('user-123'), {
        wrapper,
      });

      // Act
      await act(() =>
        result.current.mutateAsync({
          productId: 'product-1',
          values,
          productImageFile: imageFile,
        })
      );

      // Assert
      expect(updateProductForUser).toHaveBeenCalledWith('product-1', {
        ...values,
        expectedPrice: 594,
        imageUrl: 'https://example.com/ps5.png',
      });
    });
  });

  describe('useDeleteProduct', () => {
    it('deletes the product and refreshes the list', async () => {
      // Arrange
      const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
      const { result } = renderHook(() => useDeleteProduct('user-123'), {
        wrapper,
      });

      // Act
      await act(() => result.current.mutateAsync('product-1'));

      // Assert
      expect(deleteProductForUser).toHaveBeenCalledWith('product-1');
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: productKeys.list('user-123'),
      });
    });
  });
});
