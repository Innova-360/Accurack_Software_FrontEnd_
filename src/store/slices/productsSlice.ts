import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import apiClient from "../../services/api";
import { productAPI, type ProductSearchParams } from "../../services/productAPI";
import type { Product } from "../../data/inventoryData";

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

// Async thunk for fetching products
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const products = await productAPI.getProducts();
      return products;
    } catch (error: any) {
      console.error("Error fetching products:", error);
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
      const paginatedData = await productAPI.getProductsPaginated(params);
      return paginatedData;
    } catch (error: any) {
      console.error("Error fetching paginated products:", error);
      return rejectWithValue(
        error.message || "Failed to fetch products"
      );
    }
  }
);

// Async thunk for creating a product
export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (productData: CreateProductPayload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/product/create", productData);
      console.log(response.data);
      return response.data;
    } catch (error: any) {
      console.log(error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to create product"
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
        state.products = action.payload;
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
        console.log(state.error);
      });
  },
});

export const { setSearchQuery, clearProducts } = productsSlice.actions;
export default productsSlice.reducer;
