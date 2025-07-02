import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types for category
export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

const customBaseQuery = async (args: any) => {
  try {
    const apiClient = (await import('../../services/api')).default;
    const result = await apiClient({
      url: typeof args === 'string' ? args : args.url,
      method: args.method || 'GET',
      data: args.body,
      params: args.params,
    });
    return { data: result.data };
  } catch (axiosError: any) {
    return {
      error: {
        status: axiosError.response?.status,
        data: axiosError.response?.data || axiosError.message,
      },
    };
  }
};

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
  baseQuery: customBaseQuery,
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    getCategories: builder.query<{ data: Category[] }, void>({
      query: () => '/product-category',
      providesTags: ['Category'],
    }),
    searchCategories: builder.query<{ data: Category[] }, { q: string }>({
      query: ({ q }) => ({
        url: '/product-category/search',
        params: { q },
      }),
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation<Category, CreateCategoryRequest>({
      query: (data) => ({
        url: '/product-category',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useSearchCategoriesQuery,
  useCreateCategoryMutation,
} = categoryApi;