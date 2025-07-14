import React, { useState } from "react";
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
  onViewProducts: (supplier: Supplier) => void;
  onViewAssignedProducts: (supplier: Supplier) => void;
  onAddSupplier: () => void;
}

const SupplierTable: React.FC<SupplierTableProps> = ({
  suppliers,
  onViewSupplier,
  onEditSupplier,
  onDeleteSupplier,
  onAddSupplier,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  // Filter suppliers based on search term
  const filteredSuppliers =
    suppliers?.filter((supplier) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        supplier.name?.toLowerCase().includes(searchLower) ||
        supplier.email?.toLowerCase().includes(searchLower) ||
        supplier.phone?.toLowerCase().includes(searchLower) ||
        supplier.address?.toLowerCase().includes(searchLower) ||
        supplier.streetAddress?.toLowerCase().includes(searchLower)
      );
    }) || [];

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSuppliers = filteredSuppliers.slice(startIndex, endIndex);

  // Reset to first page when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Helper function to check if supplier can be edited/deleted
  const isValidSupplier = (supplier: Supplier): boolean => {
    // Simple check - any supplier with an ID can be edited/deleted
    return !!(supplier.id || supplier.supplier_id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (suppliers?.length === 0) {
    return (
      <div className="text-center py-16 bg-white">
        <div className="p-6 bg-teal-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <FaBars className="text-white" size={28} />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          No Vendors Found
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

  // No search results state
  if (searchTerm && filteredSuppliers.length === 0) {
    return (
      <>
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search suppliers by name, email, phone, or address..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="text-center py-16 bg-white">
          <div className="p-6 bg-gray-400 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FaSearch className="text-white" size={28} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            No Search Results
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            No vendors found matching "{searchTerm}". Try adjusting your search
            terms.
          </p>
          <SpecialButton
            variant="expense-add"
            onClick={() => setSearchTerm("")}
            className="mx-auto"
          >
            <FaSearch className="mr-2" /> Clear Search
          </SpecialButton>
        </div>
      </>
    );
  }

  return (
    <div className="bg-white overflow-x-auto">
      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search suppliers by name, email, phone, or address..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="min-w-[1000px]">
        {" "}
        {/* Table Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-2">SUPPLIER</div>
            <div className="col-span-3">CONTACT</div>
            <div className="col-span-4">ADDRESS</div>
            {/* <div className="col-span-2">PRODUCTS</div> */}
            <div className="col-span-2">ACTIONS</div>
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
                  <div className="text-sm text-gray-900">{supplier.email}</div>
                  <div className="text-sm text-gray-500">{supplier.phone}</div>
                </div>
                <div className="col-span-4">
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
                <div className=" flex items-center gap-1 ">
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
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Footer Summary */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {currentSuppliers?.length} out of{" "}
              {filteredSuppliers?.length} {searchTerm ? "filtered " : ""}vendors
              {searchTerm && (
                <span className="ml-2 text-teal-600">
                  (filtered from {suppliers?.length} total)
                </span>
              )}
            </div>{" "}
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                {filteredSuppliers?.length} vendors
              </div>
              <div className="text-sm text-gray-500">
                {searchTerm
                  ? "Matching search criteria"
                  : "Total vendors in system"}
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
              totalItems={filteredSuppliers?.length}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierTable;
