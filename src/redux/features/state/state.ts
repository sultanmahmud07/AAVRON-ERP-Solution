import { baseApi } from "@/redux/baseApi";

export const stateApi = baseApi.injectEndpoints({
      endpoints: (builder) => ({
            addState: builder.mutation({
                  query: (stateData) => ({
                        url: "/state/create",
                        method: "POST",
                        data: stateData,
                  }),
                  invalidatesTags: ["STATE"],
            }),
            updateState: builder.mutation({
                  query: ({ stateId, stateInfo }) => ({
                        url: `/state/${stateId}`,
                        method: "PATCH",
                        data: stateInfo, 
                  }),
                  invalidatesTags: ["STATE"],
            }),
            removeState: builder.mutation({
                  query: (stateId) => ({
                        url: `/state/${stateId}`,
                        method: "DELETE",
                  }),
                  invalidatesTags: ["STATE"],
            }),
            
            getStateDetails: builder.query({
                  query: (params) => ({
                        url: `/state/${params}`,
                        method: "GET",
                  }),
                  transformResponse: (response) => response.data,
            }),
            
            getAllStates: builder.query({
                  query: (params) => ({
                        url: "/state",
                        method: "GET",
                        params: params,
                  }),
                  providesTags: ["STATE"],
                  transformResponse: (response) => response,
            }),
      }),
});

export const {
      useAddStateMutation,
      useUpdateStateMutation,
      useRemoveStateMutation,
      useGetStateDetailsQuery,
      useGetAllStatesQuery,
} = stateApi;
