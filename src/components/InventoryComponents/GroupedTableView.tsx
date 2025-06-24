import React from "react";
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
  return (
    <div className="space-y-4">
      {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
        <div
          key={category}
          className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
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
                {categoryProducts.length} items
              </span>
            </div>
          </div>

          {/* Category Products Table */}
          {expandedCategories.includes(category) && (
            <div className="overflow-x-auto">
              <table className="table-auto w-full min-w-max bg-white">
                <thead className="bg-gray-50">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-b-gray-200">
                      <input type="checkbox" className="rounded" />
                    </th>{" "}
                    <th className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-gray-300">
                      Product Name
                    </th>
                    <th className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-gray-300">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-gray-300">
                      PLU
                    </th>
                    <th className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-gray-300">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-gray-300">
                      Description
                    </th>
                    <th className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-gray-300">
                      Price
                    </th>
                    <th className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-gray-300">
                      Supplier
                    </th>
                    <th className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-gray-300">
                      Items/Unit
                    </th>
                  </tr>
                </thead>{" "}
                <tbody>
                  {categoryProducts.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm border-b border-gray-300">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="px-4 py-3 text-sm border-b border-gray-300">
                        <div className="flex items-center gap-2">
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
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm border-b border-gray-300">
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
                      <td className="px-4 py-3 text-sm text-blue-600 border-b border-gray-300">
                        {product.plu}
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-600 border-b border-gray-300">
                        {product.sku}
                      </td>
                      <td className="px-4 py-3 text-sm border-b border-gray-300">
                        {product.description}
                      </td>
                      <td className="px-4 py-3 text-sm border-b border-gray-300">
                        {product.price}
                      </td>
                      <td className="px-4 py-3 text-sm border-b border-gray-300">
                        {product.supplier}
                      </td>
                      <td className="px-4 py-3 text-sm border-b border-gray-300">
                        {product.itemsPerUnit}
                      </td>
                    </tr>
                  ))}
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
