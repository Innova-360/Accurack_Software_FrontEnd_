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

    return response.data;
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
        state.invoices = action.payload;
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
