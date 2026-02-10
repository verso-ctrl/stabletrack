'use client';

import React, { useState } from 'react';
import { Check, Loader2, ArrowUp, CreditCard, Sparkles, Crown } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useBarn } from '@/contexts/BarnContext';
import {
  TIER_LIMITS,
  TIER_PRICING,
  type SubscriptionTier,
} from '@/types';

const HorseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12c0-4-3-8-8-8-3 0-5.5 1.5-7 3.5L3 10l1 3-2 4 3 1 2-1 2 3h4l1-2 2 1 4-3c1-1 2-2.5 2-4z"/>
    <circle cx="18" cy="9" r="1"/>
  </svg>
);

const TIER_INFO: Record<
  SubscriptionTier,
  { name: string; description: string; highlighted?: boolean; icon?: React.ReactNode }
> = {
  CORE: {
    name: 'Core',
    description: 'Everything you need for a small barn',
    highlighted: true,
  },
  PRO: {
    name: 'Pro',
    description: 'Unlimited horses for growing operations',
    icon: <Crown className="w-4 h-4 text-amber-500" />,
  },
};

function formatPrice(cents: number): string {
  if (cents === 0) return 'Free';
  return `$${(cents / 100).toFixed(0)}`;
}

function formatLimit(value: number): string {
  return value === -1 ? 'Unlimited' : value.toString();
}

export function PricingPlans() {
  const { tier: currentTier, isLoading } = useSubscription();
  const { currentBarn, refreshBarn } = useBarn();
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState<SubscriptionTier | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (!currentBarn?.id) return;

    try {
      setLoadingTier(tier);
      setError(null);

      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          barnId: currentBarn.id,
          billingCycle: 'monthly',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.demoMode) {
        // Demo mode: Simulate the upgrade
        const upgradeResponse = await fetch(`/api/barns/${currentBarn.id}/subscription`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier }),
        });

        if (upgradeResponse.ok) {
          await refreshBarn?.();
          setShowUpgradeModal(null);
        }
      } else if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Upgrade failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to upgrade');
    } finally {
      setLoadingTier(null);
    }
  };

  const tiers: SubscriptionTier[] = ['CORE', 'PRO'];

  return (
    <div className="py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground">
          Simple, transparent pricing
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          All features included. Pick the plan that fits your barn.
        </p>
      </div>

      {error && (
        <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {tiers.map((tier) => {
          const info = TIER_INFO[tier];
          const limits = TIER_LIMITS[tier];
          const price = TIER_PRICING[tier];
          const isCurrent = tier === currentTier;
          const isUpgrade = tiers.indexOf(tier) > tiers.indexOf(currentTier);

          return (
            <div
              key={tier}
              className={`
                relative rounded-2xl border-2 p-6 flex flex-col
                ${info.highlighted ? 'border-amber-500 shadow-xl' : 'border-border'}
                ${isCurrent ? 'ring-2 ring-green-500 ring-offset-2' : ''}
              `}
            >
              {info.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-amber-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-4 right-4">
                  <span className="bg-green-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  {info.icon}
                  {info.name}
                </h3>
                <p className="text-muted-foreground text-sm mt-1">{info.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">
                  {formatPrice(price)}
                </span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>

              {/* Horse limit highlight */}
              <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <HorseIcon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-700">
                      {formatLimit(limits.maxHorses)}
                    </p>
                    <p className="text-sm text-amber-600">
                      {limits.maxHorses === -1 ? 'horses' : 'horses max'}
                    </p>
                  </div>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {limits.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => isUpgrade && handleUpgrade(tier)}
                disabled={isCurrent || loadingTier !== null || isLoading || !isUpgrade}
                className={`
                  w-full py-3 px-4 rounded-xl font-medium transition-all
                  flex items-center justify-center gap-2
                  ${
                    isCurrent
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : isUpgrade
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'bg-muted text-muted-foreground cursor-default'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {loadingTier === tier ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : isCurrent ? (
                  'Current Plan'
                ) : isUpgrade ? (
                  <>
                    <ArrowUp className="w-4 h-4" />
                    Upgrade to {info.name}
                  </>
                ) : (
                  info.name
                )}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8">
        All plans include every feature. 14-day free trial, no credit card required.
      </p>
    </div>
  );
}

export function CurrentPlanCard() {
  const { subscription, tier, isLoading } = useSubscription();
  const { currentBarn } = useBarn();
  const [isOpening, setIsOpening] = useState(false);

  const handleManageBilling = async () => {
    if (!currentBarn?.id) return;

    try {
      setIsOpening(true);

      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barnId: currentBarn.id }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.demoMode) {
        alert('Demo Mode: In production, this would open the Stripe billing portal.');
      }
    } catch (err) {
      console.error('Failed to open billing portal:', err);
    } finally {
      setIsOpening(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded mb-4" />
        <div className="h-4 w-48 bg-muted rounded" />
      </div>
    );
  }

  const info = TIER_INFO[tier];
  const limits = TIER_LIMITS[tier];
  const price = TIER_PRICING[tier];

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">
              {info.name} Plan
            </h3>
            <span
              className={`
              px-2 py-0.5 rounded-full text-xs font-medium
              ${
                subscription?.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-700'
                  : subscription?.status === 'PAST_DUE'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-muted text-muted-foreground'
              }
            `}
            >
              {subscription?.status || 'Active'}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">{info.description}</p>
        </div>

        <div className="text-right">
          <span className="text-2xl font-bold text-foreground">
            {formatPrice(price)}
          </span>
          <span className="text-muted-foreground">/month</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="p-3 bg-amber-50 rounded-lg">
          <p className="text-xs text-amber-600 uppercase tracking-wide">
            Horses
          </p>
          <p className="text-lg font-semibold text-amber-700">
            {formatLimit(limits.maxHorses)}
          </p>
        </div>
        <div className="p-3 bg-background rounded-lg">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Storage
          </p>
          <p className="text-lg font-semibold text-foreground">
            {limits.storageGb} GB
          </p>
        </div>
        <div className="p-3 bg-background rounded-lg">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Features
          </p>
          <p className="text-lg font-semibold text-foreground">
            All
          </p>
        </div>
      </div>

      <button
        onClick={handleManageBilling}
        disabled={isOpening}
        className="mt-4 w-full py-2 px-4 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-accent transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isOpening ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Opening...
          </>
        ) : (
          'Manage Billing'
        )}
      </button>
    </div>
  );
}
