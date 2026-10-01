import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import About from './About';

describe('About', () => {
  afterEach(() => {
    cleanup();
  });

  it('sets the document title', () => {
    // Arrange
    document.title = '';

    // Act
    render(<About />);

    // Assert
    expect(document.title).toBe('SaleCheck | About');
  });

  it('renders the page heading', () => {
    // Arrange
    // (no separate setup needed)

    // Act
    render(<About />);

    // Assert
    expect(
      screen.getByRole('heading', { level: 1, name: 'About Us' })
    ).toBeInTheDocument();
  });

  it('renders the external links opening in a new tab', () => {
    // Arrange
    // (no separate setup needed)

    // Act
    render(<About />);

    // Assert
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
    expect(screen.getByRole('link', { name: 'goma.gg' })).toHaveAttribute(
      'href',
      'https://goma.gg'
    );
  });
});
