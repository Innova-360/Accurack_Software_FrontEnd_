import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  Supplier,
  SupplierFormData,
  SupplierState,
} from "../../types/supplier";
import apiClient from "../../services/api";

const initialState: SupplierState = {
  suppliers: [],
  currentSupplier: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks for API calls
export const fetchSuppliers = createAsyncThunk(
  "suppliers/fetchSuppliers",
  async (
    {
      storeId,
      page = 1,
      limit = 10,
    }: { storeId: string | undefined; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      if (storeId) params.append("storeId", storeId);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const url = `/supplier/list?${params.toString()}`;
      const response = await apiClient.get(url);

      // Handle different response structures from backend
      let suppliers = [];
      let pagination = {
        page,
        limit,
        total: 0,
        totalPages: 0,
      };

      if (response.data) {
        if (Array.isArray(response.data)) {
          suppliers = response.data;
          pagination.total = suppliers.length;
          pagination.totalPages = Math.ceil(suppliers.length / limit);
        } else if (
          response.data.data &&
          response.data.data.suppliers &&
          Array.isArray(response.data.data.suppliers)
        ) {
          suppliers = response.data.data.suppliers;
          if (response.data.data.pagination) {
            pagination = { ...pagination, ...response.data.data.pagination };
          } else {
            pagination.total = suppliers.length;
            pagination.totalPages = Math.ceil(suppliers.length / limit);
          }
        } else if (response.data.data && Array.isArray(response.data.data)) {
          suppliers = response.data.data;
          pagination.total = suppliers.length;
          pagination.totalPages = Math.ceil(suppliers.length / limit);
        } else if (
          response.data.suppliers &&
          Array.isArray(response.data.suppliers)
        ) {
          suppliers = response.data.suppliers;
          if (response.data.pagination) {
            pagination = { ...pagination, ...response.data.pagination };
          } else {
            pagination.total = suppliers.length;
            pagination.totalPages = Math.ceil(suppliers.length / limit);
          }
        } else if (response.data.data.data.suppliers) {
          suppliers = response.data.data.data.suppliers;
          if (response.data.data.data.pagination) {
            pagination = {
              ...pagination,
              ...response.data.data.data.pagination,
            };
          } else {
            pagination.total = suppliers.length;
            pagination.totalPages = Math.ceil(suppliers.length / limit);
          }
        }
      }

      // Filter out inactive suppliers (only show active ones)
      const activeSuppliers = suppliers.filter((supplier: any) => {
        // Check if supplier has status field and if it's active
        if (supplier.status) {
          return supplier.status === 'active' || supplier.status === 'Active' || supplier.status === 'ACTIVE';
        }
        // If no status field, assume it's active (for backward compatibility)
        return true;
      });

      console.log("All suppliers:", suppliers);
      console.log("Active suppliers only:", activeSuppliers);
      console.log("Filtered out inactive suppliers:", suppliers.length - activeSuppliers.length);

      // Update pagination to reflect active suppliers count
      const activePagination = {
        ...pagination,
        total: activeSuppliers.length,
        totalPages: Math.ceil(activeSuppliers.length / limit)
      };

      console.log("=== fetchSuppliers Debug ===");
      console.log("Raw API response:", response.data);
      console.log("All suppliers (before filter):", suppliers);
      console.log("Active suppliers (after filter):", activeSuppliers);
      console.log("Updated pagination:", activePagination);
      console.log("First active supplier structure:", activeSuppliers[0]);

      return { suppliers: activeSuppliers, pagination: activePagination };
    } catch (error: any) {
      console.error("Fetch suppliers error:", error);
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
      // Try to extract supplier data, fallback to null if not found
      const supplier = response.data?.data ?? response.data?.supplier ?? null;
      return supplier;
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
      console.log("=== Creating supplier ===");
      console.log("Sending data:", supplierData);

      const response = await apiClient.post("/supplier/create", supplierData);

      console.log("=== Backend Response ===");
      console.log("Full response:", response);
      console.log("response.data:", response.data);

      // Get the created supplier from response
      const createdSupplier = response.data?.data || response.data;
      console.log("Extracted createdSupplier:", createdSupplier);

      // Refresh suppliers list after creation
      console.log("Refreshing suppliers list after creation");
      await dispatch(fetchSuppliers({ storeId: supplierData.storeId })).unwrap();

      return {
        success: true,
        message: "Supplier created successfully",
        supplier: createdSupplier,
      };
    } catch (error: any) {
      console.error("Create supplier error:", error);
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
      console.log("Updating supplier with ID:", id);
      console.log("Supplier data:", supplierData);

      // Validate the ID - it shouldn't contain spaces or be too long
      if (!id || id.length > 50 || id.includes(" ")) {
        throw new Error("Invalid supplier ID format");
      } // Use standard REST endpoint format
      const response = await apiClient.put(`/supplier/${id}`, supplierData);
      console.log("Update response:", response.data);
      // Refresh suppliers list after update
      console.log("Refreshing suppliers list after update");
      await dispatch(fetchSuppliers({ storeId: supplierData.storeId })).unwrap();

      return { success: true, message: "Supplier updated successfully" };
    } catch (error: any) {
      console.error("Update supplier error:", error);
      console.error("Error response:", error.response?.data);

      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update supplier"
      );
    }
  }
);

