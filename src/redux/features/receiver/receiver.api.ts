import { baseApi } from "@/redux/baseApi";

export const receiverApi = baseApi.injectEndpoints({
      endpoints: (builder) => ({
            getReceiver: builder.query({
                  query: (params) => ({
                        url: "/user/all-receiver",
                        method: "GET",
                        params,
                  })
            }),
            getReceiverAnalytics: builder.query({
                  query: (params) => ({
                        url: "/stats/receiver",
                        method: "GET",
                        params,
                  }),
                  transformResponse: (response) => response.data,
            }),
      }),
});

export const {
      useGetReceiverQuery,
      useGetReceiverAnalyticsQuery,
} = receiverApi;
