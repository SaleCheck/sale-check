import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import HowItWorks from './HowItWorks';

describe('HowItWorks', () => {
  afterEach(() => {
    cleanup();
  });

  it('sets the document title', () => {
    // Arrange
    document.title = '';

    // Act
    render(<HowItWorks />);

    // Assert
    expect(document.title).toBe('SaleCheck | How It Works');
  });

  it('renders the page heading', () => {
    // Arrange
    // (no separate setup needed)

    // Act
    render(<HowItWorks />);

    // Assert
    expect(
      screen.getByRole('heading', { level: 1, name: 'How It Works' })
    ).toBeInTheDocument();
  });

  it('renders all five steps in order', () => {
    // Arrange
    // (no separate setup needed)

    // Act
    render(<HowItWorks />);

    // Assert
    const steps = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent);
    expect(steps).toEqual([
      '1. Create Your Account',
      '2. Add a Product',
      '3. Provide the Price Selector',
      '4. Automatic Monitoring',
      '5. Get Email Alerts',
    ]);
  });

  it('embeds the CSS selector tutorial video', () => {
    // Arrange
    // (no separate setup needed)

    // Act
    render(<HowItWorks />);

    // Assert
    expect(screen.getByTitle('How to find CSS selectors')).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/GCSym4Bktgg'
    );
  });
});
