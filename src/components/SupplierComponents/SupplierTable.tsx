import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaBars,
  FaEye,
  FaEdit,
  FaTrash,
  FaBox,
  FaSearch,
} from "react-icons/fa";
import { SpecialButton, IconButton } from "../buttons";
import type { Supplier } from "./types";
import Pagination from "./Pagination";
import apiClient from "../../services/api";

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
  const [productCounts, setProductCounts] = useState<{ [key: string]: number }>(
    {}
  );
  const [loadingCounts, setLoadingCounts] = useState(false);
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

  // Helper function to check if supplier can be edited/deleted
  const isValidSupplier = (supplier: Supplier): boolean => {
    // Simple check - any supplier with an ID can be edited/deleted
    return !!(supplier.id || supplier.supplier_id);
  };

  // Fetch product counts for all suppliers
  const fetchProductCounts = async () => {
    if (!suppliers || suppliers.length === 0) return;

    setLoadingCounts(true);
    const counts: { [key: string]: number } = {};

    try {
      // Create promises for all supplier product fetches
      const fetchPromises = suppliers.map(async (supplier) => {
        const supplierId = supplier.id || supplier.supplier_id;
        if (!supplierId) return { supplierId: null, count: 0 };

        try {
          const response = await apiClient.get(
            `/supplier/${supplierId}/products`
          );
          if (
            response.data?.success &&
            response.data?.data?.data &&
            Array.isArray(response.data.data.data)
          ) {
            // Filter out invalid products (products with no actual data)
            const validProducts = response.data.data.data.filter(
              (assignment: any) => {
                const product = assignment.product || {};
                return product.id && product.name && product.name !== "N/A";
              }
            );
            return { supplierId, count: validProducts.length };
          } else {
            return { supplierId, count: 0 };
          }
        } catch (error) {
          console.error(
            `Error fetching products for supplier ${supplierId}:`,
            error
          );
          return { supplierId, count: 0 };
        }
      });

      // Wait for all promises to complete
      const results = await Promise.all(fetchPromises);

      // Update counts
      results.forEach(({ supplierId, count }) => {
        if (supplierId) {
          counts[supplierId] = count;
        }
      });
    } catch (error) {
      console.error("Error fetching product counts:", error);
    }

    setProductCounts(counts);
    setLoadingCounts(false);
  };

  // Fetch product counts when suppliers change
  useEffect(() => {
    fetchProductCounts();
  }, [suppliers]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (suppliers?.length === 0) {
    return (
      <div className="text-center py-16 bg-white">
        <div className="p-6 bg-teal-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <FaBars className="text-white" size={28} />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          No vendors Found
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          You haven't added any vendors yet. Start by adding your first vendor
          to manage your supply chain effectively.
        </p>
        <SpecialButton
          variant="expense-add"
          onClick={onAddSupplier}
          className="mx-auto"
        >
          <FaPlus className="mr-2" /> Add Your First Vendor
        </SpecialButton>
      </div>
    );
  }

  // Show message when no suppliers match search
  if (searchTerm && filteredSuppliers.length === 0) {
    return (
      <div className="bg-white overflow-x-auto">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search vendors by name, email, phone, or address..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
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
            No vendors found
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            No vendors match your search "{searchTerm}". Try adjusting your
            search terms.
          </p>
          <button
            onClick={() => setSearchTerm("")}
            className="bg-teal-600 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 hover:bg-teal-700"
          >
            Clear Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-x-auto">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search vendors by name, email, phone, or address..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600">
            Found {filteredSuppliers.length} vendor
            {filteredSuppliers.length !== 1 ? "s" : ""} matching "{searchTerm}"
          </div>
        )}
      </div>

      <div className="min-w-[1000px]">
        {" "}
        {/* Table Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-2">VENDOR</div>
            <div className="col-span-3">CONTACT</div>
            <div className="col-span-2">ADDRESS</div>
            <div className="col-span-2">PRODUCTS</div>
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
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="text-sm text-gray-900">{supplier.email}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-gray-900">
                    {supplier.streetAddress ||
                      supplier.address?.split(",")[0] ||
                      supplier.address}
                  </div>
                  {supplier.createdAt && (
                    <div className="text-sm text-gray-500">
                      Created:{" "}
                      {new Date(supplier.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="col-span-2 text-sm font-medium text-gray-900">
                  {(() => {
                    const supplierId = supplier.id || supplier.supplier_id;

                    if (loadingCounts) {
                      return (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Loading...
                        </span>
                      );
                    }

                    const count = productCounts[supplierId] || 0;
                    return (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          count > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {count} {count === 1 ? "Product" : "Products"}
                      </span>
                    );
                  })()}
                </div>{" "}
                <div className="col-span-2 flex items-center gap-1 lg:mr-9">
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
                    icon={<FaBox />}
                    variant="success"
                    onClick={() => onViewProducts(supplier)}
                    title="Assign "
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
              {filteredSuppliers.length} {searchTerm ? "filtered" : ""} vendors
              {searchTerm && filteredSuppliers.length !== suppliers.length && (
                <span className="text-gray-500 ml-1">
                  (of {suppliers.length} total)
                </span>
              )}
            </div>{" "}
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                {filteredSuppliers.length} vendors
              </div>
              <div className="text-sm text-gray-500">
                {searchTerm ? "Filtered vendors" : "Total vendors in system"}
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
  );
};

export default SupplierTable;
