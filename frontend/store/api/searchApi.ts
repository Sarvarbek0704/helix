import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery as bq } from "./baseQuery";

export const searchApi = createApi({
  reducerPath: "searchApi",
  baseQuery: bq,
  endpoints: (b) => ({
    search: b.query<any, string>({
      query: (q) => `/search?q=${encodeURIComponent(q)}`,
    }),
  }),
});

export const { useLazySearchQuery } = searchApi;
