import { baseApi } from "@/redux/baseApi";

export const availabilityApi = baseApi.injectEndpoints({
      endpoints: (builder) => ({
            addAvailability: builder.mutation({
                  query: (availabilityData) => ({
                        url: "/availability/create",
                        method: "POST",
                        data: availabilityData,
                  }),
                  invalidatesTags: ["AVAILABILITY"],
            }),
            updateAvailability: builder.mutation({
                  query: ({ availabilityId, availabilityInfo }) => ({
                        url: `/availability/${availabilityId}`,
                        method: "PATCH",
                        data: availabilityInfo, 
                  }),
                  invalidatesTags: ["AVAILABILITY"],
            }),
            removeAvailability: builder.mutation({
                  query: (dateOrId) => ({
                        url: `/availability/${dateOrId}`,
                        method: "DELETE",
                  }),
                  invalidatesTags: ["AVAILABILITY"],
            }),
            
            getAvailabilityDetails: builder.query({
                  query: (params) => ({
                        url: `/availability/${params}`,
                        method: "GET",
                  }),
                  transformResponse: (response) => response.data,
            }),
            
            getAllAvailabilities: builder.query({
                  query: (params) => ({
                        url: "/availability",
                        method: "GET",
                        params: params || { limit: 500, sort: "date" },
                  }),
                  providesTags: ["AVAILABILITY"],
                  transformResponse: (response) => response,
            }),
      }),
});

export const {
      useAddAvailabilityMutation,
      useUpdateAvailabilityMutation,
      useRemoveAvailabilityMutation,
      useGetAvailabilityDetailsQuery,
      useGetAllAvailabilitiesQuery,
} = availabilityApi;
