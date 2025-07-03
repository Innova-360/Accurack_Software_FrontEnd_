import React from "react";
import { FaChevronDown, FaChevronRight, FaPlus, FaTimes } from "react-icons/fa";
import { SidebarButton, SpecialButton } from "../buttons";
import type { Supplier } from "./types";

interface SupplierSidebarProps {
  suppliers: Supplier[];
  selectedSupplier: Supplier | null;
  isSidebarOpen: boolean;
  viewMode: "suppliers" | "products";
  onSupplierSelect: (supplier: Supplier) => void;
  onBackToSuppliers: () => void;
  onToggleSidebar: () => void;
  onAddSupplier: () => void;
  onSetViewMode: (mode: "suppliers" | "products") => void;
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
  onSetViewMode,
}) => {
  // Group suppliers by category
  // const suppliersByCategory = suppliers.reduce((acc, supplier) => {
  //   if (!acc[supplier?.category]) {
  //     acc[supplier.category] = [];
  //   }
  //   acc[supplier.category].push(supplier);
  //   return acc;
  // }, {} as Record<string, Supplier[]>);

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white shadow-lg border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
            <span className="font-semibold text-gray-800">
              Suppliers Folder
            </span>
          </div>
          <button
            onClick={onToggleSidebar}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Suppliers */}
        <div className="p-2">
          {/* All Suppliers Option */}
          <SidebarButton
            onClick={onBackToSuppliers}
            active={viewMode === "suppliers"}
            icon={
              viewMode === "suppliers" ? (
                <FaChevronDown size={12} />
              ) : (
                <FaChevronRight size={12} />
              )
            }
          >
            All Suppliers
          </SidebarButton>
          {/* Category Separator */}
          <div className="border-t border-gray-200 my-2"></div>
          {/* All Suppliers List */}
          <div className="space-y-1">
            {suppliers.map((supplier) => (
              <div key={supplier.supplier_id} className="group">
                {" "}
                <SidebarButton
                  onClick={() => onSupplierSelect(supplier)}
                  active={
                    selectedSupplier?.supplier_id === supplier.supplier_id
                  }
                  icon={
                    selectedSupplier?.supplier_id === supplier.supplier_id ? (
                      <FaChevronDown size={12} />
                    ) : (
                      <FaChevronRight size={12} />
                    )
                  }
                >
                  {supplier.name}
                </SidebarButton>
              </div>
            ))}

            {suppliers.length === 0 && (
              <div className="text-gray-500 text-sm p-3 text-center">
                No active suppliers found. Click "Add New Supplier" to get
                started.
              </div>
            )}
          </div>

          {/* Products View (when supplier selected) */}
          {selectedSupplier && (
            <>
              <div className="border-t border-gray-200 my-2"></div>
              <SidebarButton
                onClick={() => onSetViewMode("products")}
                active={viewMode === "products"}
                icon={
                  viewMode === "products" ? (
                    <FaChevronDown size={12} />
                  ) : (
                    <FaChevronRight size={12} />
                  )
                }
              >
                {selectedSupplier.name} - Products
              </SidebarButton>
            </>
          )}

          {/* Add New Supplier Button */}
          <div className="border-t border-gray-200 my-2"></div>
          <SpecialButton
            variant="sidebar-add"
            onClick={onAddSupplier}
            icon={<FaPlus size={10} />}
            className="text-teal-600 font-medium"
          >
            Add New Supplier
          </SpecialButton>
        </div>
      </aside>
    </>
  );
};

export default SupplierSidebar;
