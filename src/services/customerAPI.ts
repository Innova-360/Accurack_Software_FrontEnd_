import apiClient from "./api";
import type { Customer, CustomerFormData } from "../types/customer";

export const customerAPI = {
  // Fetch all customers
  async getCustomers(params?: {
    storeId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ customers: Customer[]; pagination?: any }> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.storeId) searchParams.append("storeId", params.storeId);
      if (params?.page) searchParams.append("page", params.page.toString());
      if (params?.limit) searchParams.append("limit", params.limit.toString());

      const response = await apiClient.get(`/sales/customers?${searchParams.toString()}`);
      
      // Handle different response structures
      if (response.data?.data?.customers) {
        return {
          customers: response.data.data.customers,
          pagination: response.data.data.pagination,
        };
      } else if (response.data?.customers) {
        return {
          customers: response.data.customers,
          pagination: response.data.pagination,
        };
      } else if (Array.isArray(response.data)) {
        return {
          customers: response.data,
        };
      }
      
      return { customers: [] };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch customers");
    }
  },

  // Get customer by ID
  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const response = await apiClient.get(`/sales/customers/${id}`);
      return response.data?.data || response.data || null;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch customer");
    }
  },

  // Create a new customer
  async createCustomer(customerData: CustomerFormData): Promise<Customer> {
    try {
      const response = await apiClient.post("/sales/customers", customerData);
      return response.data?.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to create customer");
    }
  },

  // Update a customer
  async updateCustomer(id: string, customerData: CustomerFormData): Promise<Customer> {
    try {
      const response = await apiClient.put(`/sales/customers/${id}`, customerData);
      return response.data?.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to update customer");
    }
  },

  // Delete a customer
  async deleteCustomer(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/sales/customers/${id}`);
      return { success: true, message: response.data?.message || "Customer deleted successfully" };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to delete customer");
    }
  },

  // Bulk delete customers
  async deleteCustomers(ids: string[]): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post("/sales/customers/bulk-delete", { ids });
      return { success: true, message: response.data?.message || "Customers deleted successfully" };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to delete customers");
    }
  },
};

export default customerAPI;
