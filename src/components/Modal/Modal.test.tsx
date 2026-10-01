import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Modal from './Modal';

describe('Modal', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders its children when open', async () => {
    // Arrange
    // (no separate setup needed; props are passed inline below)

    // Act
    render(
      <Modal isOpen={true} closeModal={() => {}}>
        <p>Modal content</p>
      </Modal>
    );

    // Assert
    expect(await screen.findByText('Modal content')).toBeInTheDocument();
  });

  it('does not render its children when closed', () => {
    // Arrange
    // (no separate setup needed; props are passed inline below)

    // Act
    render(
      <Modal isOpen={false} closeModal={() => {}}>
        <p>Modal content</p>
      </Modal>
    );

    // Assert
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('calls closeModal when the close button is clicked', async () => {
    // Arrange
    const closeModal = vi.fn();
    render(
      <Modal isOpen={true} closeModal={closeModal}>
        <p>Modal content</p>
      </Modal>
    );
    const user = userEvent.setup();
    const closeButton = await screen.findByRole('button');

    // Act
    await user.click(closeButton);

    // Assert
    expect(closeModal).toHaveBeenCalled();
  });

  it('calls closeModal when Escape is pressed', async () => {
    // Arrange
    const closeModal = vi.fn();
    render(
      <Modal isOpen={true} closeModal={closeModal}>
        <p>Modal content</p>
      </Modal>
    );
    const user = userEvent.setup();
    await screen.findByText('Modal content');

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(closeModal).toHaveBeenCalled();
  });
});
