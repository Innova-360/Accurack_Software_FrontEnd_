import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { SpecialButton } from '../buttons';

interface StoreDeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

const StoreDeleteConfirmModal: React.FC<StoreDeleteConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onClose,
  onConfirm
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md border-2 border-red-500">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
              <FaTrash className="text-white" size={16} />
            </div>
            <h3 className="text-lg font-semibold text-red-600">{title}</h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          <div className="flex justify-end space-x-3">
            <SpecialButton
              variant="modal-cancel"
              onClick={onClose}
            >
              Cancel
            </SpecialButton>
            <SpecialButton
              variant="modal-delete"
              onClick={onConfirm}
            >
              Delete
            </SpecialButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDeleteConfirmModal; 