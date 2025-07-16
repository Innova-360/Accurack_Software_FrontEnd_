import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useStoreFromUrl } from "../../hooks/useStoreFromUrl";
import { useProducts } from "../../hooks/useProducts";
import Header from "../../components/Header";
import InventoryControls from "../../components/InventoryComponents/InventoryControls";
import InventoryTable from "../../components/InventoryComponents/InventoryTable";
import InventoryMobileView from "../../components/InventoryComponents/InventoryMobileView";
import GroupedTableView from "../../components/InventoryComponents/GroupedTableView";
import Pagination from "../../components/InventoryComponents/Pagination";
import LowStockSection from "../../components/InventoryComponents/LowStockSection";

import { productAPI } from "../../services/productAPI";
import type { Product } from "../../data/inventoryData";
import {
  useGroupedProducts,
  useLowStockProducts,
} from "../../hooks/useInventory";
import { extractErrorMessage } from "../../utils/lastUpdatedUtils";

const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const { storeId } = useStoreFromUrl(); // Handle store selection from URL

  // State for main inventory pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // --- Custom search state ---
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Fetch products from API with pagination and filters
  const { products, loading, error, pagination, fetchWithParams, refetch } =
    useProducts({
      page: currentPage,
      limit: rowsPerPage,
      search: "", // Remove searchTerm to prevent page reload on search
      sortBy: sortConfig?.key,
      sortOrder: sortConfig?.direction,
      storeId: storeId,
    });
  const [groupBy, setGroupBy] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // State for low stock pagination
  const [lowStockCurrentPage, setLowStockCurrentPage] = useState(1);
  const [lowStockRowsPerPage, setLowStockRowsPerPage] = useState(5);
  const [isPageChanging, setIsPageChanging] = useState(false);
  const [isLowStockPageChanging, setIsLowStockPageChanging] = useState(false);
  const [mobileViewType, setMobileViewType] = useState<"cards" | "table">(
    "cards"
  );

  // Server-side pagination - use products directly from API
  const groupedProducts = useGroupedProducts(products, groupBy);
  const lowStockProducts = useLowStockProducts(products);

  // Debounced search state
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- Search API integration ---
  useEffect(() => {
    if (!debouncedSearchTerm) {
      setSearchResults(null);
      setSearchLoading(false);
      setSearchError(null);
      return;
    }
    setSearchLoading(true);
    setSearchError(null);
    productAPI
      .searchProducts(debouncedSearchTerm, storeId)
      .then((results) => {
        setSearchResults(results);
        setSearchLoading(false);
      })
      .catch((err) => {
        setSearchError(extractErrorMessage(err));
        setSearchLoading(false);
      });
  }, [debouncedSearchTerm]);

  // Show loading state only for initial load (when we have no products and no search term)
  const isInitialLoading =
    loading && products.length === 0 && !searchTerm && !debouncedSearchTerm;

  // Show error state only for initial load
  const isInitialError = (error && !searchTerm) || searchError;

  const isSearching = searchResults !== null;
  const allProducts = isSearching ? searchResults : products;

  // Pagination logic for both normal and search results
  const paginatedProducts = isSearching
    ? allProducts.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
      )
    : allProducts;

  const totalItems = isSearching ? allProducts.length : pagination.total;
  const totalPages = isSearching
    ? Math.ceil(allProducts.length / rowsPerPage)
    : pagination.totalPages;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="px-4 py-8 mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f4d57] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state only for initial load
  if (isInitialError) {
    const errorMessage = extractErrorMessage(error || searchError);
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="px-4 py-8 mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">
                Error loading products: {errorMessage}
              </p>
              <button
                onClick={refetch}
                className="bg-[#0f4d57] hover:bg-[#083540] text-white px-4 py-2 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate pagination for low stock products (client-side for now)
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
    setCurrentPage(newPage);

    // For search results, pagination is handled client-side
    if (isSearching) {
      setTimeout(() => setIsPageChanging(false), 300);
      return;
    }

    // For normal pagination, fetch from server
    try {
      await fetchWithParams({
        page: newPage,
        limit: rowsPerPage,
        search: "", // Don't include searchTerm for normal pagination
        sortBy: sortConfig?.key,
        sortOrder: sortConfig?.direction,
        storeId: storeId,
      });
    } catch (error) {
      console.error("Error fetching page:", error);
    } finally {
      setTimeout(() => setIsPageChanging(false), 300);
    }
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
  const handleRowsPerPageChange = async (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page when changing rows per page

    try {
      await fetchWithParams({
        page: 1,
        limit: newRowsPerPage,
        search: "", // Don't include searchTerm for normal pagination
        sortBy: sortConfig?.key,
        sortOrder: sortConfig?.direction,
        storeId: storeId,
      });
    } catch (error) {
      console.error("Error changing rows per page:", error);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
    // Search will be triggered by the useEffect with debounced search term
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
  // Server-side sorting function
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
    setCurrentPage(1); // Reset to first page when sorting
    // Sorting will be triggered by the useEffect
  };

  // Checkbox handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = paginatedProducts.map((_, index: number) => index);
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (index: number, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, index]);
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== index));
    }
  };

  // Edit product handlers
  const handleEditProduct = (product: Product) => {
    const currentPath = window.location.pathname;
    const productId = product.id || product.sku || product.plu;

    if (!productId) {
      toast.error("Cannot edit product: No ID available");
      return;
    }

    if (currentPath.includes("/store/")) {
      // Extract store ID from path
      const storeId = currentPath.split("/store/")[1].split("/")[0];
      navigate(`/store/${storeId}/inventory/product/${productId}/update`);
    } else {
      navigate(`/inventory/product/${productId}/update`);
    }
  };

  // View product handler
  const handleViewProduct = (product: Product) => {
    const currentPath = window.location.pathname;
    const productId = product.id || product.sku || product.plu;

    if (!productId) {
      toast.error("Cannot view product: No ID available");
      return;
    }

    if (currentPath.includes("/store/")) {
      // Extract store ID from path
      const storeId = currentPath.split("/store/")[1].split("/")[0];
      navigate(`/store/${storeId}/inventory/product/${productId}`);
    } else {
      navigate(`/inventory/product/${productId}`);
    }
  };

  return (
    <>
      <Header />
      <div className="p-4 sm:p-6 bg-white min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 lg:mb-6 space-y-4 lg:space-y-0">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0f4d57]">
            View Inventory
          </h1>
        </div>
        {/* Horizontal line */}
        <hr className="border-gray-300 mb-6" />
        {/* Stats Cards Section */}
        {/* Inventory Controls */}
        <div>
          <InventoryControls
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            groupBy={groupBy}
            onGroupByChange={handleGroupByChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            isSearching={isSearching}
          />
        </div>
        {/* Inventory Table/View Container */}
        <div
          className={`border border-gray-300 px-4 sm:px-6 lg:px-10 py-4 sm:py-5 rounded-lg rounded-t-none relative ${isPageChanging ? "opacity-75" : "opacity-100"}`}
        >
          {/* Loading overlay for search/pagination */}
          {(loading || searchLoading) && !isInitialLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f4d57] mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">
                  {searchLoading ? "Searching..." : "Loading..."}
                </p>
              </div>
            </div>
          )}
          {/* Error overlay for search */}
          {searchError && !isInitialError && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-lg">
              <div className="text-center">
                <div className="text-red-500 mb-2">
                  <svg
                    className="w-8 h-8 mx-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm mb-2">
                  Search Error: {searchError}
                </p>
                <button
                  onClick={() => setSearchError(null)}
                  className="text-[#0f4d57] hover:underline text-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
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
                products={paginatedProducts}
                groupedProducts={groupedProducts}
                groupBy={groupBy}
                expandedCategories={expandedCategories}
                onToggleCategory={toggleCategory}
                onProductViewed={handleViewProduct}
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
                    products={paginatedProducts}
                    selectedItems={selectedItems}
                    startIndex={startIndex}
                    onProductDeleted={refetch}
                    sortConfig={sortConfig}
                    onSelectAll={handleSelectAll}
                    onSelectItem={handleSelectItem}
                    onSort={handleSort}
                    onProductEdited={handleEditProduct}
                    onProductViewed={handleViewProduct}
                    showDeleteButton={false}
                    showEditButton={false}
                  />
                )}
              </div>
            )}
          </div>{" "}
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
                products={paginatedProducts}
                selectedItems={selectedItems}
                startIndex={startIndex}
                sortConfig={sortConfig}
                onSelectAll={handleSelectAll}
                onSelectItem={handleSelectItem}
                onSort={handleSort}
                onProductViewed={handleViewProduct}
                showActions={false}
                showDeleteButton={false}
                showEditButton={false}
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
    </>
  );
};

export default Inventory;
