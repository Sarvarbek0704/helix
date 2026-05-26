import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery as bq } from "./baseQuery";

interface LabResult {
  testName: string;
  value: string;
  unit: string;
  referenceRange?: string;
  flag?: string;
  notes?: string;
}

export const labApi = createApi({
  reducerPath: "labApi",
  baseQuery: bq,
  tagTypes: ["LabOrders"],
  endpoints: (b) => ({
    createOrder: b.mutation<any, {
      patientId: string;
      appointmentId?: string;
      tests: string[];
      priority?: "routine" | "urgent" | "stat";
      clinicalNotes?: string;
    }>({
      query: (body) => ({ url: "/lab/orders", method: "POST", body }),
      invalidatesTags: ["LabOrders"],
    }),
    getMyOrders: b.query<any, { page?: number; limit?: number }>({
      query: (params) => ({ url: "/lab/orders/my", params }),
      providesTags: ["LabOrders"],
    }),
    getAllOrders: b.query<any, { page?: number; limit?: number; status?: string; patientId?: string }>({
      query: (params) => ({ url: "/lab/orders", params }),
      providesTags: ["LabOrders"],
    }),
    getOrderById: b.query<any, string>({
      query: (id) => `/lab/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: "LabOrders", id }],
    }),
    updateOrderStatus: b.mutation<any, { id: string; status: string }>({
      query: ({ id, ...body }) => ({ url: `/lab/orders/${id}/status`, method: "PATCH", body }),
      invalidatesTags: ["LabOrders"],
    }),
    uploadResults: b.mutation<any, { orderId: string; results: LabResult[] }>({
      query: ({ orderId, ...body }) => ({ url: `/lab/orders/${orderId}/results`, method: "POST", body }),
      invalidatesTags: ["LabOrders"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useUploadResultsMutation,
} = labApi;
