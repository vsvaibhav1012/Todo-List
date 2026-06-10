"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export function useAuth() {
  const { user, status } = useSelector((s: RootState) => s.auth);
  return {
    user,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "idle" || status === "loading",
  };
}
