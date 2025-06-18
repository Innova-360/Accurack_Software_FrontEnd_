import React from "react";
import type { Product } from "../../data/inventoryData";

interface InventoryTableProps {
  products: Product[];
  selectedItems: number[];
  startIndex: number;
  sortConfig: { key: string; direction: "asc" | "desc" } | null;
  onSelectAll: (checked: boolean) => void;
  onSelectItem: (index: number, checked: boolean) => void;
  onSort: (key: string) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  selectedItems,
  startIndex,
  sortConfig,
  onSelectAll,
  onSelectItem,
  onSort,
}) => {
  const getSortIcon = (key: string) => (
    <div className="flex flex-col">
      <span
        className={`text-xs ${
          sortConfig?.key === key && sortConfig.direction === "asc"
            ? "text-blue-600"
            : "text-gray-400"
        }`}
      >
        ▲
      </span>
      <span
        className={`text-xs ${
          sortConfig?.key === key && sortConfig.direction === "desc"
            ? "text-blue-600"
            : "text-gray-400"
        }`}
      >
        ▼
      </span>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-auto w-full min-w-max bg-white">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-b-gray-200">
                <input
                  type="checkbox"
                  checked={
                    products.length > 0 &&
                    selectedItems.length === products.length
                  }
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded"
                />
              </th>
              <th
                className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-b-gray-200 cursor-pointer hover:bg-gray-100"
                onClick={() => onSort("name")}
              >
                <div className="flex items-center justify-between">
                  Product Name
                  {getSortIcon("name")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-b-gray-200 cursor-pointer hover:bg-gray-100"
                onClick={() => onSort("quantity")}
              >
                <div className="flex items-center justify-between">
                  Quantity
                  {getSortIcon("quantity")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-b-gray-200 cursor-pointer hover:bg-gray-100"
                onClick={() => onSort("plu")}
              >
                <div className="flex items-center justify-between">
                  PLU
                  {getSortIcon("plu")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-b-gray-200 cursor-pointer hover:bg-gray-100"
                onClick={() => onSort("sku")}
              >
                <div className="flex items-center justify-between">
                  SKU
                  {getSortIcon("sku")}
                </div>
              </th>
              <th className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-b-gray-200">
                Description
              </th>
              <th
                className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-b-gray-200 cursor-pointer hover:bg-gray-100"
                onClick={() => onSort("price")}
              >
                <div className="flex items-center justify-between">
                  Price
                  {getSortIcon("price")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-b-gray-200 cursor-pointer hover:bg-gray-100"
                onClick={() => onSort("supplier")}
              >
                <div className="flex items-center justify-between">
                  Supplier
                  {getSortIcon("supplier")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-b-gray-200 cursor-pointer hover:bg-gray-100"
                onClick={() => onSort("category")}
              >
                <div className="flex items-center justify-between">
                  MSA Category
                  {getSortIcon("category")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-sm font-normal text-gray-500 border-b border-b-gray-200 cursor-pointer hover:bg-gray-100"
                onClick={() => onSort("itemsPerUnit")}
              >
                <div className="flex items-center justify-between">
                  Items/Unit
                  {getSortIcon("itemsPerUnit")}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm border-b border-b-gray-200">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(startIndex + index)}
                      onChange={(e) => onSelectItem(index, e.target.checked)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm border-b border-b-gray-200">
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
                  <td className="px-4 py-3 text-sm border-b border-b-gray-200">
                    <span
                      className={
                        product.quantity < 10 ? "text-red-600 font-bold" : ""
                      }
                    >
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
              ))
            ) : (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-8 text-center text-gray-500 border-b border-b-gray-200"
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

export default InventoryTable;
