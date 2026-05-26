import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery as bq } from "./baseQuery";

export const doctorsApi = createApi({
  reducerPath: "doctorsApi",
  baseQuery: bq,
  tagTypes: ["Doctors", "DoctorProfile"],
  endpoints: (b) => ({
    getMyProfile: b.query<any, void>({
      query: () => "/doctors/me",
      providesTags: ["DoctorProfile"],
    }),
    updateMyProfile: b.mutation<any, any>({
      query: (body) => ({ url: "/doctors/me", method: "PATCH", body }),
      invalidatesTags: ["DoctorProfile"],
    }),
    getAllDoctors: b.query<any, { page?: number; limit?: number; search?: string; departmentId?: string; specialization?: string }>({
      query: (params) => ({ url: "/doctors", params }),
      providesTags: ["Doctors"],
    }),
    getDoctorById: b.query<any, string>({
      query: (id) => `/doctors/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Doctors", id }],
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useGetAllDoctorsQuery,
  useGetDoctorByIdQuery,
} = doctorsApi;
