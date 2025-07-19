import { useState, useEffect } from "react";
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
import { useGetCategoriesQuery } from '../../store/slices/categorySlice';

const DeleteInventory: React.FC = () => {
  const currentStore = useRequireStore();

  // Check if store information is available
  const isStoreLoading = !currentStore;

  // Show loading if store information is not available
  if (isStoreLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <span>Loading store information...</span>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // State for main inventory pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [groupBy, setGroupBy] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const { data } = useGetCategoriesQuery();
  const categories = data?.data || [];
  

  // Fixed rows per page for DeleteInventory
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  // --- Custom search state for instant search ---
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

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
      .searchProducts(debouncedSearchTerm, currentStore?.id)
      .then((results) => {
        setSearchResults(results);
        setSearchLoading(false);
      })
      .catch((err) => {
        setSearchError(extractErrorMessage(err));
        setSearchLoading(false);
      });
  }, [debouncedSearchTerm, currentStore?.id]);

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
  const isSearching = searchResults !== null;
  const allProducts = isSearching ? searchResults : products;
  const totalItems = isSearching ? allProducts.length : pagination.total;
  const totalPages = isSearching ? Math.ceil(allProducts.length / rowsPerPage) : pagination.totalPages;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
  const currentProducts = isSearching
    ? allProducts.slice(startIndex, endIndex)
    : products;

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

  const handleGroupByChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    setGroupBy(event.target.value);
    setCurrentPage(1);
    try {
      await fetchWithParams({
        page: 1,
        limit: rowsPerPage,
        search: debouncedSearchTerm,
        sortBy: sortConfig?.key,
        sortOrder: sortConfig?.direction,
        storeId: currentStore?.id,
        categoryId: event.target.value,
      });
    } catch (error) {
      toast.error("Failed to change rows per page");
      console.error("RowsPerPage error:", error);
    }
  };

  const handleRowsPerPageChange = async (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    try {
      await fetchWithParams({
        page: 1,
        limit: newRowsPerPage,
        search: debouncedSearchTerm,
        sortBy: sortConfig?.key,
        sortOrder: sortConfig?.direction,
        storeId: currentStore?.id,
      });
    } catch (error) {
      toast.error("Failed to change rows per page");
      console.error("RowsPerPage error:", error);
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
    // No edit in delete page
  };

  const handleUpdateProduct = async (
    productData: EditProductFormData,
    productId: string
  ) => {
    // No update in delete page
  };

  const handleCloseEditModal = () => {
    setIsEditProductModalOpen(false);
    setSelectedProductToEdit(null);
  };

  // View product handler
  const handleViewProduct = (product: Product) => {
    setSelectedProductToEdit(product);
    setIsEditProductModalOpen(true);
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
            Delete Inventory
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
            categories={categories}  // Pass categories to InventoryControls
          />
        </div>

        {/* Inventory Table/View Container */}
        <div
          className={`border border-gray-300 px-4 sm:px-6 lg:px-10 py-4 sm:py-5 rounded-lg rounded-t-none transition-all duration-300 animate-slideUp ${isPageChanging ? "opacity-75" : "opacity-100"}`}
          style={{ animationDelay: "300ms" }}
        >
          {/* Loading indicator for search and table updates */}
          {(searchLoading || (loading && (products.length > 0 || searchTerm || debouncedSearchTerm))) && (
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
          {/* Error state for search */}
          {searchError && (
            <div className="text-center text-red-500 py-2">{searchError}</div>
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
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${mobileViewType === "cards"
                      ? "bg-white text-[#0f4d57] shadow-sm"
                      : "text-gray-600"
                      }`}
                  >
                    Cards
                  </button>
                  <button
                    onClick={() => setMobileViewType("table")}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${mobileViewType === "table"
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
                  onToggleCategory={() => { }}
                  onProductViewed={handleViewProduct}
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
                    showDeleteButton={true}
                    showEditButton={false}
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
                showDeleteButton={true}
                showEditButton={false}
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

      {/* Modals - Only EditProductModal for view */}
      <EditProductModal
        isOpen={isEditProductModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleUpdateProduct}
        product={selectedProductToEdit}
      />
    </>
  );
};

export default DeleteInventory;
