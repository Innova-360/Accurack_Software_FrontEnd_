import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadCurrentStoreFromStorage } from '../store/slices/storeSlice';

export const useRequireStore = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentStore } = useAppSelector((state) => state.stores);

  useEffect(() => {
    // Load store from localStorage on component mount
    dispatch(loadCurrentStoreFromStorage());
  }, [dispatch]);

  useEffect(() => {
    // If no store is selected, redirect to stores page
    if (!currentStore) {
      const timer = setTimeout(() => {
        navigate('/stores');
      }, 100); // Small delay to allow for loading from storage
      
      return () => clearTimeout(timer);
    }
  }, [currentStore, navigate]);

  return currentStore;
};

export default useRequireStore;
