import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../services/api";

// Types for the return API
export interface ReturnItem {
  id: string;
  saleId: string;
  productId: string;
  pluUpc: string;
  quantity: number;
  returnCategory: "SALEABLE" | "NON_SALEABLE" | "SCRAP";
  reason: string;
  processedBy: string;
  createdAt: string;
  updatedAt: string;
  sale?: {
    id: string;
    customerId?: string;
    userId?: string;
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
    isProductReturned?: boolean;
    cashierName?: string;
    createdAt: string;
    updatedAt: string;
    fileUploadSalesId?: string | null;
    validatorId?: string | null;
    customer?: {
      id: string;
      customerName: string;
      customerAddress?: string | null;
      phoneNumber?: string;
      telephoneNumber?: string | null;
      customerMail?: string | null;
      website?: string | null;
      threshold: number;
      storeId: string;
      clientId: string;
      createdAt: string;
      updatedAt: string;
    };
    saleItems?: Array<{
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
      product?: {
        id: string;
        name: string;
        categoryId: string;
        ean?: string | null;
        pluUpc: string;
        sku?: string | null;
        itemQuantity: number;
        msrpPrice: number;
        singleItemSellingPrice: number;
        clientId: string;
        storeId: string;
        discountAmount: number;
        percentDiscount: number;
        hasVariants: boolean;
        packIds: any[];
        variants: any[];
        createdAt: string;
        updatedAt: string;
      };
    }>;
    client?: {
      id: string;
      name: string;
    };
    store?: {
      id: string;
      name: string;
    };
    user?: {
      id: string;
      firstName?: string;
      name?: string;
    };
  };
  product?: {
    id: string;
    name: string;
    categoryId: string;
    ean?: string | null;
    pluUpc: string;
    sku?: string | null;
    itemQuantity: number;
    msrpPrice: number;
    singleItemSellingPrice: number;
    clientId: string;
    storeId: string;
    discountAmount: number;
    percentDiscount: number;
    hasVariants: boolean;
    packIds: any[];
    variants: any[];
    createdAt: string;
    updatedAt: string;
  };
}

// Helper interfaces for UI display
export interface DisplayReturnItem {
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
  displayReturns: DisplayReturnItem[];
  loading: boolean;
  error: string | null;
  currentReturn: ReturnItem | null;
}

const initialState: ReturnState = {
  returns: [],
  displayReturns: [],
  loading: false,
  error: null,
  currentReturn: null,
};

// Helper function to transform API response to display format
const transformReturnForDisplay = (
  returnItem: ReturnItem
): DisplayReturnItem => {
  // Map returnCategory to status
  const statusMap: Record<string, "saleable" | "no_saleable" | "scrap"> = {
    SALEABLE: "saleable",
    NON_SALEABLE: "no_saleable",
    SCRAP: "scrap",
  };

  return {
    id: returnItem.id,
    saleId: returnItem.saleId,
    productId: returnItem.productId,
    productName: returnItem.product?.name || "Unknown Product",
    pluUpc: returnItem.pluUpc || "",
    sellingPrice: returnItem.product?.singleItemSellingPrice || 0,
    vendorPrice: returnItem.product?.msrpPrice || 0, // Using msrpPrice as vendor price
    quantity: returnItem.quantity || 0,
    returnDate: returnItem.createdAt || "",
    reason: returnItem.reason || "",
    status: statusMap[returnItem.returnCategory] || "no_saleable",
    customerInfo: returnItem.sale?.customer
      ? {
          name: returnItem.sale.customer.customerName || "Unknown Customer",
          phone:
            returnItem.sale.customer.phoneNumber ||
            returnItem.sale.customer.telephoneNumber ||
            "",
        }
      : undefined,
  };
};

// Async thunk for creating a return
export const createReturn = createAsyncThunk<
  ReturnItem,
  CreateReturnRequest,
  { rejectValue: string }
>("returns/createReturn", async (returnData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post("/sales/returns", returnData);

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
  },
  { rejectValue: string }
>("returns/fetchReturns", async ({ storeId }, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams({
      storeId,
    });

    const response = await apiClient.get(`/sales/returns?${params.toString()}`);

    // Extract the data array from the response wrapper
    const returnsData = response.data?.data || response.data;

    if (!Array.isArray(returnsData)) {
      console.error(
        "❌ Invalid returns data format. Expected array, got:",
        typeof returnsData
      );
      throw new Error("Invalid returns data format - expected array");
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
      state.displayReturns = [];
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
        state.displayReturns.push(transformReturnForDisplay(action.payload));
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
        state.displayReturns = action.payload.map(transformReturnForDisplay);
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
        const index = state.returns.findIndex(
          (r) => r.id === action.payload.id
        );
        if (index !== -1) {
          state.returns[index] = action.payload;
          state.displayReturns[index] = transformReturnForDisplay(
            action.payload
          );
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
        state.returns = state.returns.filter((r) => r.id !== action.payload);
        state.displayReturns = state.displayReturns.filter(
          (r) => r.id !== action.payload
        );
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

export const { clearReturns, clearCurrentReturn, clearError } =
  returnSlice.actions;

export default returnSlice.reducer;
