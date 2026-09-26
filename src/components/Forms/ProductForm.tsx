import { useState, type ChangeEvent, type FormEvent } from "react";
import type { Timestamp } from "firebase/firestore";

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
    onSubmit?: ((data: {
        productId: string | null;
        productImageFile: File | null;
        values: {
            productName: string;
            expectedPrice: string | number;
            expectedPriceCurrency: string;
            url: string;
            cssSelector: string;
        };
    }) => Promise<void> | void) | null;
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
    submitBtnLabel = "Save Changes",
    submitBtnClassName = "bg-blue-500 text-white",
    onSubmit = null,
}: ProductFormProps) {
    const [name, setName] = useState<string>(productName || "");
    const [price, setPrice] = useState<string | number>(expectedPrice || "");
    const [currency, setCurrency] = useState<string>(
        expectedPriceCurrency || ""
    );
    const [url, setUrl] = useState<string>(productUrl || "");
    const [selector, setSelector] = useState<string>(cssSelector || "");
    const [productImageFile, setProductImageFile] = useState<File | null>(null);
    const [dbImageUrl, setDbImageUrl] = useState<string>(imageUrl || "");
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
            if (typeof onSubmit === "function") {
                await onSubmit({
                    productId,
                    productImageFile,
                    values,
                });
            } else {
                console.warn("No onSubmit handler provided for ProductForm");
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
                    alt="Product"
                    className="w-full h-40 object-cover rounded border"
                />
            )}

            {/* Product Name */}
            <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Product Name:</span>
                <input
                    className="border rounded px-3 py-2"
                    type="text"
                    value={name}
                    placeholder="Product Name"
                    onChange={(e) => setName(e.target.value)}
                />
            </label>

            {/* Expected Price + Currency */}
            <div className="flex gap-4">
                {/* Expected Price */}
                <label className="flex flex-col gap-1 flex-1">
                    <span className="text-sm font-medium text-gray-700">Expected Price:</span>
                    <input
                        className="border rounded px-3 py-2"
                        type="text"
                        value={price}
                        placeholder="Expected Price"
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </label>

                {/* Currency */}
                <label className="flex flex-col gap-1 w-32">
                    <span className="text-sm font-medium text-gray-700">Currency:</span>
                    <input
                        className="border rounded px-3 py-2"
                        type="text"
                        value={currency}
                        placeholder="DKK"
                        onChange={(e) => setCurrency(e.target.value)}
                    />
                </label>
            </div>

            {/* Product URL */}
            <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Product URL:</span>
                <input
                    className="border rounded px-3 py-2"
                    type="text"
                    value={url}
                    placeholder="Product URL"
                    onChange={(e) => setUrl(e.target.value)}
                />
            </label>

            {/* CSS Selector */}
            <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">CSS Selector:</span>
                <input
                    className="border rounded px-3 py-2"
                    type="text"
                    value={selector}
                    placeholder="CSS Selector"
                    onChange={(e) => setSelector(e.target.value)}
                />
            </label>

            {/* Image Upload */}
            <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">
                    Upload product picture (optional):
                </label>

                <input
                    type="file"
                    className="border rounded px-3 py-2"
                    accept="image/*"
                    onChange={handleImageChange}
                />
            </div>

            {/* Last updated text */}
            {lastUpdated && (
                <p className="text-sm text-gray-700">
                    {`Last updated: ${lastUpdated
                        .toDate()
                        .toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                        })}`}
                </p>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-3 pt-4 w-full">
                <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={submitting}
                    className={`px-4 py-2 rounded-md ${submitBtnClassName} ${submitting
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:brightness-95"
                        }`}
                >
                    {submitting ? "Saving..." : submitBtnLabel}
                </button>
            </div>
        </form>
    );
}