import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from 'firebase/auth';
import App from './App';

const { mockUnsubscribe, mockSubscribeToAuthStateChanges, mockLogout } =
  vi.hoisted(() => ({
    mockUnsubscribe: vi.fn(),
    mockSubscribeToAuthStateChanges: vi.fn(),
    mockLogout: vi.fn(),
  }));

vi.mock('./services/authService', () => ({
  subscribeToAuthStateChanges: mockSubscribeToAuthStateChanges,
  logout: mockLogout,
  loginWithEmailAndPwd: vi.fn(),
  signUpWithEmailAndPwd: vi.fn(),
  updateUserAuthProfile: vi.fn(),
}));

vi.mock('./services/firestoreUserService', () => ({
  getUserDoc: vi.fn(),
  updateUserDoc: vi.fn(),
}));

vi.mock('./services/firestoreProductService', () => ({
  getProductsForUser: vi.fn(),
  createProductForUser: vi.fn(),
  updateProductForUser: vi.fn(),
  deleteProductForUser: vi.fn(),
}));

vi.mock('./services/storageUserServce', () => ({
  uploadUserAvatar: vi.fn(),
  uploadProductImage: vi.fn(),
}));

vi.mock('./services/contactEmailService', () => ({
  sendContactMessage: vi.fn(),
}));

const testUser = {
  uid: 'user-123',
  email: 'jane@example.com',
  photoURL: 'https://example.com/avatar.png',
} as User;

function renderApp(currentUser: User | null, initialPath = '/') {
  mockSubscribeToAuthStateChanges.mockImplementation((callback) => {
    callback(currentUser);
    return mockUnsubscribe;
  });
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>
  );
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogout.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
  });

  it('sets the document title', () => {
    // Arrange
    document.title = '';

    // Act
    renderApp(null);

    // Assert
    expect(document.title).toBe('SaleCheck');
  });

  it('unsubscribes from auth state changes on unmount', () => {
    // Arrange
    const { unmount } = renderApp(null);

    // Act
    unmount();

    // Assert
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('renders the home page on the root route', () => {
    // Arrange
    // (no separate setup needed)

    // Act
    renderApp(null);

    // Assert
    expect(
      screen.getByRole('heading', { name: 'Welcome to SaleCheck' })
    ).toBeInTheDocument();
  });

  it('renders the footer with the current year', () => {
    // Arrange
    const year = new Date().getFullYear();

    // Act
    renderApp(null);

    // Assert
    expect(
      screen.getByText(`© ${year} SaleCheck. All rights reserved.`)
    ).toBeInTheDocument();
  });

  it('navigates to a page when its nav link is clicked', async () => {
    // Arrange
    renderApp(null);
    const user = userEvent.setup();

    // Act
    await user.click(screen.getByRole('link', { name: 'About' }));

    // Assert
    expect(
      screen.getByRole('heading', { level: 1, name: 'About Us' })
    ).toBeInTheDocument();
  });

  it('shows Login and Sign Up buttons when logged out', () => {
    // Arrange
    // (no separate setup needed)

    // Act
    renderApp(null);

    // Assert
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.queryByText('Signout')).not.toBeInTheDocument();
  });

  it('opens the login form in a modal when Login is clicked', async () => {
    // Arrange
    renderApp(null);
    const user = userEvent.setup();

    // Act
    await user.click(screen.getByRole('button', { name: 'Login' }));

    // Assert
    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByRole('heading', { name: 'Login' })
    ).toBeInTheDocument();
  });

  it('opens the signup form in a modal when Sign Up is clicked', async () => {
    // Arrange
    renderApp(null);
    const user = userEvent.setup();

    // Act
    await user.click(screen.getByRole('button', { name: 'Sign Up' }));

    // Assert
    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByRole('heading', { name: 'Sign Up' })
    ).toBeInTheDocument();
  });

  it('switches from the login form to the signup form inside the modal', async () => {
    // Arrange
    renderApp(null);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Login' }));
    const dialog = await screen.findByRole('dialog');

    // Act
    await user.click(within(dialog).getByRole('button', { name: 'Sign Up' }));

    // Assert
    expect(
      within(dialog).getByRole('heading', { name: 'Sign Up' })
    ).toBeInTheDocument();
  });

  it('toggles the mobile nav when the hamburger button is clicked', async () => {
    // Arrange
    renderApp(null);
    const user = userEvent.setup();
    const hamburger = screen
      .getAllByRole('button')
      .find((button) => button.textContent === '') as HTMLButtonElement;

    // Act
    await user.click(hamburger);

    // Assert
    expect(
      await screen.findAllByRole('link', { name: 'Contact' })
    ).toHaveLength(2);
  });

  it('shows the user avatar and Signout when logged in', () => {
    // Arrange
    // (no separate setup needed)

    // Act
    renderApp(testUser);

    // Assert
    expect(screen.getByRole('img', { name: 'User Avatar' })).toHaveAttribute(
      'src',
      'https://example.com/avatar.png'
    );
    expect(screen.getByText('Signout')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Login' })
    ).not.toBeInTheDocument();
  });

  it('redirects a logged-in user from the root route to their profile', async () => {
    // Arrange
    // (no separate setup needed)

    // Act
    renderApp(testUser);

    // Assert
    expect(
      screen.queryByRole('heading', { name: 'Welcome to SaleCheck' })
    ).not.toBeInTheDocument();
    await vi.waitFor(() => expect(document.title).toBe('SaleCheck | Profile'));
  });

  it('logs out and returns to the home page when Signout is clicked', async () => {
    // Arrange
    renderApp(testUser, '/about');
    const user = userEvent.setup();

    // Act
    await user.click(screen.getByText('Signout'));

    // Assert
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByRole('heading', { name: 'Welcome to SaleCheck' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });
});
