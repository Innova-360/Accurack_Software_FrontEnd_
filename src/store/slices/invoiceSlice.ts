import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../services/api";
import type { InvoiceResponseData } from "../../types/invoice";

interface InvoiceState {
  invoices: InvoiceResponseData[];
  selectedInvoice: InvoiceResponseData | null;
  loading: boolean;
  error: string | null;
}

const initialState: InvoiceState = {
  invoices: [],
  selectedInvoice: null,
  loading: false,
  error: null,
};

// Async thunk for fetching invoices
export const fetchInvoices = createAsyncThunk<
  InvoiceResponseData[],
  {
    storeId: string;
  },
  { rejectValue: string }
>("invoices/fetchInvoices", async ({ storeId }, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(`/invoice/store/${storeId}`);
    
    // Handle different API response structures
    const data = response.data;
    
    // If data is directly an array
    if (Array.isArray(data)) {
      return data;
    }
    
    // If data has a data property that contains the array
    if (data && Array.isArray(data.data)) {
      return data.data;
    }
    
    // If data has an invoices property that contains the array
    if (data && Array.isArray(data.invoices)) {
      return data.invoices;
    }
    
    // If none of the above, return empty array to prevent errors
    console.warn("Unexpected API response structure for invoices:", data);
    return [];
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch invoices"
    );
  }
});

// Async thunk for fetching invoices
export const fetchInvoiceById = createAsyncThunk<
  InvoiceResponseData,
  {
    invoiceId: string;
  },
  { rejectValue: string }
>("invoices/fetchInvoiceById", async ({ invoiceId }, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(`/invoice/${invoiceId}`);

    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch invoices by ID"
    );
  }
});

const invoiceSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    clearInvoices(state) {
      state.invoices = [];
      state.error = null;
    },
    clearSelectedInvoice: (state) => {
      state.selectedInvoice = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure we always set an array
        state.invoices = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong.";
      })
      // Handle fetchInvoiceById
      .addCase(fetchInvoiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchInvoiceById.fulfilled,
        (state, action: PayloadAction<InvoiceResponseData>) => {
          state.selectedInvoice = action.payload;
          state.loading = false;
        }
      )
      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch invoice by ID";
      });
  },
});

export const { clearInvoices } = invoiceSlice.actions;
export default invoiceSlice.reducer;
