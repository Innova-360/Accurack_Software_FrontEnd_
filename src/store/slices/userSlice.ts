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
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

export const fetchUser = createAsyncThunk<
  UserData,
  void,
  { rejectValue: string }
>("/auth/me", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get("/auth/me");
    console.log("User API response.data:", response.data.data); // <-- log the full response
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUser.fulfilled,
        (state, action: PayloadAction<UserData>) => {
          state.loading = false;
          state.user = action.payload;
          if (action.payload.clientId) {
            localStorage.setItem("clientId", action.payload.clientId);
          }
        }
      )
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
