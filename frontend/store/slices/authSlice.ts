import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

interface AuthState {
  user: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: Cookies.get("accessToken") || null,
  refreshToken: Cookies.get("refreshToken") || null,
  isAuthenticated: !!Cookies.get("accessToken"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: any; accessToken: string; refreshToken: string }>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      Cookies.set("accessToken", action.payload.accessToken, { expires: 1 });
      Cookies.set("refreshToken", action.payload.refreshToken, { expires: 7 });
    },
    setUser(state, action: PayloadAction<any>) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
    },
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
