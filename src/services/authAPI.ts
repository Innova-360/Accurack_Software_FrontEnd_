import { api } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

// Authentication API calls
export const authAPI = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  // Register user
  register: async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', credentials);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // Refresh token
  refreshToken: async (): Promise<{ token: string }> => {
    const response = await api.post<{ token: string }>('/auth/refresh');
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<{ user: LoginResponse['user'] }> => {
    const response = await api.get<{ user: LoginResponse['user'] }>('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: Partial<LoginResponse['user']>): Promise<{ user: LoginResponse['user'] }> => {
    const response = await api.put<{ user: LoginResponse['user'] }>('/auth/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.put('/auth/change-password', data);
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (data: { token: string; password: string }): Promise<void> => {
    await api.post('/auth/reset-password', data);
  },
};

export default authAPI;
