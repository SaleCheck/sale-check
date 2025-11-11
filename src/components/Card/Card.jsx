import { Transition } from "@headlessui/react";
import { PhotoIcon } from "@heroicons/react/24/outline";

export default function Card({ imageSrc, title }) {
  return (
    <Transition
      appear={true}
      show={true}
      enter="transition transform duration-200"
      enterFrom="scale-95 opacity-0"
      enterTo="scale-100 opacity-100"
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden w-64 hover:shadow-lg hover:scale-105 transition-all">
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
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
    </Transition>
  );
}
