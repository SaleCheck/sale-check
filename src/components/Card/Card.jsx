import { Transition } from "@headlessui/react";
import { PhotoIcon, PencilIcon, ArchiveBoxIcon } from "@heroicons/react/24/outline";

export default function Card({
  imageSrc,
  title,
  expectedPrice,
  expectedPriceCurrency,
  onEdit,
  onDelete
}) {
  return (
    <Transition
      appear={true}
      show={true}
      enter="transition transform duration-200"
      enterFrom="scale-95 opacity-0"
      enterTo="scale-100 opacity-100"
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden w-64 hover:shadow-lg hover:scale-105 transition-all">
        {/* Image */}
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-40 object-cover"
          />
        ) : (
          <div className="w-full h-40 flex items-center justify-center bg-gray-100">
            <PhotoIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}

        {/* Title */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>

        {/* Price */}
        <div className="px-4 pb-4 text-center">
          <p className="text-gray-700">{expectedPrice} {expectedPriceCurrency}</p>
        </div>

        {/* Action Icons */}
        <div className="flex items-center justify-center gap-4 py-3 border-t border-gray-100">
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Edit product"
            onClick={onEdit}
          >
            <PencilIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </button>
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Archive product"
            onClick={onDelete}
          >
            <ArchiveBoxIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>
      </div>
    </Transition>
  );
}
