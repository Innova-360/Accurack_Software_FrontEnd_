import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setSearchTerm,
  setDebouncedSearchTerm,
} from "../store/slices/searchSlice";
import { selectSearchTerm } from "../store/selectors";

export const useDebounceSearch = (delay: number = 300) => {
  const dispatch = useAppDispatch();
  const searchTerm = useAppSelector(selectSearchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setDebouncedSearchTerm(searchTerm));
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm, delay, dispatch]);
  
  const updateSearchTerm = (term: string) => {
    dispatch(setSearchTerm(term));
  };

  return {
    searchTerm,
    updateSearchTerm,
  };
};
