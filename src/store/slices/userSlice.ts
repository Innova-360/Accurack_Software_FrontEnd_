import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../services/api";

export type UserData = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  clientId: string;
  status: string;
  googleId: string;
  createdAt: string;
  updatedAt: string;
};

interface UserState {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  authChecked: boolean; // NEW
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
  authChecked: false, // NEW
};

export const fetchUser = createAsyncThunk<
  UserData,
  void,
  { rejectValue: string }
>("/auth/me", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get("/auth/me");
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch user"
    );
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = null;
      state.error = null;
      state.authChecked = false; // Reset on logout
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.authChecked = false;
      })
      .addCase(
        fetchUser.fulfilled,
        (state, action: PayloadAction<UserData>) => {
          state.loading = false;
          state.user = action.payload;
          state.authChecked = true; // Set after check
          if (action.payload.clientId) {
            localStorage.setItem("clientId", action.payload.clientId);
          }
          // Set auth.isAuthenticated to true
          try {
            const { store } = require("../store");
            store.dispatch({ type: "auth/setAuthenticated", payload: true });
          } catch (e) {}
        }
      )
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.authChecked = true; // Set after check
        // Set auth.isAuthenticated to false
        try {
          const { store } = require("../store");
          store.dispatch({ type: "auth/setAuthenticated", payload: false });
        } catch (e) {}
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
