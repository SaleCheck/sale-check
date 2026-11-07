import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { Timestamp } from 'firebase/firestore';

interface ProductFormProps {
  formTitle: string;
  closeModal: () => void;
  productId?: string | null;
  productName?: string | null;
  imageUrl?: string | null;
  expectedPrice?: string | number | null;
  expectedPriceCurrency?: string | null;
  productUrl?: string | null;
  cssSelector?: string | null;
  lastUpdated?: Timestamp | null;
  submitBtnLabel?: string;
  submitBtnClassName?: string;
  onSubmit?:
    | ((data: {
        productId: string | null;
        productImageFile: File | null;
        values: {
          productName: string;
          expectedPrice: string | number;
          expectedPriceCurrency: string;
          url: string;
          cssSelector: string;
        };
      }) => Promise<void> | void)
    | null;
}

export default function ProductForm({
  formTitle,
  closeModal,
  productId = null,
  productName = null,
  imageUrl = null,
  expectedPrice = null,
  expectedPriceCurrency = null,
  productUrl = null,
  cssSelector = null,
  lastUpdated = null,
  submitBtnLabel,
  submitBtnClassName = 'bg-blue-500 text-white',
  onSubmit = null,
}: ProductFormProps) {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState<string>(productName || '');
  const [price, setPrice] = useState<string | number>(expectedPrice || '');
  const [currency, setCurrency] = useState<string>(expectedPriceCurrency || '');
  const [url, setUrl] = useState<string>(productUrl || '');
  const [selector, setSelector] = useState<string>(cssSelector || '');
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [dbImageUrl /*, setDbImageUrl*/] = useState<string>(imageUrl || '');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (submitting) {
      return;
    } else {
      setSubmitting(true);
    }

    const values = {
      productName: name,
      expectedPrice: price,
      expectedPriceCurrency: currency,
      url,
      cssSelector: selector,
    };

    try {
      if (typeof onSubmit === 'function') {
        await onSubmit({
          productId,
          productImageFile,
          values,
        });
      } else {
        console.warn('No onSubmit handler provided for ProductForm');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setProductImageFile(file);
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold">{formTitle}</h2>

      {/* Image Preview */}
      {dbImageUrl && (
        <img
          src={dbImageUrl}
          alt={t('product.imageAlt')}
          className="w-full h-40 object-cover rounded-sm border"
        />
      )}

      {/* Product Name */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">
          {t('product.nameLabel')}
        </span>
        <input
          className="border rounded-sm px-3 py-2"
          type="text"
          value={name}
          placeholder={t('product.name')}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      {/* Expected Price + Currency */}
      <div className="flex flex-wrap gap-4">
        {/* Expected Price */}
        <label className="flex flex-col gap-1 flex-[3] min-w-40">
          <span className="text-sm font-medium text-gray-700">
            {t('product.expectedPriceLabel')}
          </span>
          <input
            className="border rounded-sm px-3 py-2 w-full min-w-0"
            type="text"
            value={price}
            placeholder={t('product.expectedPrice')}
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>

        {/* Currency */}
        <label className="flex flex-col gap-1 flex-1 min-w-24">
          <span className="text-sm font-medium text-gray-700">
            {t('product.currencyLabel')}
          </span>
          <input
            className="border rounded-sm px-3 py-2 w-full min-w-0"
            type="text"
            value={currency}
            placeholder={t('product.currencyPlaceholder')}
            onChange={(e) => setCurrency(e.target.value)}
          />
        </label>
      </div>

      {/* Product URL */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">
          {t('product.urlLabel')}
        </span>
        <input
          className="border rounded-sm px-3 py-2"
          type="text"
          value={url}
          placeholder={t('product.url')}
          onChange={(e) => setUrl(e.target.value)}
        />
      </label>

      {/* CSS Selector */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">
          {t('product.cssSelectorLabel')}
        </span>
        <input
          className="border rounded-sm px-3 py-2"
          type="text"
          value={selector}
          placeholder={t('product.cssSelector')}
          onChange={(e) => setSelector(e.target.value)}
        />
      </label>

      {/* Image Upload */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600 font-medium">
          {t('product.imageLabel')}
        </label>

        <input
          type="file"
          className="border rounded-sm px-3 py-2"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>

      {/* Last updated text */}
      {lastUpdated && (
        <p className="text-sm text-gray-700">
          {t('product.lastUpdated', {
            date: lastUpdated.toDate().toLocaleString(i18n.language, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }),
          })}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-3 pt-4 w-full">
        <button
          type="button"
          onClick={closeModal}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
        >
          {t('common.cancel')}
        </button>

        <button
          type="submit"
          disabled={submitting}
          className={`px-4 py-2 rounded-md ${submitBtnClassName} ${
            submitting ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-95'
          }`}
        >
          {submitting
            ? t('common.saving')
            : (submitBtnLabel ?? t('common.saveChanges'))}
        </button>
      </div>
    </form>
  );
}
