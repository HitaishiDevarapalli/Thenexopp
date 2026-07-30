import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes cache stale time (perfect for 500-1000 properties)
      gcTime: 10 * 60 * 1000,   // 10 minutes garbage collection time
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
