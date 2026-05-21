import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery as bq } from "./baseQuery";

export const departmentsApi = createApi({
  reducerPath: "departmentsApi",
  baseQuery: bq,
  tagTypes: ["Departments"],
  endpoints: (b) => ({
    getAll: b.query<any, void>({
      query: () => "/departments",
      providesTags: ["Departments"],
    }),
    getById: b.query<any, string>({
      query: (id) => `/departments/${id}`,
    }),
    create: b.mutation<any, { name: string; description?: string; headDoctorId?: string }>({
      query: (body) => ({ url: "/departments", method: "POST", body }),
      invalidatesTags: ["Departments"],
    }),
    update: b.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/departments/${id}`, method: "PATCH", body: data }),
      invalidatesTags: ["Departments"],
    }),
    delete: b.mutation<any, string>({
      query: (id) => ({ url: `/departments/${id}`, method: "DELETE" }),
      invalidatesTags: ["Departments"],
    }),
  }),
});

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} = departmentsApi;
