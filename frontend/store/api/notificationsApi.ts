import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery as bq } from "./baseQuery";

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: bq,
  tagTypes: ["Notifications"],
  endpoints: (b) => ({
    getAll: b.query<any, { page?: number; limit?: number; unreadOnly?: boolean }>({
      query: (params: any = {}) => ({ url: "/notifications", params }),
      providesTags: ["Notifications"],
    }),
    getUnreadCount: b.query<any, void>({
      query: () => "/notifications/unread-count",
      providesTags: ["Notifications"],
    }),
    markRead: b.mutation<void, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "PATCH" }),
      invalidatesTags: ["Notifications"],
    }),
    markAllRead: b.mutation<void, void>({
      query: () => ({ url: "/notifications/mark-all-read", method: "PATCH" }),
      invalidatesTags: ["Notifications"],
    }),
    deleteNotification: b.mutation<void, string>({
      query: (id) => ({ url: `/notifications/${id}`, method: "DELETE" }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetAllQuery,
  useGetUnreadCountQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
  useDeleteNotificationMutation,
} = notificationsApi;
