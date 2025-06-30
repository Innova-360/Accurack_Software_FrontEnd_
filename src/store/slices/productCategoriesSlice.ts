import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import apiClient from "../../services/api";

// Define the product category interface
export interface ProductCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Define the API response structure
interface ProductCategoriesApiResponse {
  success: boolean;
  message: string;
  data: ProductCategory[];
  status: number;
  timestamp: string;
}

// Define the initial state
interface ProductCategoriesState {
  categories: ProductCategory[];
  loading: boolean;
  error: string | null;
  creatingCategory: boolean; // Add loading state for creating category
}

const initialState: ProductCategoriesState = {
  categories: [],
  loading: false,
  error: null,
  creatingCategory: false, // Initialize creatingCategory state
};

// Async thunk for fetching product categories
export const fetchProductCategories = createAsyncThunk(
  "productCategories/fetchProductCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response =
        await apiClient.get<ProductCategoriesApiResponse>("/product-category");

      console.log("Product categories API response:", response.data);

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || "Failed to fetch categories"
        );
      }
    } catch (error: any) {
      console.error("Error fetching product categories:", error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch product categories"
      );
    }
  }
);

// Async thunk for creating a new product category
export const createProductCategory = createAsyncThunk(
  "productCategories/createProductCategory",
  async (categoryData: { name: string; code: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/product-category", categoryData);

      console.log("Create category API response:", response.data);

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || "Failed to create category"
        );
      }
    } catch (error: any) {
      console.error("Error creating product category:", error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create product category"
      );
    }
  }
);

// Create the slice
const productCategoriesSlice = createSlice({
  name: "productCategories",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProductCategories.fulfilled,
        (state, action: PayloadAction<ProductCategory[]>) => {
          state.loading = false;
          state.categories = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchProductCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error("Fetch product categories failed:", state.error);
      })
      .addCase(createProductCategory.pending, (state) => {
        state.creatingCategory = true; // Set creatingCategory to true on pending
        state.error = null;
      })
      .addCase(
        createProductCategory.fulfilled,
        (state, action: PayloadAction<ProductCategory>) => {
          state.creatingCategory = false; // Set creatingCategory to false on fulfilled
          state.categories.push(action.payload);
          state.error = null;
        }
      )
      .addCase(createProductCategory.rejected, (state, action) => {
        state.creatingCategory = false; // Set creatingCategory to false on rejected
        state.error = action.payload as string;
        console.error("Create product category failed:", state.error);
      });
  },
});

export const { clearError } = productCategoriesSlice.actions;
export default productCategoriesSlice.reducer;
