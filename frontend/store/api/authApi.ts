import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery as bq } from "./baseQuery";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: bq,
  endpoints: (b) => ({
    register: b.mutation<any, { email: string; password: string; firstName: string; lastName: string; role?: string; phone?: string }>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    verifyOtp: b.mutation<any, { email: string; otp: string }>({
      query: (body) => ({ url: "/auth/verify-otp", method: "POST", body }),
    }),
    resendOtp: b.mutation<any, { email: string }>({
      query: (body) => ({ url: "/auth/resend-otp", method: "POST", body }),
    }),
    login: b.mutation<any, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    refresh: b.mutation<any, { refreshToken: string }>({
      query: (body) => ({ url: "/auth/refresh", method: "POST", body }),
    }),
    forgotPassword: b.mutation<any, { email: string }>({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),
    resetPassword: b.mutation<any, { token: string; password: string }>({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
    }),
    changePassword: b.mutation<any, { currentPassword: string; newPassword: string }>({
      query: (body) => ({ url: "/auth/change-password", method: "POST", body }),
    }),
    getMe: b.query<any, void>({
      query: () => "/auth/me",
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useLoginMutation,
  useRefreshMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetMeQuery,
} = authApi;
