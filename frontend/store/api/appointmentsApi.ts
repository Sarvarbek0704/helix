import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery as bq } from "./baseQuery";

export const appointmentsApi = createApi({
  reducerPath: "appointmentsApi",
  baseQuery: bq,
  tagTypes: ["Appointments"],
  endpoints: (b) => ({
    create: b.mutation<any, {
      doctorId: string;
      appointmentDate: string;
      appointmentTime: string;
      type?: "in_person" | "telemedicine" | "follow_up" | "emergency";
      reason?: string;
      symptoms?: string;
      durationMinutes?: number;
    }>({
      query: (body) => ({ url: "/appointments", method: "POST", body }),
      invalidatesTags: ["Appointments"],
    }),
    getAll: b.query<any, { page?: number; limit?: number; status?: string; date?: string }>({
      query: (params) => ({ url: "/appointments", params }),
      providesTags: ["Appointments"],
    }),
    getMyAppointments: b.query<any, { page?: number; limit?: number; status?: string }>({
      query: (params) => ({ url: "/appointments/my", params }),
      providesTags: ["Appointments"],
    }),
    getDoctorAppointments: b.query<any, { page?: number; limit?: number; status?: string; date?: string }>({
      query: (params) => ({ url: "/appointments/doctor", params }),
      providesTags: ["Appointments"],
    }),
    getTodayStats: b.query<any, void>({
      query: () => "/appointments/doctor/today-stats",
    }),
    getById: b.query<any, string>({
      query: (id) => `/appointments/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Appointments", id }],
    }),
    confirm: b.mutation<any, string>({
      query: (id) => ({ url: `/appointments/${id}/confirm`, method: "PATCH" }),
      invalidatesTags: ["Appointments"],
    }),
    start: b.mutation<any, string>({
      query: (id) => ({ url: `/appointments/${id}/start`, method: "PATCH" }),
      invalidatesTags: ["Appointments"],
    }),
    complete: b.mutation<any, { id: string; notes?: string; diagnosis?: string }>({
      query: ({ id, ...body }) => ({ url: `/appointments/${id}/complete`, method: "PATCH", body }),
      invalidatesTags: ["Appointments"],
    }),
    cancel: b.mutation<any, { id: string; reason: string }>({
      query: ({ id, ...body }) => ({ url: `/appointments/${id}/cancel`, method: "PATCH", body }),
      invalidatesTags: ["Appointments"],
    }),
  }),
});

export const {
  useCreateMutation,
  useGetAllQuery,
  useGetMyAppointmentsQuery,
  useGetDoctorAppointmentsQuery,
  useGetTodayStatsQuery,
  useGetByIdQuery,
  useConfirmMutation,
  useStartMutation,
  useCompleteMutation,
  useCancelMutation,
} = appointmentsApi;
