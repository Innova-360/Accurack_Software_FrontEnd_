import axios from 'axios';

// Base URL for your API
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

// Create axios instance with basic configuration
axios.defaults.withCredentials = true; // Enable cookies for cross-origin requests
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 50000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Simple request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Simple response interceptor for basic error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Basic error handling - just clean up on 401
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
