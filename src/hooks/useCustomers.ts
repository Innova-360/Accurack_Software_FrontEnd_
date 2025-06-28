import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCustomers, clearError } from '../store/slices/customerSlice';

export const useCustomers = (storeId: string | undefined, options?: {
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}) => {
  const dispatch = useAppDispatch();
  const { customers, loading, error, pagination } = useAppSelector((state) => state.customers);
  
  const { page = 1, limit = 10, autoFetch = true } = options || {};

  useEffect(() => {
    if (autoFetch && storeId) {
      dispatch(fetchCustomers({ storeId, page, limit }));
    }
  }, [dispatch, storeId, page, limit, autoFetch]);

  useEffect(() => {
    // Clear errors after they've been handled
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const refetch = () => {
    if (storeId) {
      dispatch(fetchCustomers({ storeId, page, limit }));
    }
  };

  return {
    customers,
    loading,
    error,
    pagination,
    refetch,
  };
};

export default useCustomers;
