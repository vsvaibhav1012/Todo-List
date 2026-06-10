"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { store } from "@/store";
import { AuthHydrator } from "./AuthHydrator";
import { useBroadcastLogout } from "@/hooks/useBroadcastLogout";

function BroadcastListener() {
  useBroadcastLogout();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <AuthHydrator />
        <BroadcastListener />
        {children}
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </Provider>
  );
}
