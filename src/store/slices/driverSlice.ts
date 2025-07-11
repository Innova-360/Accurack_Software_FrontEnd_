import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Driver } from "../..//types/driver";
import apiClient from "../../services";

// Define state interface
interface DriverState {
  drivers: Driver[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Initial state
const initialState: DriverState = {
  drivers: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Async thunk to fetch drivers
export const getDrivers = createAsyncThunk(
  "drivers/getDrivers",
  async ({ storeId, page, limit }: { storeId: string; page: number; limit: number }, { rejectWithValue }) => {
    try {
      const url = `/driver/drivers?storeId=${storeId}&page=${page}&limit=${limit}`;
      const response = await apiClient.get(url);

      if (!response.data?.data) {
        if (response.status === 403) {
          throw new Error("Store not found or user not authorized");
        }
        throw new Error("Failed to fetch drivers");
      }

      return {
        drivers: response.data.data.drivers,
        pagination: {
          page: response.data.data.page,
          limit: response.data.data.limit,
          total: response.data.data.total,
          totalPages: response.data.data.totalPages,
        },
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch drivers");
    }
  }
);

// Create slice
const driverSlice = createSlice({
  name: "drivers",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDrivers: (state) => {
      state.drivers = [];
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
      .addCase(getDrivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDrivers.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = action.payload.drivers;
        state.pagination = action.payload.pagination;
      })
      .addCase(getDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearDrivers, setPage } = driverSlice.actions;
export default driverSlice.reducer;