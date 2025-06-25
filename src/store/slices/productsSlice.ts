import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../services/api";

// Define the payload type for product creation
export interface CreateProductPayload {
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

// Async thunk for creating a product
export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (productData: CreateProductPayload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/products/create", productData);
      return response.data;
    } catch (error: any) {
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
    products: [],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
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

export default productsSlice.reducer;