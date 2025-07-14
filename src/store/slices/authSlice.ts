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
  verifyLoading: boolean;
  resendLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  verifyLoading: false,
  resendLoading: false,
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
      console.log("🚀 API call to create-client-with-admin starting...");
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
      console.log("✅ API call successful:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ API call failed:", error);

      // Handle different types of errors
      let errorMessage = "Client registration failed";

      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        errorMessage =
          "Unable to connect to server. Please check if the backend is running on port 4000.";
      } else if (error.message?.includes("CORS")) {
        errorMessage =
          "CORS error: Backend needs to allow requests from your current port (5175). Please check backend CORS configuration.";
      } else if (error.response?.status === 404) {
        errorMessage =
          "API endpoint not found. Please verify the backend route exists.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please check backend logs.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.error("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: errorMessage,
        code: error.code,
        originalError: error,
      });
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post("/auth/logout");
      return null;
    } catch (error: any) {
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
  async (otpData: { email: string; otp?: string }, { rejectWithValue }) => {
    try {
      const requestData: { email: string; otp?: string } = {
        email: otpData.email,
      };

      if (otpData.otp) {
        console.log("🔐 Verifying OTP for email:", otpData.email);
        requestData.otp = otpData.otp;
      } else {
        console.log("📤 Sending OTP to email:", otpData.email);
      }
      const response = await apiClient.post("/auth/verify-otp", requestData);
      console.log("✅ OTP operation successful:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ OTP operation failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "OTP operation failed";
      return rejectWithValue(errorMessage);
    }
  }
);

export const resendOtp = createAsyncThunk(
  "/auth/resend-otp",
  async (email: string, { rejectWithValue }) => {
    try {
      console.log("📤 Resending OTP to email:", email);
      const response = await apiClient.post("/auth/resend-otp", { email });
      console.log("✅ OTP resent successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Resend OTP failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to resend OTP";
      return rejectWithValue(errorMessage);
    }
  }
);

// Forgot password async thunk
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send reset email"
      );
    }
  }
);

// Reset password async thunk
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    { token, password }: { token: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post("/auth/reset-password", {
        token,
        password,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reset password"
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
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
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
      })
      .addCase(registerUser.rejected, (state, action) => {
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
        // Don't authenticate user immediately after signup
        // User needs to verify OTP first
        // Just store user email for OTP verification
        if (action.payload.user && action.payload.user.email) {
        }
      })
      .addCase(createClientWithAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        // Reset user slice as well
        try {
          const { store } = require("../store");
          store.dispatch({ type: "user/clearUser" });
        } catch (e) {}
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Still logout on error
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        // Reset user slice as well
        try {
          const { store } = require("../store");
          store.dispatch({ type: "user/clearUser" });
        } catch (e) {}
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
      })
      .addCase(googleAuthCallback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.verifyLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.verifyLoading = false;
        // Handle OTP verification success - this might complete registration
        if (action.payload.user && action.payload.token) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.verifyLoading = false;
        state.error = action.payload as string;
      })
      // Resend OTP
      .addCase(resendOtp.pending, (state) => {
        state.resendLoading = true;
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.resendLoading = false;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.resendLoading = false;
        state.error = action.payload as string;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setUser,
  setToken,
  clearError,
  logout,
  setAuthenticated,
} = authSlice.actions;
export default authSlice.reducer;
