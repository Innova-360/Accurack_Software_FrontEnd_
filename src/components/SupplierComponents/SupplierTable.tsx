import React, { useState } from "react";
import { FaPlus, FaBars, FaEye, FaEdit, FaTrash, FaBox, FaLink } from "react-icons/fa";
import { SpecialButton, IconButton } from "../buttons";
import type { Supplier } from "./types";
import Pagination from "./Pagination";

interface SupplierTableProps {
  suppliers: Supplier[];
  onViewSupplier: (supplier: Supplier) => void;
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplier: Supplier) => void;
  onViewProducts: (supplier: Supplier) => void;
  onAddSupplier: () => void;
}

const SupplierTable: React.FC<SupplierTableProps> = ({
  suppliers,
  onViewSupplier,
  onEditSupplier,
  onDeleteSupplier,
  onViewProducts,
  onAddSupplier,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(suppliers?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSuppliers = suppliers?.slice(startIndex, endIndex);

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
    <div className="bg-white overflow-x-auto">
      <div className="min-w-[1000px]">
        {" "}
        {/* Table Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-3">SUPPLIER</div>
            <div className="col-span-2">CONTACT</div>
            <div className="col-span-3">ADDRESS</div>
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
                <div className="col-span-3">
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
                <div className="col-span-2">
                  <div className="text-sm text-gray-900">{supplier.email}</div>
                  <div className="text-sm text-gray-500">{supplier.phone}</div>
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
                  <IconButton
                    icon={<FaLink />}
                    variant="warning"
                                      onClick={() => onViewProducts(supplier)}

                    title="Assign Products"
                    className=" ring-yellow-200 hover:ring-yellow-300"
                  />
                  <IconButton
                    icon={<FaBox />}
                    variant="success"
                    title="View Products"
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
              Showing {currentSuppliers?.length} out of {suppliers?.length}{" "}
              suppliers
            </div>{" "}
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                {suppliers?.length} suppliers
              </div>
              <div className="text-sm text-gray-500">
                Total suppliers in system
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
              totalItems={suppliers?.length}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierTable;