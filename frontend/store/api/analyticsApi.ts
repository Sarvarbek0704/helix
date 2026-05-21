import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery as bq } from "./baseQuery";

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery: bq,
  tagTypes: ["Analytics"],
  endpoints: (b) => ({
    getAdminDashboard: b.query<any, void>({
      query: () => "/analytics/admin",
      providesTags: ["Analytics"],
    }),
    getPatientDashboard: b.query<any, void>({
      query: () => "/analytics/patient",
      providesTags: ["Analytics"],
    }),
    getDoctorDashboard: b.query<any, void>({
      query: () => "/analytics/doctor",
      providesTags: ["Analytics"],
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
  useGetPatientDashboardQuery,
  useGetDoctorDashboardQuery,
} = analyticsApi;
