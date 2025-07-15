import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheck,
  FaSearch,
  FaFilter,
  FaTimes,
} from "react-icons/fa";
import { useAppSelector } from "../../store/hooks";
import apiClient from "../../services/api";
import { productAPI, type PaginationParams } from "../../services/productAPI";
import Pagination from "../../components/InventoryComponents/Pagination";

import toast from "react-hot-toast";

interface CategoryObj {
  id: string;
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Product {
  id: string;
  name: string;
  category: string | CategoryObj;
  sku?: string;
  msrpPrice: number;
  singleItemSellingPrice: number;
  itemQuantity: number;
}

interface ProductAssignment {
  productId: string;
  costPrice: number;
  state: "primary" | "secondary";
}

// Utility function to validate if a string is a valid UUID
const isValidUUID = (str: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

const AssignProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: storeId, supplierId } = useParams();
  const location = useLocation();
  const { currentStore } = useAppSelector((state) => state.stores);

  const supplierInfo = location.state?.supplier;
  const [fetchedSupplier, setFetchedSupplier] = useState<any>(null);
  const [fetchingSupplier, setFetchingSupplier] = useState(false);

  useEffect(() => {
    const fetchSupplierInfo = async () => {
      if (!supplierInfo && supplierId) {
        try {
          setFetchingSupplier(true);

          // Try to find supplier by ID or supplier_id
          let response;

          // First try direct API
          try {
            response = await apiClient.get(`/supplier/${supplierId}`, {
              params: { storeId: currentStore?.id || storeId },
            });
          } catch (error) {

            const listResponse = await apiClient.get("/supplier/list", {
              params: { storeId: currentStore?.id || storeId },
            });

            // Find supplier by ID or supplier_id in the list
            const suppliers =
              listResponse.data?.data?.suppliers ||
              listResponse.data?.data ||
              [];
            const foundSupplier = suppliers.find(
              (s: any) =>
                s.id === supplierId ||
                s.supplier_id === supplierId ||
                s.name?.toLowerCase().replace(/\s+/g, "-") === supplierId
            );

            if (foundSupplier) {
              response = { data: { data: foundSupplier } };
            } else {
              throw new Error("Supplier not found in list");
            }
          }

          setFetchedSupplier(response.data?.data);
        } catch (error) {
          console.error("Error fetching supplier:", error);
          toast.error("Failed to load vendor information");
        } finally {
          setFetchingSupplier(false);
        }
      }
    };

    fetchSupplierInfo();
  }, [supplierInfo, supplierId, currentStore?.id, storeId]);

  const currentSupplier = supplierInfo || fetchedSupplier;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [costPrices, setCostPrices] = useState<Record<string, number>>({});
  const [categories, setCategories] = useState<
    Record<string, "primary" | "secondary">
  >({});
  const [assigning, setAssigning] = useState(false);

