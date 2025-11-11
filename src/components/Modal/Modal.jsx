import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XCircleIcon } from "@heroicons/react/24/outline";

export default function Modal({ isOpen, closeModal, children }) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClose={closeModal}
      >
        {/* Backdrop fade */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-100"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-75"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        {/* Panel scale + fade */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-100"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-75"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
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
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
