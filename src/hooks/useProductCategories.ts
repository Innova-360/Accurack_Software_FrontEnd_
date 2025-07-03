import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchProductCategories } from "../store/slices/productCategoriesSlice";

export const useProductCategories = () => {
  const dispatch = useAppDispatch();
  const { categories, loading, error, creatingCategory } = useAppSelector(
    (state) => state.productCategories
  );

  useEffect(() => {
    // Only fetch if categories are not already loaded
    if (categories.length === 0 && !loading) {
      dispatch(fetchProductCategories());
    }
  }, [dispatch, categories.length, loading]);

  return {
    categories,
    loading,
    error,
    creatingCategory,
    refetch: () => dispatch(fetchProductCategories()),
  };
};
