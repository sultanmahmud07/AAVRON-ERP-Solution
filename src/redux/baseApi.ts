import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./axiosBaseQuery";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["USER", "BLOG", "AVAILABILITY", "ADDRESS", "PRODUCT", "CATEGORY", "INSPECTION", "CONTACT", "STATE"],
  endpoints: () => ({}),
});
