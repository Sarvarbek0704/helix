import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery as bq } from "./baseQuery";

export const medicationsApi = createApi({
  reducerPath: "medicationsApi",
  baseQuery: bq,
  tagTypes: ["Medications"],
  endpoints: (b) => ({
    search: b.query<any, { search?: string; page?: number; limit?: number }>({
      query: (params) => ({ url: "/medications", params }),
      providesTags: ["Medications"],
    }),
    getById: b.query<any, string>({
      query: (id) => `/medications/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Medications", id }],
    }),
    create: b.mutation<any, { name: string; genericName?: string; category?: string; description?: string; form?: string }>({
      query: (body) => ({ url: "/medications", method: "POST", body }),
      invalidatesTags: ["Medications"],
    }),
    update: b.mutation<any, { id: string; [key: string]: any }>({
      query: ({ id, ...body }) => ({ url: `/medications/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Medications"],
    }),
    remove: b.mutation<any, string>({
      query: (id) => ({ url: `/medications/${id}`, method: "DELETE" }),
      invalidatesTags: ["Medications"],
    }),
    seed: b.mutation<any, void>({
      query: () => ({ url: "/medications/seed", method: "POST" }),
      invalidatesTags: ["Medications"],
    }),
  }),
});

export const {
  useSearchQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useRemoveMutation,
  useSeedMutation,
} = medicationsApi;
