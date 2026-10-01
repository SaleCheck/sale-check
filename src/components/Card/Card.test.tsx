import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { vi } from 'vitest';
import Card from './Card';

describe('Card', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the product title', () => {
    // Arrange
    // (no separate setup needed; props are passed inline below)

    // Act
    render(
      <Card
        title="PlayStation 5"
        expectedPrice={594}
        expectedPriceCurrency="DKK"
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    // Assert
    expect(screen.getByText('PlayStation 5')).toBeInTheDocument();
  });

  it('renders the expected price and currency', () => {
    // Arrange
    // (no separate setup needed; props are passed inline below)

    // Act
    render(
      <Card
        title="PlayStation 5"
        expectedPrice={594}
        expectedPriceCurrency="DKK"
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    // Assert
    expect(screen.getByText('594 DKK')).toBeInTheDocument();
  });

  it('renders the product image when imageSrc is provided', () => {
    // Arrange
    // (no separate setup needed; props are passed inline below)

    // Act
    render(
      <Card
        imageSrc="https://example.com/ps5.jpg"
        title="PlayStation 5"
        expectedPrice={594}
        expectedPriceCurrency="DKK"
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    // Assert
    expect(screen.getByRole('img', { name: 'PlayStation 5' })).toHaveAttribute(
      'src',
      'https://example.com/ps5.jpg'
    );
  });

  it('renders a placeholder when imageSrc is not provided', () => {
    // Arrange
    // (no separate setup needed; props are passed inline below)

    // Act
    render(
      <Card
        title="PlayStation 5"
        expectedPrice={594}
        expectedPriceCurrency="DKK"
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    // Assert
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('calls onEdit when the edit button is clicked', async () => {
    // Arrange
    const onEdit = vi.fn();
    render(
      <Card
        title="PlayStation 5"
        expectedPrice={594}
        expectedPriceCurrency="DKK"
        onEdit={onEdit}
        onDelete={() => {}}
      />
    );
    const user = userEvent.setup();

    // Act
    await user.click(screen.getByTitle('Edit product'));

    // Assert
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when the delete button is clicked', async () => {
    // Arrange
    const onDelete = vi.fn();
    render(
      <Card
        title="PlayStation 5"
        expectedPrice={594}
        expectedPriceCurrency="DKK"
        onEdit={() => {}}
        onDelete={onDelete}
      />
    );
    const user = userEvent.setup();

    // Act
    await user.click(screen.getByTitle('Archive product'));

    // Assert
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
