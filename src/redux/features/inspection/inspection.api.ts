import { baseApi } from "@/redux/baseApi";

export const inspectionApi = baseApi.injectEndpoints({
      endpoints: (builder) => ({
            addInspection: builder.mutation({
                  query: (inspectionData) => ({
                        url: "/inspection/create",
                        method: "POST",
                        data: inspectionData,
                  }),
                  invalidatesTags: ["INSPECTION"],
            }),
            updateInspection: builder.mutation({
                  query: ({ inspectionId, inspectionInfo }) => ({
                        url: `/inspection/${inspectionId}`,
                        method: "PATCH",
                        data: inspectionInfo, 
                  }),
                  invalidatesTags: ["INSPECTION"],
            }),
            removeInspection: builder.mutation({
                  query: (inspectionId) => ({
                        url: `/inspection/${inspectionId}`,
                        method: "DELETE",
                  }),
                  invalidatesTags: ["INSPECTION"],
            }),
            
            getInspectionDetails: builder.query({
                  query: (params) => ({
                        url: `/inspection/${params}`,
                        method: "GET",
                  }),
                  transformResponse: (response) => response.data,
            }),
            
            getAllInspections: builder.query({
                  query: (params) => ({
                        url: "/inspection",
                        method: "GET",
                        params: params,
                  }),
                  providesTags: ["INSPECTION"],
                  transformResponse: (response) => response,
            }),

            getBookedSlots: builder.query({
                  query: () => ({
                        url: "/inspection/booked-slots",
                        method: "GET",
                  }),
                  providesTags: ["INSPECTION"],
            }),
      }),
});

export const {
      useAddInspectionMutation,
      useUpdateInspectionMutation,
      useRemoveInspectionMutation,
      useGetInspectionDetailsQuery,
      useGetAllInspectionsQuery,
      useGetBookedSlotsQuery,
} = inspectionApi;
