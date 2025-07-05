import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { 
  OrderTrackingState, 
  OrderTrackingItem,
  VerifyOrderRequest,
  RejectOrderRequest,
  FetchTrackingOrdersParams
} from '../../types/orderTracking';

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

// Dummy data for tracking orders
const dummyTrackingOrders: OrderTrackingItem[] = [
  {
    id: 'tracking-001',
    customerId: 'customer-001',
    customerName: 'John Smith',
    status: 'pending_verification',
    paymentAmount: 250.00,
    originalPaymentAmount: 250.00,
    paymentType: 'CASH',
    driverName: 'Mike Johnson',
    isVerified: false,
    validatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    storeId: 'store-001',
  },
  {
    id: 'tracking-002',
    customerId: 'customer-002',
    customerName: 'Sarah Wilson',
    status: 'verified',
    paymentAmount: 180.00,
    originalPaymentAmount: 200.00,
    paymentType: 'CARD',
    driverName: 'David Brown',
    isVerified: true,
    verifiedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    verifiedBy: 'Admin User',
    validatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    storeId: 'store-001',
  },
  {
    id: 'tracking-003',
    customerId: 'customer-003',
    customerName: 'Robert Davis',
    status: 'under_review',
    paymentAmount: 450.00,
    originalPaymentAmount: 450.00,
    paymentType: 'BANK_TRANSFER',
    driverName: 'Chris Wilson',
    isVerified: false,
    validatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    storeId: 'store-001',
  },
  {
    id: 'tracking-004',
    customerId: 'customer-004',
    customerName: 'Emily Taylor',
    status: 'rejected',
    paymentAmount: 120.00,
    originalPaymentAmount: 120.00,
    paymentType: 'DIGITAL_WALLET',
    driverName: 'Alex Martinez',
    isVerified: false,
    validatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    storeId: 'store-001',
  },
];

// Async thunks with dummy data
export const fetchTrackingOrders = createAsyncThunk(
  'orderTracking/fetchTrackingOrders',
  async (params: FetchTrackingOrdersParams, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredOrders = [...dummyTrackingOrders];
      
      // Apply filters
      if (params.status) {
        filteredOrders = filteredOrders.filter(order => order.status === params.status);
      }
      
      if (params.paymentType) {
        filteredOrders = filteredOrders.filter(order => order.paymentType === params.paymentType);
      }
      
      if (params.isVerified !== undefined) {
        filteredOrders = filteredOrders.filter(order => order.isVerified === params.isVerified);
      }
      
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredOrders = filteredOrders.filter(order => 
          order.customerName.toLowerCase().includes(searchLower) ||
          order.driverName.toLowerCase().includes(searchLower) ||
          order.id.toLowerCase().includes(searchLower)
        );
      }
      
      const page = params.page || 1;
      const limit = params.limit || 10;
      const total = filteredOrders.length;
      const totalPages = Math.ceil(total / limit);
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
      
      return {
        orders: paginatedOrders,
        pagination: { page, limit, total, totalPages }
      };
    } catch (error: any) {
      return rejectWithValue('Failed to fetch tracking orders');
    }
  }
);

export const verifyOrder = createAsyncThunk(
  'orderTracking/verifyOrder',
  async (request: VerifyOrderRequest, { rejectWithValue, dispatch }) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find and update the order in dummy data
      const orderIndex = dummyTrackingOrders.findIndex(order => order.id === request.id);
      if (orderIndex !== -1) {
        dummyTrackingOrders[orderIndex] = {
          ...dummyTrackingOrders[orderIndex],
          status: 'verified',
          paymentAmount: request.paymentAmount,
          isVerified: true,
          verifiedAt: new Date().toISOString(),
          verifiedBy: 'Current User',
          updatedAt: new Date().toISOString(),
        };
      }
      
      // Refresh tracking orders list
      await dispatch(fetchTrackingOrders({ storeId: request.storeId }));
      
      return {
        success: true,
        message: 'Order verified successfully'
      };
    } catch (error: any) {
      return rejectWithValue('Failed to verify order');
    }
  }
);

export const rejectOrder = createAsyncThunk(
  'orderTracking/rejectOrder',
  async (request: RejectOrderRequest, { rejectWithValue, dispatch }) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find and update the order in dummy data
      const orderIndex = dummyTrackingOrders.findIndex(order => order.id === request.id);
      if (orderIndex !== -1) {
        dummyTrackingOrders[orderIndex] = {
          ...dummyTrackingOrders[orderIndex],
          status: 'rejected',
          isVerified: false,
          updatedAt: new Date().toISOString(),
        };
      }
      
      // Refresh tracking orders list
      await dispatch(fetchTrackingOrders({ storeId: request.storeId }));
      
      return {
        success: true,
        message: 'Order rejected successfully'
      };
    } catch (error: any) {
      return rejectWithValue('Failed to reject order');
    }
  }
);

// Add order to tracking (called when validate button is clicked)
export const addOrderToTracking = createAsyncThunk(
  'orderTracking/addOrderToTracking',
  async (orderData: any, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newTrackingOrder: OrderTrackingItem = {
        id: `tracking-${Date.now()}`,
        customerId: orderData.customerId,
        customerName: orderData.customerName,
        status: 'pending_verification',
        paymentAmount: orderData.paymentAmount,
        originalPaymentAmount: orderData.paymentAmount,
        paymentType: orderData.paymentType,
        driverName: orderData.driverName,
        isVerified: false,
        validatedAt: new Date().toISOString(),
        createdAt: orderData.createdAt,
        updatedAt: new Date().toISOString(),
        storeId: orderData.storeId,
      };
      
      // Add to dummy data
      dummyTrackingOrders.unshift(newTrackingOrder);
      
      return {
        success: true,
        message: 'Order moved to tracking verification',
        data: newTrackingOrder
      };
    } catch (error: any) {
      return rejectWithValue('Failed to add order to tracking');
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
      // Add order to tracking
      .addCase(addOrderToTracking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addOrderToTracking.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addOrderToTracking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearTrackingOrders, setPage } = orderTrackingSlice.actions;

// Selectors
export const selectFilteredOrdersForTracking = (state: any) => state.orderTracking.trackingOrders;

export default orderTrackingSlice.reducer;
