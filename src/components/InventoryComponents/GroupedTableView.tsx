import React, { useState } from "react";
import type { Product } from "../../data/inventoryData";

interface GroupedTableViewProps {
  groupedProducts: { [key: string]: Product[] };
  expandedCategories: string[];
  onToggleCategory: (category: string) => void;
}

const GroupedTableView: React.FC<GroupedTableViewProps> = ({
  groupedProducts,
  expandedCategories,
  onToggleCategory,
}) => {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set()
  );

  const toggleProductExpansion = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };
  return (
    <div className="space-y-4">
      {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
        <div
          key={category}
          className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
        >
          {" "}
          {/* Category Header */}
          <div
            className="bg-blue-50 px-2 sm:px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-blue-100 transition-colors"
            onClick={() => onToggleCategory(category)}
          >
            <div className="flex items-center space-x-2">
              <svg
                className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-600 transition-transform ${
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
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                {category}
              </h3>
              <span className="text-xs sm:text-sm text-gray-600 bg-white px-2 py-1 rounded">
                {categoryProducts.length} items
              </span>
            </div>
          </div>
          {/* Category Products Table */}
          {expandedCategories.includes(category) && (
            <div className="overflow-x-auto">
              {" "}
              <table className="table-auto w-full min-w-max bg-white">
                <thead className="bg-gray-50">
                  <tr className="text-left">
                    <th className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-b-gray-200">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 min-w-[150px]">
                      Product Name
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 min-w-[80px]">
                      <span className="hidden sm:inline">Quantity</span>
                      <span className="sm:hidden">Qty</span>
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 min-w-[80px]">
                      PLU
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 min-w-[100px]">
                      SKU
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 min-w-[120px]">
                      Description
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 min-w-[80px]">
                      Price
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 min-w-[100px]">
                      Supplier
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 min-w-[90px]">
                      <span className="hidden sm:inline">Items/Unit</span>
                      <span className="sm:hidden">Items</span>
                    </th>
                  </tr>
                </thead>{" "}
                <tbody>
                  {categoryProducts.map((product, index) => {
                    const productKey =
                      product.id || `product-${category}-${index}`;
                    const isProductExpanded = expandedProducts.has(productKey);
                    const hasVariantsToShow =
                      product.hasVariants &&
                      product.variants &&
                      product.variants.length > 0;

                    return (
                      <React.Fragment key={productKey}>
                        {/* Main product row */}
                        <tr className="hover:bg-gray-50">
                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                            <input type="checkbox" className="rounded" />
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                            <div className="flex items-center gap-1 sm:gap-2">
                              {hasVariantsToShow && (
                                <button
                                  onClick={() =>
                                    toggleProductExpansion(productKey)
                                  }
                                  className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
                                >
                                  <svg
                                    className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${
                                      isProductExpanded ? "rotate-90" : ""
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
                                </button>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="font-medium truncate">
                                  {product.name}
                                </div>
                                {hasVariantsToShow && (
                                  <div className="text-xs text-gray-500">
                                    {product.variants?.length || 0} variants
                                  </div>
                                )}
                              </div>
                              {product.quantity < 10 && (
                                <svg
                                  className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0"
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
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                            <span
                              className={
                                product.quantity < 10
                                  ? "text-red-600 font-bold"
                                  : ""
                              }
                            >
                              {product.quantity}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-blue-600 border-b border-gray-300">
                            <div className="truncate">{product.plu}</div>
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-blue-600 border-b border-gray-300">
                            <div className="truncate">{product.sku}</div>
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                            <div
                              className="truncate max-w-[120px] sm:max-w-none"
                              title={product.description}
                            >
                              {product.description}
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                            {product.price}
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                            <div className="truncate">{product.supplier}</div>
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                            {product.itemsPerUnit}
                          </td>
                        </tr>
                        {/* Variant rows */}
                        {hasVariantsToShow &&
                          isProductExpanded &&
                          product.variants?.map((variant, variantIndex) => (
                            <tr
                              key={`${productKey}-variant-${variantIndex}`}
                              className="bg-gray-50 hover:bg-gray-100"
                            >
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                                {/* Empty checkbox column for variants */}
                              </td>
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                                <div className="pl-4 sm:pl-6 flex items-center gap-1 sm:gap-2">
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
                                  <span className="text-gray-700 truncate">
                                    {variant.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300 text-gray-600">
                                -
                              </td>
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-blue-600 border-b border-gray-300">
                                -
                              </td>
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-blue-600 border-b border-gray-300">
                                <div className="truncate">{variant.sku}</div>
                              </td>
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300 text-gray-600">
                                <div className="truncate max-w-[120px] sm:max-w-none">
                                  Variant of {product.name}
                                </div>
                              </td>
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                                ${variant.price.toFixed(2)}
                              </td>
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                                <div className="truncate">
                                  {product.supplier}
                                </div>
                              </td>
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                                {product.itemsPerUnit}
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GroupedTableView;
