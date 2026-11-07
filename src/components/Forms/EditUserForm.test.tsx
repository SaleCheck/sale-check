import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import EditUserForm from './EditUserForm';

describe('EditUserForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('pre-fills the current first and last name', () => {
    // Arrange
    // (no separate setup needed)

    // Act
    render(
      <EditUserForm
        initialFirstName="Jane"
        initialLastName="Doe"
        onSubmit={vi.fn()}
      />
    );

    // Assert
    expect(screen.getByPlaceholderText('First Name')).toHaveValue('Jane');
    expect(screen.getByPlaceholderText('Last Name')).toHaveValue('Doe');
    expect(screen.getByRole('button', { name: /^Language/ })).toHaveTextContent(
      'English'
    );
  });

  it('submits the trimmed names and closes the modal', async () => {
    // Arrange
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const closeModal = vi.fn();
    render(<EditUserForm onSubmit={onSubmit} closeModal={closeModal} />);
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('First Name'), ' Jane ');
    await user.type(screen.getByPlaceholderText('Last Name'), ' Smith ');

    // Act
    await user.click(screen.getByRole('button', { name: 'Save' }));

    // Assert
    expect(onSubmit).toHaveBeenCalledWith({
      firstName: 'Jane',
      lastName: 'Smith',
    });
    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  it('closes without submitting when Cancel is clicked', async () => {
    // Arrange
    const onSubmit = vi.fn();
    const closeModal = vi.fn();
    render(
      <EditUserForm
        initialFirstName="Jane"
        initialLastName="Doe"
        onSubmit={onSubmit}
        closeModal={closeModal}
      />
    );
    const user = userEvent.setup();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    // Assert
    expect(closeModal).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows the error and keeps the modal open when saving fails', async () => {
    // Arrange
    const onSubmit = vi.fn().mockRejectedValue(new Error('Save failed'));
    const closeModal = vi.fn();
    render(
      <EditUserForm
        initialFirstName="Jane"
        initialLastName="Doe"
        onSubmit={onSubmit}
        closeModal={closeModal}
      />
    );
    const user = userEvent.setup();

    // Act
    await user.click(screen.getByRole('button', { name: 'Save' }));

    // Assert
    expect(await screen.findByText('Save failed')).toBeInTheDocument();
    expect(closeModal).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });
});
