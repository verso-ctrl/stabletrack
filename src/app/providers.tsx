'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BarnProvider, useBarn } from '@/contexts/BarnContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { useState } from 'react';
import type { SubscriptionTier } from '@/lib/tiers';

// Wrapper component to connect BarnContext to SubscriptionProvider
function SubscriptionProviderWithBarn({ children }: { children: React.ReactNode }) {
  const { currentBarn } = useBarn();
  const barnTier = (currentBarn?.tier as SubscriptionTier) || 'FREE';

  return (
    <SubscriptionProvider barnId={currentBarn?.id} barnTier={barnTier}>
      {children}
    </SubscriptionProvider>
  );
}

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
        <SubscriptionProviderWithBarn>
          {children}
        </SubscriptionProviderWithBarn>
      </BarnProvider>
    </QueryClientProvider>
  );
}
