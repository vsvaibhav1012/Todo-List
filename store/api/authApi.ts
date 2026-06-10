import { baseApi } from "./baseApi";
import type { User } from "@/types";
import type { RegisterInput, LoginInput } from "@/validation/auth";

interface AuthResponse {
  user: User;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    register: build.mutation<AuthResponse, RegisterInput>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      invalidatesTags: ["User"],
    }),

    login: build.mutation<AuthResponse, LoginInput>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: ["User", "Todo"],
    }),

    logout: build.mutation<{ ok: boolean }, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: ["User", "Todo"],
    }),

    getMe: build.query<AuthResponse, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation, useLogoutMutation, useGetMeQuery } = authApi;
