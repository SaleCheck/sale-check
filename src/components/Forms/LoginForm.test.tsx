import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LoginForm from './LoginForm';

const { mockNavigate, mockLoginWithEmailAndPwd } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockLoginWithEmailAndPwd: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => mockNavigate,
}));

vi.mock('../../services/authService', () => ({
  loginWithEmailAndPwd: mockLoginWithEmailAndPwd,
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the email and password fields', () => {
    // Arrange
    // (no separate setup needed; props are passed inline below)

    // Act
    render(<LoginForm switchToSignup={() => {}} closeModal={() => {}} />);

    // Assert
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('logs in with the entered credentials, closes the modal and navigates to the profile', async () => {
    // Arrange
    const closeModal = vi.fn();
    mockLoginWithEmailAndPwd.mockResolvedValue({ user: { uid: 'user-123' } });
    render(<LoginForm switchToSignup={() => {}} closeModal={closeModal} />);
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'secret123');

    // Act
    await user.click(screen.getByRole('button', { name: 'Login' }));

    // Assert
    expect(mockLoginWithEmailAndPwd).toHaveBeenCalledWith(
      'test@example.com',
      'secret123'
    );
    expect(closeModal).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/profile?id=user-123');
  });

  it('shows an error message when login fails', async () => {
    // Arrange
    mockLoginWithEmailAndPwd.mockRejectedValue(new Error('auth/invalid'));
    render(<LoginForm switchToSignup={() => {}} closeModal={() => {}} />);
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'wrong');

    // Act
    await user.click(screen.getByRole('button', { name: 'Login' }));

    // Assert
    expect(
      await screen.findByText('Invalid email or password')
    ).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables the submit button while logging in', async () => {
    // Arrange
    mockLoginWithEmailAndPwd.mockReturnValue(new Promise(() => {}));
    render(<LoginForm switchToSignup={() => {}} closeModal={() => {}} />);
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'secret123');

    // Act
    await user.click(screen.getByRole('button', { name: 'Login' }));

    // Assert
    expect(
      screen.getByRole('button', { name: 'Logging in...' })
    ).toBeDisabled();
  });

  it('calls switchToSignup when the Sign Up button is clicked', async () => {
    // Arrange
    const switchToSignup = vi.fn();
    render(<LoginForm switchToSignup={switchToSignup} closeModal={() => {}} />);
    const user = userEvent.setup();

    // Act
    await user.click(screen.getByRole('button', { name: 'Sign Up' }));

    // Assert
    expect(switchToSignup).toHaveBeenCalledTimes(1);
  });
});
