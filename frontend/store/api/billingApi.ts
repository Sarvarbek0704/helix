import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery as bq } from "./baseQuery";

export const billingApi = createApi({
  reducerPath: "billingApi",
  baseQuery: bq,
  tagTypes: ["Bills"],
  endpoints: (b) => ({
    create: b.mutation<any, { patientId: string; items: any[]; dueDate?: string }>({
      query: (body) => ({ url: "/billing", method: "POST", body }),
      invalidatesTags: ["Bills"],
    }),
    getMyBills: b.query<any, { page?: number; limit?: number; status?: string }>({
      query: (params) => ({ url: "/billing/my", params }),
      providesTags: ["Bills"],
    }),
    getSummary: b.query<any, void>({
      query: () => "/billing/summary",
    }),
    getAll: b.query<any, { page?: number; limit?: number; status?: string }>({
      query: (params) => ({ url: "/billing", params }),
      providesTags: ["Bills"],
    }),
    getById: b.query<any, string>({
      query: (id) => `/billing/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Bills", id }],
    }),
    recordPayment: b.mutation<any, { id: string; amount: number; method: string }>({
      query: ({ id, ...body }) => ({ url: `/billing/${id}/payment`, method: "PATCH", body }),
      invalidatesTags: ["Bills"],
    }),
  }),
});

export const {
  useCreateMutation,
  useGetMyBillsQuery,
  useGetSummaryQuery,
  useGetAllQuery,
  useGetByIdQuery,
  useRecordPaymentMutation,
} = billingApi;
