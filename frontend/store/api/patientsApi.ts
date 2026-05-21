import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery as bq } from "./baseQuery";

export const patientsApi = createApi({
  reducerPath: "patientsApi",
  baseQuery: bq,
  tagTypes: ["Patients", "MyProfile"],
  endpoints: (b) => ({
    getMyProfile: b.query<any, void>({
      query: () => "/patients/me",
      providesTags: ["MyProfile"],
    }),
    updateMyProfile: b.mutation<any, any>({
      query: (body) => ({ url: "/patients/me", method: "PATCH", body }),
      invalidatesTags: ["MyProfile"],
    }),
    getAllPatients: b.query<any, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({ url: "/patients", params }),
      providesTags: ["Patients"],
    }),
    getPatientById: b.query<any, string>({
      query: (id) => `/patients/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Patients", id }],
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useGetAllPatientsQuery,
  useGetPatientByIdQuery,
} = patientsApi;
