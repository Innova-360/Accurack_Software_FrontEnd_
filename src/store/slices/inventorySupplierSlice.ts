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
      console.log("📦 Fetched inventory suppliers response structure:", {
        fullResponse: response.data,
        dataLevel1: response.data.data,
        dataLevel2: response.data.data.data,
        suppliers: response.data.data.data.suppliers,
        suppliersCount: response.data.data.data.suppliers?.length,
      });

      const allSuppliers = response.data.data.data.suppliers || [];

      // Filter suppliers by active status
      const activeSuppliers = allSuppliers.filter(
        (supplier: any) => supplier.status !== "inactive"
      );
      console.log(
        `inventorySupplierSlice: ${activeSuppliers.length} active suppliers out of ${allSuppliers.length} total`
      );

      return activeSuppliers;
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
        // Fix: suppliers are directly in the payload since we return them from the thunk
        state.suppliers = action.payload || [];
      })
      .addCase(fetchInventorySuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
export default inventorySupplierSlice.reducer;
