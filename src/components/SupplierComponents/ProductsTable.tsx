import React, { useState, useEffect } from "react";
import { FaSpinner } from "react-icons/fa";
import apiClient from "../../services/api";
import toast from "react-hot-toast";
import type { Supplier } from "./types";

interface AssignedProduct {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  categoryId?: string;
  costPrice?: number;
  sellingPrice?: number;
  quantity?: number;
  status?: string;
  assignedAt?: string;
  ean?: string;
  pluUpc?: string;
  itemQuantity?: number;
  msrpPrice?: number;
  singleItemSellingPrice?: number;
  supplierType?: "primary" | "secondary";
}

const formatCurrency = (amount: number | undefined) => {
  if (!amount) return "N/A";
  return `$${amount.toFixed(2)}`;
};

interface ProductsTableProps {
  supplier: Supplier;
  onBackToSuppliers: () => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  supplier,
  onBackToSuppliers,
}) => {
  const [products, setProducts] = useState<AssignedProduct[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories for mapping categoryId to category name
 

  useEffect(() => {
    if (supplier) {
      fetchAssignedProducts();
    }
  }, [supplier]);

  const fetchAssignedProducts = async () => {
    if (!supplier) return;

    try {
      setLoading(true);
      const supplierId = supplier.id || supplier.supplier_id;

      // New API response structure
      const response = await apiClient.get(`/supplier/${supplierId}/products`);

      let assignedProducts = [];
      if (
        response.data?.success &&
        response.data?.data?.data &&
        Array.isArray(response.data.data.data)
      ) {
        assignedProducts = response.data.data.data
          .filter((assignment: any) => {
            // Only include products that have valid data
            const product = assignment.product || {};
            return product.id && product.name && product.name !== "N/A";
          })
          .map((assignment: any) => {
            const product = assignment.product || {};
            return {
              id: product.id || assignment.productId || assignment.id,
              name: product.name,
              sku: product.pluUpc || product.sku || "-",
              categoryId: product.categoryId,
              category: product.category?.name || "Uncategorized",
              costPrice: assignment.costPrice ?? product.msrpPrice ?? 0,
              sellingPrice: product.singleItemSellingPrice ?? 0,
              quantity: product.itemQuantity ?? 0,
              status: "active",
              supplierType: assignment.state || "primary",
              assignedAt:
                assignment.createdAt ||
                assignment.updatedAt ||
                new Date().toISOString(),
              ean: product.ean,
              pluUpc: product.pluUpc,
              itemQuantity: product.itemQuantity,
              msrpPrice: product.msrpPrice,
              singleItemSellingPrice: product.singleItemSellingPrice,
            };
          });
      }
      setProducts(assignedProducts);

      //   toast.success(`No products assigned to ${supplier.name}`);
      // } else {
      //   toast.success(`Found ${assignedProducts.length} assigned products`);
      // }
    } catch (error: any) {
      console.error("Error fetching assigned products:", error);
      if (error.response?.status === 404) {
        setProducts([]);
        toast.error("No products assigned for this supplier");
      } else {
        toast.error("Failed to load assigned products");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <FaSpinner className="animate-spin text-[#043E49] w-6 h-6" />
          <span className="text-gray-600">Loading assigned products...</span>
        </div>
      </div>
    );
  }
  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-white">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          No Products Found
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          {supplier.name} doesn't have any products assigned yet. Click below to
          assign products to this supplier.
        </p>
        <button
          onClick={onBackToSuppliers}
          className="bg-[#03414C] text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 hover:bg-[#032e37]"
        >
          Back to Supplier
        </button>
      </div>
    );
  }
  return (
    <div className="bg-white">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 lg:p-6 bg-gray-50 border-b border-gray-200">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-xl lg:text-2xl font-bold text-gray-900">
            {products.length}
          </div>
          <div className="text-xs lg:text-sm text-gray-600">Total Products</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-xl lg:text-2xl font-bold text-green-600">
            {products.filter((p) => (p.quantity || 0) > 0).length}
          </div>
          <div className="text-xs lg:text-sm text-gray-600">In Stock</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-xl lg:text-2xl font-bold text-blue-600">
            {products.reduce((sum, p) => sum + (p.quantity || 0), 0)}
          </div>
          <div className="text-xs lg:text-sm text-gray-600">Total Quantity</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-xl lg:text-2xl font-bold text-teal-600">
            {formatCurrency(
              products.reduce(
                (sum, p) => sum + (p.costPrice || 0) * (p.quantity || 0),
                0
              )
            )}
          </div>
          <div className="text-xs lg:text-sm text-gray-600">Total Value</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Products Table Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
              <div className="col-span-1">#</div>
              <div className="col-span-2">PRODUCT</div>
              <div className="col-span-2">SKU</div>
              <div className="col-span-2">CATEGORY</div>
              <div className="col-span-1">COST PRICE</div>
              <div className="col-span-1">SELLING PRICE</div>
              <div className="col-span-1">QUANTITY</div>
              <div className="col-span-2">VENDOR TYPE</div>
            </div>
          </div>

          {/* Products Table Content */}
          <div className="divide-y divide-gray-200">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Index */}
                  <div className="col-span-1">
                    <span className="text-sm font-medium text-gray-900">
                      {index + 1}
                    </span>
                  </div>

                  {/* Product Name */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {product.name}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SKU */}
                  <div className="col-span-2">
                    <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      {product.sku || "N/A"}
                    </span>
                  </div>

                  {/* Category */}
                  <div className="col-span-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {product.category || "Uncategorized"}
                    </span>
                  </div>

                  {/* Cost Price */}
                  <div className="col-span-1">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(product.costPrice)}
                    </span>
                  </div>

                  {/* Selling Price */}
                  <div className="col-span-1">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(product.sellingPrice)}
                    </span>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-1">
                    <span className="text-sm font-medium text-gray-900">
                      {product.quantity || "N/A"}
                    </span>
                  </div>

                  {/* Supplier Type */}
                  <div className="col-span-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.supplierType === "primary"
                          ? "bg-blue-100 text-blue-800"
                          : product.supplierType === "secondary"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.supplierType === "primary"
                        ? "Primary"
                        : "Secondary"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Products Summary */}
        <div className="px-4 lg:px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="text-sm text-gray-600">
              Showing {products.length} products from {supplier.name}
            </div>
            <div className="text-left sm:text-right">
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(
                  products.reduce(
                    (sum, p) => sum + (p.costPrice || 0) * (p.quantity || 0),
                    0
                  )
                )}
              </div>
              <div className="text-sm text-gray-500">Total inventory value</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsTable;