export const deleteSupplier = createAsyncThunk(
  "suppliers/deleteSupplier",
  async (
    { id, storeId }: { id: string; storeId: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      console.log("deleteSupplier thunk called with:", { id, storeId });

      // Basic validation
      if (!id || !id.trim()) {
        throw new Error("Supplier ID is required");
      }

      if (!storeId || !storeId.trim()) {
        throw new Error("Store ID is required");
      }

      // Check if this is sample data (simple heuristic)
      if (id.startsWith("SUP") && id.length <= 10 && /^SUP\d{3}$/.test(id)) {
        console.log("Detected sample data, skipping API call for:", id);
        
        // For sample data, just refresh the supplier list (it will filter out sample data)
        console.log("Refreshing suppliers list for sample data removal");
        await dispatch(fetchSuppliers({ storeId })).unwrap();
        
        return { id, success: true, message: "Sample supplier removed from view" };
      }

      // Use standard REST endpoint format for real suppliers
      console.log("Calling API to delete supplier:", id);
      await apiClient.delete(`/supplier/${id}`);
      console.log("Supplier deleted successfully via API");

      // Refresh suppliers list after deletion
      console.log("Refreshing suppliers list for store:", storeId);
      const refreshResult = await dispatch(fetchSuppliers({ storeId })).unwrap();
      console.log("Suppliers list refreshed successfully:", refreshResult);

      return { id, success: true, message: "Supplier deleted successfully" };
    } catch (error: any) {
      console.error("Delete supplier error:", error);
      console.error("Error response:", error.response?.data);

      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete supplier"
      );
    }
  }
);

export const deleteAllSuppliers = createAsyncThunk(
  "suppliers/deleteAllSuppliers",
  async (storeId: string, { rejectWithValue, dispatch }) => {
    try {
      console.log("Deleting all suppliers for store:", storeId); // Get all suppliers for this store (use high limit to get all suppliers)
      const suppliersResponse = await dispatch(
        fetchSuppliers({ storeId, page: 1, limit: 1000 })
      ).unwrap();
      const suppliers = Array.isArray(suppliersResponse.suppliers)
        ? suppliersResponse.suppliers
        : [];

      if (suppliers.length === 0) {
        console.log("No suppliers to delete");
        return { success: true, message: "No suppliers to delete" };
      }

      // Filter to only real suppliers (not sample data)
      const realSuppliers = suppliers.filter((supplier: any) => {
        const validId = getValidId(supplier);
        return validId !== null;
      });

      if (realSuppliers.length === 0) {
        console.log("No real suppliers to delete (only sample data found)");
        return { success: true, message: "No real suppliers to delete" };
      }

      console.log(`Found ${realSuppliers.length} real suppliers to delete`);

      // Delete each supplier individually
      const deletePromises = realSuppliers.map(async (supplier: any) => {
        const validId = getValidId(supplier);
        if (validId) {
          try {
            await apiClient.delete(`/supplier/${validId}`);
            console.log(`Deleted supplier: ${validId}`);
          } catch (err) {
            console.error(`Failed to delete supplier ${validId}:`, err);
            throw err;
          }
        }
      });

      await Promise.all(deletePromises);
      console.log("All suppliers deleted successfully");
      
      // Refresh suppliers list after deletion
      console.log("Refreshing suppliers list after bulk deletion");
      const refreshResult = await dispatch(fetchSuppliers({ storeId })).unwrap();
      console.log("Suppliers list refreshed successfully:", refreshResult);

      return {
        success: true,
        message: `Successfully deleted ${realSuppliers.length} suppliers`,
      };
    } catch (error: any) {
      console.error("Delete all suppliers error:", error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete all suppliers"
      );
    }
  }
);

// Helper function to get valid ID (same logic as in components)
const getValidId = (supplier: any): string | null => {
  // Prefer numeric/UUID id if available
  if (
    supplier.id &&
    supplier.id.trim() &&
    !supplier.id.includes(" ") &&
    supplier.id.length <= 50
  ) {
    return supplier.id;
  }

  // Check if supplier_id is valid (should be numeric or UUID, not sample text)
  if (
    supplier.supplier_id &&
    supplier.supplier_id.trim() &&
    !supplier.supplier_id.includes(" ") &&
    supplier.supplier_id.length <= 50 &&
    /^[a-zA-Z0-9_-]+$/.test(supplier.supplier_id)
  ) {
    return supplier.supplier_id;
  }

  return null;
};

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
      state.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
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
        state.suppliers = action.payload.suppliers;
        state.pagination = action.payload.pagination;
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
  setPage,
} = supplierSlice.actions;

export default supplierSlice.reducer;
