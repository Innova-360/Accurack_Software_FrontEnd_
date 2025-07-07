import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useStoreFromUrl } from "../../hooks/useStoreFromUrl";
import { useProducts } from "../../hooks/useProducts";
import Header from "../../components/Header";
import InventoryStats from "../../components/InventoryComponents/InventoryStats";
import InventoryControls from "../../components/InventoryComponents/InventoryControls";
import InventoryTable from "../../components/InventoryComponents/InventoryTable";
import InventoryMobileView from "../../components/InventoryComponents/InventoryMobileView";
import GroupedTableView from "../../components/InventoryComponents/GroupedTableView";
import Pagination from "../../components/InventoryComponents/Pagination";
import LowStockSection from "../../components/InventoryComponents/LowStockSection";
import {
  AddInventoryOptionsModal,
  UploadInventoryModal,
  BarcodeScanModal,
  EditProductModal,
  DeleteAllInventoryModal,
} from "../../components/InventoryComponents";
import { productAPI } from "../../services/productAPI";
import type { Product } from "../../data/inventoryData";
import type { EditProductFormData } from "../../components/InventoryComponents/EditProductModal";
import {
  useInventoryStats,
  useGroupedProducts,
  useLowStockProducts,
} from "../../hooks/useInventory";

// Utility function to extract error messages from API response
const extractErrorMessage = (error: any): string => {
  // Default fallback message
  const defaultMessage = "An unexpected error occurred. Please try again.";

  try {
    // Check if error exists and has response data
    if (!error?.response?.data) {
      return defaultMessage;
    }

    const { data } = error.response;

    // Handle different message formats
    if (data.message) {
      // If message is a string, return it directly
      if (typeof data.message === "string") {
        return data.message;
      }

      // If message is an array, join the messages
      if (Array.isArray(data.message)) {
        return data.message.join(", ");
      }

      // If message is an object, try to extract meaningful text
      if (typeof data.message === "object") {
        // Handle nested validation errors (e.g., { field: ['error1', 'error2'] })
        const errorMessages: string[] = [];
        Object.values(data.message).forEach((value: any) => {
          if (typeof value === "string") {
            errorMessages.push(value);
          } else if (Array.isArray(value)) {
            errorMessages.push(...value);
          }
        });
        return errorMessages.length > 0
          ? errorMessages.join(", ")
          : defaultMessage;
      }
    }

    // Check for other common error fields
    if (data.error) {
      if (typeof data.error === "string") {
        return data.error;
      }
      if (Array.isArray(data.error)) {
        return data.error.join(", ");
      }
    }

    // Check for detail field (common in some APIs)
    if (data.detail && typeof data.detail === "string") {
      return data.detail;
    }

    // If we have any string value in the data object, use it
    const firstStringValue = Object.values(data).find(
      (value) => typeof value === "string"
    );
    if (firstStringValue) {
      return firstStringValue as string;
    }
  } catch (extractionError) {
    console.error("Error extracting error message:", extractionError);
  }

  return defaultMessage;
};

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

  // Fetch products from API with pagination and filters
  const { products, loading, error, pagination, fetchWithParams, refetch } =
    useProducts({
      page: currentPage,
      limit: rowsPerPage,
      search: searchTerm,
      sortBy: sortConfig?.key,
      sortOrder: sortConfig?.direction,
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
  // Modal states
  const [isAddInventoryModalOpen, setIsAddInventoryModalOpen] = useState(false);
  const [isUploadInventoryModalOpen, setIsUploadInventoryModalOpen] =
    useState(false);
  const [isBarcodeScanModalOpen, setIsBarcodeScanModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [selectedProductToEdit, setSelectedProductToEdit] =
    useState<Product | null>(null);
  const [isDeletingAllProducts, setIsDeletingAllProducts] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);

  // Use custom hooks for data processing
  const inventoryStats = useInventoryStats(products, pagination);
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

  // Fetch data when search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) return;

    fetchWithParams({
      page: 1, // Reset to first page on search
      limit: rowsPerPage,
      search: debouncedSearchTerm,
      sortBy: sortConfig?.key,
      sortOrder: sortConfig?.direction,
    });
    setCurrentPage(1);
  }, [
    debouncedSearchTerm,
    rowsPerPage,
    sortConfig?.key,
    sortConfig?.direction,
    fetchWithParams,
  ]);

  // Show loading state only for initial load (when we have no products and no search term)
  if (loading && products.length === 0 && !searchTerm && !debouncedSearchTerm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="px-4 py-8 mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="rounded-full h-12 w-12 border-b-2 border-[#0f4d57] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    const errorMessage = extractErrorMessage(error);
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
                className="bg-[#0f4d57] hover:bg-[#083540] text-white px-4 py-2 rounded-lg"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Server-side pagination - use pagination data from API
  const totalItems = pagination.total;
  const totalPages = pagination.totalPages;
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = Math.min(startIndex + pagination.limit, totalItems);
  const currentProducts = products; // All products returned from API for current page

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
  // Pagination handlers for main inventory - now triggers server-side fetch
  const handlePageChange = async (newPage: number) => {
    if (newPage === currentPage || isPageChanging) return;

    setIsPageChanging(true);
    setCurrentPage(newPage);

    try {
      await fetchWithParams({
        page: newPage,
        limit: rowsPerPage,
        search: searchTerm,
        sortBy: sortConfig?.key,
        sortOrder: sortConfig?.direction,
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
        search: searchTerm,
        sortBy: sortConfig?.key,
        sortOrder: sortConfig?.direction,
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
      // Use product IDs instead of array indices for server-side pagination
      const allIds = currentProducts.map((_, index: number) => index);
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
  }; // Modal handlers
  const handleAddInventoryClick = () => {
    setIsAddInventoryModalOpen(true);
  };

  const handleUploadInventory = () => {
    setIsAddInventoryModalOpen(false);
    setIsUploadInventoryModalOpen(true);
  };

  const handleCreateInventory = () => {
    setIsAddInventoryModalOpen(false);
    // Navigate to create inventory page
    const currentPath = window.location.pathname;
    if (currentPath.includes("/store/")) {
      // Extract store ID from path
      const storeId = currentPath.split("/store/")[1].split("/")[0];
      navigate(`/store/${storeId}/inventory/create`);
    } else {
      navigate("/inventory/create");
    }
  };

  const handleScanInventory = () => {
    setIsAddInventoryModalOpen(false);
    setIsBarcodeScanModalOpen(true);
  };
  const handleBarcodeScanned = (barcode: string) => {
    setIsBarcodeScanModalOpen(false);
    const currentPath = window.location.pathname;
    if (currentPath.includes("/store/")) {
      // Extract store ID from path
      const storeId = currentPath.split("/store/")[1].split("/")[0];
      navigate(`/store/${storeId}/inventory/create`, {
        state: { scannedPLU: barcode },
      });
    } else {
      navigate("/inventory/create", { state: { scannedPLU: barcode } });
    }
  };

  // Edit product handlers
  const handleEditProduct = (product: Product) => {
    setSelectedProductToEdit(product);
    setIsEditProductModalOpen(true);
  };

  const handleUpdateProduct = async (
    productData: EditProductFormData,
    productId: string
  ) => {
    try {
      await productAPI.updateProduct(productId, productData as any);
      toast.success("Product updated successfully!");
      refetch(); // Refresh the product list
      setIsEditProductModalOpen(false);
      setSelectedProductToEdit(null);
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Failed to update product:", error);
      toast.error(errorMessage);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditProductModalOpen(false);
    setSelectedProductToEdit(null);
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

  // Delete all inventory handler
  const handleDeleteAllInventory = async () => {
    if (!storeId) {
      toast.error("Store ID not found. Cannot delete inventory.");
      return;
    }

    if (products.length === 0) {
      toast("No products to delete.", { icon: "ℹ️" });
      return;
    }

    // Open the custom confirmation modal
    setIsDeleteAllModalOpen(true);
  };

  // Confirm delete all inventory
  const confirmDeleteAllInventory = async () => {
    if (!storeId) {
      toast.error("Store ID not found. Cannot delete inventory.");
      setIsDeleteAllModalOpen(false);
      return;
    }

    try {
      setIsDeletingAllProducts(true);
      await productAPI.deleteAllProducts(storeId);
      toast.success("All inventory items have been successfully deleted!");
      refetch(); // Refresh the product list
      setIsDeleteAllModalOpen(false);
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Failed to delete all inventory:", error);
      toast.error(`Failed to delete inventory: ${errorMessage}`);
    } finally {
      setIsDeletingAllProducts(false);
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
          </h1>{" "}
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <button
              onClick={handleAddInventoryClick}
              className="bg-[#0f4d57] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl shadow-md text-sm sm:text-base hover:bg-[#0d3f47]"
            >
              + Add Inventory
            </button>
            <button
              onClick={handleDeleteAllInventory}
              disabled={isDeletingAllProducts || products.length === 0}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl shadow-md text-sm sm:text-base ${
                isDeletingAllProducts || products.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-700 hover:bg-red-800 text-white"
              }`}
            >
              {isDeletingAllProducts ? (
                <>
                  <div className="inline-block rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                "Delete Inventory"
              )}
            </button>
          </div>
        </div>
        {/* Horizontal line */}
        <hr className="border-gray-300 mb-6" /> {/* Stats Cards Section */}
        <div>
          <InventoryStats
            totalProducts={inventoryStats.totalProducts}
            totalItems={inventoryStats.totalItems}
            totalValue={inventoryStats.totalValue}
          />
        </div>
        {/* Inventory Controls */}
        <div>
          <InventoryControls
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            groupBy={groupBy}
            onGroupByChange={handleGroupByChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            isSearching={
              loading &&
              (searchTerm !== debouncedSearchTerm ||
                Boolean(debouncedSearchTerm))
            }
          />
        </div>
        {/* Inventory Table/View Container */}
        <div
          className={`border border-gray-300 px-4 sm:px-6 lg:px-10 py-4 sm:py-5 rounded-lg rounded-t-none ${isPageChanging ? "opacity-75" : "opacity-100"}`}
        >
          {/* Loading indicator for search and table updates */}
          {loading &&
            (products.length > 0 || searchTerm || debouncedSearchTerm) && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="inline-block rounded-full h-8 w-8 border-b-2 border-[#0f4d57] animate-spin mb-2"></div>
                  <p className="text-gray-600 text-sm">
                    {searchTerm || debouncedSearchTerm
                      ? "Searching products..."
                      : "Loading..."}
                  </p>
                </div>
              </div>
            )}

          {/* Content - Show even when loading for search to prevent flicker */}
          <div
            className={
              loading && (searchTerm || debouncedSearchTerm)
                ? "opacity-50"
                : "opacity-100"
            }
          >
            {/* Mobile View */}
            <div className="block md:hidden">
              {/* Mobile View Toggle */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-700">
                  View Mode:
                </h3>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setMobileViewType("cards")}
                    className={`px-3 py-1 text-xs rounded-md ${
                      mobileViewType === "cards"
                        ? "bg-white text-[#0f4d57] shadow-sm"
                        : "text-gray-600"
                    }`}
                  >
                    Cards
                  </button>
                  <button
                    onClick={() => setMobileViewType("table")}
                    className={`px-3 py-1 text-xs rounded-md ${
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
                      products={currentProducts}
                      selectedItems={selectedItems}
                      startIndex={startIndex}
                      onProductDeleted={refetch}
                      sortConfig={sortConfig}
                      onSelectAll={handleSelectAll}
                      onSelectItem={handleSelectItem}
                      onSort={handleSort}
                      onProductEdited={handleEditProduct}
                      onProductViewed={handleViewProduct}
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
                  products={currentProducts}
                  selectedItems={selectedItems}
                  onProductDeleted={refetch}
                  startIndex={startIndex}
                  sortConfig={sortConfig}
                  onSelectAll={handleSelectAll}
                  onSelectItem={handleSelectItem}
                  onSort={handleSort}
                  onProductEdited={handleEditProduct}
                  onProductViewed={handleViewProduct}
                />
              )}
            </div>
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
      <AddInventoryOptionsModal
        isOpen={isAddInventoryModalOpen}
        onClose={() => setIsAddInventoryModalOpen(false)}
        onUploadInventory={handleUploadInventory}
        onCreateInventory={handleCreateInventory}
        onScanInventory={handleScanInventory}
      />
      <UploadInventoryModal
        isOpen={isUploadInventoryModalOpen}
        onClose={() => setIsUploadInventoryModalOpen(false)}
        onUploadSuccess={refetch}
      />{" "}
      <BarcodeScanModal
        isOpen={isBarcodeScanModalOpen}
        onClose={() => setIsBarcodeScanModalOpen(false)}
        onBarcodeScanned={handleBarcodeScanned}
      />
      <EditProductModal
        isOpen={isEditProductModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleUpdateProduct}
        product={selectedProductToEdit}
      />
      <DeleteAllInventoryModal
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        onConfirm={confirmDeleteAllInventory}
        productCount={products.length}
        isDeleting={isDeletingAllProducts}
      />
    </>
  );
};

export default Inventory;
