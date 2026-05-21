import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery as bq } from "./baseQuery";

export const medicalApi = createApi({
  reducerPath: "medicalApi",
  baseQuery: bq,
  tagTypes: ["MedicalRecords"],
  endpoints: (b) => ({
    create: b.mutation<any, { patientId: string; title: string; description: string; diagnosis?: string; appointmentId?: string }>({
      query: (body) => ({ url: "/medical-records", method: "POST", body }),
      invalidatesTags: ["MedicalRecords"],
    }),
    getMyRecords: b.query<any, { page?: number; limit?: number }>({
      query: (params) => ({ url: "/medical-records/my", params }),
      providesTags: ["MedicalRecords"],
    }),
    getPatientRecords: b.query<any, { id: string; page?: number; limit?: number }>({
      query: ({ id, ...params }) => ({ url: `/medical-records/patient/${id}`, params }),
      providesTags: ["MedicalRecords"],
    }),
    getById: b.query<any, string>({
      query: (id) => `/medical-records/${id}`,
      providesTags: (_r, _e, id) => [{ type: "MedicalRecords", id }],
    }),
    update: b.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/medical-records/${id}`, method: "PATCH", body: data }),
      invalidatesTags: ["MedicalRecords"],
    }),
    delete: b.mutation<any, string>({
      query: (id) => ({ url: `/medical-records/${id}`, method: "DELETE" }),
      invalidatesTags: ["MedicalRecords"],
    }),
  }),
});

export const {
  useCreateMutation,
  useGetMyRecordsQuery,
  useGetPatientRecordsQuery,
  useGetByIdQuery,
  useUpdateMutation,
  useDeleteMutation,
} = medicalApi;
