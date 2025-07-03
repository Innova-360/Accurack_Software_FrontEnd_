import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa";
import { SpecialButton } from "../buttons";
import type { ExpenseCategory } from "./types";

interface AddExpenseModalProps {
  isOpen: boolean;
  selectedCategory: string;
  categories: ExpenseCategory[];
  onClose: () => void;
  onAdd: (expense: {
    name: string;
    quantity: number;
    price: number;
    category: string;
  }) => void;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  selectedCategory,
  categories,
  onClose,
  onAdd,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    quantity: 1,
    price: 0,
    category: "Marketing",
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      category:
        selectedCategory === "All Expenses" ? "Marketing" : selectedCategory,
    }));
  }, [selectedCategory]);
  const handleSubmit = () => {
    if (formData.name.trim() === "") {
      toast.error("Please enter an item name");
      return;
    }

    onAdd(formData);
    setFormData({
      name: "",
      quantity: 1,
      price: 0,
      category: formData.category,
    });
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
            <h3 className="text-lg font-semibold text-teal-600">
              Add New Expense
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter item name"
              />
            </div>

            {selectedCategory === "All Expenses" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  {categories.map((category) => (
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
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter quantity"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Price ($)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter unit price"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <SpecialButton variant="modal-cancel" onClick={onClose}>
              Cancel
            </SpecialButton>
            <SpecialButton variant="modal-add" onClick={handleSubmit}>
              Add Expense
            </SpecialButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;
