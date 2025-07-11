import React from "react";

interface InventoryControlsProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  groupBy: string;
  onGroupByChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  rowsPerPage: number;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  isSearching?: boolean; // Add prop to indicate search loading state
}

const InventoryControls: React.FC<InventoryControlsProps> = ({
  searchTerm,
  onSearchChange,
  groupBy,
  onGroupByChange,
  rowsPerPage,
  onRowsPerPageChange,
  isSearching = false,
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
          <div className="flex items-center space-x-2">
            <span className="text-sm sm:text-base whitespace-nowrap">
              Group By:
            </span>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm sm:text-base"
              value={groupBy}
              onChange={onGroupByChange}
            >
              <option value="">None</option>
              <option value="category">Category</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm sm:text-base whitespace-nowrap">
              Rows per page:
            </span>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm sm:text-base"
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
  );
};

export default InventoryControls;
