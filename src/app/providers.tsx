'use client';

import { BarnProvider } from '@/contexts/BarnContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BarnProvider>
      <SubscriptionProvider>
        {children}
      </SubscriptionProvider>
    </BarnProvider>
  );
}
