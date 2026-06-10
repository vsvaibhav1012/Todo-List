"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logout } from "@/store/authSlice";
import { baseApi } from "@/store/api/baseApi";

const CHANNEL = "auth";

export function useBroadcastLogout() {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = (e) => {
      if (e.data === "logout") {
        dispatch(logout());
        dispatch(baseApi.util.resetApiState());
        router.push("/login");
      }
    };
    return () => channel.close();
  }, [dispatch, router]);
}

export function broadcastLogout() {
  if (typeof window === "undefined") return;
  const channel = new BroadcastChannel(CHANNEL);
  channel.postMessage("logout");
  channel.close();
}
