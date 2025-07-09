import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { 
  OrderTrackingState, 
  OrderTrackingItem,
  VerifyOrderRequest,
  RejectOrderRequest,
  FetchTrackingOrdersParams,
} from '../../types/orderTracking';
import axios from 'axios';

const initialState: OrderTrackingState = {
  trackingOrders: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export const fetchTrackingOrders = createAsyncThunk(
  'orderTracking/fetchTrackingOrders',
  async (params: FetchTrackingOrdersParams, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/validator/orders`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          storeId: params.storeId,
        },
      });

      console.log(response);

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
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tracking orders');
    }
  }
);

export const verifyOrder = createAsyncThunk(
  'orderTracking/verifyOrder',
  async (request: VerifyOrderRequest, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.patch(`${import.meta.env.VITE_API_URL}/validator/orders/validate/${request.id}`);

      // Refresh tracking orders list
      await dispatch(fetchTrackingOrders({ storeId: request.storeId }));

      return {
        success: true,
        message: 'Order verified successfully',
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify order');
    }
  }
);

export const rejectOrder = createAsyncThunk(
  'orderTracking/rejectOrder',
  async (request: RejectOrderRequest, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.patch(`${import.meta.env.VITE_API_URL}/validator/orders/reject/${request.id}`);

      // Refresh tracking orders list
      await dispatch(fetchTrackingOrders({ storeId: request.storeId }));

      return {
        success: true,
        message: 'Order rejected successfully',
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject order');
    }
  }
);

export const updatePayment = createAsyncThunk(
  'orderTracking/updatePayment',
  async (request: any, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.patch(`${import.meta.env.VITE_API_URL}/validator/orders/payment`, {
        orderId: request.orderId,
        paymentAmount: request.paymentAmount,
        paymentType: request.paymentType
      });

      // Refresh tracking orders list
      await dispatch(fetchTrackingOrders({ storeId: request.storeId }));

      return {
        success: true,
        message: 'Payment updated successfully',
        order: response.data,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update payment');
    }
  }
);

const orderTrackingSlice = createSlice({
  name: 'orderTracking',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTrackingOrders: (state) => {
      state.trackingOrders = [];
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
      // Fetch tracking orders
      .addCase(fetchTrackingOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrackingOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.trackingOrders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTrackingOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Verify order
      .addCase(verifyOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(verifyOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Reject order
      .addCase(rejectOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(rejectOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update payment
      .addCase(updatePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePayment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearTrackingOrders, setPage } = orderTrackingSlice.actions;

// Selectors
export const selectFilteredOrdersForTracking = (state: any) => state.orderTracking.trackingOrders;

export default orderTrackingSlice.reducer;