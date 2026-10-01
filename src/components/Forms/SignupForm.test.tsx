import { cleanup, render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SignupForm from './SignupForm';

const {
  mockNavigate,
  mockSignUpWithEmailAndPwd,
  mockUpdateUserAuthProfile,
  mockUpdateUserDoc,
  mockUploadUserAvatar,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockSignUpWithEmailAndPwd: vi.fn(),
  mockUpdateUserAuthProfile: vi.fn(),
  mockUpdateUserDoc: vi.fn(),
  mockUploadUserAvatar: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => mockNavigate,
}));

vi.mock('../../services/authService', () => ({
  signUpWithEmailAndPwd: mockSignUpWithEmailAndPwd,
  updateUserAuthProfile: mockUpdateUserAuthProfile,
}));

vi.mock('../../services/firestoreUserService', () => ({
  updateUserDoc: mockUpdateUserDoc,
}));

vi.mock('../../services/storageUserServce', () => ({
  uploadUserAvatar: mockUploadUserAvatar,
}));

async function fillForm(
  user: UserEvent,
  { confirmPassword = 'secret123' }: { confirmPassword?: string } = {}
) {
  await user.type(screen.getByPlaceholderText('First Name'), 'Jane');
  await user.type(screen.getByPlaceholderText('Last Name'), 'Doe');
  await user.type(screen.getByPlaceholderText('Email'), 'jane@example.com');
  await user.type(screen.getByPlaceholderText('Password'), 'secret123');
  await user.type(
    screen.getByPlaceholderText('Confirm Password'),
    confirmPassword
  );
}

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    mockSignUpWithEmailAndPwd.mockResolvedValue({ user: { uid: 'user-123' } });
    mockUpdateUserAuthProfile.mockResolvedValue(undefined);
    mockUpdateUserDoc.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders all signup fields', () => {
    // Arrange
    // (no separate setup needed; props are passed inline below)

    // Act
    render(<SignupForm switchToLogin={() => {}} />);

    // Assert
    expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
  });

  it('shows an error and does not sign up when passwords do not match', async () => {
    // Arrange
    render(<SignupForm switchToLogin={() => {}} />);
    const user = userEvent.setup();
    await fillForm(user, { confirmPassword: 'different' });

    // Act
    await user.click(screen.getByRole('button', { name: 'Sign Up' }));

    // Assert
    expect(
      await screen.findByText('Passwords do not match.')
    ).toBeInTheDocument();
    expect(mockSignUpWithEmailAndPwd).not.toHaveBeenCalled();
  });

  it('signs up, saves the profile, closes the modal and navigates to the profile', async () => {
    // Arrange
    const closeModal = vi.fn();
    render(<SignupForm switchToLogin={() => {}} closeModal={closeModal} />);
    const user = userEvent.setup();
    await fillForm(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Sign Up' }));

    // Assert
    expect(mockSignUpWithEmailAndPwd).toHaveBeenCalledWith(
      'jane@example.com',
      'secret123'
    );
    expect(mockUploadUserAvatar).not.toHaveBeenCalled();
    expect(mockUpdateUserAuthProfile).toHaveBeenCalledWith(
      { uid: 'user-123' },
      { displayName: 'Jane Doe', photoURL: null }
    );
    expect(mockUpdateUserDoc).toHaveBeenCalledWith('user-123', {
      displayName: 'Jane Doe',
      firstName: 'Jane',
      lastName: 'Doe',
    });
    expect(closeModal).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/profile?id=user-123');
  });

  it('uploads the avatar and stores its URL when a file is selected', async () => {
    // Arrange
    mockUploadUserAvatar.mockResolvedValue('https://example.com/avatar.png');
    const { container } = render(<SignupForm switchToLogin={() => {}} />);
    const user = userEvent.setup();
    const avatar = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    await fillForm(user);
    await user.upload(
      container.querySelector('input[type="file"]') as HTMLInputElement,
      avatar
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Sign Up' }));

    // Assert
    expect(mockUploadUserAvatar).toHaveBeenCalledWith('user-123', avatar);
    expect(mockUpdateUserAuthProfile).toHaveBeenCalledWith(
      { uid: 'user-123' },
      { displayName: 'Jane Doe', photoURL: 'https://example.com/avatar.png' }
    );
    expect(mockUpdateUserDoc).toHaveBeenCalledWith('user-123', {
      displayName: 'Jane Doe',
      firstName: 'Jane',
      lastName: 'Doe',
      photoURL: 'https://example.com/avatar.png',
    });
  });

  it('shows the error message when signup fails', async () => {
    // Arrange
    mockSignUpWithEmailAndPwd.mockRejectedValue(
      new Error('Email already in use')
    );
    render(<SignupForm switchToLogin={() => {}} />);
    const user = userEvent.setup();
    await fillForm(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Sign Up' }));

    // Assert
    expect(await screen.findByText('Email already in use')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows a generic error message when signup fails with a non-Error value', async () => {
    // Arrange
    mockSignUpWithEmailAndPwd.mockRejectedValue('boom');
    render(<SignupForm switchToLogin={() => {}} />);
    const user = userEvent.setup();
    await fillForm(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Sign Up' }));

    // Assert
    expect(
      await screen.findByText('An unexpected error occurred.')
    ).toBeInTheDocument();
  });

  it('disables the submit button while signing up', async () => {
    // Arrange
    mockSignUpWithEmailAndPwd.mockReturnValue(new Promise(() => {}));
    render(<SignupForm switchToLogin={() => {}} />);
    const user = userEvent.setup();
    await fillForm(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Sign Up' }));

    // Assert
    expect(
      screen.getByRole('button', { name: 'Signing up...' })
    ).toBeDisabled();
  });

  it('calls switchToLogin when the Login button is clicked', async () => {
    // Arrange
    const switchToLogin = vi.fn();
    render(<SignupForm switchToLogin={switchToLogin} />);
    const user = userEvent.setup();

    // Act
    await user.click(screen.getByRole('button', { name: 'Login' }));

    // Assert
    expect(switchToLogin).toHaveBeenCalledTimes(1);
  });
});
