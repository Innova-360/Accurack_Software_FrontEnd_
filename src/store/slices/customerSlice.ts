import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  Customer,
  CustomerFormData,
  CustomerState,
} from "../../types/customer";
import apiClient from "../../services/api";

const initialState: CustomerState = {
  customers: [],
  currentCustomer: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks for API calls
export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async (
    {
      storeId,
      page = 1,
      limit = 10,
    }: { storeId: string | undefined; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      if (storeId) params.append("storeId", storeId);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const url = `/sales/customers?${params.toString()}`;
      const response = await apiClient.get(url);

      // Handle different response structures from backend
      let customers = [];
      let pagination = {
        page,
        limit,
        total: 0,
        totalPages: 0,
      };

      if (response.data) {
        if (Array.isArray(response.data)) {
          customers = response.data;
          pagination.total = customers.length;
          pagination.totalPages = Math.ceil(customers.length / limit);
        } else if (
          response.data.data &&
          response.data.data.customers &&
          Array.isArray(response.data.data.customers)
        ) {
          customers = response.data.data.customers;
          if (response.data.data.pagination) {
            pagination = { ...pagination, ...response.data.data.pagination };
          } else {
            pagination.total = customers.length;
            pagination.totalPages = Math.ceil(customers.length / limit);
          }
        } else if (response.data.data && Array.isArray(response.data.data)) {
          customers = response.data.data;
          if (response.data.pagination) {
            pagination = { ...pagination, ...response.data.pagination };
          } else {
            pagination.total = customers.length;
            pagination.totalPages = Math.ceil(customers.length / limit);
          }
        } else if (
          response.data.customers &&
          Array.isArray(response.data.customers)
        ) {
          customers = response.data.customers;
          if (response.data.pagination) {
            pagination = { ...pagination, ...response.data.pagination };
          } else {
            pagination.total = customers.length;
            pagination.totalPages = Math.ceil(customers.length / limit);
          }
        } else if (response.data.data.data.customers) {
          customers = response.data.data.data.customers;
          if (response.data.data.data.pagination) {
            pagination = {
              ...pagination,
              ...response.data.data.data.pagination,
            };
          } else {
            pagination.total = customers.length;
            pagination.totalPages = Math.ceil(customers.length / limit);
          }
        }
      }

      console.log("customers:", customers);
      console.log("pagination:", pagination);

      return { customers, pagination };
    } catch (error) {
      console.error("Fetch customers error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch customers"
      );
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  "customers/fetchCustomerById",
  async (customerId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/sales/customers/${customerId}`);
      // Try to extract customer data, fallback to null if not found
      const customer = response.data?.data ?? response.data?.customer ?? null;
      return customer;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch customer"
      );
    }
  }
);

export const createCustomer = createAsyncThunk(
  "customers/createCustomer",
  async (customerData: CustomerFormData, { rejectWithValue, dispatch }) => {
    try {
      await apiClient.post("/sales/customers", customerData);
      // Refresh customers list after creation
      await dispatch(fetchCustomers({ storeId: customerData.storeId }));

      return { success: true, message: "Customer created successfully" };
    } catch (error: any) {
      console.error("Create customer error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to create customer"
      );
    }
  }
);

export const updateCustomer = createAsyncThunk(
  "customers/updateCustomer",
  async (
    { id, customerData }: { id: string; customerData: CustomerFormData },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await apiClient.put(`/sales/customers/${id}`, customerData);
      // Refresh customers list after update
      await dispatch(fetchCustomers({ storeId: customerData.storeId }));

      return { success: true, message: "Customer updated successfully", data: response.data };
    } catch (error: any) {
      console.error("Update customer error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update customer"
      );
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  "customers/deleteCustomer",
  async (
    { id, storeId }: { id: string; storeId: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      console.log("deleteCustomer thunk called with:", { id, storeId });

      // Basic validation
      if (!id || !id.trim()) {
        throw new Error("Customer ID is required");
      }

      if (!storeId || !storeId.trim()) {
        throw new Error("Store ID is required");
      }

      console.log("Making DELETE request to:", `/sales/customers/${id}`);

      // Use standard REST endpoint format
      const response = await apiClient.delete(`/sales/customers/${id}`);
      console.log("Delete response:", response.data);

      // Refresh customers list after deletion
      console.log("Refreshing customers list for store:", storeId);
      await dispatch(fetchCustomers({ storeId }));

      return { id, success: true, message: "Customer deleted successfully" };
    } catch (error: any) {
      console.error("Delete customer error:", error);
      console.error("Error response:", error.response?.data);

      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete customer"
      );
    }
  }
);

export const deleteAllCustomers = createAsyncThunk(
  "customers/deleteAllCustomers",
  async (storeId: string, { rejectWithValue, dispatch }) => {
    try {
      console.log("Deleting all customers for store:", storeId);
      // Get all customers for this store (use high limit to get all customers)
      const customersResponse = await dispatch(
        fetchCustomers({ storeId, page: 1, limit: 1000 })
      ).unwrap();
      const customers = Array.isArray(customersResponse.customers)
        ? customersResponse.customers
        : [];

      if (customers.length === 0) {
        return { success: true, message: "No customers to delete" };
      }

      // Delete all customers
      const deletePromises = customers.map((customer) =>
        apiClient.delete(`/sales/customers/${customer.id}`)
      );

      await Promise.all(deletePromises);

      // Refresh customers list after deletion
      await dispatch(fetchCustomers({ storeId }));

      return {
        success: true,
        message: `Successfully deleted all ${customers.length} customers`,
      };
    } catch (error: any) {
      console.error("Delete all customers error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete all customers"
      );
    }
  }
);

export const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    setCurrentCustomer: (state, action: PayloadAction<Customer>) => {
      state.currentCustomer = action.payload;
    },
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCustomers: (state) => {
      state.customers = [];
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
      // Fetch customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload.customers;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create customer
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update customer
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete customer
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete all customers
      .addCase(deleteAllCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAllCustomers.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteAllCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentCustomer,
  clearCurrentCustomer,
  clearError,
  clearCustomers,
  setPage,
} = customerSlice.actions;

export default customerSlice.reducer;
import { createApi } from '@reduxjs/toolkit/query/react';

const customBaseQuery = async (args: any) => {
  try {
    const apiClient = (await import('../../services/api')).default;
    const result = await apiClient({
      url: typeof args === 'string' ? args : args.url,
      method: args.method || 'GET',
      data: args.body,
      params: args.params,
    });
    return { data: result.data };
  } catch (axiosError: any) {
    return {
      error: {
        status: axiosError.response?.status,
        data: axiosError.response?.data || axiosError.message,
      },
    };
  }
};

export const customerApi = createApi({
  reducerPath: 'customerApi',
  baseQuery: customBaseQuery,
  tagTypes: ['Customer'],
  endpoints: (builder) => ({
    searchCustomers: builder.query<{ data: any[] }, { search: string; storeId: string }>({
      query: ({ search, storeId }) => ({
        url: '/sales/customers',
        params: { search, storeId },
      }),
      providesTags: ['Customer'],
    }),
  }),
});

export const { useSearchCustomersQuery } = customerApi;
