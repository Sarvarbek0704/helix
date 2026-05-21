import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import { authApi } from "./api/authApi";
import { usersApi } from "./api/usersApi";
import { patientsApi } from "./api/patientsApi";
import { doctorsApi } from "./api/doctorsApi";
import { appointmentsApi } from "./api/appointmentsApi";
import { analyticsApi } from "./api/analyticsApi";
import { notificationsApi } from "./api/notificationsApi";
import { medicalApi } from "./api/medicalApi";
import { vitalsApi } from "./api/vitalsApi";
import { billingApi } from "./api/billingApi";
import { prescriptionsApi } from "./api/prescriptionsApi";
import { labApi } from "./api/labApi";
import { departmentsApi } from "./api/departmentsApi";
import { schedulesApi } from "./api/schedulesApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [patientsApi.reducerPath]: patientsApi.reducer,
    [doctorsApi.reducerPath]: doctorsApi.reducer,
    [appointmentsApi.reducerPath]: appointmentsApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [medicalApi.reducerPath]: medicalApi.reducer,
    [vitalsApi.reducerPath]: vitalsApi.reducer,
    [billingApi.reducerPath]: billingApi.reducer,
    [prescriptionsApi.reducerPath]: prescriptionsApi.reducer,
    [labApi.reducerPath]: labApi.reducer,
    [departmentsApi.reducerPath]: departmentsApi.reducer,
    [schedulesApi.reducerPath]: schedulesApi.reducer,
  },
  middleware: (gDM) =>
    gDM().concat(
      authApi.middleware,
      usersApi.middleware,
      patientsApi.middleware,
      doctorsApi.middleware,
      appointmentsApi.middleware,
      analyticsApi.middleware,
      notificationsApi.middleware,
      medicalApi.middleware,
      vitalsApi.middleware,
      billingApi.middleware,
      prescriptionsApi.middleware,
      labApi.middleware,
      departmentsApi.middleware,
      schedulesApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
