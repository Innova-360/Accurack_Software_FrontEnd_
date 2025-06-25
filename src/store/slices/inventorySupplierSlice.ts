import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../services/api";

// Async thunk to fetch suppliers by storeId, page, and limit
export const fetchInventorySuppliers = createAsyncThunk(
  "inventorySuppliers/fetchInventorySuppliers",
  async (
    {
      storeId,
      page = 1,
      limit = 10,
    }: { storeId: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.get(
        `/supplier/list?storeId=${storeId}&page=${page}&limit=${limit}`
      );
      console.log("Fetched inventory suppliers:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching inventory suppliers:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch inventory suppliers"
      );
    }
  }
);

const inventorySupplierSlice = createSlice({
  name: "inventorySuppliers",
  initialState: {
    suppliers: [],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventorySuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventorySuppliers.fulfilled, (state, action) => {
        state.loading = false;
        // Fix: extract suppliers from response.data.data.suppliers
        state.suppliers = action.payload?.data?.data?.suppliers || [];
      })
      .addCase(fetchInventorySuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default inventorySupplierSlice.reducer;
