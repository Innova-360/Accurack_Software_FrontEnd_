import { api } from './api';

// Generic API service for common CRUD operations
export class APIService<T = any> {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  // Get all items
  async getAll(params?: Record<string, any>): Promise<{ data: T[]; total?: number; page?: number; limit?: number }> {
    const response = await api.get(this.endpoint, { params });
    return response.data;
  }

  // Get item by ID
  async getById(id: string | number): Promise<{ data: T }> {
    const response = await api.get(`${this.endpoint}/${id}`);
    return response.data;
  }

  // Create new item
  async create(data: Partial<T>): Promise<{ data: T }> {
    const response = await api.post(this.endpoint, data);
    return response.data;
  }

  // Update item by ID
  async update(id: string | number, data: Partial<T>): Promise<{ data: T }> {
    const response = await api.put(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  // Partially update item by ID
  async patch(id: string | number, data: Partial<T>): Promise<{ data: T }> {
    const response = await api.patch(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  // Delete item by ID
  async delete(id: string | number): Promise<{ message: string }> {
    const response = await api.delete(`${this.endpoint}/${id}`);
    return response.data;
  }

  // Search items
  async search(query: string, params?: Record<string, any>): Promise<{ data: T[]; total?: number }> {
    const response = await api.get(`${this.endpoint}/search`, { 
      params: { q: query, ...params } 
    });
    return response.data;
  }
}

// Example usage - you can create specific services for your entities
export const userService = new APIService('/users');
export const productService = new APIService('/products');
export const orderService = new APIService('/orders');

// You can also create more specific services with custom methods
export class UserService extends APIService {
  constructor() {
    super('/users');
  }

  // Custom method for user-specific operations
  async getUserStats(userId: string): Promise<any> {
    const response = await api.get(`/users/${userId}/stats`);
    return response.data;
  }

  async updateUserPreferences(userId: string, preferences: any): Promise<any> {
    const response = await api.put(`/users/${userId}/preferences`, preferences);
    return response.data;
  }
}

export const customUserService = new UserService();

export default APIService;
