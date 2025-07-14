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
  allowance: number;
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
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: SalesState = {
  sales: [],
  currentSale: null,
  loading: false,
  error: null,
  lastCreatedSale: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  },
};

// Async thunk for creating a new sale
export const createSale = createAsyncThunk<
  SaleResponseData,
  SaleRequestData,
  { rejectValue: string }
>("sales/createSale", async (saleData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post("/sales/create", saleData);

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
  {
    sales: SaleResponseData[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  },
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
>(
  "sales/fetchSales",
  async (
    {
      storeId,
      page = 1,
      limit = 20,
      customerId,
      status,
      paymentMethod,
      dateFrom,
      dateTo,
    },
    { rejectWithValue }
  ) => {
    try {
      // Build query parameters object, only including defined values
      const params: Record<string, string | number> = {
        storeId,
        page,
        limit,
      };

      if (customerId) params.customerId = customerId;
      if (status && status !== "All") params.status = status.toUpperCase();
      if (paymentMethod && paymentMethod !== "All")
        params.paymentMethod = paymentMethod.toUpperCase();
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const response = await apiClient.get("/sales/list", {
        params,
      });

      // Handle the new response format: extract sales array from data.sales
      const responseData = response.data?.data || response.data;
      const salesData = responseData?.sales || responseData;
      const salesArray = Array.isArray(salesData) ? salesData : [];

      // Extract pagination data if available, otherwise calculate based on current data
      let paginationData;
      if (responseData?.pagination) {
        paginationData = responseData.pagination;
      } else if (responseData?.total !== undefined) {
        // If we have a total field but no pagination object
        paginationData = {
          total: responseData.total,
          page: page,
          limit: limit,
          totalPages: Math.ceil(responseData.total / limit),
        };
      } else {
        // Fallback: assume this is the full dataset if we don't have pagination info
        // This is likely wrong for server-side pagination, but we need to handle it
        paginationData = {
          total: salesArray.length, // This might be wrong, but it's our best guess
          page: page,
          limit: limit,
          totalPages: Math.ceil(salesArray.length / limit),
        };
        console.warn(
          "⚠️ No pagination metadata from backend. Falling back to client-side calculation."
        );
      }

      salesArray.forEach((sale: SaleResponseData, index: number) => {});

      return {
        sales: salesArray,
        pagination: paginationData,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch sales"
      );
    }
  }
);

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
    const response = await apiClient.put(`/sales/${saleId}`, updateData);

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
        state.sales = action.payload.sales;
        state.pagination = action.payload.pagination;
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
        const index = state.sales.findIndex(
          (sale) => sale.id === action.payload.id
        );
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
