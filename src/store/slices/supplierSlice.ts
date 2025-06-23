import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Supplier, SupplierFormData, SupplierState } from "../../types/supplier";
import apiClient from "../../services/api";

const initialState: SupplierState = {
  suppliers: [],
  currentSupplier: null,
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchSuppliers = createAsyncThunk(
  "suppliers/fetchSuppliers",
  async (storeId: string | undefined, { rejectWithValue }) => {
    try {
      const url = storeId ? `/supplier/list?storeId=${storeId}` : '/supplier/list';
      console.log('Fetching suppliers from URL:', url);
      
      const response = await apiClient.get(url);
      console.log('Fetch suppliers response:', response.data);
      
      // Handle different response structures from backend
      let suppliers = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          suppliers = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          suppliers = response.data.data;
        } else if (response.data.suppliers && Array.isArray(response.data.suppliers)) {
          suppliers = response.data.suppliers;
        } else if (response.data.data && response.data.data.suppliers && Array.isArray(response.data.data.suppliers)) {
          suppliers = response.data.data.suppliers;
        }
      }
      
      console.log('Processed suppliers:', suppliers);
      return suppliers;
    } catch (error: any) {
      console.error('Fetch suppliers error:', error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch suppliers"
      );
    }
  }
);

export const fetchSupplierById = createAsyncThunk(
  "suppliers/fetchSupplierById",
  async (supplierId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/supplier/${supplierId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch supplier"
      );
    }
  }
);

export const createSupplier = createAsyncThunk(
  "suppliers/createSupplier",
  async (supplierData: SupplierFormData, { rejectWithValue, dispatch }) => {
    try {
      await apiClient.post("/supplier/create", supplierData);
      
      // Refresh suppliers list after creation
      await dispatch(fetchSuppliers(supplierData.storeId));
      
      return { success: true, message: "Supplier created successfully" };
    } catch (error: any) {
      console.error('Create supplier error:', error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to create supplier"
      );
    }
  }
);

export const updateSupplier = createAsyncThunk(
  "suppliers/updateSupplier",
  async (
    { id, supplierData }: { id: string; supplierData: SupplierFormData },
    { rejectWithValue, dispatch }
  ) => {
    try {
      await apiClient.put(`/supplier/${id}`, supplierData);
      
      // Refresh suppliers list after update
      await dispatch(fetchSuppliers(supplierData.storeId));
      
      return { success: true, message: "Supplier updated successfully" };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update supplier"
      );    }
  }
);

export const deleteSupplier = createAsyncThunk(
  "suppliers/deleteSupplier",
  async ({ id, storeId }: { id: string; storeId: string }, { rejectWithValue, dispatch }) => {
    try {
      await apiClient.delete(`/supplier/${id}`);
      
      // Refresh suppliers list after deletion
      await dispatch(fetchSuppliers(storeId));
      
      return { id, success: true, message: "Supplier deleted successfully" };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete supplier"
      );
    }
  }
);

export const deleteAllSuppliers = createAsyncThunk(
  "suppliers/deleteAllSuppliers",
  async (storeId: string, { rejectWithValue, dispatch }) => {
    try {
      await apiClient.delete(`/supplier/all/${storeId}`);
      
      // Refresh suppliers list after deletion
      await dispatch(fetchSuppliers(storeId));
      
      return { success: true, message: "All suppliers deleted successfully" };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete all suppliers"
      );
    }
  }
);

export const supplierSlice = createSlice({
  name: "suppliers",
  initialState,
  reducers: {
    setCurrentSupplier: (state, action: PayloadAction<Supplier>) => {
      state.currentSupplier = action.payload;
    },
    clearCurrentSupplier: (state) => {
      state.currentSupplier = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuppliers: (state) => {
      state.suppliers = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch suppliers
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = action.payload;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSupplierById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplierById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSupplier = action.payload;
      })
      .addCase(fetchSupplierById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create supplier
      .addCase(createSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSupplier.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update supplier
      .addCase(updateSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSupplier.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete supplier
      .addCase(deleteSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSupplier.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete all suppliers
      .addCase(deleteAllSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAllSuppliers.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteAllSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentSupplier,
  clearCurrentSupplier,
  clearError,
  clearSuppliers,
} = supplierSlice.actions;

export default supplierSlice.reducer;
