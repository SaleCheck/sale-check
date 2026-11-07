import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AvatarForm from './AvatarForm';

const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });

describe('AvatarForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('shows the current avatar and disables Save until a file is chosen', () => {
    // Arrange
    // (no separate setup needed)

    // Act
    render(
      <AvatarForm
        currentPhotoURL="https://example.com/avatar.png"
        onSubmit={vi.fn()}
      />
    );

    // Assert
    expect(screen.getByRole('img', { name: 'Avatar Preview' })).toHaveAttribute(
      'src',
      'https://example.com/avatar.png'
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('previews the chosen file', async () => {
    // Arrange
    render(<AvatarForm onSubmit={vi.fn()} />);
    const user = userEvent.setup();

    // Act
    await user.upload(
      screen.getByLabelText('Upload new profile picture:'),
      file
    );

    // Assert
    expect(screen.getByRole('img', { name: 'Avatar Preview' })).toHaveAttribute(
      'src',
      'blob:preview'
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it('submits the chosen file and closes the modal', async () => {
    // Arrange
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const closeModal = vi.fn();
    render(<AvatarForm onSubmit={onSubmit} closeModal={closeModal} />);
    const user = userEvent.setup();
    await user.upload(
      screen.getByLabelText('Upload new profile picture:'),
      file
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Save' }));

    // Assert
    expect(onSubmit).toHaveBeenCalledWith(file);
    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  it('shows the error and keeps the modal open when the upload fails', async () => {
    // Arrange
    const onSubmit = vi.fn().mockRejectedValue(new Error('Upload failed'));
    const closeModal = vi.fn();
    render(<AvatarForm onSubmit={onSubmit} closeModal={closeModal} />);
    const user = userEvent.setup();
    await user.upload(
      screen.getByLabelText('Upload new profile picture:'),
      file
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Save' }));

    // Assert
    expect(await screen.findByText('Upload failed')).toBeInTheDocument();
    expect(closeModal).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });
});
