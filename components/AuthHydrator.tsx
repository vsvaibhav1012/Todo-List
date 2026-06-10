"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useGetMeQuery } from "@/store/api/authApi";

export function AuthHydrator() {
  const { data, isError } = useGetMeQuery();
  return null;
}
