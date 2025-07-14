import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Store, StoreFormData, StoreState } from "../../types/store";
import apiClient from "../../services/api";

const initialState: StoreState = {
  stores: [],
  currentStore: null,
  loading: false,
  error: null,
  // Search-related state
  searchResults: [],
  searchLoading: false,
  searchError: null,
};

// Async thunks for API calls
export const fetchStores = createAsyncThunk(
  "stores/fetchStores",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/store/list");
      // Debug log
      return response.data.data; // Extract stores from response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch stores"
      );
    }
  }
);

export const createStore = createAsyncThunk(
  "stores/createStore",
  async (storeData: StoreFormData, { rejectWithValue, dispatch }) => {
    try {
      await apiClient.post("/store/create", storeData);

      // After successful creation, refetch the stores list
      // This ensures we have the most up-to-date data from the server
      await dispatch(fetchStores());

      return { success: true, message: "Store created successfully" };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create store"
      );
    }
  }
);

export const updateStore = createAsyncThunk(
  "stores/updateStore",
  async (
    { id, storeData }: { id: string; storeData: StoreFormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.put(`/store/${id}`, storeData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update store"
      );
    }
  }
);

export const deleteStore = createAsyncThunk(
  "stores/deleteStore",
  async (storeId: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/store/${storeId}`);
      return storeId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete store"
      );
    }
  }
);

// Search stores async thunk
export const searchStores = createAsyncThunk(
  "stores/searchStores",
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/store/search", {
        params: { q: query },
      });
      return response.data.data; // Extract stores from response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to search stores"
      );
    }
  }
);

export const storeSlice = createSlice({
  name: "stores",
  initialState,
  reducers: {
    setCurrentStore: (state, action: PayloadAction<Store>) => {
      state.currentStore = action.payload;
      localStorage.setItem("selectedStore", JSON.stringify(action.payload));
    },
    clearCurrentStore: (state) => {
      state.currentStore = null;
      localStorage.removeItem("selectedStore");
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchError = null;
    },
    loadCurrentStoreFromStorage: (state) => {
      const storedStore = localStorage.getItem("selectedStore");
      if (storedStore) {
        try {
          state.currentStore = JSON.parse(storedStore);
        } catch (error) {
          console.error("Failed to parse stored store:", error);
          localStorage.removeItem("selectedStore");
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
      .addCase(createStore.fulfilled, (state) => {
        state.loading = false;
        // Store creation was successful, the stores list will be updated by the fetchStores call
        // No need to manually push to the array since we're refetching from server
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
        const index = state.stores.findIndex(
          (store) => store.id === action.payload.id
        );
        if (index !== -1) {
          state.stores[index] = action.payload;
        }
        // Update current store if it's the one being updated
        if (state.currentStore?.id === action.payload.id) {
          state.currentStore = action.payload;
          localStorage.setItem("selectedStore", JSON.stringify(action.payload));
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
        state.stores = state.stores.filter(
          (store) => store.id !== action.payload
        );
        // Clear current store if it's the one being deleted
        if (state.currentStore?.id === action.payload) {
          state.currentStore = null;
          localStorage.removeItem("selectedStore");
        }
      })
      .addCase(deleteStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Search stores
      .addCase(searchStores.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchStores.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchStores.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload as string;
      });
  },
});

export const {
  setCurrentStore,
  clearCurrentStore,
  clearError,
  loadCurrentStoreFromStorage,
  clearSearchResults,
} = storeSlice.actions;

export default storeSlice.reducer;
