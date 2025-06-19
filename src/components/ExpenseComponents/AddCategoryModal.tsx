import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { SpecialButton } from '../buttons';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (categoryName: string) => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [categoryName, setCategoryName] = useState('');

  const handleSubmit = () => {
    if (categoryName.trim() === '') {
      alert('Please enter a category name');
      return;
    }
    
    onAdd(categoryName.trim());
    setCategoryName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md border-2 border-teal-500">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center mr-3">
              <FaPlus className="text-white" size={16} />
            </div>
            <h3 className="text-lg font-semibold text-teal-600">Add New Category</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter category name"
              />
              <p className="text-xs text-gray-500 mt-1">
                Category names should be unique and descriptive
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <SpecialButton
              variant="modal-cancel"
              onClick={onClose}
            >
              Cancel
            </SpecialButton>
            <SpecialButton
              variant="modal-add"
              onClick={handleSubmit}
            >
              Add Category
            </SpecialButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryModal;
