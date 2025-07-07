import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import apiClient from "../../services/api";

interface BusinessDetails {
  businessName: string;
  contactNo: string;
  website: string;
  address: string;
  logoUrl?: string;
}

interface BusinessState {
  businessDetails: BusinessDetails | null;
  loading: boolean;
  error: string | null;
}

const initialState: BusinessState = {
  businessDetails: null,
  loading: false,
  error: null,
};

export const fetchBusinessDetails = createAsyncThunk(
  "business/fetchBusinessDetails",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/invoice/get-business/details");
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch business details"
      );
    }
  }
);

export const setBusinessDetails = createAsyncThunk(
  "business/setBusinessDetails",
  async (businessData: BusinessDetails, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/invoice/set-business/details", businessData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to set business details"
      );
    }
  }
);

export const businessSlice = createSlice({
  name: "business",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearBusinessDetails: (state) => {
      state.businessDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch business details
      .addCase(fetchBusinessDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusinessDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.businessDetails = action.payload;
      })
      .addCase(fetchBusinessDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Set business details
      .addCase(setBusinessDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setBusinessDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.businessDetails = action.payload;
      })
      .addCase(setBusinessDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearBusinessDetails } = businessSlice.actions;

export default businessSlice.reducer;