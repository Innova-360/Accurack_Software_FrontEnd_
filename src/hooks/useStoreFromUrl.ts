import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setCurrentStore, fetchStores } from "../store/slices/storeSlice";

/**
 * Custom hook to handle store selection from URL parameters
 * Automatically redirects to / if no valid store is found
 */
export const useStoreFromUrl = () => {
  const { id: storeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { stores, currentStore, loading } = useAppSelector(
    (state) => state.stores
  );

  useEffect(() => {
    if (storeId) {
      if (!stores || stores.length === 0) {
        dispatch(fetchStores());
        return;
      }

      // Find the store by ID and set it as current if it's not already set
      const store = stores.find((s) => s.id === storeId);
      if (store && (!currentStore || currentStore.id !== storeId)) {
        dispatch(setCurrentStore(store));
      } else if (!store) {
        // Store not found, redirect to home page
        navigate("/");
      }
    } else if (!storeId && !currentStore) {
      // No store ID in URL and no current store, redirect to home page
      navigate("/");
    }
  }, [storeId, stores, currentStore, dispatch, navigate]);

  return {
    storeId,
    currentStore,
    stores,
    loading: loading && (!stores || stores.length === 0),
    isStoreReady: !!(storeId && currentStore && currentStore.id === storeId),
  };
};
