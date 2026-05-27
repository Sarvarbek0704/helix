import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery as bq } from "./baseQuery";

export const timelineApi = createApi({
  reducerPath: "timelineApi",
  baseQuery: bq,
  endpoints: (b) => ({
    getMyTimeline: b.query<any[], void>({ query: () => "/patients/my/timeline" }),
    getPatientTimeline: b.query<any[], string>({ query: (id) => `/patients/${id}/timeline` }),
  }),
});

export const { useGetMyTimelineQuery, useGetPatientTimelineQuery } = timelineApi;
