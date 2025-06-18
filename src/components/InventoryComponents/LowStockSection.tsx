import React from "react";
import type { Product } from "../../data/inventoryData";

interface LowStockSectionProps {
  lowStockProducts: Product[];
}

const LowStockSection: React.FC<LowStockSectionProps> = ({
  lowStockProducts,
}) => {
  if (lowStockProducts.length === 0) {
    return null;
  }

  return (
    <div className="border border-gray-300 px-4 sm:px-6 lg:px-10 py-4 sm:py-5 rounded-lg mt-6">
      <h2 className="text-base sm:text-lg font-semibold mb-4 text-red-600">
        Low Stock Products (Quantity &lt; 10)
      </h2>

      {/* Mobile Card View for Low Stock */}
      <div className="block md:hidden">
        {lowStockProducts.map((product, index) => (
          <div
            key={index}
            className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm mb-4"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                {product.name}
                <svg
                  className="w-4 h-4 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </h3>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                Low Stock
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>
                <span className="font-medium">Quantity:</span>{" "}
                <span className="text-red-600 font-bold">
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
                <span className="font-medium">Category:</span>{" "}
                {product.category}
              </div>
              <div className="col-span-2">
                <span className="font-medium">Supplier:</span>{" "}
                {product.supplier}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View for Low Stock */}
      <div className="hidden md:block overflow-x-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-auto w-full min-w-max bg-white">
              <thead className="bg-red-50">
                <tr className="text-left">
                  <th className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-b-gray-200">
                    Product Name
                  </th>
                  <th className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-b-gray-200">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-b-gray-200">
                    PLU
                  </th>
                  <th className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-b-gray-200">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-b-gray-200">
                    Description
                  </th>
                  <th className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-b-gray-200">
                    Price
                  </th>
                  <th className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-b-gray-200">
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-b-gray-200">
                    Category
                  </th>
                  <th className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-b-gray-200">
                    Items/Unit
                  </th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((product, index) => (
                  <tr key={index} className="bg-red-50 hover:bg-red-100">
                    <td className="px-4 py-3 text-sm border-b border-b-gray-200">
                      <div className="flex items-center gap-2">
                        {product.name}
                        <svg
                          className="w-4 h-4 text-red-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-b-gray-200">
                      <span className="text-red-600 font-bold">
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-600 border-b border-b-gray-200">
                      {product.plu}
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-600 border-b border-b-gray-200">
                      {product.sku}
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-b-gray-200">
                      {product.description}
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-b-gray-200">
                      {product.price}
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-b-gray-200">
                      {product.supplier}
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-b-gray-200">
                      {product.category}
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-b-gray-200">
                      {product.itemsPerUnit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LowStockSection;
