import { baseApi } from "@/redux/baseApi";

export const userApi = baseApi.injectEndpoints({
      endpoints: (builder) => ({
             addAdmin: builder.mutation({
                  query: (userInfo) => ({
                        url: "/user/register",
                        method: "POST",
                        data: userInfo,
                  }),
                  invalidatesTags: ["USER"],
            }),
            updateProfile: builder.mutation({
                  query: (userInfo) => ({
                        url: `/user/profile`,
                        method: "PATCH",
                        data: userInfo, 
                  }),
                  invalidatesTags: ["USER"],
            }),
            updateUser: builder.mutation({
                  query: ({ userId, userInfo }) => ({
                        url: `/user/${userId}`,
                        method: "PATCH",
                        data: userInfo, 
                  }),
                  invalidatesTags: ["USER"],
            }),
            removeUser: builder.mutation({
                  query: (userId) => ({
                        url: `/user/${userId}`,
                        method: "DELETE",
                  }),
                  invalidatesTags: ["USER"],
            }),
            getUserDetails: builder.query({
                  query: (params) => ({
                        url: `/user/${params}`,
                        method: "GET",
                  }),
                  transformResponse: (response) => response.data,
            }),
            getAllUser: builder.query({
                  query: (params) => ({
                        url: "/user/all-users",
                        method: "GET",
                        params: params,
                  }),
                  providesTags: ["USER"],
                  transformResponse: (response) => response,
            }),
            getAllAdmin: builder.query({
                  query: (params) => ({
                        url: "/user/all-admin",
                        method: "GET",
                        params: params,
                  }),
                  providesTags: ["USER"],
                  transformResponse: (response) => response,
            }),
            getDeletedUser: builder.query({
                  query: (params) => ({
                        url: "/user/deleted-users",
                        method: "GET",
                        params: params,
                  }),
                  providesTags: ["USER"],
                  transformResponse: (response) => response,
            }),
      }),
});

export const {
      useAddAdminMutation,
      useUpdateProfileMutation,
      useUpdateUserMutation,
      useRemoveUserMutation,
      useGetUserDetailsQuery,
      useGetAllUserQuery,
      useGetAllAdminQuery,
      useGetDeletedUserQuery,
} = userApi;
