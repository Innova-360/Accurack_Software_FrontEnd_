import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../services/api';

interface CounterState {
  value: number;
  loading: boolean;
  error: string | null;
}

const initialState: CounterState = {
  value: 0,
  loading: false,
  error: null,
};

// Example async thunk for fetching counter value from API
export const fetchCounter = createAsyncThunk(
  'counter/fetchCounter',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/counter');
      return response.data.value;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch counter');
    }
  }
);

// Example async thunk for updating counter on server
export const updateCounter = createAsyncThunk(
  'counter/updateCounter',
  async (value: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.put('/counter', { value });
      return response.data.value;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update counter');
    }
  }
);

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    reset: (state) => {
      state.value = 0;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch counter
      .addCase(fetchCounter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCounter.fulfilled, (state, action) => {
        state.loading = false;
        state.value = action.payload;
      })
      .addCase(fetchCounter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update counter
      .addCase(updateCounter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCounter.fulfilled, (state, action) => {
        state.loading = false;
        state.value = action.payload;
      })
      .addCase(updateCounter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { increment, decrement, incrementByAmount, reset, clearError } = counterSlice.actions;
export default counterSlice.reducer;
