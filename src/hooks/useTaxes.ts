import { useState, useEffect, useCallback } from "react";
import type { Tax, TaxListFilters, TaxFormData } from "../types/tax";
import { taxAPI } from "../services/taxAPI";

export const useTaxes = (initialFilters?: Partial<TaxListFilters>) => {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState<TaxListFilters>({
    search: "",
    type: "all",
    status: "all",
    sortBy: "name",
    sortOrder: "asc",
    page: 1,
    limit: 10,
    ...initialFilters,
  });

  const loadTaxes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await taxAPI.getTaxes(filters);
      setTaxes(response.taxes);
      setTotalCount(response.total);
    } catch (err) {
      setError("Failed to load taxes");
      console.error("Error loading taxes:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTaxes();
  }, [loadTaxes]);

  const updateFilters = useCallback((newFilters: Partial<TaxListFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1,
    }));
  }, []);

  const refreshTaxes = useCallback(() => {
    loadTaxes();
  }, [loadTaxes]);

  return {
    taxes,
    loading,
    error,
    totalCount,
    filters,
    updateFilters,
    refreshTaxes,
  };
};

export const useTax = (taxId?: string) => {
  const [tax, setTax] = useState<Tax | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTax = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const taxData = await taxAPI.getTax(id);
      setTax(taxData);
    } catch (err) {
      setError("Failed to load tax");
      console.error("Error loading tax:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (taxId) {
      loadTax(taxId);
    }
  }, [taxId, loadTax]);

  const refreshTax = useCallback(() => {
    if (taxId) {
      loadTax(taxId);
    }
  }, [taxId, loadTax]);

  return {
    tax,
    loading,
    error,
    refreshTax,
  };
};

export const useTaxOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTax = useCallback(
    async (taxData: TaxFormData): Promise<Tax | null> => {
      try {
        setLoading(true);
        setError(null);
        const newTax = await taxAPI.createTax(taxData);
        return newTax;
      } catch (err) {
        setError("Failed to create tax");
        console.error("Error creating tax:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateTax = useCallback(
    async (taxId: string, taxData: TaxFormData): Promise<Tax | null> => {
      try {
        setLoading(true);
        setError(null);
        const updatedTax = await taxAPI.updateTax(taxId, taxData);
        return updatedTax;
      } catch (err) {
        setError("Failed to update tax");
        console.error("Error updating tax:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteTax = useCallback(async (taxId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await taxAPI.deleteTax(taxId);
      return true;
    } catch (err) {
      setError("Failed to delete tax");
      console.error("Error deleting tax:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);
  const calculateTaxes = useCallback(
    async (context: {
      basePrice: number;
      productId?: string;
      categoryId?: string;
      customerId?: string;
      storeId?: string;
      supplierId?: string;
      region?: string;
      customerType?: string;
      quantity?: number;
      productCategory?: string;
      storeLocation?: string;
      totalAmount?: number;
    }) => {
      try {
        setLoading(true);
        setError(null);
        const results = await taxAPI.calculateTaxes(context);
        return results;
      } catch (err) {
        setError("Failed to calculate taxes");
        console.error("Error calculating taxes:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    createTax,
    updateTax,
    deleteTax,
    calculateTaxes,
  };
};
