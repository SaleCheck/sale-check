import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { User } from 'firebase/auth';
import type { Product } from '../services/firestoreProductService';
import Profile from './Profile';

const {
  mockUnsubscribe,
  mockSubscribeToAuthStateChanges,
  mockGetUserDoc,
  mockGetProductsForUser,
  mockCreateProductForUser,
  mockUpdateProductForUser,
  mockDeleteProductForUser,
  mockUploadProductImage,
} = vi.hoisted(() => ({
  mockUnsubscribe: vi.fn(),
  mockSubscribeToAuthStateChanges: vi.fn(),
  mockGetUserDoc: vi.fn(),
  mockGetProductsForUser: vi.fn(),
  mockCreateProductForUser: vi.fn(),
  mockUpdateProductForUser: vi.fn(),
  mockDeleteProductForUser: vi.fn(),
  mockUploadProductImage: vi.fn(),
}));

vi.mock('../services/authService', () => ({
  subscribeToAuthStateChanges: mockSubscribeToAuthStateChanges,
}));

vi.mock('../services/firestoreUserService', () => ({
  getUserDoc: mockGetUserDoc,
}));

vi.mock('../services/firestoreProductService', () => ({
  getProductsForUser: mockGetProductsForUser,
  createProductForUser: mockCreateProductForUser,
  updateProductForUser: mockUpdateProductForUser,
  deleteProductForUser: mockDeleteProductForUser,
}));

vi.mock('../services/storageUserServce', () => ({
  uploadProductImage: mockUploadProductImage,
}));

const testUser = {
  uid: 'user-123',
  email: 'jane@example.com',
  displayName: 'Jane Doe',
} as User;

const testProduct: Product = {
  id: 'product-1',
  productName: 'PlayStation 5',
  expectedPrice: 594,
  expectedPriceCurrency: 'DKK',
  url: 'https://example.com/ps5',
  cssSelector: '.price',
  user: 'user-123',
  emailNotification: ['jane@example.com'],
};

let authCallback: (user: User | null) => Promise<void>;

function renderWithQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Profile />
    </QueryClientProvider>
  );
}

async function renderProfile(user: User | null) {
  const result = renderWithQueryClient();
  await act(async () => {
    await authCallback(user);
  });
  if (user) {
    await screen.findByRole('heading', { name: /^Welcome/ });
  }
  return result;
}

