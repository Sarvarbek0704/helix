import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery as bq } from "./baseQuery";

export const vitalsApi = createApi({
  reducerPath: "vitalsApi",
  baseQuery: bq,
  tagTypes: ["Vitals"],
  endpoints: (b) => ({
    record: b.mutation<any, { patientId: string; bloodPressure?: string; heartRate?: number; temperature?: number; oxygenSaturation?: number; weight?: number; height?: number; notes?: string }>({
      query: (body) => ({ url: "/vitals", method: "POST", body }),
      invalidatesTags: ["Vitals"],
    }),
    getMyVitals: b.query<any, { page?: number; limit?: number }>({
      query: (params) => ({ url: "/vitals/my", params }),
      providesTags: ["Vitals"],
    }),
    getMyLatest: b.query<any, void>({
      query: () => "/vitals/my/latest",
      providesTags: ["Vitals"],
    }),
    getPatientVitals: b.query<any, { id: string; page?: number; limit?: number }>({
      query: ({ id, ...params }) => ({ url: `/vitals/patient/${id}`, params }),
      providesTags: ["Vitals"],
    }),
    getPatientLatest: b.query<any, string>({
      query: (id) => `/vitals/patient/${id}/latest`,
    }),
  }),
});

export const {
  useRecordMutation,
  useGetMyVitalsQuery,
  useGetMyLatestQuery,
  useGetPatientVitalsQuery,
  useGetPatientLatestQuery,
} = vitalsApi;
