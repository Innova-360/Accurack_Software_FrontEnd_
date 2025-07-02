import React from 'react';
import { FaBars, FaFileExport, FaTrash, FaSave, FaPlus } from 'react-icons/fa';
import { SpecialButton } from '../buttons';

interface ExpenseActionBarProps {
  selectedCategory: string;
  onSidebarToggle: () => void;
  onExportCSV: () => void;
  onDeleteAll: () => void;
  onAddExpense: () => void;
}

const ExpenseActionBar: React.FC<ExpenseActionBarProps> = ({
  selectedCategory,
  onSidebarToggle,
  onExportCSV,
  onDeleteAll,
  onAddExpense
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center">
          <button
            onClick={onSidebarToggle}
            className="lg:hidden mr-3 p-1 text-gray-600 hover:text-gray-800"
          >
            <FaBars size={16} />
          </button>
          <nav className="text-sm text-gray-600">
            <span className="hover:text-[#03414C] cursor-pointer">Back to Expenses</span>
            <span className="mx-2">›</span>
            <span className="font-medium text-[#03414C]">
              {selectedCategory === 'All Expenses' ? 'All Expenses' : `${selectedCategory} Supplies`}
            </span>
          </nav>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <SpecialButton
            variant="expense-export"
            onClick={onExportCSV}
            icon={<FaFileExport size={12} />}
          >
            Export CSV
          </SpecialButton>
          <SpecialButton
            variant="expense-delete"
            onClick={onDeleteAll}
            icon={<FaTrash size={12} />}
          >
            Delete All
          </SpecialButton>
          <SpecialButton
            variant="expense-save"
            icon={<FaSave size={12} />}
          >
            Save
          </SpecialButton>
          <SpecialButton
            variant="expense-add"
            onClick={onAddExpense}
            icon={<FaPlus size={12} />}
          >
            Add new Expense
          </SpecialButton>
        </div>
      </div>
    </div>
  );
};

export default ExpenseActionBar;
