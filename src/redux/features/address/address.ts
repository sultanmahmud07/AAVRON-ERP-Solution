import { baseApi } from "@/redux/baseApi";

export const addressApi = baseApi.injectEndpoints({
      endpoints: (builder) => ({
            addAddress: builder.mutation({
                  query: (addressData) => ({
                        url: "/address/create",
                        method: "POST",
                        data: addressData,
                  }),
                  invalidatesTags: ["ADDRESS"],
            }),
            updateAddress: builder.mutation({
                  query: ({ addressId, addressInfo }) => ({
                        url: `/address/${addressId}`,
                        method: "PATCH",
                        data: addressInfo, 
                  }),
                  invalidatesTags: ["ADDRESS"],
            }),
            removeAddress: builder.mutation({
                  query: (addressId) => ({
                        url: `/address/${addressId}`,
                        method: "DELETE",
                  }),
                  invalidatesTags: ["ADDRESS"],
            }),
            
            getAddressDetails: builder.query({
                  query: (params) => ({
                        url: `/address/${params}`,
                        method: "GET",
                  }),
                  transformResponse: (response) => response.data,
            }),
            
            getAllAddresses: builder.query({
                  query: (params) => ({
                        url: "/address",
                        method: "GET",
                        params: params,
                  }),
                  providesTags: ["ADDRESS"],
                  transformResponse: (response) => response,
            }),
      }),
});

export const {
      useAddAddressMutation,
      useUpdateAddressMutation,
      useRemoveAddressMutation,
      useGetAddressDetailsQuery,
      useGetAllAddressesQuery,
} = addressApi;
