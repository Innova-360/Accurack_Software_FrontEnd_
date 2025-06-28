import React from 'react';
import { FaChevronDown, FaChevronRight, FaPlus, FaTimes } from 'react-icons/fa';
import { SidebarButton, SpecialButton } from '../buttons';
import type { ExpenseCategory } from './types';

interface ExpenseSidebarProps {
  selectedCategory: string;
  categories: ExpenseCategory[];
  isSidebarOpen: boolean;
  onCategorySelect: (category: string) => void;
  onSidebarToggle: () => void;
  onAddCategory: () => void;
}

const ExpenseSidebar: React.FC<ExpenseSidebarProps> = ({
  selectedCategory,
  categories,
  isSidebarOpen,
  onCategorySelect,
  onSidebarToggle,
  onAddCategory
}) => {
  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onSidebarToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white shadow-lg border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
            <span className="font-semibold text-gray-800">Expenses Folder</span>
          </div>
          <button
            onClick={onSidebarToggle}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Categories */}
        <div className="p-2">
          {/* All Expenses Option */}
          <SidebarButton
            onClick={() => onCategorySelect('All Expenses')}
            active={selectedCategory === 'All Expenses'}
            icon={selectedCategory === 'All Expenses' ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
          >
            All Expenses
          </SidebarButton>
          
          {/* Category Separator */}
          <div className="border-t border-gray-200 my-2"></div>
          
          {categories.map((category) => (
            <SidebarButton
              key={category.name}
              onClick={() => onCategorySelect(category.name)}
              active={selectedCategory === category.name}
              icon={selectedCategory === category.name ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
            >
              {category.name}
            </SidebarButton>
          ))}

          {/* Add New Category Button */}
          <div className="border-t border-gray-200 my-2"></div>
          <SpecialButton
            variant="sidebar-add"
            onClick={onAddCategory}
            icon={<FaPlus size={10} />}
            className="text-teal-600 font-medium"
          >
            Add New Category
          </SpecialButton>
        </div>
      </aside>
    </>
  );
};

export default ExpenseSidebar;
