import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery as bq } from "./baseQuery";

export const schedulesApi = createApi({
  reducerPath: "schedulesApi",
  baseQuery: bq,
  tagTypes: ["Schedules"],
  endpoints: (b) => ({
    getMySchedule: b.query<any, void>({
      query: () => "/schedules/me",
      providesTags: ["Schedules"],
    }),
    updateMySchedule: b.mutation<any, any[]>({
      query: (body) => ({ url: "/schedules/me", method: "PUT", body }),
      invalidatesTags: ["Schedules"],
    }),
    getDoctorSchedule: b.query<any, string>({
      query: (doctorId) => `/schedules/doctor/${doctorId}`,
    }),
    getAvailableSlots: b.query<any, { doctorId: string; date: string }>({
      query: ({ doctorId, date }) => ({ url: `/schedules/doctor/${doctorId}/slots`, params: { date } }),
    }),
  }),
});

export const {
  useGetMyScheduleQuery,
  useUpdateMyScheduleMutation,
  useGetDoctorScheduleQuery,
  useGetAvailableSlotsQuery,
} = schedulesApi;
