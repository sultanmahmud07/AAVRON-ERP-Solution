import { baseApi } from "@/redux/baseApi";
import { IResponse, ISendOtp, IVerifyOtp } from "@/types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (userInfo) => ({
        url: "/auth/login",
        method: "POST",
        data: userInfo,
      }),
      invalidatesTags: ["USER"],
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["USER"],
    }),
    register: builder.mutation({
      query: (userInfo) => ({
        url: "/user/register",
        method: "POST",
        data: userInfo,
      }),
      invalidatesTags: ["USER"],
    }),
    sendOtp: builder.mutation<IResponse<null>, ISendOtp>({
      query: (userInfo) => ({
        url: "/otp/send",
        method: "POST",
        data: userInfo,
      }),
    }),
    verifyOtp: builder.mutation<IResponse<null>, IVerifyOtp>({
      query: (userInfo) => ({
        url: "/otp/verify",
        method: "POST",
        data: userInfo,
      }),
    }),
    changePassword: builder.mutation({
      query: (userInfo) => ({
        url: `/auth/change-password`,
        method: "POST",
        data: userInfo,
      }),
      invalidatesTags: ["USER"],
    }),
    resetPassword: builder.mutation({
      query: (userInfo) => ({
        url: `/auth/reset-password`,
        method: "POST",
        data: userInfo,
      }),
      invalidatesTags: ["USER"],
    }),
    forgotPassword: builder.mutation({
      query: (userInfo) => ({
        url: `/auth/forgot-password`,
        method: "POST",
        data: userInfo,
      }),
      invalidatesTags: ["USER"],
    }),
    userInfo: builder.query({
      query: () => ({
        url: "/user/me",
        method: "GET",
      }),
      providesTags: ["USER"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useLogoutMutation,
  useChangePasswordMutation,
  useResetPasswordMutation,
  useForgotPasswordMutation,
  useUserInfoQuery,
} = authApi;
