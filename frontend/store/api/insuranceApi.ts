import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery as bq } from "./baseQuery";

export const insuranceApi = createApi({
  reducerPath: "insuranceApi",
  baseQuery: bq,
  tagTypes: ["InsurancePlans", "InsuranceClaims"],
  endpoints: (b) => ({
    getPlans: b.query<any, { page?: number; limit?: number }>({
      query: (params) => ({ url: "/insurance/plans", params }),
      providesTags: ["InsurancePlans"],
    }),
    getPlanById: b.query<any, string>({
      query: (id) => `/insurance/plans/${id}`,
      providesTags: (_r, _e, id) => [{ type: "InsurancePlans", id }],
    }),
    createPlan: b.mutation<any, { name: string; description?: string; coveragePercent: number; maxCoverageAmount?: number; monthlyPremium?: number }>({
      query: (body) => ({ url: "/insurance/plans", method: "POST", body }),
      invalidatesTags: ["InsurancePlans"],
    }),
    updatePlan: b.mutation<any, { id: string; [key: string]: any }>({
      query: ({ id, ...body }) => ({ url: `/insurance/plans/${id}`, method: "PATCH", body }),
      invalidatesTags: ["InsurancePlans"],
    }),
    submitClaim: b.mutation<any, { billId: string; insurancePlanId: string; memberId: string; notes?: string }>({
      query: (body) => ({ url: "/insurance/claims", method: "POST", body }),
      invalidatesTags: ["InsuranceClaims"],
    }),
    getMyClaims: b.query<any, { page?: number; limit?: number }>({
      query: (params) => ({ url: "/insurance/claims/my", params }),
      providesTags: ["InsuranceClaims"],
    }),
    getAllClaims: b.query<any, { page?: number; limit?: number; status?: string }>({
      query: (params) => ({ url: "/insurance/claims", params }),
      providesTags: ["InsuranceClaims"],
    }),
    processClaim: b.mutation<any, { id: string; status: string; approvedAmount?: number; notes?: string }>({
      query: ({ id, ...body }) => ({ url: `/insurance/claims/${id}`, method: "PATCH", body }),
      invalidatesTags: ["InsuranceClaims"],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetPlanByIdQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useSubmitClaimMutation,
  useGetMyClaimsQuery,
  useGetAllClaimsQuery,
  useProcessClaimMutation,
} = insuranceApi;
