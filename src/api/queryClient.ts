import { QueryClient } from "@tanstack/react-query";
import {
  QUERY_RETRY_COUNT,
  QUERY_STALE_TIME_MS,
  QUERY_GC_TIME_MS,
} from "../constants";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // defaults, can be overridden
      retry: QUERY_RETRY_COUNT,
      staleTime: QUERY_STALE_TIME_MS,
      gcTime: QUERY_GC_TIME_MS,
      refetchOnWindowFocus: false,
    },
  },
});
