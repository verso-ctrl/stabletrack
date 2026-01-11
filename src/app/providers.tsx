'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BarnProvider } from '@/contexts/BarnContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // Data stays fresh for 1 minute
            gcTime: 5 * 60 * 1000, // Cache kept for 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <BarnProvider>
        <SubscriptionProvider>
          {children}
        </SubscriptionProvider>
      </BarnProvider>
    </QueryClientProvider>
  );
}
