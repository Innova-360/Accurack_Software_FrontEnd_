import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../services/api";

// Types for the sales API
export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  totalPrice: number;
  pluUpc: string;
}

export interface SaleRequestData {
  customerPhone: string;
  customerData: {
    customerName: string;
    customerAddress: string;
    phoneNumber: string;
    telephoneNumber: string;
    customerMail: string;
    storeId: string;
    clientId: string;
  };
  storeId: string;
  clientId: string;
  paymentMethod: "CASH" | "CARD" | "BANK_TRANSFER" | "CHECK" | "DIGITAL_WALLET";
  totalAmount: number;
  tax: number;
  cashierName: string;
  generateInvoice: boolean;
  source: string;
  status?: string;
  saleItems: SaleItem[];
}

export interface SaleResponseData {
  id: string;
  transactionId: string;
  customerPhone: string;
  customerData: any;
  customer?: any;
  storeId: string;
  clientId: string;
  paymentMethod: string;
  totalAmount: number;
  tax: number;
  cashierName: string;
  generateInvoice: boolean;
  source: string;
  status?: string;
  saleItems: SaleItem[];
  createdAt: string;
  updatedAt: string;
}

interface SalesState {
  sales: SaleResponseData[];
  currentSale: SaleResponseData | null;
  loading: boolean;
  error: string | null;
  lastCreatedSale: SaleResponseData | null;
}

const initialState: SalesState = {
  sales: [],
  currentSale: null,
  loading: false,
  error: null,
  lastCreatedSale: null,
};

// Async thunk for creating a new sale
export const createSale = createAsyncThunk<
  SaleResponseData,
  SaleRequestData,
  { rejectValue: string }
>("sales/createSale", async (saleData, { rejectWithValue }) => {
  try {
    console.log("🚀 Sending sale data to backend:", JSON.stringify(saleData, null, 2));
    const response = await apiClient.post("/sales/create", saleData);
    console.log("✅ Sale creation response:", JSON.stringify(response.data, null, 2));
    return response.data.data || response.data;
  } catch (error: any) {
    console.error("❌ Sale creation error:", error);
    return rejectWithValue(
      error.response?.data?.message || "Failed to create sale"
    );
  }
});


// Async thunk for fetching sales
export const fetchSales = createAsyncThunk<
  SaleResponseData[],
  { 
    storeId: string; 
    page?: number; 
    limit?: number;
    customerId?: string;
    status?: string;
    paymentMethod?: string;
    dateFrom?: string;
    dateTo?: string;
  },
  { rejectValue: string }
>("sales/fetchSales", async ({ 
  storeId, 
  page = 1, 
  limit = 20,
  customerId,
  status,
  paymentMethod,
  dateFrom,
  dateTo
}, { rejectWithValue }) => {
  try {
    // Build query parameters object, only including defined values
    const params: any = { 
      storeId, 
      page,
      limit
    };
    
    if (customerId) params.customerId = customerId;
    if (status && status !== "All") params.status = status.toUpperCase();
    if (paymentMethod && paymentMethod !== "All") params.paymentMethod = paymentMethod.toUpperCase();
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    console.log("Fetching sales with params:", params);
    
    const response = await apiClient.get("/sales/list", {
      params
    });
    console.log("📊 Sales API response:", JSON.stringify(response.data, null, 2));
    // Handle the new response format: extract sales array from data.sales
    const salesData = response.data?.data?.sales || response.data?.sales || response.data?.data || response.data;
    const salesArray = Array.isArray(salesData) ? salesData : [];
    
    // Debug: Log the status of each sale
    salesArray.forEach((sale: any, index: number) => {
      console.log(`🔍 Sale ${index + 1} status:`, sale.status, `(type: ${typeof sale.status})`);
    });
    
    return salesArray;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch sales"
    );
  }
});

// Async thunk for fetching sale by ID
export const fetchSaleById = createAsyncThunk<
  SaleResponseData,
  string,
  { rejectValue: string }
>("sales/fetchSaleById", async (saleId, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(`/sales/${saleId}`);
    return response.data.data || response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch sale"
    );
  }
});

// Async thunk for updating a sale
export const updateSale = createAsyncThunk<
  SaleResponseData,
  {
    saleId: string;
    updateData: {
      paymentMethod: string;
      status: string;
      totalAmount: number;
      tax: number;
      cashierName: string;
    };
  },
  { rejectValue: string }
>("sales/updateSale", async ({ saleId, updateData }, { rejectWithValue }) => {
  try {
    console.log("🚀 Updating sale:", saleId, "with data:", updateData);
    const response = await apiClient.put(`/sales/${saleId}`, updateData);
    console.log("✅ Sale update response:", response.data);
    return response.data.data || response.data;
  } catch (error: any) {
    console.error("❌ Sale update error:", error);
    return rejectWithValue(
      error.response?.data?.message || "Failed to update sale"
    );
  }
});

const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    clearSales: (state) => {
      state.sales = [];
      state.currentSale = null;
      state.lastCreatedSale = null;
    },
    clearCurrentSale: (state) => {
      state.currentSale = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearLastCreatedSale: (state) => {
      state.lastCreatedSale = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create sale
      .addCase(createSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.loading = false;
        state.sales.push(action.payload);
        state.lastCreatedSale = action.payload;
        state.error = null;
      })
      .addCase(createSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch sales
      .addCase(fetchSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload;
        state.error = null;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch sale by ID
      .addCase(fetchSaleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSaleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSale = action.payload;
        state.error = null;
      })
      .addCase(fetchSaleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update sale
      .addCase(updateSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSale.fulfilled, (state, action) => {
        state.loading = false;
        // Update the sale in the sales array
        const index = state.sales.findIndex(sale => sale.id === action.payload.id);
        if (index !== -1) {
          state.sales[index] = action.payload;
        }
        // Update current sale if it's the same
        if (state.currentSale?.id === action.payload.id) {
          state.currentSale = action.payload;
        }
        state.error = null;
      })
      .addCase(updateSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearSales,
  clearCurrentSale,
  clearError,
  clearLastCreatedSale,
} = salesSlice.actions;

export default salesSlice.reducer;
