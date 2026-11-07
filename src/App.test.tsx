import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from 'firebase/auth';
import App from './App';
import { updateUserAuthProfile } from './services/authService';
import { getUserDoc, updateUserDoc } from './services/firestoreUserService';
import { uploadUserAvatar } from './services/storageUserServce';

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
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogout.mockResolvedValue(undefined);
    vi.mocked(getUserDoc).mockResolvedValue(null);
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
    expect(
      screen.queryByRole('img', { name: 'User Avatar' })
    ).not.toBeInTheDocument();
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

  it('shows the user avatar when logged in', () => {
    // Arrange
    // (no separate setup needed)

    // Act
    renderApp(testUser);

    // Assert
    expect(screen.getByRole('img', { name: 'User Avatar' })).toHaveAttribute(
      'src',
      'https://example.com/avatar.png'
    );
    expect(
      screen.queryByRole('menuitem', { name: 'Sign out' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Login' })
    ).not.toBeInTheDocument();
  });

  it('prefers the avatar from the user document over the auth profile', async () => {
    // Arrange
    vi.mocked(getUserDoc).mockResolvedValue({
      uid: 'user-123',
      email: 'jane@example.com',
      photoURL: 'https://example.com/new-avatar.png',
    });

    // Act
    renderApp(testUser, '/about');

    // Assert
    await vi.waitFor(() =>
      expect(screen.getByRole('img', { name: 'User Avatar' })).toHaveAttribute(
        'src',
        'https://example.com/new-avatar.png'
      )
    );
  });

  it('opens the avatar menu on hover', async () => {
    // Arrange
    renderApp(testUser, '/about');
    const user = userEvent.setup();

    // Act
    await user.hover(screen.getByRole('img', { name: 'User Avatar' }));

    // Assert
    expect(
      await screen.findByRole('menuitem', { name: 'Edit Avatar' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Sign out' })
    ).toBeInTheDocument();
  });

  it('opens the avatar menu on click', async () => {
    // Arrange
    renderApp(testUser, '/about');
    const user = userEvent.setup({ skipHover: true });

    // Act
    await user.pointer({
      keys: '[TouchA]',
      target: screen.getByRole('button', { name: 'User Avatar' }),
    });

    // Assert
    expect(
      await screen.findByRole('menuitem', { name: 'Sign out' })
    ).toBeInTheDocument();
  });

  it('uploads a new avatar and saves it to auth and the user document', async () => {
    // Arrange
    const newURL = 'https://example.com/new-avatar.png';
    vi.mocked(uploadUserAvatar).mockResolvedValue(newURL);
    renderApp(testUser, '/about');
    const user = userEvent.setup();
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    await user.hover(screen.getByRole('img', { name: 'User Avatar' }));
    await user.click(
      await screen.findByRole('menuitem', { name: 'Edit Avatar' })
    );
    const dialog = await screen.findByRole('dialog');
    await user.upload(
      within(dialog).getByLabelText('Upload new profile picture:'),
      file
    );
    vi.mocked(getUserDoc).mockResolvedValue({
      uid: 'user-123',
      email: 'jane@example.com',
      photoURL: newURL,
    });

    // Act
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    // Assert
    expect(uploadUserAvatar).toHaveBeenCalledWith('user-123', file);
    expect(updateUserAuthProfile).toHaveBeenCalledWith(testUser, {
      photoURL: newURL,
    });
    expect(updateUserDoc).toHaveBeenCalledWith('user-123', {
      photoURL: newURL,
    });
    await vi.waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
    expect(screen.getByRole('img', { name: 'User Avatar' })).toHaveAttribute(
      'src',
      newURL
    );
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

  it('logs out and returns to the home page when Sign out is clicked', async () => {
    // Arrange
    renderApp(testUser, '/about');
    const user = userEvent.setup();
    await user.hover(screen.getByRole('img', { name: 'User Avatar' }));

    // Act
    await user.click(await screen.findByRole('menuitem', { name: 'Sign out' }));

    // Assert
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByRole('heading', { name: 'Welcome to SaleCheck' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });
});
