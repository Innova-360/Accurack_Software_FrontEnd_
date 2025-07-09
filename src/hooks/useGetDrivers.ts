import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getDrivers, clearError, setPage } from '../store/slices/driverSlice';
import { fetchOrders, setPage as setOrderPage } from '../store/slices/orderProcessingSlice';

interface UseGetDriversResult {
  drivers: any[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  setPage: (page: number) => void;
  refetch: (page?: number, limit?: number) => void;
}

interface UseGetOrdersResult {
  orders: any[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  setPage: (page: number) => void;
  refetch: (page?: number, limit?: number) => void;
}

export const useGetDrivers = (storeId: string | undefined, autoFetch: boolean, defaultPage: number = 1, defaultLimit: number = 10): UseGetDriversResult => {
  const dispatch = useAppDispatch();
  const { drivers, loading, error, pagination } = useAppSelector((state) => state.drivers);

  useEffect(() => {
    if (storeId && autoFetch) {
      dispatch(getDrivers({ storeId, page: pagination.page || defaultPage, limit: pagination.limit || defaultLimit }));
    }
  }, [dispatch, storeId, autoFetch, pagination.page, pagination.limit, defaultPage, defaultLimit]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const refetch = useCallback((page: number = pagination.page, limit: number = pagination.limit) => {
    if (storeId) {
      dispatch(getDrivers({ storeId, page, limit }));
    }
  }, [dispatch, storeId, pagination.page, pagination.limit]);

  const handleSetPage = useCallback((page: number) => {
    dispatch(setPage(page));
  }, [dispatch]);

  return {
    drivers,
    loading,
    error,
    pagination,
    setPage: handleSetPage,
    refetch,
  };
};

export const useGetOrders = (storeId: string | undefined, autoFetch: boolean, defaultPage: number = 1, defaultLimit: number = 10): UseGetOrdersResult => {
  const dispatch = useAppDispatch();
  const { orders, loading, error, pagination } = useAppSelector((state) => state.orders);

  useEffect(() => {
    if (storeId && autoFetch) {
      dispatch(fetchOrders({ storeId, page: pagination.page || defaultPage, limit: pagination.limit || defaultLimit }));
    }
  }, [dispatch, storeId, autoFetch, pagination.page, pagination.limit, defaultPage, defaultLimit]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const refetch = useCallback((page: number = pagination.page, limit: number = pagination.limit) => {
    if (storeId) {
      dispatch(fetchOrders({ storeId, page, limit }));
    }
  }, [dispatch, storeId, pagination.page, pagination.limit]);

  const handleSetPage = useCallback((page: number) => {
    dispatch(setOrderPage(page));
  }, [dispatch]);

  return {
    orders,
    loading,
    error,
    pagination,
    setPage: handleSetPage,
    refetch,
  };
};