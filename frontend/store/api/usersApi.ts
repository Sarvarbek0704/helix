import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery as bq } from "./baseQuery";

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: bq,
  tagTypes: ["Users"],
  endpoints: (b) => ({
    getUsers: b.query<any, { page?: number; limit?: number; role?: string; search?: string; status?: string }>({
      query: (params) => ({ url: "/users", params }),
      providesTags: ["Users"],
    }),
    getUser: b.query<any, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Users", id }],
    }),
    updateMe: b.mutation<any, any>({
      query: (body) => ({ url: "/users/me", method: "PATCH", body }),
    }),
    adminUpdate: b.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/users/${id}`, method: "PATCH", body: data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Users", id }, "Users"],
    }),
    suspend: b.mutation<any, string>({
      query: (id) => ({ url: `/users/${id}/suspend`, method: "POST" }),
      invalidatesTags: ["Users"],
    }),
    activate: b.mutation<any, string>({
      query: (id) => ({ url: `/users/${id}/activate`, method: "POST" }),
      invalidatesTags: ["Users"],
    }),
    deleteUser: b.mutation<any, string>({
      query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: ["Users"],
    }),
    getUserStats: b.query<any, void>({
      query: () => "/users/stats",
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useUpdateMeMutation,
  useAdminUpdateMutation,
  useSuspendMutation,
  useActivateMutation,
  useDeleteUserMutation,
  useGetUserStatsQuery,
} = usersApi;
