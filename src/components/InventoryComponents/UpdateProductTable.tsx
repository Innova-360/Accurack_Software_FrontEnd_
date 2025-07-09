import React, { useState } from "react";
import type { Product } from "../../data/inventoryData";

interface UpdateProductTableProps {
  products: Product[];
  sortConfig: { key: string; direction: "asc" | "desc" } | null;
  onSort: (key: string) => void;
  onProductClicked: (product: Product) => void;
}

const UpdateProductTable: React.FC<UpdateProductTableProps> = ({
  products,
  sortConfig,
  onSort,
  onProductClicked,
}) => {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set()
  );

  const getSortIcon = (column: string) => {
    if (!sortConfig || sortConfig.key !== column) {
      return (
        <svg
          className="w-4 h-4 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M5 12l5-5 5 5H5z" />
        </svg>
      );
    }
    return sortConfig.direction === "asc" ? (
      <svg
        className="w-4 h-4 text-gray-600"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M5 12l5-5 5 5H5z" />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 text-gray-600"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M15 8l-5 5-5-5h10z" />
      </svg>
    );
  };

  const toggleProductExpansion = (productKey: string) => {
    setExpandedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productKey)) {
        newSet.delete(productKey);
      } else {
        newSet.add(productKey);
      }
      return newSet;
    });
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="table-auto w-full min-w-max bg-white">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th
                className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 cursor-pointer hover:bg-gray-100 min-w-[150px]"
                onClick={() => onSort("name")}
              >
                <div className="flex items-center justify-between">
                  Product Name
                  {getSortIcon("name")}
                </div>
              </th>
              <th
                className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 cursor-pointer hover:bg-gray-100 min-w-[80px]"
                onClick={() => onSort("quantity")}
              >
                <div className="flex items-center justify-between">
                  Qty
                  {getSortIcon("quantity")}
                </div>
              </th>
              <th
                className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 cursor-pointer hover:bg-gray-100 min-w-[80px]"
                onClick={() => onSort("plu")}
              >
                <div className="flex items-center justify-between">
                  PLU
                  {getSortIcon("plu")}
                </div>
              </th>
              <th
                className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 cursor-pointer hover:bg-gray-100 min-w-[100px]"
                onClick={() => onSort("sku")}
              >
                <div className="flex items-center justify-between">
                  SKU
                  {getSortIcon("sku")}
                </div>
              </th>
              <th className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 min-w-[120px]">
                Description
              </th>
              <th
                className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 cursor-pointer hover:bg-gray-100 min-w-[80px]"
                onClick={() => onSort("price")}
              >
                <div className="flex items-center justify-between">
                  Price
                  {getSortIcon("price")}
                </div>
              </th>
              <th
                className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 cursor-pointer hover:bg-gray-100 min-w-[100px]"
                onClick={() => onSort("category")}
              >
                <div className="flex items-center justify-between">
                  <span className="hidden sm:inline">Category</span>
                  <span className="sm:hidden">Category</span>
                  {getSortIcon("category")}
                </div>
              </th>
              <th
                className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-normal text-gray-500 border-b border-gray-300 cursor-pointer hover:bg-gray-100 min-w-[90px]"
                onClick={() => onSort("itemsPerUnit")}
              >
                <div className="flex items-center justify-between">
                  <span className="hidden sm:inline">Items/Unit</span>
                  <span className="sm:hidden">Items</span>
                  {getSortIcon("itemsPerUnit")}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product, index) => {
                const productKey = product.id || `product-${index}`;
                const isExpanded = expandedProducts.has(productKey);
                const hasVariantsToShow =
                  product.hasVariants &&
                  product.variants &&
                  product.variants.length > 0;

                return (
                  <React.Fragment key={productKey}>
                    {/* Main product row - clickable */}
                    <tr
                      className="hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => onProductClicked(product)}
                    >
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                        <div className="flex items-center gap-2">
                          {hasVariantsToShow && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent row click
                                toggleProductExpansion(productKey);
                              }}
                              className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
                            >
                              <svg
                                className={`w-3 h-3 transition-transform ${
                                  isExpanded ? "rotate-90" : ""
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
                          <div
                            className="truncate max-w-[120px] sm:max-w-none font-medium"
                            title={product.name}
                          >
                            {product.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.quantity < 10
                              ? "bg-red-100 text-red-800"
                              : product.quantity < 50
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                        {product.plu || "N/A"}
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                        {product.sku}
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
                        {typeof product.price === "string"
                          ? product.price
                          : typeof product.price === "number"
                            ? `$${(product.price as number).toFixed(2)}`
                            : "$0.00"}
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                        <div className="truncate">
                          {typeof product.category === "string"
                            ? product.category
                            : (product.category as any)?.name ||
                              "Uncategorized"}
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm border-b border-gray-300">
                        {typeof product.itemsPerUnit === "number"
                          ? product.itemsPerUnit
                          : String(product.itemsPerUnit || "1")}
                      </td>
                    </tr>

                    {/* Variant rows */}
                    {hasVariantsToShow &&
                      isExpanded &&
                      product.variants?.map((variant, variantIndex) => (
                        <tr
                          key={`${productKey}-variant-${variantIndex}`}
                          className="bg-gray-50 hover:bg-gray-100 cursor-pointer"
                          onClick={() => onProductClicked(product)}
                        >
                          <td className="px-2 sm:px-4 py-2 text-xs border-b border-gray-200">
                            <div className="pl-6 text-gray-600">
                              ↳ {variant.name}
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-2 text-xs border-b border-gray-200">
                            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              {variant.quantity || 0}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-2 text-xs border-b border-gray-200 text-gray-600">
                            {variant.pluUpc || "N/A"}
                          </td>
                          <td className="px-2 sm:px-4 py-2 text-xs border-b border-gray-200 text-gray-600">
                            {variant.sku || "N/A"}
                          </td>
                          <td className="px-2 sm:px-4 py-2 text-xs border-b border-gray-200 text-gray-600">
                            Variant
                          </td>
                          <td className="px-2 sm:px-4 py-2 text-xs border-b border-gray-200 text-gray-600">
                            ${variant.price?.toFixed(2) || "0.00"}
                          </td>
                          <td className="px-2 sm:px-4 py-2 text-xs border-b border-gray-200 text-gray-600">
                            Variant
                          </td>
                          <td className="px-2 sm:px-4 py-2 text-xs border-b border-gray-200 text-gray-600">
                            1
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-2 sm:px-4 py-8 text-center text-gray-500 border-b border-gray-300 text-xs sm:text-sm"
                >
                  No products found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UpdateProductTable;
