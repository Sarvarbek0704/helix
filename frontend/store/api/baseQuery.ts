import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

const rawBase = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002/api",
  prepareHeaders: (headers) => {
    const token = Cookies.get("accessToken");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

export const baseQuery: typeof rawBase = async (args, api, extra) => {
  const result = await rawBase(args, api, extra);
  if (result.data && typeof result.data === "object" && "success" in (result.data as any)) {
    return { ...result, data: (result.data as any).data };
  }
  return result;
};
