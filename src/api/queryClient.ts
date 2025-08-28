import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // defaults, can be overridden
      retry: 2,
      staleTime: 60_000,
      gcTime: 1000 * 60 * 60, // keep in cache for 1h if not used
      refetchOnWindowFocus: false,
    },
  },
});
