import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { TaxType, TaxCode, TaxRegion, TaxRate } from '../../types/tax';

// Request types for creating new records
export interface CreateTaxTypeRequest {
  name: string;
  description: string;
  payer: string;
}

export interface CreateTaxCodeRequest {
  code: string;
  description: string;
  taxTypeId: string;
}

export interface CreateTaxRegionRequest {
  name: string;
  code: string;
  description: string;
}

export interface CreateTaxRateRequest {
  rate: number;
  effectiveFrom: string;
  effectiveTo: string;
  regionId: string;
  taxTypeId: string;
  taxCodeId: string;
}

export interface TaxAssignment {
  entityType: 'PRODUCT' | 'CATEGORY' | 'CUSTOMER' | 'STORE';
  entityId: string;
  taxRateId: string;
}

export interface BulkTaxAssignmentRequest {
  assignments: TaxAssignment[];
}

// Async thunk for fetching countries
export const fetchCountriesThunk = createAsyncThunk(
  'tax/fetchCountries',
  async () => {
    const response = await fetch('https://countriesnow.space/api/v0.1/countries/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch countries');
    }
    
    const data = await response.json();
    if (data.error) {
      throw new Error('Failed to fetch countries');
    }
    
    return data.data;
  }
);

// Async thunk for creating tax rate
export const createTaxRateThunk = createAsyncThunk(
  'tax/createTaxRate',
  async (taxRateData: CreateTaxRateRequest) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/tax/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taxRateData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create tax rate');
    }
    
    return response.json();
  }
);

// Tax slice for handling tax rate creation state and countries
const taxSlice = createSlice({
  name: 'tax',
  initialState: {
    isCreating: false,
    createError: null as string | null,
    countries: [] as any[],
    countriesLoading: false,
    countriesError: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountriesThunk.pending, (state) => {
        state.countriesLoading = true;
        state.countriesError = null;
      })
      .addCase(fetchCountriesThunk.fulfilled, (state, action) => {
        state.countriesLoading = false;
        state.countries = action.payload;
      })
      .addCase(fetchCountriesThunk.rejected, (state, action) => {
        state.countriesLoading = false;
        state.countriesError = action.error.message || 'Failed to fetch countries';
      })
      .addCase(createTaxRateThunk.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
      })
      .addCase(createTaxRateThunk.fulfilled, (state) => {
        state.isCreating = false;
      })
      .addCase(createTaxRateThunk.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.error.message || 'Failed to create tax rate';
      });
  },
});

export const taxReducer = taxSlice.reducer;

export const taxApi = createApi({
  reducerPath: 'taxApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/tax`,
  }),
  tagTypes: ['TaxType', 'TaxCode', 'TaxRegion', 'TaxRate'],
  endpoints: (builder) => ({
    getTaxTypes: builder.query<TaxType[], void>({
      query: () => '/type',
      providesTags: ['TaxType'],
    }),
    getTaxCodes: builder.query<TaxCode[], void>({
      query: () => '/code',
      providesTags: ['TaxCode'],
    }),
    getTaxRegions: builder.query<TaxRegion[], void>({
      query: () => '/region',
      providesTags: ['TaxRegion'],
    }),
    getTaxRates: builder.query<TaxRate[], void>({
      query: () => '/rate',
      providesTags: ['TaxRate'],
    }),
    createTaxType: builder.mutation<TaxType, CreateTaxTypeRequest>({
      query: (data) => ({
        url: '/type',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TaxType'],
    }),
    createTaxCode: builder.mutation<TaxCode, CreateTaxCodeRequest>({
      query: (data) => ({
        url: '/code',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TaxCode'],
    }),
    createTaxRegion: builder.mutation<TaxRegion, CreateTaxRegionRequest>({
      query: (data) => ({
        url: '/region',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TaxRegion'],
    }),
    createTaxRate: builder.mutation<TaxRate, CreateTaxRateRequest>({
      query: (data) => ({
        url: '/rate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TaxRate'],
    }),
    bulkAssignTax: builder.mutation<any, BulkTaxAssignmentRequest>({
      query: (data) => ({
        url: '/assign/bulk',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TaxRate'],
    }),
  }),
});

export const {
  useGetTaxTypesQuery,
  useGetTaxCodesQuery,
  useGetTaxRegionsQuery,
  useGetTaxRatesQuery,
  useCreateTaxTypeMutation,
  useCreateTaxCodeMutation,
  useCreateTaxRegionMutation,
  useCreateTaxRateMutation,
  useBulkAssignTaxMutation,
} = taxApi;