'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PricingPlans, CurrentPlanCard } from '@/components/billing/PricingPlans';

export default function BillingPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/settings"
          className="p-2 rounded-xl hover:bg-stone-100 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Billing & Subscription</h1>
          <p className="text-stone-500">Manage your subscription and billing details</p>
        </div>
      </div>

      {/* Current Plan */}
      <section>
        <h2 className="text-lg font-semibold text-stone-900 mb-4">Current Plan</h2>
        <CurrentPlanCard />
      </section>

      {/* Pricing Plans */}
      <section>
        <PricingPlans />
      </section>
    </div>
  );
}