describe('Profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockSubscribeToAuthStateChanges.mockImplementation((callback) => {
      authCallback = callback;
      return mockUnsubscribe;
    });
    mockGetUserDoc.mockResolvedValue({
      uid: 'user-123',
      email: 'jane@example.com',
      firstName: 'Jane',
    });
    mockGetProductsForUser.mockResolvedValue([testProduct]);
    mockCreateProductForUser.mockResolvedValue({ id: 'new-product' });
    mockUpdateProductForUser.mockResolvedValue(undefined);
    mockDeleteProductForUser.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('sets the document title', () => {
    // Arrange
    document.title = '';

    // Act
    renderWithQueryClient();

    // Assert
    expect(document.title).toBe('SaleCheck | Profile');
  });

  it('unsubscribes from auth state changes on unmount', () => {
    // Arrange
    const { unmount } = renderWithQueryClient();

    // Act
    unmount();

    // Assert
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('shows a not-logged-in message when there is no user', async () => {
    // Arrange
    // (no separate setup needed)

    // Act
    await renderProfile(null);

    // Assert
    expect(screen.getByText('You are not logged in.')).toBeInTheDocument();
    expect(mockGetUserDoc).not.toHaveBeenCalled();
  });

  it('shows a loading message while fetching user data', async () => {
    // Arrange
    mockGetUserDoc.mockReturnValue(new Promise(() => {}));
    renderWithQueryClient();

    // Act
    act(() => {
      void authCallback(testUser);
    });

    // Assert
    expect(screen.getByText('Fetching products...')).toBeInTheDocument();
  });

  it('greets the user by first name and renders a card per product', async () => {
    // Arrange
    mockGetProductsForUser.mockResolvedValue([
      testProduct,
      { ...testProduct, id: 'product-2', productName: 'Xbox Series X' },
    ]);

    // Act
    await renderProfile(testUser);

    // Assert
    expect(mockGetUserDoc).toHaveBeenCalledWith('user-123');
    expect(mockGetProductsForUser).toHaveBeenCalledWith('user-123');
    expect(
      screen.getByRole('heading', { name: 'Welcome, Jane!' })
    ).toBeInTheDocument();
    expect(screen.getByText('PlayStation 5')).toBeInTheDocument();
    expect(screen.getByText('Xbox Series X')).toBeInTheDocument();
  });

  it('falls back to the display name when the user doc has no first name', async () => {
    // Arrange
    mockGetUserDoc.mockResolvedValue(null);

    // Act
    await renderProfile(testUser);

    // Assert
    expect(
      screen.getByRole('heading', { name: 'Welcome, Jane Doe!' })
    ).toBeInTheDocument();
  });

  it('creates a product with a numeric price and refreshes the product list', async () => {
    // Arrange
    mockGetProductsForUser.mockResolvedValue([]);
    await renderProfile(testUser);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add Product' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Product Name:'), 'Switch');
    await user.type(within(dialog).getByLabelText('Expected Price:'), '299');
    await user.type(within(dialog).getByLabelText('Currency:'), 'DKK');
    await user.type(
      within(dialog).getByLabelText('Product URL:'),
      'https://example.com/switch'
    );
    await user.type(within(dialog).getByLabelText('CSS Selector:'), '.price');

    // Act
    await user.click(
      within(dialog).getByRole('button', { name: 'Add Product' })
    );

    // Assert
    expect(mockCreateProductForUser).toHaveBeenCalledWith(
      'user-123',
      'jane@example.com',
      {
        productName: 'Switch',
        expectedPrice: 299,
        expectedPriceCurrency: 'DKK',
        url: 'https://example.com/switch',
        cssSelector: '.price',
      }
    );
    expect(mockUploadProductImage).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(mockGetProductsForUser).toHaveBeenCalledTimes(2)
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
  });

  it('uploads the product image after creating a product', async () => {
    // Arrange
    mockGetProductsForUser.mockResolvedValue([]);
    mockUploadProductImage.mockResolvedValue('https://example.com/img.png');
    await renderProfile(testUser);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add Product' }));
    const dialog = await screen.findByRole('dialog');
    const image = new File(['img'], 'img.png', { type: 'image/png' });
    await user.upload(
      dialog.querySelector('input[type="file"]') as HTMLInputElement,
      image
    );

    // Act
    await user.click(
      within(dialog).getByRole('button', { name: 'Add Product' })
    );

    // Assert
    expect(mockUploadProductImage).toHaveBeenCalledWith('new-product', image);
    expect(mockUpdateProductForUser).toHaveBeenCalledWith('new-product', {
      imageUrl: 'https://example.com/img.png',
    });
    await waitFor(() =>
      expect(mockGetProductsForUser).toHaveBeenCalledTimes(2)
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
  });

  it('opens the edit form prefilled and saves the changes', async () => {
    // Arrange
    await renderProfile(testUser);
    const user = userEvent.setup();
    await user.click(screen.getByTitle('Edit product'));
    const dialog = await screen.findByRole('dialog');
    const priceInput = within(dialog).getByLabelText('Expected Price:');
    expect(within(dialog).getByLabelText('Product Name:')).toHaveValue(
      'PlayStation 5'
    );
    await user.clear(priceInput);
    await user.type(priceInput, '499');

    // Act
    await user.click(
      within(dialog).getByRole('button', { name: 'Save Changes' })
    );

    // Assert
    expect(mockUpdateProductForUser).toHaveBeenCalledWith('product-1', {
      productName: 'PlayStation 5',
      expectedPrice: 499,
      expectedPriceCurrency: 'DKK',
      url: 'https://example.com/ps5',
      cssSelector: '.price',
    });
    await waitFor(() =>
      expect(mockGetProductsForUser).toHaveBeenCalledTimes(2)
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
  });

  it('asks for confirmation and deletes the product', async () => {
    // Arrange
    await renderProfile(testUser);
    const user = userEvent.setup();
    await user.click(screen.getByTitle('Archive product'));
    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByText('Are you sure you want to delete this product?')
    ).toBeInTheDocument();

    // Act
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    // Assert
    expect(mockDeleteProductForUser).toHaveBeenCalledWith('product-1');
    await waitFor(() =>
      expect(mockGetProductsForUser).toHaveBeenCalledTimes(2)
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
  });

  it('does not delete the product when the deletion is cancelled', async () => {
    // Arrange
    await renderProfile(testUser);
    const user = userEvent.setup();
    await user.click(screen.getByTitle('Archive product'));
    const dialog = await screen.findByRole('dialog');

    // Act
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    // Assert
    expect(mockDeleteProductForUser).not.toHaveBeenCalled();
    expect(mockGetProductsForUser).toHaveBeenCalledTimes(1);
  });
});
