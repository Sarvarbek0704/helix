import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery as bq } from "./baseQuery";

export const labApi = createApi({
  reducerPath: "labApi",
  baseQuery: bq,
  tagTypes: ["LabOrders", "LabResults"],
  endpoints: (b) => ({
    createOrder: b.mutation<any, { patientId: string; tests: string[]; notes?: string; appointmentId?: string }>({
      query: (body) => ({ url: "/lab/orders", method: "POST", body }),
      invalidatesTags: ["LabOrders"],
    }),
    getMyOrders: b.query<any, { page?: number; limit?: number }>({
      query: (params) => ({ url: "/lab/orders/my", params }),
      providesTags: ["LabOrders"],
    }),
    getPatientOrders: b.query<any, { id: string; page?: number; limit?: number }>({
      query: ({ id, ...params }) => ({ url: `/lab/orders/patient/${id}`, params }),
      providesTags: ["LabOrders"],
    }),
    getAllOrders: b.query<any, { page?: number; limit?: number; status?: string }>({
      query: (params) => ({ url: "/lab/orders", params }),
      providesTags: ["LabOrders"],
    }),
    getOrderById: b.query<any, string>({
      query: (id) => `/lab/orders/${id}`,
    }),
    uploadResult: b.mutation<any, { orderId: string; results: any[]; notes?: string }>({
      query: ({ orderId, ...body }) => ({ url: `/lab/orders/${orderId}/result`, method: "POST", body }),
      invalidatesTags: ["LabOrders", "LabResults"],
    }),
    getMyResults: b.query<any, { page?: number; limit?: number }>({
      query: (params) => ({ url: "/lab/results/my", params }),
      providesTags: ["LabResults"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetPatientOrdersQuery,
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useUploadResultMutation,
  useGetMyResultsQuery,
} = labApi;
