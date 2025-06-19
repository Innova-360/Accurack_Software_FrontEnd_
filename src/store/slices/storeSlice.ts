import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Store, StoreFormData, StoreState } from '../../types/store';
import apiClient from '../../services/api';

const initialState: StoreState = {
  stores: [],
  currentStore: null,
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchStores = createAsyncThunk(
  'stores/fetchStores',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/stores');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stores');
    }
  }
);

export const createStore = createAsyncThunk(
  'stores/createStore',
  async (storeData: StoreFormData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/stores', storeData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create store');
    }
  }
);

export const updateStore = createAsyncThunk(
  'stores/updateStore',
  async ({ id, storeData }: { id: string; storeData: StoreFormData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/stores/${id}`, storeData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update store');
    }
  }
);

export const deleteStore = createAsyncThunk(
  'stores/deleteStore',
  async (storeId: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/stores/${storeId}`);
      return storeId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete store');
    }
  }
);

export const storeSlice = createSlice({
  name: 'stores',
  initialState,
  reducers: {
    setCurrentStore: (state, action: PayloadAction<Store>) => {
      state.currentStore = action.payload;
      localStorage.setItem('selectedStore', JSON.stringify(action.payload));
    },
    clearCurrentStore: (state) => {
      state.currentStore = null;
      localStorage.removeItem('selectedStore');
    },
    clearError: (state) => {
      state.error = null;
    },
    loadCurrentStoreFromStorage: (state) => {
      const storedStore = localStorage.getItem('selectedStore');
      if (storedStore) {
        try {
          state.currentStore = JSON.parse(storedStore);
        } catch (error) {
          console.error('Failed to parse stored store:', error);
          localStorage.removeItem('selectedStore');
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stores
      .addCase(fetchStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.loading = false;
        state.stores = action.payload;
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create store
      .addCase(createStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStore.fulfilled, (state, action) => {
        state.loading = false;
        state.stores.push(action.payload);
      })
      .addCase(createStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update store
      .addCase(updateStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStore.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.stores.findIndex(store => store.id === action.payload.id);
        if (index !== -1) {
          state.stores[index] = action.payload;
        }
        // Update current store if it's the one being updated
        if (state.currentStore?.id === action.payload.id) {
          state.currentStore = action.payload;
          localStorage.setItem('selectedStore', JSON.stringify(action.payload));
        }
      })
      .addCase(updateStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete store
      .addCase(deleteStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStore.fulfilled, (state, action) => {
        state.loading = false;
        state.stores = state.stores.filter(store => store.id !== action.payload);
        // Clear current store if it's the one being deleted
        if (state.currentStore?.id === action.payload) {
          state.currentStore = null;
          localStorage.removeItem('selectedStore');
        }
      })
      .addCase(deleteStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentStore, clearCurrentStore, clearError, loadCurrentStoreFromStorage } = storeSlice.actions;

export default storeSlice.reducer;
