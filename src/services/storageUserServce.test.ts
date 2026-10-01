import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { uploadProductImage, uploadUserAvatar } from './storageUserServce';

const { mockStorage, mockRef, mockUploadBytes, mockGetDownloadURL } =
  vi.hoisted(() => ({
    mockStorage: { name: 'mock-storage' },
    mockRef: vi.fn(),
    mockUploadBytes: vi.fn(),
    mockGetDownloadURL: vi.fn(),
  }));

vi.mock('../firebase/firebase', () => ({
  storage: mockStorage,
}));

vi.mock('firebase/storage', () => ({
  ref: mockRef,
  uploadBytes: mockUploadBytes,
  getDownloadURL: mockGetDownloadURL,
}));

const file = new File(['img'], 'image.png', { type: 'image/png' });

describe('storageUserServce', () => {
  beforeEach(() => {
    mockRef.mockReturnValue('storage-ref');
    mockUploadBytes.mockResolvedValue(undefined);
    mockGetDownloadURL.mockResolvedValue('https://example.com/image.png');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadUserAvatar', () => {
    it('uploads the file to the user avatar path', async () => {
      // Arrange
      // (mocks are configured in beforeEach)

      // Act
      await uploadUserAvatar('user-123', file);

      // Assert
      expect(mockRef).toHaveBeenCalledWith(
        mockStorage,
        'users/avatar/user-123/user-123.png'
      );
      expect(mockUploadBytes).toHaveBeenCalledWith('storage-ref', file);
    });

    it('returns the download URL of the uploaded avatar', async () => {
      // Arrange
      // (mocks are configured in beforeEach)

      // Act
      const result = await uploadUserAvatar('user-123', file);

      // Assert
      expect(mockGetDownloadURL).toHaveBeenCalledWith('storage-ref');
      expect(result).toBe('https://example.com/image.png');
    });

    it('does not request a download URL when the upload fails', async () => {
      // Arrange
      mockUploadBytes.mockRejectedValue(new Error('storage/unauthorized'));

      // Act
      const result = uploadUserAvatar('user-123', file);

      // Assert
      await expect(result).rejects.toThrow('storage/unauthorized');
      expect(mockGetDownloadURL).not.toHaveBeenCalled();
    });
  });

  describe('uploadProductImage', () => {
    it('uploads the file to the product image path', async () => {
      // Arrange
      // (mocks are configured in beforeEach)

      // Act
      await uploadProductImage('product-1', file);

      // Assert
      expect(mockRef).toHaveBeenCalledWith(
        mockStorage,
        '/productImages/product-1/product-1.png'
      );
      expect(mockUploadBytes).toHaveBeenCalledWith('storage-ref', file);
    });

    it('returns the download URL of the uploaded image', async () => {
      // Arrange
      // (mocks are configured in beforeEach)

      // Act
      const result = await uploadProductImage('product-1', file);

      // Assert
      expect(mockGetDownloadURL).toHaveBeenCalledWith('storage-ref');
      expect(result).toBe('https://example.com/image.png');
    });

    it('does not request a download URL when the upload fails', async () => {
      // Arrange
      mockUploadBytes.mockRejectedValue(new Error('storage/unauthorized'));

      // Act
      const result = uploadProductImage('product-1', file);

      // Assert
      await expect(result).rejects.toThrow('storage/unauthorized');
      expect(mockGetDownloadURL).not.toHaveBeenCalled();
    });
  });
});
