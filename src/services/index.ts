// Export the main API client
export { default as apiClient, api } from './api';

// Export authentication API
export { default as authAPI } from './authAPI';
export type { LoginCredentials, LoginResponse, RegisterCredentials, RegisterResponse } from './authAPI';

// Export generic API service
export { default as APIService, userService, productService, orderService, customUserService, UserService } from './genericAPI';

// Re-export everything for convenience
export * from './api';
export * from './authAPI';
export * from './genericAPI';
