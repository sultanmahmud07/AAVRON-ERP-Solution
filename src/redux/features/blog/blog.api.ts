import { baseApi } from "@/redux/baseApi";

export const blogApi = baseApi.injectEndpoints({
      endpoints: (builder) => ({
            addBlog: builder.mutation({
                  query: (blogData) => ({
                        url: "/blog/create",
                        method: "POST",
                        data: blogData,
                  }),
                  invalidatesTags: ["BLOG"],
            }),
            updateBlogByAdmin: builder.mutation({
                  query: ({ blogId, blogInfo }) => ({
                        url: `/blog/${blogId}`,
                        method: "PATCH",
                        data: blogInfo, 
                  }),
                  invalidatesTags: ["BLOG"],
            }),
            removeBlog: builder.mutation({
                  query: (blogId) => ({
                        url: `/blog/${blogId}`,
                        method: "DELETE",
                  }),
                  invalidatesTags: ["BLOG"],
            }),
            getBlogDetails: builder.query({
                  query: (params) => ({
                        url: `/blog/${params}`,
                        method: "GET",
                  }),
                  transformResponse: (response) => response.data,
            }),
            getAllBlogs: builder.query({
                  query: (params) => ({
                        url: "/blog",
                        method: "GET",
                        params: params,
                  }),
                  providesTags: ["BLOG"],
                  transformResponse: (response) => response,
            }),
      }),
});

export const {
      useAddBlogMutation,
      useUpdateBlogByAdminMutation,
      useRemoveBlogMutation,
      useGetBlogDetailsQuery,
      useGetAllBlogsQuery,
} = blogApi;
