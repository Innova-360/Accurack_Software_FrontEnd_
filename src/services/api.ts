import axios from "axios";

// Base URL for your API
export const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

// Create axios instance with basic configuration
axios.defaults.withCredentials = true; // Enable cookies for cross-origin requests
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 80000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Simple response interceptor for basic error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized responses
    if (error.response?.status === 401) {
      // Do not clear authentication data from localStorage (removed)
      // Only handle Redux state elsewhere
    }
    return Promise.reject(error);
  }
);

// Forgot password API function
export const forgotPassword = async (email: string) => {
  const response = await apiClient.post("/auth/forgot-password", { email });
  return response.data;
};

// Reset password API function
export const resetPassword = async (token: string, newPassword: string) => {
  const response = await apiClient.post("/auth/reset-password", {
    token,
    newPassword,
  });
  return response.data;
};

export default apiClient;
