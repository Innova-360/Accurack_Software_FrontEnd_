import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useProducts } from "../../hooks/useProducts";
import Header from "../../components/Header";
import InventoryControls from "../../components/InventoryComponents/InventoryControls";
import InventoryTable from "../../components/InventoryComponents/InventoryTable";
import InventoryMobileView from "../../components/InventoryComponents/InventoryMobileView";
import Pagination from "../../components/InventoryComponents/Pagination";
import LowStockSection from "../../components/InventoryComponents/LowStockSection";
import { EditProductModal } from "../../components/InventoryComponents";
import { productAPI } from "../../services/productAPI";
import type { Product } from "../../data/inventoryData";
import type { EditProductFormData } from "../../components/InventoryComponents/EditProductModal";
import { useLowStockProducts } from "../../hooks/useInventory";
import { extractErrorMessage } from "../../utils/lastUpdatedUtils";
import useRequireStore from "../../hooks/useRequireStore";

// Utility function for safe product ID extraction
const getProductId = (product: Product): string | null => {
  if (product.id && typeof product.id === "string" && product.id.trim()) {
    return product.id.trim();
  }
  if (product.sku && typeof product.sku === "string" && product.sku.trim()) {
    return product.sku.trim();
  }
  if (product.plu && typeof product.plu === "string" && product.plu.trim()) {
    return product.plu.trim();
  }
  return null;
};

