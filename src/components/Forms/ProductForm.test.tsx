import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Timestamp } from 'firebase/firestore';
import ProductForm from './ProductForm';

describe('ProductForm', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders the form title and submit button label', () => {
    // Arrange
    // (no separate setup needed; props are passed inline below)

    // Act
    render(
      <ProductForm
        formTitle="Add Product"
        closeModal={() => {}}
        submitBtnLabel="Add Product"
      />
    );

    // Assert
    expect(
      screen.getByRole('heading', { name: 'Add Product' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add Product' })
    ).toBeInTheDocument();
  });

  it('renders empty fields when no initial values are provided', () => {
    // Arrange
    // (no separate setup needed; props are passed inline below)

    // Act
    render(<ProductForm formTitle="Add Product" closeModal={() => {}} />);

    // Assert
    expect(screen.getByLabelText('Product Name:')).toHaveValue('');
    expect(screen.getByLabelText('Expected Price:')).toHaveValue('');
    expect(screen.getByLabelText('Currency:')).toHaveValue('');
    expect(screen.getByLabelText('Product URL:')).toHaveValue('');
    expect(screen.getByLabelText('CSS Selector:')).toHaveValue('');
  });

  it('prefills fields with the initial values', () => {
    // Arrange
    // (no separate setup needed; props are passed inline below)

    // Act
    render(
      <ProductForm
        formTitle="Edit Product"
        closeModal={() => {}}
        productName="PlayStation 5"
        expectedPrice={594}
        expectedPriceCurrency="DKK"
        productUrl="https://example.com/ps5"
        cssSelector=".price"
      />
    );

    // Assert
    expect(screen.getByLabelText('Product Name:')).toHaveValue('PlayStation 5');
    expect(screen.getByLabelText('Expected Price:')).toHaveValue('594');
    expect(screen.getByLabelText('Currency:')).toHaveValue('DKK');
    expect(screen.getByLabelText('Product URL:')).toHaveValue(
      'https://example.com/ps5'
    );
    expect(screen.getByLabelText('CSS Selector:')).toHaveValue('.price');
  });

  it('renders an image preview when imageUrl is provided', () => {
    // Arrange
    // (no separate setup needed; props are passed inline below)

    // Act
    render(
      <ProductForm
        formTitle="Edit Product"
        closeModal={() => {}}
        imageUrl="https://example.com/ps5.jpg"
      />
    );

    // Assert
    expect(screen.getByRole('img', { name: 'Product' })).toHaveAttribute(
      'src',
      'https://example.com/ps5.jpg'
    );
  });

  it('does not render an image preview when imageUrl is not provided', () => {
    // Arrange
    // (no separate setup needed; props are passed inline below)

    // Act
    render(<ProductForm formTitle="Add Product" closeModal={() => {}} />);

    // Assert
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders the last updated text when lastUpdated is provided', () => {
    // Arrange
    const lastUpdated = {
      toDate: () => new Date(2025, 0, 15, 14, 30),
    } as unknown as Timestamp;

    // Act
    render(
      <ProductForm
        formTitle="Edit Product"
        closeModal={() => {}}
        lastUpdated={lastUpdated}
      />
    );

    // Assert
    expect(
      screen.getByText('Last updated: Jan 15, 2025, 2:30 PM')
    ).toBeInTheDocument();
  });

  it('calls onSubmit with the productId, image file and entered values', async () => {
    // Arrange
    const onSubmit = vi.fn();
    const { container } = render(
      <ProductForm
        formTitle="Add Product"
        closeModal={() => {}}
        productId="product-1"
        submitBtnLabel="Add Product"
        onSubmit={onSubmit}
      />
    );
    const user = userEvent.setup();
    const image = new File(['img'], 'ps5.png', { type: 'image/png' });
    await user.type(screen.getByLabelText('Product Name:'), 'PlayStation 5');
    await user.type(screen.getByLabelText('Expected Price:'), '594');
    await user.type(screen.getByLabelText('Currency:'), 'DKK');
    await user.type(
      screen.getByLabelText('Product URL:'),
      'https://example.com/ps5'
    );
    await user.type(screen.getByLabelText('CSS Selector:'), '.price');
    await user.upload(
      container.querySelector('input[type="file"]') as HTMLInputElement,
      image
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Add Product' }));

    // Assert
    expect(onSubmit).toHaveBeenCalledWith({
      productId: 'product-1',
      productImageFile: image,
      values: {
        productName: 'PlayStation 5',
        expectedPrice: '594',
        expectedPriceCurrency: 'DKK',
        url: 'https://example.com/ps5',
        cssSelector: '.price',
      },
    });
  });

  it('disables the submit button while submitting', async () => {
    // Arrange
    const onSubmit = vi.fn(() => new Promise<void>(() => {}));
    render(
      <ProductForm
        formTitle="Add Product"
        closeModal={() => {}}
        onSubmit={onSubmit}
      />
    );
    const user = userEvent.setup();

    // Act
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
  });

  it('warns when no onSubmit handler is provided', async () => {
    // Arrange
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<ProductForm formTitle="Add Product" closeModal={() => {}} />);
    const user = userEvent.setup();

    // Act
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    // Assert
    expect(warn).toHaveBeenCalledWith(
      'No onSubmit handler provided for ProductForm'
    );
  });

  it('calls closeModal when the Cancel button is clicked', async () => {
    // Arrange
    const closeModal = vi.fn();
    render(<ProductForm formTitle="Add Product" closeModal={closeModal} />);
    const user = userEvent.setup();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    // Assert
    expect(closeModal).toHaveBeenCalledTimes(1);
  });
});
