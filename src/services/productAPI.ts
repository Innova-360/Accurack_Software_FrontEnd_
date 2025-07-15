import apiClient from "./api";
import type { Product as BaseProduct, Variant } from "../data/inventoryData";

export interface ApiProduct {
  id: string;
  name: string;
  category:
    | string
    | {
        id: string;
        name: string;
        code?: string;
        description?: string;
        parentId?: string;
        createdAt?: string;
        updatedAt?: string;
      };
  categoryId?: string;
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
        address?: string;
        status?: string;
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
  purchaseOrders?: Array<{
    id: string;
    quantity: number;
    total?: number;
    status: string;
  }>;
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
  productSuppliers?: Array<{
    id: string;
    productId: string;
    supplierId: string;
    costPrice: number;
    categoryId: string;
    state: string;
    createdAt: string;
    updatedAt: string;
    supplier: {
      id: string;
      name: string;
      email: string;
      phone: string;
      address: string;
      status: string;
      storeId: string;
      createdAt: string;
      updatedAt: string;
    };
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
    purchaseOrders: string;
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


const transformApiProduct = (apiProduct: ApiProduct): Product => {
  try {
    const primarySupplierEntry = apiProduct.productSuppliers?.find(
      (ps) => ps.state === "primary"
    );

    // Fix: Only assign a supplier object or string, not an array
    const supplier =
      primarySupplierEntry?.supplier ||
      apiProduct.productSuppliers?.[0]?.supplier ||
      apiProduct.supplier ||
      "Not Assigned";

    return {
      id: apiProduct.id || "",
      name: apiProduct.name || "-",
      quantity: apiProduct.itemQuantity ?? 0,
      plu: apiProduct.pluUpc || "-",
      sku: apiProduct.sku || "-",
      ean: apiProduct.ean || "-",
      description: apiProduct.description || "-",
      price: `$${(apiProduct.singleItemSellingPrice ?? 0).toFixed(2)}`,
      category:
        typeof apiProduct.category === "object"
          ? apiProduct.category.name || "Uncategorized"
          : "Uncategorized",
      minimumSellingQuantity: apiProduct.packs?.[0]?.minimumSellingQuantity || 0,
      supplier: supplier,
      supplierId:
        primarySupplierEntry?.supplierId || apiProduct.supplierId || "",
      createdAt: apiProduct.createdAt
        ? new Date(apiProduct.createdAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      hasVariants: apiProduct.hasVariants ?? false,
      variants:
        apiProduct.variants?.map((variant) => ({
          id: variant.id,
          name: variant.name || "Unknown Variant",
          price: variant.price ?? 0,
          sku: variant.sku || variant.id || "",
          pluUpc: variant.pluUpc || "",
          quantity: variant.quantity ?? 0,
          msrpPrice: variant.msrpPrice,
          discountAmount: variant.discountAmount,
          percentDiscount: variant.percentDiscount,
          supplierId: variant.supplierId,
          packIds: variant.packIds || [],
          packs: variant.packs || [],
        })) || [],
      costPrice:
        primarySupplierEntry?.costPrice ?? apiProduct.singleItemCostPrice,
      msrpPrice: apiProduct.msrpPrice,
      profitAmount: apiProduct.profitAmount,
      profitMargin: apiProduct.profitMargin,
      store: apiProduct.store,
      sales: apiProduct.sales || [],
      purchaseOrders:
        (apiProduct.purchaseOrders as Array<{
          id: string;
          quantity: number;
          total?: number;
          status: string;
        }>) || [],
      packs: apiProduct.packs || [],
      categoryId:
        (typeof apiProduct.category === "object" && apiProduct.category?.id) ||
        apiProduct.categoryId ||
        "",
      productSuppliers: apiProduct.productSuppliers || [],
      clientId: apiProduct.clientId || "",
      storeId: apiProduct.storeId || apiProduct.store?.id || "",
      updatedAt: apiProduct.updatedAt || apiProduct.createdAt || "",
      percentDiscount: apiProduct.percentDiscount ?? 0,
      discountAmount: apiProduct.discountAmount ?? 0,
      packIds: apiProduct.packIds || [],
    };
  } catch (transformError) {
    console.error("Error transforming product:", apiProduct, transformError);
    
    return {
      id: apiProduct.id,
      name: apiProduct.name || "Unknown Product",
      quantity: 0,
      plu: "",
      sku: "",
      description: "Error loading product details",
      price: "$0.00",
      category: "Uncategorized",
      minimumSellingQuantity: 69,
      supplier: "",
      createdAt: new Date().toISOString().split("T")[0],
      hasVariants: false,
      variants: [],
    };
  }
};

export type Product = BaseProduct;
export type { Variant, PaginatedProductsResponse, PaginationParams };

// Add interface for pagination response
interface PaginatedProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

//   products: Product[];
//   totalProducts: number;
//   totalPages: number;
//   currentPage: number;
//   hasNextPage: boolean;
//   hasPreviousPage: boolean;
// }

// Add interface for pagination parameters
interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  category?: string;
  storeId?: string;
}

// Pagination and search parameters interface
export interface ProductSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  storeId?: string;
}

// API service
export const productAPI = {
  // Fetch products with pagination
  async getProducts(
    params: PaginationParams = {}
  ): Promise<PaginatedProductsResponse> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 10;

      const searchParams = new URLSearchParams();
      searchParams.append("page", page.toString());
      searchParams.append("limit", limit.toString());
      if (params.storeId !== undefined) {
        searchParams.append("storeId", params.storeId.toString());
      }

      // Add search parameter if provided
      if (params.search && params.search.trim()) {
        searchParams.append("search", params.search.trim());
      }

      // Add sorting parameters if provided
      if (params.sortBy) {
        searchParams.append("sortBy", params.sortBy);
        searchParams.append("sortOrder", params.sortOrder || "asc");
      }

      // Add category filter if provided
      if (params.category && params.category !== "all") {
        searchParams.append("category", params.category);
      }

      const url = `/product/list?${searchParams.toString()}`;
      // Debug log
      const response = await apiClient.get(url);
      // Debug log

      // Handle different possible response structures
      let apiProducts: ApiProduct[];
      let pagination = {
        page: page,
        limit: limit,
        total: 0,
        totalPages: 0,
      };

      // First check if response.data.data exists and has products
      if (
        response.data?.data?.products &&
        Array.isArray(response.data.data.products)
      ) {
        apiProducts = response.data.data.products;
        // Check if pagination info exists
        if (response.data.data.pagination) {
          pagination = { ...pagination, ...response.data.data.pagination };
        } else {
          pagination.total = apiProducts.length;
          pagination.totalPages = Math.ceil(
            apiProducts.length / pagination.limit
          );
        }
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        apiProducts = response.data.data;
        pagination.total = apiProducts.length;
        pagination.totalPages = Math.ceil(
          apiProducts.length / pagination.limit
        );
      } else if (Array.isArray(response.data)) {
        apiProducts = response.data;
        pagination.total = apiProducts.length;
        pagination.totalPages = Math.ceil(
          apiProducts.length / pagination.limit
        );
      } else if (
        response.data?.products &&
        Array.isArray(response.data.products)
      ) {
        apiProducts = response.data.products;
        if (response.data.pagination) {
          pagination = { ...pagination, ...response.data.pagination };
        } else {
          pagination.total = apiProducts.length;
          pagination.totalPages = Math.ceil(
            apiProducts.length / pagination.limit
          );
        }
      } else if (
        response.data?.data &&
        typeof response.data.data === "object"
      ) {
        const dataKeys = Object.keys(response.data.data);

        // Try to find an array in the data object
        let foundArray = null;
        for (const key of dataKeys) {
          if (Array.isArray(response.data.data[key])) {
            foundArray = response.data.data[key];

            break;
          }
        }

        if (foundArray) {
          apiProducts = foundArray;
          pagination.total = apiProducts.length;
          pagination.totalPages = Math.ceil(
            apiProducts.length / pagination.limit
          );
        } else {
          console.error("No array found in data object:", response.data.data);
          return {
            products: [],
            pagination: {
              page: params.page || 1,
              limit: params.limit || 10,
              total: 0,
              totalPages: 0,
            },
          };
        }
      } else {
        console.error("Unexpected API response structure:", response.data);

        return {
          products: [],
          pagination: {
            page: page,
            limit: limit,
            total: 0,
            totalPages: 0,
          },
        };
      }

      // Validate that we have an array
      if (!Array.isArray(apiProducts)) {
        console.error("API products is not an array:", apiProducts);
        return {
          products: [],
          pagination: {
            page: page,
            limit: limit,
            total: 0,
            totalPages: 0,
          },
        };
      }

      // Transform API products to match the existing Product interface
      const transformedProducts = apiProducts.map((apiProduct) =>
        transformApiProduct(apiProduct)
      );

      return {
        products: transformedProducts,
        pagination,
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  // Legacy method for backward compatibility - fetches all products without pagination
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await this.getProducts({ page: 1, limit: 1000 }); // Get a large number to simulate "all"
      return response.products;
    } catch (error) {
      console.error("Error fetching all products:", error);
      throw error;
    }
  },

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await apiClient.get(`/product/${id}`);
      if (!response.data || !response.data.data) {
        throw new Error("Invalid API response structure");
      }
      const apiProduct = response.data.data;
      // Validate required fields
      if (!apiProduct.id || !apiProduct.name) {
        throw new Error("Product data is incomplete");
      }
      return transformApiProduct(apiProduct);
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      throw new Error("Product not found or access denied");
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

  // Update product quantity
  async updateProductQuantity(
    id: string,
    quantity: number
  ): Promise<{ success: boolean; message: string; data?: ApiProduct }> {
    try {
      const response = await apiClient.patch(`/product/${id}/quantity`, {
        quantity: quantity,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating product quantity:", error);
      throw error;
    }
  },

  // Search products by query string
  async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await apiClient.get(
        `/product/search?q=${encodeURIComponent(query)}`
      );
      // Assume response.data is an array of products or has a .data property
      let apiProducts: ApiProduct[] = [];
      if (Array.isArray(response.data)) {
        apiProducts = response.data;
      } else if (Array.isArray(response.data?.data)) {
        apiProducts = response.data.data;
      } else if (
        response.data?.products &&
        Array.isArray(response.data.products)
      ) {
        apiProducts = response.data.products;
      }
      return apiProducts.map(transformApiProduct);
    } catch (error) {
      console.error("Error searching products:", error);
      throw error;
    }
  },

  async updateVariantQuantityByPluUpc(
    pluUpc: string,
    quantity: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.patch(
        `/product/variant-quantity/${encodeURIComponent(pluUpc)}`,
        { quantity }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating variant quantity:", error);
      throw error;
    }
  },
};
