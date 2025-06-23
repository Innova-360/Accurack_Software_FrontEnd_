import apiClient from './api';

export interface SupplierResponse {
  success: boolean;
  message: string;
  data: {
    suppliers: Supplier[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  status: number;
  timestamp: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  storeId: string;
  status: 'active' | 'inactive';
}

export const supplierAPI = {
  // GET /api/supplier/list
  getSuppliers: async (
    storeId: string,
    page: number = 1,
    limit?: number
  ): Promise<SupplierResponse> => {
    try {
      const params: any = { storeId, page };
      if (limit) params.limit = limit;
      const response = await apiClient.get('/supplier/list', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  },

  // GET /api/suppliers/:id
  getSupplierById: async (id: string): Promise<{ success: boolean; data: { supplier: Supplier } }> => {
    try {
      const response = await apiClient.get(`/suppliers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching supplier:', error);
      throw error;
    }
  },

  // POST /api/suppliers
  createSupplier: async (supplierData: Omit<Supplier, 'id'>): Promise<{ success: boolean; data: { supplier: Supplier } }> => {
    try {
      const response = await apiClient.post('/suppliers', supplierData);
      return response.data;
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  },

  // PUT /api/suppliers/:id
  updateSupplier: async (id: string, supplierData: Partial<Supplier>): Promise<{ success: boolean; data: { supplier: Supplier } }> => {
    try {
      const response = await apiClient.put(`/suppliers/${id}`, supplierData);
      return response.data;
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }
  },

  // DELETE /api/suppliers/:id
  deleteSupplier: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete(`/suppliers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }
  }
};

export default supplierAPI;
