import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store";

const baseQuery = fetchBaseQuery({
  baseUrl: "/api",
  credentials: "include",
});

const baseQueryWithRefresh: typeof baseQuery = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    // Attempt token refresh
    const refreshResult = await baseQuery(
      { url: "/auth/refresh", method: "POST" },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      // Retry original request with new access token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed — clear auth state
      api.dispatch({ type: "auth/logout" });
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRefresh,
  tagTypes: ["Todo", "User"],
  endpoints: () => ({}),
});
