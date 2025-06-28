import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import apiClient from "../../services/api";

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('authToken'),
  isAuthenticated: !!localStorage.getItem('authToken'),
  loading: false,
  error: null,
};

// Simple async thunks using apiClient directly
export const loginUser = createAsyncThunk(
  "/auth/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post("/auth/login", credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const registerUser = createAsyncThunk(
  "/auth/signup/super-admin",
  async (
    userData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post("/auth/signup/super-admin", {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const createClientWithAdmin = createAsyncThunk(
  "/auth/create-client-with-admin",
  async (
    userData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      companyName: string;
      companyEmail: string;
      companyPhone: string;
      companyAddress: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post("/auth/create-client-with-admin", {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        companyName: userData.companyName,
        companyEmail: userData.companyEmail,
        companyPhone: userData.companyPhone,
        companyAddress: userData.companyAddress,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Client registration failed"
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post("/auth/logout");
      localStorage.removeItem("authToken");
      return null;
    } catch (error: any) {
      localStorage.removeItem("authToken");
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

export const googleAuth = createAsyncThunk(
  "/auth/google",
  async (_, { rejectWithValue }) => {
    try {
      // For Google OAuth, we need to redirect to the auth URL
      // Instead of making an API call, we construct the redirect URL
      const baseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";
      const redirectUrl = `${baseUrl}/auth/google`;

      // Redirect to Google OAuth
      window.location.href = redirectUrl;

      // Return a success response since we're redirecting
      return { redirectUrl, message: "Redirecting to Google OAuth..." };
    } catch (error: any) {
      return rejectWithValue(error.message || "Google authentication failed");
    }
  }
);

export const googleAuthCallback = createAsyncThunk(
  "/auth/google/callback",
  async (
    callbackData: { code?: string; state?: string; [key: string]: any },
    { rejectWithValue }
  ) => {
    try {
      // Create a one-time axios instance without credentials for the callback
      const baseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";
      const response = await axios.post(
        `${baseUrl}/auth/google/callback`,
        callbackData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          withCredentials: false, // Don't send credentials for this request
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Google authentication callback failed"
      );
    }
  }
);


export const verifyOtp = createAsyncThunk(
  "/auth/verify-otp",
  async (otpData: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/auth/verify-otp", otpData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "OTP operation failed"
      );
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem("authToken", action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("authToken");
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem("authToken", action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem("authToken", action.payload.token);
      })      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Client with Admin
      .addCase(createClientWithAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClientWithAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem("authToken", action.payload.token);
      })
      .addCase(createClientWithAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Still logout on error
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Google Auth
      .addCase(googleAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleAuth.fulfilled, (state) => {
        state.loading = false;
        // Google auth typically returns a redirect URL or similar
        // Handle based on your API response structure
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Google Auth Callback
      .addCase(googleAuthCallback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleAuthCallback.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem("authToken", action.payload.token);
      })
      .addCase(googleAuthCallback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        // Handle OTP verification success - this might complete registration
        if (action.payload.user && action.payload.token) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          localStorage.setItem("authToken", action.payload.token);
        }
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, setToken, clearError, logout } = authSlice.actions;
export default authSlice.reducer;