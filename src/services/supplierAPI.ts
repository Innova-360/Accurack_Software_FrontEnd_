import apiClient from "./api";

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
  status: "active" | "inactive";
}

export const supplierAPI = {
  // GET /api/supplier/list
  getSuppliers: async (
    storeId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<SupplierResponse> => {
    try {
      const params: any = { storeId, page, limit };
      const response = await apiClient.get("/supplier/list", { params });

      // The response structure is: response.data.data.data.suppliers
      // We need to restructure it to match our SupplierResponse interface
      return {
        success: response.data.success,
        message: response.data.message,
        data: {
          suppliers: response.data.data.data.suppliers,
          pagination: response.data.data.data.pagination,
        },
        status: response.data.status,
        timestamp: response.data.timestamp,
      };
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      throw error;
    }
  },

  getSupplierById: async (
    id: string
  ): Promise<{ success: boolean; data: { supplier: Supplier } }> => {
    try {
      const response = await apiClient.get(`/supplier/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching supplier:", error);
      throw error;
    }
  },

  // POST /api/supplier/create
  createSupplier: async (
    supplierData: Omit<Supplier, "id">
  ): Promise<{ success: boolean; data: { supplier: Supplier } }> => {
    try {
      const response = await apiClient.post("/supplier/create", supplierData);
      return response.data;
    } catch (error) {
      console.error("Error creating supplier:", error);
      throw error;
    }
  },

  // PUT /api/supplier/:id
  updateSupplier: async (
    id: string,
    supplierData: Partial<Supplier>
  ): Promise<{ success: boolean; data: { supplier: Supplier } }> => {
    try {
      const response = await apiClient.put(`/supplier/${id}`, supplierData);
      return response.data;
    } catch (error) {
      console.error("Error updating supplier:", error);
      throw error;
    }
  },
  // DELETE /api/supplier/:id
  deleteSupplier: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete(`/supplier/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting supplier:", error);
      throw error;
    }
  },
  // DELETE ALL suppliers for a store
  deleteAllSuppliers: async (
    storeId: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const suppliersResponse = await supplierAPI.getSuppliers(
        storeId,
        1,
        1000
      );
      const suppliers = suppliersResponse.data.suppliers;

      if (suppliers.length === 0) {
        return { success: true, message: "No suppliers to delete" };
      }

      // Delete each supplier individually
      const deletePromises = suppliers.map((supplier) =>
        supplierAPI.deleteSupplier(supplier.id)
      );

      await Promise.all(deletePromises);

      return {
        success: true,
        message: `Successfully deleted ${suppliers.length} suppliers`,
      };
    } catch (error) {
      console.error("Error deleting all suppliers:", error);
      throw error;
    }
  },
};

export default supplierAPI;
