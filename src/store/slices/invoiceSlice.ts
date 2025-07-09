import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../services/api";
import type { InvoiceResponseData } from "../../types/invoice";


interface InvoiceState {
  invoices: InvoiceResponseData[];
  loading: boolean;
  error: string | null;
}

const initialState: InvoiceState = {
  invoices: [],
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
>("invoices/fetchInvoices", async ({ 
  storeId, 
}, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(`/invoice/store/${storeId}`);
    console.log("Invoice API response:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch sales"
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong.";
      });
  },
});

export const { clearInvoices } = invoiceSlice.actions;
export default invoiceSlice.reducer;