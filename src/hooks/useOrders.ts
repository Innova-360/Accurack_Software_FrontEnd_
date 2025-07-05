import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchOrders, clearError } from '../store/slices/orderProcessingSlice';
import type { FetchOrdersParams } from '../types/orderProcessing';

export const useOrders = (
  storeId: string | undefined, 
  options?: Partial<FetchOrdersParams> & { autoFetch?: boolean }
) => {
  const dispatch = useAppDispatch();
  const { orders, loading, error, pagination } = useAppSelector((state) => state.orders);
  
  const { autoFetch = true, ...fetchParams } = options || {};

  useEffect(() => {
    if (autoFetch && storeId) {
      const params: FetchOrdersParams = {
        storeId,
        page: 1,
        limit: 10,
        ...fetchParams,
      };
      dispatch(fetchOrders(params));
    }
  }, [dispatch, storeId, autoFetch, JSON.stringify(fetchParams)]);

  useEffect(() => {
    // Clear errors after they've been handled
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const refetch = (params?: Partial<FetchOrdersParams>) => {
    if (storeId) {
      const fetchParams: FetchOrdersParams = {
        storeId,
        page: 1,
        limit: 10,
        ...params,
      };
      dispatch(fetchOrders(fetchParams));
    }
  };

  return {
    orders,
    loading,
    error,
    pagination,
    refetch,
  };
};

export default useOrders;
