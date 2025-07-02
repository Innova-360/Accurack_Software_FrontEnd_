import { useState, useEffect, useCallback } from "react";
import {
  productAPI,
  type Product,
  type PaginatedProductsResponse,
} from "../services/productAPI";

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  category?: string;
}

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: any;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  fetchWithParams: (params: PaginationParams) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useProducts = (
  initialParams: PaginationParams = {}
): UseProductsResult => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [currentParams, setCurrentParams] =
    useState<PaginationParams>(initialParams);
  const [pagination, setPagination] = useState({
    page: initialParams.page || 1,
    limit: initialParams.limit || 10,
    total: 0,
    totalPages: 0,
  });

  const fetchWithParams = useCallback(async (params: PaginationParams) => {
    setLoading(true);
    setError(null);
    setCurrentParams(params);

    try {
      const response: PaginatedProductsResponse =
        await productAPI.getProducts(params);
      setProducts(response.products);
      setPagination(response.pagination);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err);
      setProducts([]);
      setPagination({
        page: params.page || 1,
        limit: params.limit || 10,
        total: 0,
        totalPages: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchWithParams(currentParams);
  }, [fetchWithParams, currentParams]);

  // Initial fetch
  useEffect(() => {
    fetchWithParams(initialParams);
  }, []); // Remove initialParams from dependency to prevent infinite re-renders

  return {
    products,
    loading,
    error,
    pagination,
    fetchWithParams,
    refetch,
  };
};
