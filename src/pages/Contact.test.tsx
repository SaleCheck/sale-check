import { cleanup, render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Contact from './Contact';

const { mockSendContactMessage } = vi.hoisted(() => ({
  mockSendContactMessage: vi.fn(),
}));

vi.mock('../services/contactEmailService', () => ({
  sendContactMessage: mockSendContactMessage,
}));

function renderContact() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Contact />
    </QueryClientProvider>
  );
}

async function fillForm(user: UserEvent) {
  await user.type(screen.getByLabelText('Name'), 'Jane Doe');
  await user.type(screen.getByLabelText('E-Mail'), 'jane@example.com');
  await user.type(screen.getByLabelText('Message'), 'Hello there');
}

describe('Contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('sets the document title', () => {
    // Arrange
    document.title = '';

    // Act
    renderContact();

    // Assert
    expect(document.title).toBe('SaleCheck | Contact');
  });

  it('renders the name, email and message fields', () => {
    // Arrange
    // (no separate setup needed)

    // Act
    renderContact();

    // Assert
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('E-Mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
  });

  it('sends the entered message, shows a confirmation and clears the form', async () => {
    // Arrange
    mockSendContactMessage.mockResolvedValue(undefined);
    renderContact();
    const user = userEvent.setup();
    await fillForm(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // Assert
    expect(mockSendContactMessage).toHaveBeenCalledWith(
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello there',
      },
      expect.anything()
    );
    expect(
      await screen.findByText('Message sent — thanks!')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('E-Mail')).toHaveValue('');
    expect(screen.getByLabelText('Message')).toHaveValue('');
  });

  it('shows an error message and keeps the input when sending fails', async () => {
    // Arrange
    mockSendContactMessage.mockRejectedValue(new Error('Network error'));
    renderContact();
    const user = userEvent.setup();
    await fillForm(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // Assert
    expect(
      await screen.findByText('Something went wrong. Try again.')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('Jane Doe');
  });

  it('disables the submit button while sending', async () => {
    // Arrange
    mockSendContactMessage.mockReturnValue(new Promise(() => {}));
    renderContact();
    const user = userEvent.setup();
    await fillForm(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled();
  });
});
