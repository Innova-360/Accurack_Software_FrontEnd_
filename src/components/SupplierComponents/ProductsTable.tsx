import React from "react";
// import { FaBox } from 'react-icons/fa';
import type { Product, Supplier } from "./types";

const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

interface ProductsTableProps {
  products: Product[];
  supplier: Supplier;
  onBackToSuppliers: () => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  supplier,
  onBackToSuppliers,
}) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-white">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          No Products Found
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          {supplier.name} doesn't have any products in the system yet. Products
          will appear here once they're added.
        </p>
        <button
          onClick={onBackToSuppliers}
          className="bg-black hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
        >
          ← Back to Suppliers
        </button>
      </div>
    );
  }
  return (
    <div className="bg-white">
      {/* Products Table Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-2">PRODUCT</div>
          <div className="col-span-2">SKU</div>
          <div className="col-span-2">CATEGORY</div>
          <div className="col-span-1">PRICE</div>
          <div className="col-span-1">STOCK</div>
          <div className="col-span-3">DESCRIPTION</div>
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
                    <div className="text-xs text-gray-500">
                      ID: {product.id}
                    </div>
                  </div>
                </div>
              </div>

              {/* SKU */}
              <div className="col-span-2">
                <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                  {product.sku}
                </span>
              </div>

              {/* Category */}
              <div className="col-span-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {typeof product.category === "string"
                    ? product.category || "Uncategorized"
                    : "Uncategorized"}
                </span>
              </div>

              {/* Price */}
              <div className="col-span-1">
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(product.price)}
                </span>
              </div>

              {/* Stock */}
              <div className="col-span-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.stock > 10
                      ? "bg-green-100 text-green-800"
                      : product.stock > 0
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      product.stock > 10
                        ? "bg-green-500"
                        : product.stock > 0
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  ></div>
                  {product.stock}
                </span>
              </div>

              {/* Description */}
              <div className="col-span-3">
                <p
                  className="text-sm text-gray-600 truncate"
                  title={product.description}
                >
                  {product.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Products Summary */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {products.length} products from {supplier.name}
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(
                products.reduce((sum, p) => sum + p.price * p.stock, 0)
              )}
            </div>
            <div className="text-sm text-gray-500">Total inventory value</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsTable;
