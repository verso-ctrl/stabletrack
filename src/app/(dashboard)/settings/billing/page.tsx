'use client';

import React from 'react';
import { PricingPlans, CurrentPlanCard } from '@/components/billing/PricingPlans';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export default function BillingPage() {
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
        <h1 className="text-2xl font-bold text-foreground">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing details</p>
      </div>

      {/* Current Plan */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Current Plan</h2>
        <CurrentPlanCard />
      </section>

      {/* Pricing Plans */}
      <section>
        <PricingPlans />
      </section>
    </div>
  );
}
