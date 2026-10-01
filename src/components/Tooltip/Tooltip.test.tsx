import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import Tooltip from './Tooltip';

describe('Tooltip', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders its children', () => {
    // Arrange
    // (no separate setup needed; props are passed inline below)

    // Act
    render(
      <Tooltip text="Edit">
        <button>Child button</button>
      </Tooltip>
    );

    // Assert
    expect(
      screen.getByRole('button', { name: 'Child button' })
    ).toBeInTheDocument();
  });

  it('hides the tooltip text by default', () => {
    // Arrange
    // (no separate setup needed; props are passed inline below)

    // Act
    render(
      <Tooltip text="Edit">
        <button>Child button</button>
      </Tooltip>
    );

    // Assert
    expect(screen.getByText('Edit')).toHaveClass('opacity-0');
  });

  it('shows the tooltip text on mouse enter', async () => {
    // Arrange
    render(
      <Tooltip text="Edit">
        <button>Child button</button>
      </Tooltip>
    );
    const user = userEvent.setup();

    // Act
    await user.hover(screen.getByRole('button', { name: 'Child button' }));

    // Assert
    expect(screen.getByText('Edit')).toHaveClass('opacity-100');
  });

  it('hides the tooltip text again on mouse leave', async () => {
    // Arrange
    render(
      <Tooltip text="Edit">
        <button>Child button</button>
      </Tooltip>
    );
    const user = userEvent.setup();
    const child = screen.getByRole('button', { name: 'Child button' });
    await user.hover(child);

    // Act
    await user.unhover(child);

    // Assert
    expect(screen.getByText('Edit')).toHaveClass('opacity-0');
  });
});
