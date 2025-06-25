import React from "react";
import type { Product } from "../../data/inventoryData";

interface InventoryMobileViewProps {
  products: Product[];
  groupedProducts: { [key: string]: Product[] } | null;
  groupBy: string;
  expandedCategories: string[];
  onToggleCategory: (category: string) => void;
}

const InventoryMobileView: React.FC<InventoryMobileViewProps> = ({
  products,
  groupedProducts,
  groupBy,
  expandedCategories,
  onToggleCategory,
}) => {
  if (groupBy === "category" && groupedProducts) {
    return (
      <div className="space-y-4">
        {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
          <div
            key={category}
            className="border border-gray-300 rounded-lg overflow-hidden"
          >
            {/* Category Header */}
            <div
              className="bg-blue-50 px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-blue-100 transition-colors"
              onClick={() => onToggleCategory(category)}
            >
              <div className="flex items-center space-x-2">
                <svg
                  className={`w-5 h-5 text-gray-600 transition-transform ${
                    expandedCategories.includes(category) ? "rotate-90" : ""
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800">
                  {category}
                </h3>
                <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                  {categoryProducts.length}
                </span>
              </div>
            </div>

            {/* Category Products Cards */}
            {expandedCategories.includes(category) && (
              <div className="p-4 space-y-4">
                {categoryProducts.map((product, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                        {product.name}
                        {product.quantity < 10 && (
                          <svg
                            className="w-4 h-4 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">Quantity:</span>{" "}
                        <span
                          className={
                            product.quantity < 10
                              ? "text-red-600 font-bold"
                              : ""
                          }
                        >
                          {product.quantity}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Price:</span>{" "}
                        {product.price}
                      </div>
                      <div>
                        <span className="font-medium">PLU:</span> {product.plu}
                      </div>
                      <div>
                        <span className="font-medium">SKU:</span> {product.sku}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Items/Unit:</span>{" "}
                        {product.itemsPerUnit}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Supplier:</span>{" "}
                        {product.supplier}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="font-medium">Description:</span>{" "}
                      {product.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Regular Mobile View
  if (products.length > 0) {
    return (
      <div className="space-y-4">
        {products.map((product, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                {product.name}{" "}
                {product.quantity < 10 && (
                  <svg
                    className="w-4 h-4 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </h3>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {product.category}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>
                <span className="font-medium">Quantity:</span>{" "}
                <span
                  className={
                    product.quantity < 10 ? "text-red-600 font-bold" : ""
                  }
                >
                  {product.quantity}
                </span>
              </div>
              <div>
                <span className="font-medium">Price:</span> {product.price}
              </div>
              <div>
                <span className="font-medium">PLU:</span> {product.plu}
              </div>
              <div>
                <span className="font-medium">SKU:</span> {product.sku}
              </div>
              <div className="col-span-2">
                <span className="font-medium">Items/Unit:</span>{" "}
                {product.itemsPerUnit}
              </div>
              <div className="col-span-2">
                <span className="font-medium">Supplier:</span>{" "}
                {product.supplier}
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <span className="font-medium">Description:</span>{" "}
              {product.description}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="text-center py-8 text-gray-500">
      No products found matching your search criteria.
    </div>
  );
};

export default InventoryMobileView;
