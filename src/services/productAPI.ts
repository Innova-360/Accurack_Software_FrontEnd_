import apiClient from "./api";
import type { Product as BaseProduct, Variant } from "../data/inventoryData";

export interface ApiProduct {
  id: string;
  name: string;
  category: string;
  ean: string;
  pluUpc: string;
  supplierId: string;
  sku: string;
  singleItemCostPrice: number;
  itemQuantity: number;
  msrpPrice: number;
  singleItemSellingPrice: number;
  discountAmount?: number;
  percentDiscount?: number;
  clientId: string;
  storeId: string;
  hasVariants: boolean;
  description?: string;
  supplier?:
    | string
    | {
        id: string;
        name: string;
        email?: string;
        phone?: string;
      };
  createdAt?: string;
  updatedAt?: string;
  profitAmount?: number;
  profitMargin?: number;
  store?: {
    id: string;
    name: string;
  };
  sales?: unknown[];
  purchaseOrders?: unknown[];
  packIds?: string[];
  packs: Array<{
    id?: string;
    productId?: string;
    minimumSellingQuantity: number;
    totalPacksQuantity: number;
    orderedPacksPrice: number;
    discountAmount?: number;
    percentDiscount: number;
    createdAt?: string;
    updatedAt?: string;
  }>;
  variants: Array<{
    id?: string;
    name: string;
    price: number;
    sku?: string;
    pluUpc?: string;
    quantity?: number;
    msrpPrice?: number;
    discountAmount?: number;
    percentDiscount?: number;
    supplierId?: string;
    packIds?: string[];
    packs?: Array<{
      id?: string;
      productId?: string;
      minimumSellingQuantity: number;
      totalPacksQuantity: number;
      orderedPacksPrice: number;
      percentDiscount: number;
      discountAmount?: number;
      createdAt?: string;
      updatedAt?: string;
    }>;
  }>;
}

