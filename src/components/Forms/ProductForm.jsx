import { useState } from "react";

export default function ProductForm({
    formTitle,
    productName,
    imageUrl,
    expectedPrice,
    expectedPriceCurrency,
    productUrl,
    cssSelector,
    lastUpdated,
    closeModal
}) {
    return (
        <form className="flex flex-col gap-4">
            <h2 className="text-xl font-bold">{formTitle}</h2>

            {/* Image Preview */}
            {imageUrl && (
                <img
                    src={imageUrl}
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
                    defaultValue={productName}
                    placeholder="Product Name"
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
                        defaultValue={expectedPrice}
                        placeholder="Expected Price"
                    />
                </label>

                {/* Currency */}
                <label className="flex flex-col gap-1 w-32">
                    <span className="text-sm font-medium text-gray-700">Currency:</span>
                    <input
                        className="border rounded px-3 py-2"
                        type="text"
                        defaultValue={expectedPriceCurrency}
                        placeholder="DKK"
                    />
                </label>
            </div>

            {/* Product URL */}
            <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Product URL:</span>
                <input
                    className="border rounded px-3 py-2"
                    type="text"
                    defaultValue={productUrl}
                    placeholder="Product URL"
                />
            </label>

            {/* CSS Selector */}
            <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">CSS Selector:</span>
                <input
                    className="border rounded px-3 py-2"
                    type="text"
                    defaultValue={cssSelector}
                    placeholder="CSS Selector"
                />
            </label>

            {lastUpdated ? (
                <p className="text-sm text-gray-700">{`Last updated: ${lastUpdated.toDate().toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true
                })}`}</p>
            ) : (
                <p></p>
            )}
        </form>
    );
};