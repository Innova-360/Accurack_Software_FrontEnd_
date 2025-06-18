import React from 'react';
import { FaPlus, FaChevronRight } from 'react-icons/fa';
import type { Supplier } from './types';

interface SupplierSidebarProps {
  suppliers: Supplier[];
  selectedSupplier: Supplier | null;
  isSidebarOpen: boolean;
  viewMode: 'suppliers' | 'products';
  onSupplierSelect: (supplier: Supplier) => void;
  onBackToSuppliers: () => void;
  onToggleSidebar: () => void;
  onAddSupplier: () => void;
  onSetViewMode: (mode: 'suppliers' | 'products') => void;
}

const SupplierSidebar: React.FC<SupplierSidebarProps> = ({
  suppliers,
  selectedSupplier,
  isSidebarOpen,
  viewMode,
  onSupplierSelect,
  onBackToSuppliers,
  onToggleSidebar,
  onAddSupplier,
  onSetViewMode
}) => {
  // Group suppliers by category
  const suppliersByCategory = suppliers.reduce((acc, supplier) => {
    if (!acc[supplier.category]) {
      acc[supplier.category] = [];
    }
    acc[supplier.category].push(supplier);
    return acc;
  }, {} as Record<string, Supplier[]>);

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        w-64 md:w-64 bg-white border-r border-gray-200 shadow-lg md:shadow-none
        flex flex-col
      `}>
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-teal-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="text-gray-800 font-medium">Suppliers Folder</span>
            </div>
            <button
              onClick={onToggleSidebar}
              className="p-1 hover:bg-gray-200 rounded md:hidden"
            >
              <FaPlus className="transform rotate-45 text-gray-600" size={12} />
            </button>
          </div>
        </div>

        {/* All Suppliers Section */}
        <div className="p-2">
          <button
            onClick={onBackToSuppliers}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
              viewMode === 'suppliers'
                ? 'bg-teal-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="w-4 h-4 bg-teal-600 rounded-sm flex items-center justify-center">
              <span className="text-white text-xs">▼</span>
            </div>
            All Suppliers
          </button>
        </div>

        {/* Suppliers by Category */}
        <div className="flex-1 overflow-y-auto">
          {Object.entries(suppliersByCategory).map(([category, categorySuppliers]) => (
            <div key={category} className="p-2">
              <div className="mb-2">
                <div className="flex items-center gap-2 text-gray-600 text-sm px-3 py-1">
                  <FaChevronRight size={10} />
                  <span>{category}</span>
                </div>
                
                {/* Suppliers in this category */}
                <div className="ml-4 space-y-1">
                  {categorySuppliers.map((supplier) => (
                    <button
                      key={supplier.id}
                      onClick={() => onSupplierSelect(supplier)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-md transition-colors ${
                        selectedSupplier?.id === supplier.id
                          ? 'bg-teal-50 text-teal-700 border-l-2 border-teal-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                      }`}
                    >
                     
                      <span className="truncate">{supplier.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Add New Category */}
          <div className="p-2 mt-4">
            <button
              onClick={onAddSupplier}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
            >
              <FaPlus size={12} />
              <span>Add New Supplier</span>
            </button>
          </div>
        </div>

        {/* Products View Toggle (when supplier selected) */}
        {selectedSupplier && (
          <div className="p-2 border-t border-gray-200">
            <button
              onClick={() => onSetViewMode('products')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                viewMode === 'products'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                <span className="text-white text-xs">▼</span>
              </div>
              {selectedSupplier.name} - Products
            </button>
          </div>        )}
      </div>
    </>
  );
};

export default SupplierSidebar;
