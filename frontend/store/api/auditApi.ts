import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery as bq } from "./baseQuery";

export const auditApi = createApi({
  reducerPath: "auditApi",
  baseQuery: bq,
  tagTypes: ["Audit"],
  endpoints: (b) => ({
    getAuditLogs: b.query<any, { page?: number; limit?: number; entityType?: string; userId?: string }>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params.page) q.set("page", String(params.page));
        if (params.limit) q.set("limit", String(params.limit));
        if (params.entityType) q.set("entityType", params.entityType);
        if (params.userId) q.set("userId", params.userId);
        return `/audit?${q.toString()}`;
      },
      providesTags: ["Audit"],
    }),
  }),
});

export const { useGetAuditLogsQuery } = auditApi;
