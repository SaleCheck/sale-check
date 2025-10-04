import { Dialog } from "@headlessui/react";
import { XCircleIcon } from "@heroicons/react/24/outline"; 

export default function Modal({ isOpen, closeModal, children }) {
  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={closeModal}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
    >
      <Dialog.Panel className="relative bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <button
          onClick={closeModal}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-800"
        >
          <XCircleIcon className="h-6 w-6" />
        </button>
        {children}
      </Dialog.Panel>
    </Dialog>
  );
}

