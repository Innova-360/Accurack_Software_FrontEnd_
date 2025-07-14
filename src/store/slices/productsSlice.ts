import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../services/api";
import {
  productAPI,
  type ProductSearchParams,
} from "../../services/productAPI";
import type { Product } from "../../data/inventoryData";
import { createApi } from "@reduxjs/toolkit/query/react";

// Define the payload type for product creation

export interface CreateProductPayload {
  name: string;
  categoryId: string; // Changed from category to categoryId
  ean: string;
  pluUpc: string;
  supplierId: string;
  sku: string;
  singleItemCostPrice: number;
  itemQuantity: number;
  msrpPrice: number;
  singleItemSellingPrice: number;
  discountAmount: number;
  percentDiscount: number;
  clientId: string;
  storeId: string;
  hasVariants: boolean;
  packs: Array<{
    minimumSellingQuantity: number;
    totalPacksQuantity: number;
    orderedPacksPrice: number;
    discountAmount: number;
    percentDiscount: number;
  }>;
  variants: Array<{
    name: string;
    price: number;
    sku: string;
    pluUpc: string;
    supplierId: string;
    quantity: number;
    packs: Array<{
      minimumSellingQuantity: number;
      totalPacksQuantity: number;
      orderedPacksPrice: number;
      percentDiscount: number;
      discountAmount?: number;
    }>;
    msrpPrice?: number;
    discountAmount?: number;
    percentDiscount?: number;
  }>;
}

// Define the payload type for product update
export interface UpdateProductPayload {
  name: string;
  categoryId: string; // Changed from category to categoryId
  ean: string;
  pluUpc: string;
  supplierId: string;
  sku: string;
  singleItemCostPrice: number;
  itemQuantity: number;
  msrpPrice: number;
  singleItemSellingPrice: number;
  discountAmount: number;
  percentDiscount: number;
  clientId: string;
  storeId: string;
  hasVariants: boolean;
  packs: Array<{
    minimumSellingQuantity: number;
    totalPacksQuantity: number;
    orderedPacksPrice: number;
    discountAmount: number;
    percentDiscount: number;
  }>;
  variants: Array<{
    name: string;
    price: number;
    sku: string;
    pluUpc: string;
    supplierId: string;
    quantity: number;
    packs: Array<{
      minimumSellingQuantity: number;
      totalPacksQuantity: number;
      orderedPacksPrice: number;
      percentDiscount: number;
      discountAmount?: number;
    }>;
    msrpPrice?: number;
    discountAmount?: number;
    percentDiscount?: number;
  }>;
}

// Async thunk for fetching products
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params: ProductSearchParams, { rejectWithValue }) => {
    try {
      const products = await productAPI.getProducts(params);
      return products;
    } catch (error: any) {
      console.error("Error fetching products:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

// Async thunk for fetching products By ID
export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (productId: string, { rejectWithValue }) => {
    try {
      const product = await productAPI.getProductById(productId);

      return product;
    } catch (error: any) {
      console.error("Error fetching product:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

// Async thunk for fetching products with pagination and search
export const fetchProductsPaginated = createAsyncThunk(
  "products/fetchProductsPaginated",
  async (params: ProductSearchParams, { rejectWithValue }) => {
    try {
      // Corrected function call from getProductsPaginated to getProducts
      const paginatedData = await productAPI.getProducts(params);

      // We need to transform the data to match what the slice expects.
      return {
        products: paginatedData.products,
        totalProducts: paginatedData.pagination.total,
        totalPages: paginatedData.pagination.totalPages,
        currentPage: paginatedData.pagination.page,
        hasNextPage:
          paginatedData.pagination.page < paginatedData.pagination.totalPages,
        hasPreviousPage: paginatedData.pagination.page > 1,
      };
    } catch (error: any) {
      console.error("Error fetching paginated products:", error);
      return rejectWithValue(error.message || "Failed to fetch products");
    }
  }
);

// Async thunk for creating a product
export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (productData: CreateProductPayload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/product/create", productData);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create product"
      );
    }
  }
);

// Async thunk for Updating a product
export const updateProduct = createAsyncThunk(
  "products/updateProduct",

  async (
    {
      productId,
      productData,
    }: { productId: string; productData: UpdateProductPayload },
    { rejectWithValue }
  ) => {
    try {
      const response = await productAPI.updateProduct(
        productId,
        productData as any
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update product"
      );
    }
  }
);

// You can add the rest of your slice logic here as needed
const productsSlice = createSlice({
  name: "products",
  initialState: {
    products: [] as Product[],
    loading: false,
    error: null as string | null,
    // Pagination state
    totalProducts: 0,
    totalPages: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    searchQuery: "",
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearProducts: (state) => {
      state.products = [];
      state.totalProducts = 0;
      state.totalPages = 0;
      state.currentPage = 1;
      state.hasNextPage = false;
      state.hasPreviousPage = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error("Fetch products failed:", state.error);
      })
      .addCase(fetchProductsPaginated.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsPaginated.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.totalProducts = action.payload.totalProducts;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.hasNextPage = action.payload.hasNextPage;
        state.hasPreviousPage = action.payload.hasPreviousPage;
        state.error = null;
      })
      .addCase(fetchProductsPaginated.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error("Fetch paginated products failed:", state.error);
      })
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.loading = false;
        // Optionally, push the new product to state.products if needed
        // state.products.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

const customBaseQuery = async (args: any) => {
  try {
    const result = await apiClient({
      url: typeof args === "string" ? args : args.url,

      method: args.method || "GET",

      data: args.body,

      params: args.params,
    });

    return { data: result.data };
  } catch (axiosError: any) {
    return {
      error: {
        status: axiosError.response?.status,

        data: axiosError.response?.data || axiosError.message,
      },
    };
  }
};

export const productsApi = createApi({
  reducerPath: "productsApi",

  baseQuery: customBaseQuery,

  tagTypes: ["Product"],

  endpoints: (builder) => ({
    searchProducts: builder.query<
      { data: Product[] },
      { q: string; storeId: string }
    >({
      query: ({ q, storeId }) => ({
        url: "/product/search",

        params: { q, storeId },
      }),

      providesTags: ["Product"],
    }),
  }),
});

export const { useSearchProductsQuery } = productsApi;

export const { setSearchQuery, clearProducts } = productsSlice.actions;
export default productsSlice.reducer;
