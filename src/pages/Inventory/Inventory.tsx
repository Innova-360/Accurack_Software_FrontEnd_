import { useState } from "react";
import Header from "../../components/Header";
import InventoryStats from "../../components/InventoryComponents/InventoryStats";
import InventoryControls from "../../components/InventoryComponents/InventoryControls";
import InventoryTable from "../../components/InventoryComponents/InventoryTable";
import InventoryMobileView from "../../components/InventoryComponents/InventoryMobileView";
import GroupedTableView from "../../components/InventoryComponents/GroupedTableView";
import Pagination from "../../components/InventoryComponents/Pagination";
import LowStockSection from "../../components/InventoryComponents/LowStockSection";
import {
  AddInventoryModal,
  AddProductModal,
  UploadInventoryModal,
} from "../../components/modals";
import type { ProductFormData } from "../../components/modals";
import { products } from "../../data/inventoryData";
import {
  useInventoryStats,
  useFilteredProducts,
  useGroupedProducts,
  useLowStockProducts,
} from "../../hooks/useInventory";

const Inventory: React.FC = () => {
  // State for main inventory pagination
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

  // State for low stock pagination
  const [lowStockCurrentPage, setLowStockCurrentPage] = useState(1);
  const [lowStockRowsPerPage, setLowStockRowsPerPage] = useState(5);

  const [isPageChanging, setIsPageChanging] = useState(false);
  const [isLowStockPageChanging, setIsLowStockPageChanging] = useState(false);
  const [mobileViewType, setMobileViewType] = useState<"cards" | "table">(
    "cards"
  );

  // Modal states
  const [isAddInventoryModalOpen, setIsAddInventoryModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isUploadInventoryModalOpen, setIsUploadInventoryModalOpen] =
    useState(false);

  // Use custom hooks for data processing
  const inventoryStats = useInventoryStats(products);
  const filteredProducts = useFilteredProducts(
    products,
    searchTerm,
    sortConfig
  );
  const groupedProducts = useGroupedProducts(filteredProducts, groupBy);
  const lowStockProducts = useLowStockProducts(products);
  // Calculate pagination for main inventory
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentProducts =
    groupBy === "category"
      ? filteredProducts
      : filteredProducts.slice(startIndex, endIndex);

  // Calculate pagination for low stock products
  const totalLowStockItems = lowStockProducts.length;
  const totalLowStockPages = Math.ceil(
    totalLowStockItems / lowStockRowsPerPage
  );
  const lowStockStartIndex = (lowStockCurrentPage - 1) * lowStockRowsPerPage;
  const lowStockEndIndex = lowStockStartIndex + lowStockRowsPerPage;
  const currentLowStockProducts = lowStockProducts.slice(
    lowStockStartIndex,
    lowStockEndIndex
  );

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };
  // Pagination handlers for main inventory
  const handlePageChange = async (newPage: number) => {
    if (newPage === currentPage || isPageChanging) return;

    setIsPageChanging(true);

    // Add a small delay for smooth transition
    await new Promise((resolve) => setTimeout(resolve, 150));

    setCurrentPage(newPage);

    // Reset animation state
    setTimeout(() => setIsPageChanging(false), 300);
  };

  // Pagination handlers for low stock products
  const handleLowStockPageChange = async (newPage: number) => {
    if (newPage === lowStockCurrentPage || isLowStockPageChanging) return;

    setIsLowStockPageChanging(true);

    // Add a small delay for smooth transition
    await new Promise((resolve) => setTimeout(resolve, 150));

    setLowStockCurrentPage(newPage);

    // Reset animation state
    setTimeout(() => setIsLowStockPageChanging(false), 300);
  };

  const handleLowStockRowsPerPageChange = (newRowsPerPage: number) => {
    setLowStockRowsPerPage(newRowsPerPage);
    setLowStockCurrentPage(1); // Reset to first page when changing rows per page
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

    // When grouping by category, keep categories collapsed by default
    if (value === "category") {
      setExpandedCategories([]); // Start with all categories closed
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

  // Modal handlers
  const handleAddInventoryClick = () => {
    setIsAddInventoryModalOpen(true);
  };

  const handleAddProductClick = () => {
    setIsAddInventoryModalOpen(false);
    setIsAddProductModalOpen(true);
  };

  const handleUploadInventoryClick = () => {
    setIsAddInventoryModalOpen(false);
    setIsUploadInventoryModalOpen(true);
  };

  const handleScanInventoryClick = () => {
    setIsAddInventoryModalOpen(false);
    // Will be implemented later
    alert("Scan inventory feature coming soon!");
  };

  const handleAddProductSave = (productData: ProductFormData) => {
    // Handle saving the new product
    console.log("New product:", productData);
    // Here you would typically send the data to your API
    alert("Product added successfully!");
  };

  const handleUploadInventoryFile = (file: File) => {
    // Handle file upload
    console.log("Uploading file:", file.name);
    // Here you would typically send the file to your API
    alert("File uploaded successfully!");
  };

  return (
    <>
      <Header />
      <div className="p-4 sm:p-6 bg-white min-h-screen animate-fadeIn">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 lg:mb-6 space-y-4 lg:space-y-0 animate-slideDown">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0f4d57]">
            Inventory Management
          </h1>{" "}
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <button
              onClick={handleAddInventoryClick}
              className="bg-[#0f4d57] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl shadow-md text-sm sm:text-base hover:bg-[#0d3f47] transition-all duration-300 hover:scale-105 hover:shadow-lg transform"
            >
              + Add Inventory
            </button>
            <button className="bg-red-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl shadow-md text-sm sm:text-base hover:bg-[#0d3f47] transition-all duration-300 hover:scale-105 hover:shadow-lg transform">
              Delete Inventory
            </button>
          </div>
        </div>
        {/* Horizontal line */}
        <hr className="border-gray-300 mb-6 animate-slideIn" />{" "}
        {/* Stats Cards Section */}
        <div className="animate-slideUp">
          <InventoryStats
            totalProducts={inventoryStats.totalProducts}
            totalItems={inventoryStats.totalItems}
            totalValue={inventoryStats.totalValue}
          />
        </div>
        {/* Inventory Controls */}
        <div className="animate-slideUp" style={{ animationDelay: "200ms" }}>
          <InventoryControls
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            groupBy={groupBy}
            onGroupByChange={handleGroupByChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </div>
        {/* Inventory Table/View Container */}
        <div
          className={`border border-gray-300 px-4 sm:px-6 lg:px-10 py-4 sm:py-5 rounded-lg rounded-t-none transition-all duration-300 animate-slideUp ${isPageChanging ? "opacity-75" : "opacity-100"}`}
          style={{ animationDelay: "300ms" }}
        >
          {/* Mobile View */}
          <div className="block md:hidden">
            {/* Mobile View Toggle */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-700">View Mode:</h3>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setMobileViewType("cards")}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    mobileViewType === "cards"
                      ? "bg-white text-[#0f4d57] shadow-sm"
                      : "text-gray-600"
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setMobileViewType("table")}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    mobileViewType === "table"
                      ? "bg-white text-[#0f4d57] shadow-sm"
                      : "text-gray-600"
                  }`}
                >
                  Table
                </button>
              </div>
            </div>

            {mobileViewType === "cards" ? (
              <InventoryMobileView
                products={currentProducts}
                groupedProducts={groupedProducts}
                groupBy={groupBy}
                expandedCategories={expandedCategories}
                onToggleCategory={toggleCategory}
              />
            ) : (
              <div className="overflow-x-auto">
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
            )}
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
        </div>{" "}
        {/* Low Stock Products Section */}
        <LowStockSection
          lowStockProducts={currentLowStockProducts}
          currentPage={lowStockCurrentPage}
          totalPages={totalLowStockPages}
          totalItems={totalLowStockItems}
          startIndex={lowStockStartIndex}
          endIndex={lowStockEndIndex}
          rowsPerPage={lowStockRowsPerPage}
          onPageChange={handleLowStockPageChange}
          onRowsPerPageChange={handleLowStockRowsPerPageChange}
          isPageChanging={isLowStockPageChanging}
        />
      </div>

      {/* Modals */}
      <AddInventoryModal
        isOpen={isAddInventoryModalOpen}
        onClose={() => setIsAddInventoryModalOpen(false)}
        onAddProduct={handleAddProductClick}
        onUploadInventory={handleUploadInventoryClick}
        onScanInventory={handleScanInventoryClick}
      />

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onSave={handleAddProductSave}
      />

      <UploadInventoryModal
        isOpen={isUploadInventoryModalOpen}
        onClose={() => setIsUploadInventoryModalOpen(false)}
        onUpload={handleUploadInventoryFile}
      />
    </>
  );
};

export default Inventory;
