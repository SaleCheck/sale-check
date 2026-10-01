import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Spinner from './Spinner';

describe('Spinner', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders an svg with the default size', () => {
    // Arrange
    // (no separate setup needed; props are passed inline below)

    // Act
    const { container } = render(<Spinner />);

    // Assert
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '8');
    expect(svg).toHaveAttribute('height', '8');
  });

  it('renders an svg with a custom size', () => {
    // Arrange
    // (no separate setup needed; props are passed inline below)

    // Act
    const { container } = render(<Spinner size="24" />);

    // Assert
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('applies the spin animation', () => {
    // Arrange
    // (no separate setup needed; props are passed inline below)

    // Act
    const { container } = render(<Spinner />);

    // Assert
    expect(container.querySelector('svg')).toHaveClass('animate-spin');
  });
});
