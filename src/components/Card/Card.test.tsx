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
    render(
      <Card
        title="PlayStation 5"
        expectedPrice={594}
        expectedPriceCurrency="DKK"
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    expect(screen.getByText('PlayStation 5')).toBeInTheDocument();
  });

  it('renders the expected price and currency', () => {
    render(
      <Card
        title="PlayStation 5"
        expectedPrice={594}
        expectedPriceCurrency="DKK"
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    expect(screen.getByText('594 DKK')).toBeInTheDocument();
  });

  it('renders the product image when imageSrc is provided', () => {
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

    expect(screen.getByRole('img', { name: 'PlayStation 5' })).toHaveAttribute(
      'src',
      'https://example.com/ps5.jpg'
    );
  });

  it('renders a placeholder when imageSrc is not provided', () => {
    render(
      <Card
        title="PlayStation 5"
        expectedPrice={594}
        expectedPriceCurrency="DKK"
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('calls onEdit when the edit button is clicked', async () => {
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

    await user.click(screen.getByTitle('Edit product'));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when the delete button is clicked', async () => {
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

    await user.click(screen.getByTitle('Archive product'));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