const UpdateProduct: React.FC = () => {
  const navigate = useNavigate();
  const currentStore = useRequireStore();

  // State for main inventory pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [groupBy, setGroupBy] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // Fixed rows per page for UpdateProduct
  const rowsPerPage = 10;

  // Fetch products from API with pagination and filters
  const { products, loading, error, pagination, fetchWithParams, refetch } =
    useProducts({
      page: currentPage,
      limit: rowsPerPage,
      search: searchTerm,
      sortBy: sortConfig?.key,
      sortOrder: sortConfig?.direction,
      storeId: currentStore?.id,
    });

  // State for low stock pagination
  const [lowStockCurrentPage, setLowStockCurrentPage] = useState(1);
  const [lowStockRowsPerPage, setLowStockRowsPerPage] = useState(5);
  const [isPageChanging, setIsPageChanging] = useState(false);
  const [isLowStockPageChanging, setIsLowStockPageChanging] = useState(false);
  const [mobileViewType, setMobileViewType] = useState<"cards" | "table">(
    "cards"
  );

  // Modal states
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [selectedProductToEdit, setSelectedProductToEdit] =
    useState<Product | null>(null);

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
      storeId: currentStore?.id,
    });
    setCurrentPage(1);
  }, [
    debouncedSearchTerm,
    rowsPerPage,
    sortConfig?.key,
    sortConfig?.direction,
    fetchWithParams,
    currentStore?.id,
  ]);

  // Show loading state only for initial load (when we have no products and no search term)
  if (loading && products.length === 0 && !searchTerm && !debouncedSearchTerm) {
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

  // Show error state
  if (error) {
    const errorMessage = extractErrorMessage(error);
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="px-4 py-8 mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Error Loading Products
              </h2>
              <p className="text-gray-600 mb-4">{errorMessage}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-[#0f4d57] text-white px-6 py-2 rounded-lg hover:bg-[#0d3f47] transition-colors"
              >
                Try Again
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

  // Pagination handlers for main inventory - now triggers server-side fetch
  const handlePageChange = async (newPage: number) => {
    if (newPage === currentPage || isPageChanging) return;

    setIsPageChanging(true);
    setCurrentPage(newPage);

    try {
      await fetchWithParams({
        page: newPage,
        limit: rowsPerPage,
        search: debouncedSearchTerm,
        sortBy: sortConfig?.key,
        sortOrder: sortConfig?.direction,
        storeId: currentStore?.id,
      });
    } catch (error) {
      toast.error("Failed to load page");
      console.error("Pagination error:", error);
    } finally {
      // Add delay for smooth transition
      setTimeout(() => {
        setIsPageChanging(false);
      }, 300);
    }
  };

  // Pagination handlers for low stock products
  const handleLowStockPageChange = async (newPage: number) => {
    if (newPage === lowStockCurrentPage || isLowStockPageChanging) return;

    setIsLowStockPageChanging(true);

    // Add a small delay for smooth transition
    await new Promise((resolve) => setTimeout(resolve, 150));

    setLowStockCurrentPage(newPage);
    setIsLowStockPageChanging(false);
  };

  const handleLowStockRowsPerPageChange = (newRowsPerPage: number) => {
    setLowStockRowsPerPage(newRowsPerPage);
    setLowStockCurrentPage(1); // Reset to first page
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleGroupByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setGroupBy(event.target.value);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    // Handle rows per page change if needed
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
  };

  // Checkbox handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
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
  };

  // Edit product handlers
  const handleEditProduct = (product: Product) => {
    const productId = getProductId(product);
    if (!productId) {
      toast.error("Cannot edit product: No valid ID available");
      return;
    }
    navigate(
      `/store/${currentStore?.id}/inventory/product/${productId}/update`
    );
  };

  const handleUpdateProduct = async (
    productData: EditProductFormData,
    productId: string
  ) => {
    try {
      await productAPI.updateProduct(productId, productData as any);
      toast.success("Product updated successfully!");
      setIsEditProductModalOpen(false);
      setSelectedProductToEdit(null);
      refetch(); // Refresh the products list
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      toast.error(`Failed to update product: ${errorMessage}`);
      console.error("Product update error:", error);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditProductModalOpen(false);
    setSelectedProductToEdit(null);
  };

  // View product handler
  const handleViewProduct = (product: Product) => {
    // Handle view product if needed
  };

  // Product deleted handler
  const handleProductDeleted = () => {
    refetch(); // Refresh the product list
  };

  return (
    <>
      <Header />
      <div className="p-4 sm:p-6 bg-white min-h-screen animate-fadeIn">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 lg:mb-6 space-y-4 lg:space-y-0 animate-slideDown">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0f4d57]">
            Update Inventory
          </h1>
        </div>
        {/* Horizontal line */}
        <hr className="border-gray-300 mb-6 animate-slideIn" />

        {/* Inventory Controls */}
        <div className="animate-slideUp" style={{ animationDelay: "200ms" }}>
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
          className={`border border-gray-300 px-4 sm:px-6 lg:px-10 py-4 sm:py-5 rounded-lg rounded-t-none transition-all duration-300 animate-slideUp ${isPageChanging ? "opacity-75" : "opacity-100"}`}
          style={{ animationDelay: "300ms" }}
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
                  groupedProducts={null}
                  groupBy=""
                  expandedCategories={[]}
                  onToggleCategory={() => {}}
                  onProductViewed={handleEditProduct}
                />
              ) : (
                <div className="overflow-x-auto">
                  <InventoryTable
                    products={currentProducts}
                    selectedItems={selectedItems}
                    startIndex={startIndex}
                    sortConfig={sortConfig}
                    onSelectAll={handleSelectAll}
                    onSelectItem={handleSelectItem}
                    onSort={handleSort}
                    onProductDeleted={handleProductDeleted}
                    onProductEdited={handleEditProduct}
                    onProductViewed={handleViewProduct}
                    showDeleteButton={false}
                    showEditButton={true}
                    showUpdateQuantity={true}
                  />
                </div>
              )}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <InventoryTable
                products={currentProducts}
                selectedItems={selectedItems}
                startIndex={startIndex}
                sortConfig={sortConfig}
                onSelectAll={handleSelectAll}
                onSelectItem={handleSelectItem}
                onSort={handleSort}
                onProductDeleted={handleProductDeleted}
                onProductEdited={handleEditProduct}
                onProductViewed={handleViewProduct}
                showDeleteButton={false}
                showEditButton={true}
                showUpdateQuantity={true}
              />
            </div>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={handlePageChange}
          />
        </div>

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

      {/* Modals - Only EditProductModal */}
      <EditProductModal
        isOpen={isEditProductModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleUpdateProduct}
        product={selectedProductToEdit}
      />
    </>
  );
};

export default UpdateProduct;
