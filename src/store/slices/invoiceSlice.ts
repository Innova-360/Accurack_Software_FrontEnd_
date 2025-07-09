import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../services/api";
import type { AxiosError } from "axios";

// Product
interface Product {
  id: string;
  name: string;
  categoryId: string;
  ean: string | null;
  pluUpc: string;
  sku: string | null;
  itemQuantity: number;
  msrpPrice: number;
  singleItemSellingPrice: number;
  clientId: string;
  storeId: string;
  discountAmount: number;
  percentDiscount: number;
  hasVariants: boolean;
  packIds: string[];
  variants: []; // adjust if variants have a specific structure
  createdAt: string;
  updatedAt: string;
  fileUploadId: string | null;
}

// SaleItem
interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  pluUpc: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

// Sale
interface Sale {
  id: string;
  customerId: string;
  userId: string;
  validatorId: string | null;
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
  saleItems: SaleItem[];
}

// Customer
interface Customer {
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

// Business
interface Business {
  id: string;
  clientId: string;
  businessName: string;
  contactNo: string;
  website: string;
  address: string;
  logoUrl: string;
  createdAt: string;
  updatedAt: string;
}

// CustomField
interface CustomField {
  id: string;
  invoiceId: string;
  fieldName: string;
  fieldValue: string;
  createdAt: string;
  updatedAt: string;
}

// Invoice
export interface Invoice {
  id: string;
  saleId: string;
  customerId: string;
  businessId: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerMail: string;
  customerWebsite: string | null;
  customerAddress: string;
  businessName: string;
  businessContact: string;
  businessWebsite: string;
  businessAddress: string;
  shippingAddress: string;
  paymentMethod: string;
  totalAmount: number;
  netAmount: number;
  tax: number;
  status: string;
  cashierName: string;
  logoUrl: string;
  qrCode: string;
  createdAt: string;
  updatedAt: string;
  sale: Sale;
  customer: Customer;
  business: Business;
  customFields: CustomField[];
}

// Invoice State
interface InvoiceState {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
}

const initialState: InvoiceState = {
  invoices: [],
  loading: false,
  error: null,
};

// Async Thunk
export const fetchInvoicesByStore = createAsyncThunk(
  "invoice/fetchInvoicesByStore",
  async (storeId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/api/v1/invoice/store/${storeId}`);
      return response.data.data as Invoice[];
    } catch (error: unknown) {
      const err = error as AxiosError;
      const errorMessage =
        (err.response?.data && typeof err.response.data === "object" && "message" in err.response.data
          ? (err.response.data as { message?: string }).message
          : undefined) || "Failed to fetch invoices";
      return rejectWithValue(errorMessage);
    }
  }
);

// Redux Slice
export const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoicesByStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoicesByStore.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchInvoicesByStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default invoiceSlice.reducer;
