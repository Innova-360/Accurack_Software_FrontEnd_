import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../services/api";

// Types for the sales API
export interface SaleItem {
  id?: string;
  saleId?: string;
  productId: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  totalPrice: number;
  pluUpc: string;
  createdAt?: string;
  updatedAt?: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    category: {
      id: string;
      name: string;
      code: string;
      description: string;
      parentId: string | null;
      createdAt: string;
      updatedAt: string;
    };
  };
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
  paymentMethod: "CASH" | "CARD" | "DIGITAL";
  totalAmount: number;
  tax: number;
  cashierName: string;
  generateInvoice: boolean;
  source: string;
  saleItems: SaleItem[];
}

export interface Customer {
  id: string;
  customerName: string;
  customerAddress: string;
  phoneNumber: string;
  telephoneNumber: string;
  customerMail: string;
  website: string | null;
  threshold: number;
  storeId: string;
  clientId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
}

export interface SaleResponseData {
  id: string;
  customerId: string;
  userId: string;
  storeId: string;
  clientId: string;
  paymentMethod: string;
  totalAmount: number;
  confirmation: string;
  quantitySend: number;
  allowance: number;
  source: string;
  tax: number;
  status: string;
  generateInvoice: boolean;
  cashierName: string;
  createdAt: string;
  updatedAt: string;
  fileUploadSalesId: string | null;
  customer: Customer;
  saleItems: SaleItem[];
  user: User;
  invoices: any[];
  returns: any[];
  // Legacy fields for backward compatibility
  transactionId?: string;
  customerPhone?: string;
  customerData?: any;
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
    console.log("Sending sale data:", saleData);
    const response = await apiClient.post("/sales/create", saleData);
    console.log("Sale response:", response);
    return response.data.data || response.data;
  } catch (error: any) {
    console.error("Sale creation error:", error);
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
    console.log("Sales API response:", response.data);
    // Handle the new response format: extract sales array from data.sales
    const salesData = response.data?.data?.sales || response.data?.sales || response.data?.data || response.data;
    return Array.isArray(salesData) ? salesData : [];
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
