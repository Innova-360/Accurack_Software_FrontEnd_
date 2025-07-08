import React, { useState, useEffect, useMemo } from "react";
import {
  FaPlus,
  FaBars,
  FaEye,
  FaEdit,
  FaTrash,
  FaSearch,
} from "react-icons/fa";
import { SpecialButton, IconButton } from "../buttons";
import type { Supplier } from "./types";
import Pagination from "./Pagination";

interface SupplierTableProps {
  suppliers: Supplier[];
  onViewSupplier: (supplier: Supplier) => void;
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplier: Supplier) => void;
  onViewProducts?: (supplier: Supplier) => void;
  onViewAssignedProducts?: (supplier: Supplier) => void;
  onAddSupplier: () => void;
}

const SupplierTable: React.FC<SupplierTableProps> = ({
  suppliers,
  onViewSupplier,
  onEditSupplier,
  onDeleteSupplier,
  onViewProducts: _onViewProducts,
  onViewAssignedProducts: _onViewAssignedProducts,
  onAddSupplier,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const itemsPerPage = 10;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter suppliers based on search term
  const filteredSuppliers = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return suppliers || [];
    }

    const searchLower = debouncedSearchTerm.toLowerCase();
    return (suppliers || []).filter(
      (supplier) =>
        supplier.name?.toLowerCase().includes(searchLower) ||
        supplier.email?.toLowerCase().includes(searchLower) ||
        supplier.phone?.toLowerCase().includes(searchLower) ||
        supplier.address?.toLowerCase().includes(searchLower) ||
        supplier.supplier_id?.toLowerCase().includes(searchLower) ||
        supplier.id?.toLowerCase().includes(searchLower)
    );
  }, [suppliers, debouncedSearchTerm]);

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSuppliers = filteredSuppliers.slice(startIndex, endIndex);

  // Helper function to check if supplier can be edited/deleted
  const isValidSupplier = (supplier: Supplier): boolean => {
    // Simple check - any supplier with an ID can be edited/deleted
    return !!(supplier.id || supplier.supplier_id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
  };

  if (suppliers?.length === 0) {
    return (
      <div className="text-center py-16 bg-white">
        <div className="p-6 bg-teal-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <FaBars className="text-white" size={28} />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          No Suppliers Found
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          You haven't added any suppliers yet. Start by adding your first
          supplier to manage your supply chain effectively.
        </p>
        <SpecialButton
          variant="expense-add"
          onClick={onAddSupplier}
          className="mx-auto"
        >
          <FaPlus className="mr-2" /> Add Your First Supplier
        </SpecialButton>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search suppliers by name, email, phone, or address..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#03414C] focus:border-[#03414C] transition-colors duration-200"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              {filteredSuppliers.length} of {suppliers?.length || 0} suppliers
            </span>
            {debouncedSearchTerm && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Filtered
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Show message when no results found */}
      {filteredSuppliers.length === 0 && debouncedSearchTerm && (
        <div className="text-center py-16 bg-white">
          <div className="p-6 bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <FaSearch className="text-gray-400" size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            No Suppliers Found
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            No suppliers match your search for "{debouncedSearchTerm}". Try
            adjusting your search terms.
          </p>
          <button
            onClick={clearSearch}
            className="text-[#03414C] hover:text-[#025a6b] font-medium"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Table */}
      {filteredSuppliers.length > 0 && (
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Table Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                <div className="col-span-1">#</div>
                <div className="col-span-2">SUPPLIER</div>
                <div className="col-span-3">CONTACT</div>
                <div className="col-span-3">ADDRESS</div>
                <div className="col-span-3">ACTIONS</div>
              </div>
            </div>
            {/* Table Content */}
            <div className="divide-y divide-gray-200">
              {currentSuppliers?.map((supplier, index) => (
                <div
                  key={supplier.supplier_id || supplier.id || index}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150 group"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1 text-sm font-medium text-gray-900">
                      {startIndex + index + 1}
                    </div>{" "}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900">
                          {supplier.name}
                        </div>
                        {!isValidSupplier(supplier) && (
                          <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                            Sample Data
                          </span>
                        )}
                      </div>
                      {/* <div className="text-sm text-gray-500">ID: {supplier.supplier_id || supplier.id}</div> */}
                    </div>
                    <div className="col-span-3">
                      <div className="text-sm text-gray-900">
                        {supplier.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {supplier.phone}
                      </div>
                    </div>
                    <div className="col-span-3">
                      <div className="text-sm text-gray-900">
                        {supplier.address}
                      </div>
                      {supplier.createdAt && (
                        <div className="text-sm text-gray-500">
                          Created:{" "}
                          {new Date(supplier.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    {/* <div className="col-span-2 text-sm font-medium text-gray-900">
                  TODO: Show product count when products API is integrated
                  <span className="text-gray-400">N/A</span>
                </div>{" "} */}
                    <div className="col-span-3 flex items-center gap-1 lg:mr-9">
                      <IconButton
                        icon={<FaEye />}
                        variant="info"
                        onClick={() => onViewSupplier(supplier)}
                        title="View Details"
                      />
                      <IconButton
                        icon={<FaEdit />}
                        variant="primary"
                        onClick={() =>
                          isValidSupplier(supplier)
                            ? onEditSupplier(supplier)
                            : null
                        }
                        title={
                          isValidSupplier(supplier)
                            ? "Edit Supplier"
                            : "Cannot edit sample data"
                        }
                        disabled={!isValidSupplier(supplier)}
                      />
                      <IconButton
                        icon={<FaTrash />}
                        variant="danger"
                        onClick={() =>
                          isValidSupplier(supplier)
                            ? onDeleteSupplier(supplier)
                            : null
                        }
                        title={
                          isValidSupplier(supplier)
                            ? "Delete Supplier"
                            : "Cannot delete sample data"
                        }
                        disabled={!isValidSupplier(supplier)}
                      />
                      {/* <IconButton
                    icon={<FaLink />}
                    variant="warning"
                                      onClick={() => onViewProducts(supplier)}

                    title="Assign Products"
                    className=" ring-yellow-200 hover:ring-yellow-300"
                  />
                  <IconButton
                    icon={<FaBox />}
                    variant="secondary"
                    onClick={() => onViewAssignedProducts(supplier)}
                    title="View Assigned Products"
                    className="border border-gray-400 hover:border-gray-500 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-700"
                  /> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Footer Summary */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {Math.min(startIndex + 1, filteredSuppliers.length)}-
                  {Math.min(endIndex, filteredSuppliers.length)} of{" "}
                  {filteredSuppliers.length} suppliers
                  {debouncedSearchTerm && (
                    <span className="ml-2 text-blue-600">
                      (filtered from {suppliers?.length || 0} total)
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {filteredSuppliers.length} suppliers
                  </div>
                  <div className="text-sm text-gray-500">
                    {debouncedSearchTerm
                      ? "Matching search"
                      : "Total suppliers in system"}
                  </div>
                </div>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-white border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredSuppliers.length}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierTable;
