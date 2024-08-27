import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useState } from 'react'

export default function DeleteConfirmationModal({ isOpen, closeModal, onConfirm }) {
  return (
    <Dialog open={isOpen} as="div" className="relative z-10" onClose={closeModal}>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-xl bg-gray-100 p-6 shadow">
            <DialogTitle as="h3" className="text-lg font-medium text-black">
              Confirm Deletion
            </DialogTitle>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete this survey? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                className="inline-flex items-center gap-2 rounded-md bg-gray-200 py-2 px-4 text-sm font-semibold text-black hover:bg-gray-300"
                onClick={closeModal}
              >
                Cancel
              </Button>
              <Button
                className="inline-flex items-center gap-2 rounded-md bg-red-600 py-2 px-4 text-sm font-semibold text-white hover:bg-red-700"
                onClick={() => {
                  onConfirm();
                  closeModal();
                }}
              >
                Delete
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
