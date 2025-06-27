import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { loadCurrentStoreFromStorage } from "../store/slices/storeSlice";
import type { Store } from "../types/store";

/**
 * Custom hook that ensures a store is selected
 * Redirects to /stores if no store is available
 * Returns the current store or null if none is selected
 */
const useRequireStore = (): Store | null => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentStore, stores } = useAppSelector((state) => state.stores);

  useEffect(() => {
    // Load store from localStorage if not already loaded
    if (!currentStore) {
      dispatch(loadCurrentStoreFromStorage());
    }
  }, [dispatch, currentStore]);

  useEffect(() => {
    // If no current store and no stores available, redirect to stores page
    if (!currentStore && stores.length === 0) {
      navigate("/stores");
    }
  }, [currentStore, stores, navigate]);

  return currentStore;
};

export default useRequireStore;
