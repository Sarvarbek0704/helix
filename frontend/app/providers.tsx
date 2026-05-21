"use client";
import { Provider } from "react-redux";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { store } from "@/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        {children}
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </Provider>
  );
}
