import { createApi } from "@reduxjs/toolkit/query/react";
import apiClient from "../services";
import type { Product } from "../data/inventoryData";

const customBaseQuery = async (args: any) => {
    try {
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



export const productsApi = createApi({

    reducerPath: 'productsApi',

    baseQuery: customBaseQuery,

    tagTypes: ['Product'],

    endpoints: (builder) => ({

        searchProducts: builder.query<{ data: Product[] }, { q: string; storeId: string }>({

            query: ({ q, storeId }) => ({

                url: '/product/search',

                params: { q, storeId },

            }),

            providesTags: ['Product'],

        }),

    }),

});

export const { useSearchProductsQuery } = productsApi;