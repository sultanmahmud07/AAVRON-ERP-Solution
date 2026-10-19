import { baseApi } from "@/redux/baseApi";

export const contactApi = baseApi.injectEndpoints({
      endpoints: (builder) => ({
            removeContact: builder.mutation({
                  query: (contactId) => ({
                        url: `/contact/${contactId}`,
                        method: "DELETE",
                  }),
                  invalidatesTags: ["CONTACT"],
            }),
               getContactDetails: builder.query({
                  query: (params) => ({
                        url: `/contact/${params}`,
                        method: "GET",
                  }),
                  transformResponse: (response) => response.data,
            }),
            getAllContact: builder.query({
                  query: (params) => ({
                        url: "/contact/all-contact",
                        method: "GET",
                        params: params,
                  }),
                  providesTags: ["CONTACT"],
                  transformResponse: (response) => response,
            }),
      }),
});

export const {
      useRemoveContactMutation,
      useGetContactDetailsQuery,
      useGetAllContactQuery,
} = contactApi;
