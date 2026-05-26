import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery as bq } from "./baseQuery";

export const schedulesApi = createApi({
  reducerPath: "schedulesApi",
  baseQuery: bq,
  tagTypes: ["Schedules"],
  endpoints: (b) => ({
    getMySchedule: b.query<any, void>({
      query: () => "/schedules/my",
      providesTags: ["Schedules"],
    }),
    createScheduleSlot: b.mutation<any, {
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      slotDurationMinutes?: number;
    }>({
      query: (body) => ({ url: "/schedules/my", method: "POST", body }),
      invalidatesTags: ["Schedules"],
    }),
    updateScheduleSlot: b.mutation<any, {
      id: string;
      startTime?: string;
      endTime?: string;
      slotDurationMinutes?: number;
      isActive?: boolean;
    }>({
      query: ({ id, ...body }) => ({ url: `/schedules/my/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Schedules"],
    }),
    deleteScheduleSlot: b.mutation<any, string>({
      query: (id) => ({ url: `/schedules/my/${id}`, method: "DELETE" }),
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
  useCreateScheduleSlotMutation,
  useUpdateScheduleSlotMutation,
  useDeleteScheduleSlotMutation,
  useGetDoctorScheduleQuery,
  useGetAvailableSlotsQuery,
} = schedulesApi;
