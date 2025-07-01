import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import apiClient from "../../services/api";
import { productAPI } from "../../services/productAPI";
import type { Product } from "../../data/inventoryData";
import { createApi } from "@reduxjs/toolkit/query";

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
  },
  reducers: {},
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

const customBaseQuery = async (args: any) => {
  try {
    const result = await apiClient({
      url: typeof args === 'string' ? args : args.url,
      method: args.method || 'GET',
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
  reducerPath: 'productsApi',
  baseQuery: customBaseQuery,
  tagTypes: ['Product'],
  endpoints: (builder) => ({
    searchProducts: builder.query<{ data: Product[] }, { q: string; storeId: string }>({
      query: ({ q, storeId }) => ({
        url: '/product/search',
        params: { q, storeId },
      }),
      providesTags: ['Product'],
    }),
  }),
});





export const { useSearchProductsQuery } = productsApi;

export default productsSlice.reducer;
