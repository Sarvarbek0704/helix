import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery as bq } from "./baseQuery";

export const waitlistApi = createApi({
  reducerPath: "waitlistApi",
  baseQuery: bq,
  tagTypes: ["Waitlist"],
  endpoints: (b) => ({
    getMyWaitlist: b.query<any[], void>({ query: () => "/waitlist/my", providesTags: ["Waitlist"] }),
    addToWaitlist: b.mutation<any, { doctorId: string; preferredDate?: string; reason?: string }>({
      query: (body) => ({ url: "/waitlist", method: "POST", body }),
      invalidatesTags: ["Waitlist"],
    }),
    cancelWaitlist: b.mutation<any, string>({
      query: (id) => ({ url: `/waitlist/${id}/cancel`, method: "PATCH", body: {} }),
      invalidatesTags: ["Waitlist"],
    }),
  }),
});

export const { useGetMyWaitlistQuery, useAddToWaitlistMutation, useCancelWaitlistMutation } = waitlistApi;
