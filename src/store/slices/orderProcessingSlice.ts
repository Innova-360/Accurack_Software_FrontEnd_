import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { 
  OrderState, 
  CreateOrderRequest,
  UpdateOrderRequest,
  FetchOrdersParams
} from '../../types/orderProcessing';
import { 
  mockOrderData, 
  getFilteredOrders, 
  addMockOrder, 
  updateMockOrder, 
  deleteMockOrder 
} from '../../data/mockOrderData';

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

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params: FetchOrdersParams, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use dummy data with filtering
      const filteredOrders = getFilteredOrders(
        params.search,
        params.status,
        params.paymentType,
        undefined // driver filter handled client-side
      );
      
      // Simulate pagination
      const page = params.page || 1;
      const limit = params.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
      
      const pagination = {
        page,
        limit,
        total: filteredOrders.length,
        totalPages: Math.ceil(filteredOrders.length / limit),
      };

      return { orders: paginatedOrders, pagination };
    } catch (error: any) {
      return rejectWithValue('Failed to fetch orders');
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: CreateOrderRequest, { rejectWithValue, dispatch }) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Add order to mock data
      const newOrder = addMockOrder(orderData);
      
      // Refresh orders list after creation
      await dispatch(fetchOrders({ storeId: orderData.storeId }));
      
      return {
        success: true,
        message: 'Order created successfully',
        data: newOrder
      };
    } catch (error: any) {
      return rejectWithValue('Failed to create order');
    }
  }
);

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async ({ id, orderData, storeId }: { id: string; orderData: UpdateOrderRequest; storeId: string }, { rejectWithValue, dispatch }) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update order in mock data
      const updatedOrder = updateMockOrder(id, orderData);
      
      if (!updatedOrder) {
        throw new Error('Order not found');
      }
      
      // Refresh orders list after update
      await dispatch(fetchOrders({ storeId }));
      
      return {
        success: true,
        message: 'Order updated successfully',
        data: updatedOrder
      };
    } catch (error: any) {
      return rejectWithValue('Failed to update order');
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async ({ id, storeId }: { id: string; storeId: string }, { rejectWithValue, dispatch }) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Delete order from mock data
      const success = deleteMockOrder(id);
      
      if (!success) {
        throw new Error('Order not found');
      }
      
      // Refresh orders list after deletion
      await dispatch(fetchOrders({ storeId }));
      
      return {
        success: true,
        message: 'Order deleted successfully'
      };
    } catch (error: any) {
      return rejectWithValue('Failed to delete order');
    }
  }
);

export const validateOrder = createAsyncThunk(
  'orders/validateOrder',
  async ({ id, storeId }: { id: string; storeId: string }, { rejectWithValue, dispatch }) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find and validate the order
      const validatedOrder = updateMockOrder(id, { 
        isValidated: true,
        validatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      if (!validatedOrder) {
        throw new Error('Order not found');
      }
      
      // Refresh orders list after validation
      await dispatch(fetchOrders({ storeId }));
      
      return {
        success: true,
        message: 'Order validated successfully',
        data: validatedOrder
      };
    } catch (error: any) {
      return rejectWithValue('Failed to validate order');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
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
