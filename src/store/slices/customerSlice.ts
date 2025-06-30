import { createApi } from '@reduxjs/toolkit/query/react';

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

export const customerApi = createApi({
  reducerPath: 'customerApi',
  baseQuery: customBaseQuery,
  tagTypes: ['Customer'],
  endpoints: (builder) => ({
    searchCustomers: builder.query<{ data: any[] }, { search: string; storeId: string }>({
      query: ({ search, storeId }) => ({
        url: '/sales/customers',
        params: { search, storeId },
      }),
      providesTags: ['Customer'],
    }),
  }),
});

export const { useSearchCustomersQuery } = customerApi;