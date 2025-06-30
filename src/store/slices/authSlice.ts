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
  token: null,
  isAuthenticated: false,
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

export const sendOtp = createAsyncThunk(
  "/auth/send-otp",
  async (email: string, { rejectWithValue }) => {
    try {
      console.log("📤 Sending OTP to email:", email);
      const response = await apiClient.post("/auth/send-otp", { email });
      console.log("✅ OTP sent successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Failed to send OTP:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to send OTP";
      return rejectWithValue(errorMessage);
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "/auth/verify-otp",
  async (otpData: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      console.log("🔐 Verifying OTP for email:", otpData.email);
      const response = await apiClient.post("/auth/verify-otp", otpData);
      console.log("✅ OTP verified successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ OTP verification failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "OTP verification failed";
      return rejectWithValue(errorMessage);
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
    // Add new reducer to initialize from localStorage
    initializeFromLocalStorage: (state) => {
      const token = localStorage.getItem("authToken");
      const userEmail = localStorage.getItem("userEmail");

      if (token && token !== "undefined" && userEmail) {
        state.token = token;
        state.isAuthenticated = true;
        // Create a basic user object if we have the email
        state.user = {
          id: "", // We don't have ID in localStorage
          email: userEmail,
          name: userEmail.split("@")[0], // Use email prefix as name
        };
      }
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
      // Send OTP
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendOtp.rejected, (state, action) => {
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

export const {
  setUser,
  setToken,
  clearError,
  logout,
  initializeFromLocalStorage,
} = authSlice.actions;
export default authSlice.reducer;
