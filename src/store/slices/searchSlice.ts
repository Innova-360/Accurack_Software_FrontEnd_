import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface SearchState {
  searchTerm: string;
  debouncedSearchTerm: string;
}

const initialState: SearchState = {
  searchTerm: '',
  debouncedSearchTerm: '',
};

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setDebouncedSearchTerm: (state, action: PayloadAction<string>) => {
      state.debouncedSearchTerm = action.payload;
    },
    clearSearch: (state) => {
      state.searchTerm = '';
      state.debouncedSearchTerm = '';
    },
  },
});

export const { setSearchTerm, setDebouncedSearchTerm, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
