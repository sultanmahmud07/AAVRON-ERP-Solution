import { baseApi } from "@/redux/baseApi";

export const productApi = baseApi.injectEndpoints({
      endpoints: (builder) => ({
            addProduct: builder.mutation({
                  query: (productData) => ({
                        url: "/product/create",
                        method: "POST",
                        data: productData,
                  }),
                  invalidatesTags: ["PRODUCT"],
            }),
            updateProductByAdmin: builder.mutation({
                  query: ({ productId, productInfo }) => ({
                        url: `/product/status/${productId}`,
                        method: "PATCH",
                        data: productInfo, 
                  }),
                  invalidatesTags: ["PRODUCT"],
            }),
            blockProductByAdmin: builder.mutation({
                  query: ({ productId, productInfo }) => ({
                        url: `/product/block/${productId}`,
                        method: "PATCH",
                        data: productInfo, 
                  }),
                  invalidatesTags: ["PRODUCT"],
            }),
            removeProduct: builder.mutation({
                  query: (productId) => ({
                        url: `/product/${productId}`,
                        method: "DELETE",
                  }),
                  invalidatesTags: ["PRODUCT"],
            }),
            cancelProduct: builder.mutation({
                  query: (productId) => ({
                        url: `/product/cancel/${productId}`,
                        method: "PATCH",
                  }),
                  invalidatesTags: ["PRODUCT"],
            }),
            getProductDetails: builder.query({
                  query: (params) => ({
                        url: `/product/${params}`,
                        method: "GET",
                  }),
                  transformResponse: (response) => response.data,
            }),
            
            getAllProducts: builder.query({
                  query: (params) => ({
                        url: "/product",
                        method: "GET",
                        params: params,
                  }),
                  providesTags: ["PRODUCT"],
                  transformResponse: (response) => response,
            }),
            getDashboardAnalytics: builder.query({
                  query: (params) => ({
                        url: "/stats/analytics",
                        method: "GET",
                        params: params,
                  }),
                  transformResponse: (response) => response,
            }),
      }),
});

export const {
      useAddProductMutation,
      useUpdateProductByAdminMutation,
      useBlockProductByAdminMutation,
      useCancelProductMutation,
      useRemoveProductMutation,
      useGetProductDetailsQuery,
      useGetAllProductsQuery,
      useGetDashboardAnalyticsQuery,
} = productApi;
