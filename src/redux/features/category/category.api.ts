import { baseApi } from "@/redux/baseApi";

export const categoryApi = baseApi.injectEndpoints({
      endpoints: (builder) => ({
            addCategory: builder.mutation({
                  query: (categoryData) => ({
                        url: "/category/create",
                        method: "POST",
                        data: categoryData,
                  }),
                  invalidatesTags: ["CATEGORY"],
            }),
            updateCategory: builder.mutation({
                  query: ({ categoryId, categoryInfo }) => ({
                        url: `/category/${categoryId}`,
                        method: "PATCH",
                        data: categoryInfo, 
                  }),
                  invalidatesTags: ["CATEGORY"],
            }),
            removeCategory: builder.mutation({
                  query: (categoryId) => ({
                        url: `/category/${categoryId}`,
                        method: "DELETE",
                  }),
                  invalidatesTags: ["CATEGORY"],
            }),
            
            getCategoryDetails: builder.query({
                  query: (params) => ({
                        url: `/category/${params}`,
                        method: "GET",
                  }),
                  transformResponse: (response) => response.data,
            }),
            
            getAllCategories: builder.query({
                  query: (params) => ({
                        url: "/category",
                        method: "GET",
                        params: params,
                  }),
                  providesTags: ["CATEGORY"],
                  transformResponse: (response) => response,
            }),
      }),
});

export const {
      useAddCategoryMutation,
      useUpdateCategoryMutation,
      useRemoveCategoryMutation,
      useGetCategoryDetailsQuery,
      useGetAllCategoriesQuery,
} = categoryApi;