  // Track products that already have primary suppliers
  const [productsWithPrimarySupplier, setProductsWithPrimarySupplier] =
    useState<Set<string>>(new Set());

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 1000,
  });
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [isPageChanging, setIsPageChanging] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  // const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Fetch all product assignments to check which products have primary suppliers
  const fetchProductAssignments = async () => {
    try {
      const finalStoreId = currentStore?.id || storeId;

      const suppliersResponse = await apiClient.get("/supplier/list", {
        params: { storeId: finalStoreId },
      });

      const suppliers =
        suppliersResponse.data?.data?.suppliers ||
        suppliersResponse.data?.data ||
        [];
      const primaryProductIds = new Set<string>();
      const currentSupplierId =
        currentSupplier?.id || currentSupplier?.supplier_id || supplierId;

      // For each supplier, get their assigned products
      for (const supplier of suppliers) {
        try {
          const supplierIdToCheck = supplier.id || supplier.supplier_id;

          const supplierProductsResponse = await apiClient.get(
            `/supplier/${supplierIdToCheck}/products`
          );

          if (
            supplierProductsResponse.data?.success &&
            supplierProductsResponse.data?.data?.data
          ) {
            const assignments = supplierProductsResponse.data.data.data;

            // Check for primary assignments
            assignments.forEach((assignment: any) => {
              if (assignment.state === "primary" && assignment.productId) {
                if (supplierIdToCheck !== currentSupplierId) {
                  primaryProductIds.add(assignment.productId);
                }
              }
            });
          }
        } catch (error) {
          console.error(
            `Error fetching products for supplier ${supplier.id}:`,
            error
          );
        }
      }

      setProductsWithPrimarySupplier(primaryProductIds);
    } catch (error) {
      console.error("Error fetching product assignments:", error);
    }
  };

  // Fetch products from inventory with pagination
  const fetchProducts = async (page: number = currentPage) => {
    try {
      setLoading(false);
      const finalStoreId = currentStore?.id || storeId;

      const params: PaginationParams = {
        page,
        limit: rowsPerPage,
        storeId: finalStoreId,
      };

      // Add search parameter if provided
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      // Add category filter if provided
      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }

      const response = await productAPI.getProducts(params);
      
      setProducts(response.products);
      setTotalItems(response.pagination.total);
      setTotalPages(response.pagination.totalPages);

      // Fetch categories for filter (only on first load)
      if (page === 1 && availableCategories.length === 0) {
        await fetchCategories();
      }

      // Fetch product assignments to check which products have primary suppliers
      await fetchProductAssignments();
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for filter dropdown
  const fetchCategories = async () => {
    try {
      const finalStoreId = currentStore?.id || storeId;
      const response = await productAPI.getProducts({
        page: 1,
        limit: 1000, // Get more products to extract categories
        storeId: finalStoreId,
      });
      
      const uniqueCategories = [
        ...new Set(
          response.products.map((product: Product) => {
            if (
              typeof product.category === "object" &&
              product.category !== null
            ) {
              return (
                product.category.name ||
                product.category.code ||
                "Uncategorized"
              );
            }
            return product.category || "Uncategorized";
          })
        ),
      ].filter((category): category is string => typeof category === "string");
      setAvailableCategories(uniqueCategories);

      // Set price range based on actual product prices
      const prices = response.products
        .map((p: Product) => p.singleItemSellingPrice)
        .filter((price) => price != null && !isNaN(price));
      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        setPriceRange({ min: Math.floor(minPrice), max: Math.ceil(maxPrice) });
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    if (currentStore?.id || storeId) {
      fetchProducts(1);
    }
  }, [currentStore?.id, storeId]);

  // Search functionality with debounce - now triggers backend API call
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching/filtering
      fetchProducts(1);
    }, 100); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory]);

  // Handle price range filter separately (client-side for now)
  useEffect(() => {
    if (products.length > 0) {
      const filtered = products.filter((product) => {
        const price = product.singleItemSellingPrice || 0;
        return price >= priceRange.min && price <= priceRange.max;
      });
      // Note: This is still client-side filtering for price range
      // You may want to implement this on backend as well
    }
  }, [priceRange]);

  // Handle page change
  const handlePageChange = async (newPage: number) => {
    if (newPage === currentPage || isPageChanging) return;

    setIsPageChanging(true);
    setCurrentPage(newPage);

    // Fetch products for the new page
    await fetchProducts(newPage);

    // Reset animation state
    setTimeout(() => setIsPageChanging(false), 100);
  };

  // Calculate pagination info for display
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);

  // Products are already paginated from backend
  const filteredProducts = products;

  const handleProductSelect = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
      const newCostPrices = { ...costPrices };
      const newCategories = { ...categories };
      delete newCostPrices[productId];
      delete newCategories[productId];
      setCostPrices(newCostPrices);
      setCategories(newCategories);
    } else {
      newSelected.add(productId);

      const hasPrimary = productsWithPrimarySupplier.has(productId);
      const defaultCategory = hasPrimary ? "secondary" : "primary";

      setCategories((prev) => ({ ...prev, [productId]: defaultCategory }));
    }
    setSelectedProducts(newSelected);
  };

  const handleCostPriceChange = (productId: string, price: number) => {
    setCostPrices((prev) => ({
      ...prev,
      [productId]: price,
    }));
  };

  const handleCategoryChange = (
    productId: string,
    category: "primary" | "secondary"
  ) => {
    setCategories((prev) => ({
      ...prev,
      [productId]: category,
    }));
  };

  const handleAssignProducts = async () => {
    if (selectedProducts.size === 0) {
      toast.error("Please select at least one product");
      return;
    }

    // Validate all selected products have cost prices
    const missingPrices = Array.from(selectedProducts).filter(
      (id) => !costPrices[id] || costPrices[id] <= 0
    );
    if (missingPrices.length > 0) {
      toast.error("Please enter valid cost prices for all selected products");
      return;
    }

    try {
      setAssigning(true);

      const assignments: ProductAssignment[] = Array.from(selectedProducts).map(
        (productId) => ({
          productId,
          costPrice: costPrices[productId],
          state: categories[productId] || "secondary",
        })
      );

      // API call to assign products to supplier
      await apiClient.post("/product/assign-supplier", {
        supplierId:
          currentSupplier?.supplier_id || currentSupplier?.id || supplierId,
        storeId: currentStore?.id || storeId,
        products: assignments,
      });

      toast.success(
        `Successfully assigned ${assignments.length} products to supplier`
      );
      navigate(`/store/${storeId}/supplier`);
    } catch (error: any) {
      console.error("Error assigning products:", error);
      toast.error(error.response?.data?.message || "Failed to assign products");
    } finally {
      setAssigning(false);
    }
  };

  // Check if URL has supplier name instead of ID and redirect if needed
  useEffect(() => {
    const checkAndRedirectIfNeeded = async () => {
      if (supplierId && !isValidUUID(supplierId) && !supplierInfo) {
        try {
          // Fetch all suppliers to find the one with matching name
          const listResponse = await apiClient.get("/supplier/list", {
            params: { storeId: currentStore?.id || storeId },
          });

          const suppliers =
            listResponse.data?.data?.suppliers || listResponse.data?.data || [];

          // Find supplier by name (case insensitive)
          const foundSupplier = suppliers.find(
            (s: any) =>
              s.name?.toLowerCase().replace(/\s+/g, "") ===
                supplierId?.toLowerCase().replace(/\s+/g, "") ||
              s.name?.toLowerCase().replace(/\s+/g, "-") ===
                supplierId?.toLowerCase() ||
              s.supplier_id === supplierId
          );

          if (
            foundSupplier &&
            (foundSupplier.id || foundSupplier.supplier_id)
          ) {
            const correctId = foundSupplier.id || foundSupplier.supplier_id;

            // Redirect to correct URL with UUID
            navigate(
              `/store/${storeId}/supplier/${correctId}/assign-products`,
              {
                state: { supplier: foundSupplier },
                replace: true, // Replace current history entry
              }
            );
            return;
          }
        } catch (error) {
          console.error("Error finding supplier by name:", error);
        }
      }
    };

    checkAndRedirectIfNeeded();
  }, [supplierId, currentStore?.id, storeId, supplierInfo, navigate]);

  if (!currentSupplier && !fetchingSupplier && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="p-8 bg-gradient-to-br from-red-50 to-red-100 rounded-3xl w-32 h-32 flex items-center justify-center mx-auto mb-8 shadow-lg">
            <span className="text-red-600 text-4xl">⚠</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Vendor Not Found
          </h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            The vendor information could not be loaded. Please try again or
            contact support if the issue persists.
          </p>
          <button
            onClick={() => navigate(`/store/${storeId}/supplier`)}
            className="bg-gradient-to-r from-[#03414C] to-[#025a6b] text-white px-8 py-4 rounded-xl hover:from-[#025a6b] hover:to-[#03414C] transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
          >
            Back to Suppliers
          </button>
        </div>
      </div>
    );
  }

  if (loading || fetchingSupplier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-[#03414C] mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-r-[#025a6b] mx-auto animate-pulse"></div>
          </div>
          <p className="mt-6 text-gray-600 text-lg font-medium">
            {fetchingSupplier
              ? "Loading vendor information..."
              : "Loading products..."}
          </p>
          <div className="mt-4 flex justify-center gap-1">
            {/* <div className="w-2 h-2 bg-[#03414C] rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-[#03414C] rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div> */}
            {/* <div
              className="w-2 h-2 bg-[#03414C] rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div> */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between py-4 lg:py-6 gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(`/store/${storeId}/supplier`)}
                  className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md"
                >
                  <FaArrowLeft className="text-gray-600" size={20} />
                </button>
                <div>
                  <h1 className="text-2xl lg:text-2xl font-bold text-gray-900 mb-1">
                    Assign Products to Vendor
                  </h1>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-sm lg:text-base text-gray-600 font-medium">
                      {currentSupplier?.name ||
                        (fetchingSupplier
                          ? "Loading supplier..."
                          : "Unknown Supplier")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-lg border border-blue-200">
                  <span className="text-sm font-semibold text-blue-700">
                    {selectedProducts.size} products selected
                  </span>
                </div>
                <button
                  onClick={handleAssignProducts}
                  disabled={selectedProducts.size === 0 || assigning}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#03414C] to-[#025a6b] text-white px-6 py-3 rounded-xl hover:from-[#025a6b] hover:to-[#03414C] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <FaCheck size={16} />
                  {assigning ? "Assigning..." : "Assign Products"}
                </button>
              </div>
            </div>
          </div>
        </div>
        {selectedProducts.size > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[#45814798] rounded-lg flex items-center justify-center">
                  <FaCheck className="text-white" size={16} />
                </div>
                <h3 className="text-2xl lg:text-2xl font-bold text-gray-900">
                  Assignment Summary
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-200">
                  <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
                    {selectedProducts.size}
                  </div>
                  <div className="text-sm lg:text-base font-semibold text-blue-700">
                    Products Selected
                  </div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-200">
                  <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">
                    $
                    {Object.values(costPrices)
                      .reduce((sum, price) => sum + (price || 0), 0)
                      .toFixed(2)}
                  </div>
                  <div className="text-sm lg:text-base font-semibold text-green-700">
                    Total Cost Value
                  </div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-200">
                  <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-2">
                    {
                      Object.keys(costPrices).filter((id) => costPrices[id] > 0)
                        .length
                    }
                  </div>
                  <div className="text-sm lg:text-base font-semibold text-purple-700">
                    Ready to Assign
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Product Search & Filter
                  </h3>
                  <p className="text-sm text-gray-600">
                    Find and select products to assign to this supplier
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      Showing {totalItems === 0 ? 0 : startIndex + 1} to{" "}
                      {Math.min(endIndex, totalItems)} of {totalItems} products
                    </span>
                    {totalPages > 1 && (
                      <span>
                        • Page {currentPage} of {totalPages}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-80">
                    <FaSearch
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Search by name, category, or SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent transition-all duration-200 text-sm lg:text-base"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 ${
                      showFilters
                        ? "bg-[#03414C] text-white border-[#03414C]"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <FaFilter size={16} />
                    <span>Filters</span>
                  </button>
                </div>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Filter by Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent transition-all duration-200"
                      >
                        <option value="all">All Categories</option>
                        {availableCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price Range Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Price Range: ${priceRange.min} - ${priceRange.max}
                      </label>
                      <div className="flex gap-3 items-center">
                        <div className="flex-1">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Min Price"
                            value={priceRange.min}
                            onChange={(e) =>
                              setPriceRange((prev) => ({
                                ...prev,
                                min: parseFloat(e.target.value) || 0,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent text-sm"
                          />
                        </div>
                        <span className="text-gray-500">to</span>
                        <div className="flex-1">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Max Price"
                            value={priceRange.max}
                            onChange={(e) =>
                              setPriceRange((prev) => ({
                                ...prev,
                                max: parseFloat(e.target.value) || 1000,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedCategory("all");
                        // Reset price range to default values
                        setPriceRange({ min: 0, max: 1000 });
                        setSearchTerm("");
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
                    >
                      <FaTimes size={14} />
                      Clear All Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-[#03414C] to-[#025a6b] p-6">
              <h2 className="text-xl lg:text-2xl font-bold text-white">
                Available Products
              </h2>
              <p className="text-blue-100 mt-1">
                Select products and set their cost prices for this supplier
              </p>
            </div>

            {/* Mobile Cards View */}
            <div className="block lg:hidden">
              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <FaSearch className="text-gray-400" size={24} />
                  </div>
                  <p className="text-gray-500 text-lg">
                    {searchTerm
                      ? "No products found matching your search"
                      : "No products available"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedProducts.has(product.id)}
                            onChange={() => handleProductSelect(product.id)}
                            className="h-5 w-5 text-[#03414C] focus:ring-[#03414C] border-gray-300 rounded"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              SKU: {product.sku || "N/A"}
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {typeof product.category === "object" &&
                          product.category !== null
                            ? product.category.name ||
                              product.category.code ||
                              JSON.stringify(product.category)
                            : product.category}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Selling Price
                          </label>
                          <p className="text-lg font-semibold text-gray-900">
                            ${(product.singleItemSellingPrice || 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stock
                          </label>
                          <p className="text-lg font-semibold text-gray-900">
                            {product.itemQuantity}
                          </p>
                        </div>
                      </div>

                      {selectedProducts.has(product.id) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Cost Price *
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Enter cost price"
                              value={costPrices[product.id] || ""}
                              onChange={(e) =>
                                handleCostPriceChange(
                                  product.id,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Category
                            </label>
                            <select
                              value={categories[product.id] || "secondary"}
                              onChange={(e) =>
                                handleCategoryChange(
                                  product.id,
                                  e.target.value as "primary" | "secondary"
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                            >
                              <option value="secondary">Secondary</option>
                              <option
                                value="primary"
                                disabled={productsWithPrimarySupplier.has(
                                  product.id
                                )}
                              >
                                Primary{" "}
                                {productsWithPrimarySupplier.has(product.id)
                                  ? "(Already Assigned)"
                                  : ""}
                              </option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Select
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Product Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Pricing & Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Cost Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Assignment Type
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                          <FaSearch className="text-gray-400" size={24} />
                        </div>
                        <p className="text-gray-500 text-lg">
                          {searchTerm
                            ? "No products found matching your search"
                            : "No products available"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-6 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedProducts.has(product.id)}
                            onChange={() => handleProductSelect(product.id)}
                            className="h-5 w-5 text-[#03414C] focus:ring-[#03414C] border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div>
                            <div className="text-base font-semibold text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              SKU: {product.sku || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {typeof product.category === "object" &&
                            product.category !== null
                              ? product.category.name ||
                                product.category.code ||
                                JSON.stringify(product.category)
                              : product.category}
                          </span>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div>
                            <div className="text-base font-semibold text-gray-900">
                              ${(product.singleItemSellingPrice || 0).toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Stock: {product.itemQuantity}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          {selectedProducts.has(product.id) ? (
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Enter cost price"
                              value={costPrices[product.id] || ""}
                              onChange={(e) =>
                                handleCostPriceChange(
                                  product.id,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-36 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                            />
                          ) : (
                            <span className="text-gray-400 text-sm font-medium">
                              Select product first
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          {selectedProducts.has(product.id) ? (
                            <select
                              value={categories[product.id] || "secondary"}
                              onChange={(e) =>
                                handleCategoryChange(
                                  product.id,
                                  e.target.value as "primary" | "secondary"
                                )
                              }
                              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03414C] focus:border-transparent"
                            >
                              <option value="secondary">Secondary</option>
                              <option
                                value="primary"
                                disabled={productsWithPrimarySupplier.has(
                                  product.id
                                )}
                              >
                                Primary{" "}
                                {productsWithPrimarySupplier.has(product.id)
                                  ? "(Already Assigned)"
                                  : ""}
                              </option>
                            </select>
                          ) : (
                            <span className="text-gray-400 text-sm font-medium">
                              -
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={handlePageChange}
            />
          )}

          {/* Summary */}
        </div>
      </div>
    </>
  );
};

export default AssignProductsPage;
