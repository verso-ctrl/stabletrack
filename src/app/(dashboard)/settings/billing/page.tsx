'use client';

import React, { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PricingPlans, CurrentPlanCard } from '@/components/billing/PricingPlans';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { useBarn } from '@/contexts/BarnContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from '@/lib/toast';
import { csrfFetch } from '@/lib/fetch';

export default function BillingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentBarn, refreshBarn } = useBarn();
  const { changeTier } = useSubscription();
  const handledRef = useRef(false);

  // Handle return from Stripe checkout
  useEffect(() => {
    if (handledRef.current || !currentBarn?.id) return;

    const addonSuccess = searchParams?.get('addon_success');
    const planSuccess = searchParams?.get('success');
    const tier = searchParams?.get('tier');

    if (addonSuccess === 'true') {
      handledRef.current = true;
      // Verify and sync add-on status from Stripe session
      csrfFetch(`/api/barns/${currentBarn.id}/sync-subscription`, { method: 'POST' })
        .then(() => refreshBarn?.())
        .then(() => toast.success('Add-on activated!', 'Your add-on is now active.'))
        .catch(() => toast.success('Checkout complete!', 'Your add-on will be activated shortly.'));
      router.replace('/settings/billing');
    } else if (planSuccess === 'true' && tier) {
      handledRef.current = true;
      csrfFetch(`/api/barns/${currentBarn.id}/sync-subscription`, { method: 'POST' })
        .then(() => {
          changeTier(tier as any);
          return refreshBarn?.();
        })
        .then(() => toast.success('Plan upgraded!', `You are now on the ${tier} plan.`))
        .catch(() => toast.success('Checkout complete!', 'Your plan will be updated shortly.'));
      router.replace('/settings/billing');
    }
  }, [searchParams, currentBarn?.id, refreshBarn, changeTier, router]);

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings', href: '/settings' },
          { label: 'Billing' },
        ]}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing & Plans</h1>
        <p className="text-muted-foreground">Manage your plan, add-ons, and billing details</p>
      </div>

      {/* Current Plan */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Current Plan</h2>
        <CurrentPlanCard />
      </section>

      {/* Plans & Add-ons */}
      <section>
        <PricingPlans />
      </section>
    </div>
  );
}
