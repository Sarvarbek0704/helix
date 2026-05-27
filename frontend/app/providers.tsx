"use client";
import { useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { store } from "@/store";
import { useGetMeQuery } from "@/store/api/authApi";
import { setUser, logout } from "@/store/slices/authSlice";
import type { RootState } from "@/store";

function AuthInit() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const currentUser = useSelector((s: RootState) => s.auth.user);

  const { data, error } = useGetMeQuery(undefined, {
    skip: !isAuthenticated || !!currentUser,
  });

  useEffect(() => {
    if (data) dispatch(setUser(data));
  }, [data, dispatch]);

  useEffect(() => {
    if (error) dispatch(logout());
  }, [error, dispatch]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AuthInit />
        {children}
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </Provider>
  );
}
