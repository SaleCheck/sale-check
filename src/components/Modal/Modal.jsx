import { Dialog } from "@headlessui/react";

export default function Modal({ isOpen, closeModal, children }) {
  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={closeModal}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
    >
      <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        {children}
      </Dialog.Panel>
    </Dialog>
  );
}