// Helper function to transform API product to frontend Product interface
const transformApiProduct = (apiProduct: ApiProduct): Product => {
  try {
    // Handle supplier field - it can be string or object
    let supplierInfo:
      | string
      | { id: string; name: string; email?: string; phone?: string };

    if (typeof apiProduct.supplier === "string") {
      supplierInfo = apiProduct.supplier;
    } else if (apiProduct.supplier && typeof apiProduct.supplier === "object") {
      supplierInfo = apiProduct.supplier;
    } else {
      supplierInfo = "N/A";
    }

    return {
      id: apiProduct.id || "",
      name: apiProduct.name || "Unknown Product",
      quantity: apiProduct.itemQuantity || 0,
      plu: apiProduct.pluUpc || "plu not found",
      sku: apiProduct.sku || "sku not found",
      ean: apiProduct.ean || "", // Add EAN field
      description: apiProduct.description || "this is description",
      price: `$${(apiProduct.singleItemSellingPrice || 0).toFixed(2)}`,
      category: apiProduct.category || "Uncategorized",
      itemsPerUnit: 1,
      supplier: supplierInfo,
      supplierId: apiProduct.supplierId, // Add supplier ID
      createdAt: apiProduct.createdAt
        ? new Date(apiProduct.createdAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      hasVariants: apiProduct.hasVariants || false,
      variants:
        apiProduct.variants?.map((variant) => ({
          id: variant.id,
          name: variant.name || "Unknown Variant",
          price: variant.price || 0,
          sku: variant.sku || variant.id || "",
          pluUpc: variant.pluUpc || "",
          quantity: variant.quantity || 0,
          msrpPrice: variant.msrpPrice,
          discountAmount: variant.discountAmount,
          percentDiscount: variant.percentDiscount,
          supplierId: variant.supplierId,
          packIds: variant.packIds || [],
          packs: variant.packs || [],
        })) || [],
      // Additional fields for detailed view
      costPrice: apiProduct.singleItemCostPrice,
      msrpPrice: apiProduct.msrpPrice,
      profitAmount: apiProduct.profitAmount,
      profitMargin: apiProduct.profitMargin,
      store: apiProduct.store,
      sales: apiProduct.sales || [],
      purchaseOrders: apiProduct.purchaseOrders || [],
      packs: apiProduct.packs || [],
    };
  } catch (transformError) {
    console.error("Error transforming product:", apiProduct, transformError);
    // Return a basic product structure for failed transformations
    return {
      id: apiProduct.id || Math.random().toString(),
      name: apiProduct.name || "Unknown Product",
      quantity: 0,
      plu: "",
      sku: "",
      description: "Error loading product details",
      price: "$0.00",
      category: "Uncategorized",
      itemsPerUnit: 1,
      supplier: "",
      createdAt: new Date().toISOString().split("T")[0],
      hasVariants: false,
      variants: [],
    };
  }
};

// Export the Product type for use in other components
export type Product = BaseProduct;
export type { Variant };

// Pagination and search parameters interface
export interface ProductSearchParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedProductsResponse {
  products: Product[];
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// API service
export const productAPI = {
  // Fetch products with pagination and search
  async getProductsPaginated(
    params: ProductSearchParams = {}
  ): Promise<PaginatedProductsResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.search) queryParams.append("search", params.search);

      const url = `/product/list${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await apiClient.get(url);

      console.log("Paginated API Response:", response.data);

      // Handle different possible response structures for paginated data
      let apiProducts: ApiProduct[];
      let totalProducts = 0;
      let totalPages = 1;
      let currentPage = params.page || 1;

      if (
        response.data?.data?.products &&
        Array.isArray(response.data.data.products)
      ) {
        apiProducts = response.data.data.products;
        totalProducts =
          response.data.data.totalProducts ||
          response.data.data.total ||
          apiProducts.length;
        totalPages =
          response.data.data.totalPages ||
          Math.ceil(totalProducts / (params.limit || 50));
        currentPage = response.data.data.currentPage || currentPage;
      } else if (response.data?.products && Array.isArray(response.data.products)) {
        apiProducts = response.data.products;
        totalProducts =
          response.data.totalProducts ||
          response.data.total ||
          apiProducts.length;
        totalPages =
          response.data.totalPages ||
          Math.ceil(totalProducts / (params.limit || 50));
        currentPage = response.data.currentPage || currentPage;
      } else {
        // Fallback to original method if pagination not supported by backend
        console.log("Backend doesn't support pagination, using client-side pagination");
        const allProducts = await this.getProducts();
        console.log("Total products from getProducts:", allProducts.length);
        
        const limit = params.limit || 50;
        const page = params.page || 1;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        console.log("Pagination params:", { limit, page, startIndex, endIndex });

        // Apply search filter if provided
        let filteredProducts = allProducts;
        if (params.search) {
          const searchTerm = params.search.toLowerCase();
          console.log("Applying search filter:", searchTerm);
          filteredProducts = allProducts.filter(
            (product) =>
              product.name.toLowerCase().includes(searchTerm) ||
              (product.sku && product.sku.toLowerCase().includes(searchTerm)) ||
              (product.plu && product.plu.toLowerCase().includes(searchTerm)) ||
              (typeof product.category === "string" &&
                product.category.toLowerCase().includes(searchTerm))
          );
          console.log("Filtered products count:", filteredProducts.length);
        }

        totalProducts = filteredProducts.length;
        totalPages = Math.ceil(totalProducts / limit);
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        
        console.log("Pagination result:", {
          totalProducts,
          totalPages,
          currentPage: page,
          paginatedProductsCount: paginatedProducts.length,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        });
        
        return {
          products: paginatedProducts,
          totalProducts,
          totalPages,
          currentPage: page,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        };
      }

      // Transform API products to frontend format
      const transformedProducts: Product[] = apiProducts.map((apiProduct) => transformApiProduct(apiProduct));

      return {
        products: transformedProducts,
        totalProducts,
        totalPages,
        currentPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      };
    } catch (error: any) {
      console.error("Error fetching paginated products:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch products");
    }
  },

  // Fetch all products
  async getProducts(): Promise<Product[]> {
    try {
      const response = await apiClient.get("/product/list");
      console.log("API Response:", response.data); // Debug log      // Handle different possible response structures
      let apiProducts: ApiProduct[];

      // First check if response.data.data exists and has products
      if (
        response.data?.data?.products &&
        Array.isArray(response.data.data.products)
      ) {
        apiProducts = response.data.data.products;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        apiProducts = response.data.data;
      } else if (Array.isArray(response.data)) {
        apiProducts = response.data;
      } else if (
        response.data?.products &&
        Array.isArray(response.data.products)
      ) {
        apiProducts = response.data.products;
      } else if (
        response.data?.data &&
        typeof response.data.data === "object"
      ) {
        // If data is an object, look for arrays inside it
        const dataKeys = Object.keys(response.data.data);
        console.log("Data object keys:", dataKeys);

        // Try to find an array in the data object
        let foundArray = null;
        for (const key of dataKeys) {
          if (Array.isArray(response.data.data[key])) {
            foundArray = response.data.data[key];
            console.log(`Found array at key: ${key}`, foundArray);
            break;
          }
        }

        if (foundArray) {
          apiProducts = foundArray;
        } else {
          console.error("No array found in data object:", response.data.data);
          return [];
        }
      } else {
        console.error("Unexpected API response structure:", response.data);
        // Return empty array if we can't find products
        return [];
      }

      // Validate that we have an array
      if (!Array.isArray(apiProducts)) {
        console.error("API products is not an array:", apiProducts);
        return [];
      }

      // Transform API products to match the existing Product interface
      return apiProducts.map(transformApiProduct);
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  // Get a single product by ID
  async getProductById(id: string): Promise<Product> {
    try {
      // Try to get the product by ID from the API
      const response = await apiClient.get(`/product/${id}`);
      console.log("Product by ID API Response:", response.data); // Debug log

      // Handle the response structure based on the API format provided
      let apiProduct: ApiProduct;

      if (
        response.data?.data?.products &&
        Array.isArray(response.data.data.products) &&
        response.data.data.products.length > 0
      ) {
        // If the response has products array (as per the API response structure), take the first one
        apiProduct = response.data.data.products[0];
      } else if (response.data?.data && !Array.isArray(response.data.data)) {
        // If data is a single product object
        apiProduct = response.data.data;
      } else if (response.data && !response.data.data) {
        // If the product is directly in response.data
        apiProduct = response.data;
      } else {
        throw new Error("Invalid API response structure");
      }

      return transformApiProduct(apiProduct);
    } catch (error) {
      console.error("Error fetching product by ID:", error);

      // Fallback: Get all products and find the one with matching ID
      try {
        const allProducts = await this.getProducts();
        const product = allProducts.find(
          (p) => p.id === id || p.sku === id || p.plu === id
        );

        if (product) {
          return product;
        }

        throw new Error("Product not found");
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
        throw new Error("Product not found");
      }
    }
  },

  // Delete a product
  async deleteProduct(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/product/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  // Delete all products for a store
  async deleteAllProducts(
    storeId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/product/delete/all`, {
        params: { storeId },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting all products:", error);
      throw error;
    }
  },

  // Update a product
  async updateProduct(
    id: string,
    productData: Partial<ApiProduct>
  ): Promise<{ success: boolean; message: string; data?: ApiProduct }> {
    try {
      const response = await apiClient.put(`/product/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },
};
