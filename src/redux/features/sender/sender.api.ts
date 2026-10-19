import { baseApi } from "@/redux/baseApi";

export const senderApi = baseApi.injectEndpoints({
      endpoints: (builder) => ({
            getSender: builder.query({
                  query: (params) => ({
                        url: "/user/all-sender",
                        method: "GET",
                        params,
                  }),
            }),
              getSenderAnalytics: builder.query({
                  query: (params) => ({
                        url: "/stats/sender",
                        method: "GET",
                        params,
                  }),
                  transformResponse: (response) => response.data,
            }),
      }),
});

export const {
      useGetSenderQuery,
      useGetSenderAnalyticsQuery
} = senderApi;
