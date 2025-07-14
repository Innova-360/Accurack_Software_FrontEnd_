import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type {
  OrderState,
  CreateOrderRequest,
  UpdateOrderRequest,
  FetchOrdersParams,
} from "../../types/orderProcessing";
import apiClient from "../../services";

const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async ({ storeId, page, limit, search = '' }: FetchOrdersParams, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/driver/orders?storeId=${storeId}&page=${page}&limit=${limit}&search=${search}`);

      if (!response.data?.data) {
        throw new Error("Failed to fetch orders");
      }

      console.log(response.data);

      return {
        orders: response.data.data.orders,
        pagination: {
          page: response.data.data.page,
          limit: response.data.data.limit,
          total: response.data.data.total,
          totalPages: response.data.data.totalPages,
        },
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch orders");
    }
  }
);

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData: CreateOrderRequest, { rejectWithValue, dispatch }) => {
    try {
      const response = await apiClient.post('/driver/order', orderData);

      if (!response.data?.data) {
        throw new Error("Failed to create order");
      }

      // Refresh orders list after creation
      await dispatch(fetchOrders({ storeId: orderData.storeId, page: 1, limit: 10 }));

      return {
        success: true,
        message: "Order created successfully",
        data: response.data.data,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create order");
    }
  }
);

export const updateOrder = createAsyncThunk(
  "orders/updateOrder",
  async (
    {
      id,
      orderData,
      storeId,
    }: { id: string; orderData: UpdateOrderRequest; storeId: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await apiClient.patch(`/driver/order/${id}`, orderData);

      if (!response.data?.data) {
        throw new Error("Failed to update order");
      }

      // Refresh orders list after update
      await dispatch(fetchOrders({ storeId, page: 1, limit: 10 }));

      return {
        success: true,
        message: "Order updated successfully",
        data: response.data.data,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update order");
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async (
    { id, storeId }: { id: string; storeId: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await apiClient.delete(`/driver/order/${id}`);

      if (!response.data?.success) {
        throw new Error("Failed to delete order");
      }

      // Refresh orders list after deletion
      await dispatch(fetchOrders({ storeId, page: 1, limit: 10 }));

      return {
        success: true,
        message: "Order deleted successfully",
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete order");
    }
  }
);

export const validateOrder = createAsyncThunk(
  "orders/validateOrder",
  async (
    { id, storeId }: { id: string; storeId: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      console.log(id)
      const response = await apiClient.post(`/driver/order/validate/${id}`, {});

      if (!response.data?.data) {
        throw new Error("Failed to validate order");
      }

      // Refresh orders list after validation
      await dispatch(fetchOrders({ storeId, page: 1, limit: 10 }));

      return {
        success: true,
        message: "Order validated successfully",
        data: response.data.data,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to validate order");
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearOrders: (state) => {
      state.orders = [];
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
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update order
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete order
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Validate order
      .addCase(validateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(validateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearOrders, setPage } = orderSlice.actions;
export default orderSlice.reducer;