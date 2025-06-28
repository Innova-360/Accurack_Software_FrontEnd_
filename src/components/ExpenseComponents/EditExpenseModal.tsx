import React, { useState, useEffect } from 'react';
import { FaEdit } from 'react-icons/fa';
import { SpecialButton } from '../buttons';
import type { ExpenseItem, ExpenseCategory } from './types';

interface EditExpenseModalProps {
  isOpen: boolean;
  expense: ExpenseItem | null;
  selectedCategory: string;
  categories: ExpenseCategory[];
  onClose: () => void;
  onSave: (updatedExpense: ExpenseItem & { category?: string }) => void;
}

const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  expense,
  selectedCategory,
  categories,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    price: 0,
    category: ''
  });

  useEffect(() => {
    if (expense) {
      // Find the category of the item
      let itemCategory = '';
      if (selectedCategory === 'All Expenses') {
        const foundCategory = categories.find(cat => 
          cat.items.some(catItem => catItem.id === expense.id)
        );
        itemCategory = foundCategory?.name || 'Marketing';
      } else {
        itemCategory = selectedCategory;
      }
      
      setFormData({
        name: expense.name,
        quantity: expense.quantity,
        price: expense.price,
        category: itemCategory
      });
    }
  }, [expense, selectedCategory, categories]);

  const handleSubmit = () => {
    if (!expense) return;
    
    onSave({
      ...expense,
      name: formData.name,
      quantity: formData.quantity,
      price: formData.price,
      category: formData.category
    });
  };

  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md border-2 border-[#03414C]">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-[#03414C] rounded-full flex items-center justify-center mr-3">
              <FaEdit className="text-white" size={16} />
            </div>
            <h3 className="text-lg font-semibold text-[#03414C]">Edit Expense</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-[#03414C]"
                placeholder="Enter item name"
              />
            </div>
            
            {selectedCategory === 'All Expenses' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-[#03414C]"
                >
                  {categories.map(category => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-[#03414C]"
                placeholder="Enter quantity"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Price ($)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-[#03414C]"
                placeholder="Enter unit price"
                min="0"
                step="0.01"
              />
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
              variant="modal-confirm"
              onClick={handleSubmit}
            >
              Save Changes
            </SpecialButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditExpenseModal;
