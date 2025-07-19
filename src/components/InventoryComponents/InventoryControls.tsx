import React from "react";
import type { Category } from '../../store/slices/categorySlice';
interface InventoryControlsProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  groupBy: string;
  onGroupByChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  rowsPerPage: number;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  isSearching?: boolean; // Add prop to indicate search loading state
  categories: Category[]; // Add prop for categories
}
const InventoryControls: React.FC<InventoryControlsProps> = ({
  searchTerm,
  onSearchChange,
  groupBy,
  onGroupByChange,
  rowsPerPage,
  onRowsPerPageChange,
  isSearching = false,
  categories
}) => {
  return (
    <div className="border border-gray-300 px-4 sm:px-6 lg:px-10 py-4 sm:py-5 rounded-lg rounded-b-none border-b-0">
      <h2 className="text-base sm:text-lg font-semibold mb-4">
        Inventory Items
      </h2>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div className="relative w-full lg:w-80">
          <input
            type="text"
            placeholder="Search inventory..."
            className="border border-gray-300 rounded px-4 py-2 w-full pr-10"
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6 w-full lg:w-auto">
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            {/* Group by Categories */}
            <div className="flex items-center rounded px-3 py-1 ">
              <span className="text-sm sm:text-base font-medium mr-2 text-gray-700">
                Group by:
              </span>
              <select
                className="border border-gray-300 rounded px-2 py-1 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={groupBy}
                onChange={onGroupByChange}
              >
                <option value="">All</option>
                {categories && categories.length > 0 ? categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                )) : (
                  <option disabled>No categories available</option>
                )}
              </select>
            </div>
            {/* Rows per page */}
            <div className="flex items-center rounded px-3 py-1 ">
              <span className="text-sm sm:text-base font-medium mr-2 text-gray-700">
                Rows:
              </span>
              <select
                className="border border-gray-300 rounded px-2 py-1 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={rowsPerPage}
                onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default InventoryControls;
