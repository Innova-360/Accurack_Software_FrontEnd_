import React, { useState } from "react";
import Header from "../../components/Header";
import InventoryStats from "../../components/InventoryComponents/InventoryStats";
import InventoryControls from "../../components/InventoryComponents/InventoryControls";
import InventoryTable from "../../components/InventoryComponents/InventoryTable";
import InventoryMobileView from "../../components/InventoryComponents/InventoryMobileView";
import GroupedTableView from "../../components/InventoryComponents/GroupedTableView";
import Pagination from "../../components/InventoryComponents/Pagination";
import LowStockSection from "../../components/InventoryComponents/LowStockSection";
import { products } from "../../data/inventoryData";
import {
  useInventoryStats,
  useFilteredProducts,
  useGroupedProducts,
  useLowStockProducts,
} from "../../hooks/useInventory";

const Inventory: React.FC = () => {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupBy, setGroupBy] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const [isPageChanging, setIsPageChanging] = useState(false);

  // Use custom hooks for data processing
  const inventoryStats = useInventoryStats(products);
  const filteredProducts = useFilteredProducts(
    products,
    searchTerm,
    sortConfig
  );
  const groupedProducts = useGroupedProducts(filteredProducts, groupBy);
  const lowStockProducts = useLowStockProducts(products);

  // Calculate pagination
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentProducts =
    groupBy === "category"
      ? filteredProducts
      : filteredProducts.slice(startIndex, endIndex);

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  // Pagination handlers
  const handlePageChange = async (newPage: number) => {
    if (newPage === currentPage || isPageChanging) return;

    setIsPageChanging(true);

    // Add a small delay for smooth transition
    await new Promise((resolve) => setTimeout(resolve, 150));

    setCurrentPage(newPage);

    // Reset animation state
    setTimeout(() => setIsPageChanging(false), 300);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleGroupByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setGroupBy(value);
    setCurrentPage(1); // Reset to first page when changing group by

    // Auto-expand all categories when grouping by category
    if (value === "category") {
      const allCategories = [
        ...new Set(products.map((product) => product.category)),
      ];
      setExpandedCategories(allCategories);
    } else {
      setExpandedCategories([]);
    }
  };

  // Sorting function
  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Checkbox handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = currentProducts.map((_, index) => startIndex + index);
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (index: number, checked: boolean) => {
    const actualIndex = startIndex + index;
    if (checked) {
      setSelectedItems([...selectedItems, actualIndex]);
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== actualIndex));
    }
  };

  return (
    <>
      <Header />
      <div className="p-4 sm:p-6 bg-white min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 lg:mb-6 space-y-4 lg:space-y-0">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0f4d57]">
            Inventory Management
          </h1>
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <button className="bg-[#0f4d57] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl shadow-md text-sm sm:text-base hover:bg-[#0d3f47] transition-colors">
              + Create Inventory
            </button>
            <button className="bg-[#0f4d57] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl shadow-md text-sm sm:text-base hover:bg-[#0d3f47] transition-colors">
              Update Inventory
            </button>
            <button className="bg-[#0f4d57] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl shadow-md text-sm sm:text-base hover:bg-[#0d3f47] transition-colors">
              Delete Inventory
            </button>
            <button className="bg-[#0f4d57] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl shadow-md text-sm sm:text-base hover:bg-[#0d3f47] transition-colors">
              Upload Inventory
            </button>
          </div>
        </div>

        {/* Horizontal line */}
        <hr className="border-gray-300 mb-6" />

        {/* Stats Cards Section */}
        <InventoryStats
          totalProducts={inventoryStats.totalProducts}
          totalItems={inventoryStats.totalItems}
          totalValue={inventoryStats.totalValue}
        />

        {/* Inventory Controls */}
        <InventoryControls
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          groupBy={groupBy}
          onGroupByChange={handleGroupByChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
        />

        {/* Inventory Table/View Container */}
        <div className="border border-gray-300 px-4 sm:px-6 lg:px-10 py-4 sm:py-5 rounded-lg rounded-t-none">
          {/* Mobile View */}
          <div className="block md:hidden">
            <InventoryMobileView
              products={currentProducts}
              groupedProducts={groupedProducts}
              groupBy={groupBy}
              expandedCategories={expandedCategories}
              onToggleCategory={toggleCategory}
            />
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            {groupBy === "category" && groupedProducts ? (
              <GroupedTableView
                groupedProducts={groupedProducts}
                expandedCategories={expandedCategories}
                onToggleCategory={toggleCategory}
              />
            ) : (
              <InventoryTable
                products={currentProducts}
                selectedItems={selectedItems}
                startIndex={startIndex}
                sortConfig={sortConfig}
                onSelectAll={handleSelectAll}
                onSelectItem={handleSelectItem}
                onSort={handleSort}
              />
            )}
          </div>

          {/* Pagination - Only show when not grouped by category */}
          {groupBy !== "category" && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={handlePageChange}
            />
          )}
        </div>

        {/* Low Stock Products Section */}
        <LowStockSection lowStockProducts={lowStockProducts} />
      </div>
    </>
  );
};

export default Inventory;
