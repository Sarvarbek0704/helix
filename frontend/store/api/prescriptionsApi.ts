import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery as bq } from "./baseQuery";

export const prescriptionsApi = createApi({
  reducerPath: "prescriptionsApi",
  baseQuery: bq,
  tagTypes: ["Prescriptions"],
  endpoints: (b) => ({
    create: b.mutation<any, { patientId: string; items: any[]; notes?: string; appointmentId?: string }>({
      query: (body) => ({ url: "/prescriptions", method: "POST", body }),
      invalidatesTags: ["Prescriptions"],
    }),
    getMyPrescriptions: b.query<any, { page?: number; limit?: number }>({
      query: (params) => ({ url: "/prescriptions/my", params }),
      providesTags: ["Prescriptions"],
    }),
    getPatientPrescriptions: b.query<any, { id: string; page?: number; limit?: number }>({
      query: ({ id, ...params }) => ({ url: `/prescriptions/patient/${id}`, params }),
      providesTags: ["Prescriptions"],
    }),
    getById: b.query<any, string>({
      query: (id) => `/prescriptions/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Prescriptions", id }],
    }),
    dispense: b.mutation<any, string>({
      query: (id) => ({ url: `/prescriptions/${id}/dispense`, method: "PATCH" }),
      invalidatesTags: ["Prescriptions"],
    }),
  }),
});

export const {
  useCreateMutation,
  useGetMyPrescriptionsQuery,
  useGetPatientPrescriptionsQuery,
  useGetByIdQuery,
  useDispenseMutation,
} = prescriptionsApi;
