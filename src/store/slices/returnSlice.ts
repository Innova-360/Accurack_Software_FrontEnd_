import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../services/api";

// Types for the return API
export interface ReturnItem {
  id: string;
  saleId: string;
  productId: string;
  productName: string;
  pluUpc: string;
  sellingPrice: number;
  vendorPrice: number;
  quantity: number;
  returnDate: string;
  reason: string;
  status: "saleable" | "no_saleable" | "scrap";
  customerInfo?: {
    name: string;
    phone: string;
  };
}

export interface CreateReturnRequest {
  saleId: string;
  returnItems: {
    productId: string;
    pluUpc: string;
    isProductReturned: boolean;
    quantity: number;
    refundAmount: number;
    returnCategory: "SALEABLE" | "NON_SALEABLE" | "SCRAP";
    reason: string;
  }[];
}

interface ReturnState {
  returns: ReturnItem[];
  loading: boolean;
  error: string | null;
  currentReturn: ReturnItem | null;
}

const initialState: ReturnState = {
  returns: [],
  loading: false,
  error: null,
  currentReturn: null,
};

// Async thunk for creating a return
export const createReturn = createAsyncThunk<
  ReturnItem,
  CreateReturnRequest,
  { rejectValue: string }
>("returns/createReturn", async (returnData, { rejectWithValue }) => {
  try {
    console.log("🚀 Sending return data to backend:", JSON.stringify(returnData, null, 2));
    const response = await apiClient.post("/sales/returns", returnData);
    console.log("✅ Return creation response:", JSON.stringify(response.data, null, 2));
    return response.data.data || response.data;
  } catch (error: any) {
    console.error("❌ Return creation error:", error);
    return rejectWithValue(
      error.response?.data?.message || "Failed to create return"
    );
  }
});

// Async thunk for fetching returns
export const fetchReturns = createAsyncThunk<
  ReturnItem[],
  { 
    storeId: string; 
    page?: number; 
    limit?: number;
  },
  { rejectValue: string }
>("returns/fetchReturns", async ({ 
  storeId, 
  page = 1, 
  limit = 20
}, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams({
      storeId,
      page: page.toString(),
      limit: limit.toString(),
    });

    console.log("Fetching returns with params:", params.toString());
    
    const response = await apiClient.get(`/returns/list?${params.toString()}`);
    console.log("📊 Returns API response:", JSON.stringify(response.data, null, 2));
    
    const returnsData = response.data?.data?.returns || response.data?.returns || response.data?.data || response.data;
    
    if (!Array.isArray(returnsData)) {
      throw new Error("Invalid returns data format");
    }
    
    return returnsData;
  } catch (error: any) {
    console.error("❌ Error fetching returns:", error);
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch returns"
    );
  }
});

// Async thunk for fetching a single return
export const fetchReturnById = createAsyncThunk<
  ReturnItem,
  string,
  { rejectValue: string }
>("returns/fetchReturnById", async (returnId, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(`/returns/${returnId}`);
    return response.data.data || response.data;
  } catch (error: any) {
    console.error("❌ Error fetching return:", error);
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch return"
    );
  }
});

// Async thunk for updating a return
export const updateReturn = createAsyncThunk<
  ReturnItem,
  { id: string; returnData: Partial<CreateReturnRequest> },
  { rejectValue: string }
>("returns/updateReturn", async ({ id, returnData }, { rejectWithValue }) => {
  try {
    const response = await apiClient.put(`/returns/${id}`, returnData);
    return response.data.data || response.data;
  } catch (error: any) {
    console.error("❌ Error updating return:", error);
    return rejectWithValue(
      error.response?.data?.message || "Failed to update return"
    );
  }
});

// Async thunk for deleting a return
export const deleteReturn = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("returns/deleteReturn", async (returnId, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/returns/${returnId}`);
    return returnId;
  } catch (error: any) {
    console.error("❌ Error deleting return:", error);
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete return"
    );
  }
});

const returnSlice = createSlice({
  name: "returns",
  initialState,
  reducers: {
    clearReturns: (state) => {
      state.returns = [];
      state.currentReturn = null;
    },
    clearCurrentReturn: (state) => {
      state.currentReturn = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create return
      .addCase(createReturn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReturn.fulfilled, (state, action) => {
        state.loading = false;
        state.returns.push(action.payload);
        state.currentReturn = action.payload;
      })
      .addCase(createReturn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch returns
      .addCase(fetchReturns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReturns.fulfilled, (state, action) => {
        state.loading = false;
        state.returns = action.payload;
      })
      .addCase(fetchReturns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch return by ID
      .addCase(fetchReturnById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReturnById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReturn = action.payload;
      })
      .addCase(fetchReturnById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update return
      .addCase(updateReturn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReturn.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.returns.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.returns[index] = action.payload;
        }
        state.currentReturn = action.payload;
      })
      .addCase(updateReturn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete return
      .addCase(deleteReturn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReturn.fulfilled, (state, action) => {
        state.loading = false;
        state.returns = state.returns.filter(r => r.id !== action.payload);
        if (state.currentReturn?.id === action.payload) {
          state.currentReturn = null;
        }
      })
      .addCase(deleteReturn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearReturns,
  clearCurrentReturn,
  clearError,
} = returnSlice.actions;

export default returnSlice.reducer;
