// 📁 lib/query-provider.tsx

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState ensures each browser session gets its own QueryClient
  // (important for SSR — prevents data leaking between users)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 2 minutes before a background refetch
            staleTime: 2 * 60 * 1000,
            // Keep unused data in cache for 5 minutes
            gcTime: 5 * 60 * 1000,
            // Retry failed requests once before showing an error
            retry: 1,
            // Refetch on remount when data is stale
            refetchOnMount: true,
            // Refetch when the user returns to the tab after being away
            refetchOnWindowFocus: true,
            // Refetch queries when network connectivity is restored
            refetchOnReconnect: true,
          },
          mutations: {
            // Don't retry failed mutations — they may have side effects
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
