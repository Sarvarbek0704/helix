import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery as bq } from "./baseQuery";

interface PrescriptionItem {
  medicationName: string;
  medicationId?: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity?: number;
  refillsAllowed?: number;
}

export const prescriptionsApi = createApi({
  reducerPath: "prescriptionsApi",
  baseQuery: bq,
  tagTypes: ["Prescriptions"],
  endpoints: (b) => ({
    create: b.mutation<any, {
      patientId: string;
      appointmentId?: string;
      items: PrescriptionItem[];
      diagnosis?: string;
      notes?: string;
      validUntil?: string;
    }>({
      query: (body) => ({ url: "/prescriptions", method: "POST", body }),
      invalidatesTags: ["Prescriptions"],
    }),
    getMyPrescriptions: b.query<any, { page?: number; limit?: number; status?: string }>({
      query: (params) => ({ url: "/prescriptions/my", params }),
      providesTags: ["Prescriptions"],
    }),
    getDoctorPrescriptions: b.query<any, { page?: number; limit?: number }>({
      query: (params) => ({ url: "/prescriptions/doctor", params }),
      providesTags: ["Prescriptions"],
    }),
    getById: b.query<any, string>({
      query: (id) => `/prescriptions/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Prescriptions", id }],
    }),
    update: b.mutation<any, { id: string; status?: string; notes?: string }>({
      query: ({ id, ...body }) => ({ url: `/prescriptions/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Prescriptions"],
    }),
  }),
});

export const {
  useCreateMutation,
  useGetMyPrescriptionsQuery,
  useGetDoctorPrescriptionsQuery,
  useGetByIdQuery,
  useUpdateMutation,
} = prescriptionsApi;
