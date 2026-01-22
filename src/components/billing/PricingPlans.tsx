'use client';

import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
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
  { name: string; description: string; highlighted?: boolean }
> = {
  FREE: {
    name: 'Free',
    description: 'Perfect for getting started',
  },
  BASIC: {
    name: 'Basic',
    description: 'For growing operations',
    highlighted: true,
  },
  ADVANCED: {
    name: 'Advanced',
    description: 'Unlimited horses for larger farms',
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
  const { tier: currentTier, upgradeTier, isLoading } = useSubscription();
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (tier === 'FREE' || tier === currentTier) return;

    try {
      setLoadingTier(tier);
      await upgradeTier(tier);
    } catch (err) {
      console.error('Upgrade failed:', err);
    } finally {
      setLoadingTier(null);
    }
  };

  const tiers: SubscriptionTier[] = ['FREE', 'BASIC', 'ADVANCED'];

  return (
    <div className="py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-stone-900">
          Simple, transparent pricing
        </h2>
        <p className="mt-4 text-lg text-stone-600">
          All features included. Only pay for the horses you need.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {tiers.map((tier) => {
          const info = TIER_INFO[tier];
          const limits = TIER_LIMITS[tier];
          const price = TIER_PRICING[tier];
          const isCurrent = tier === currentTier;
          const isDowngrade =
            tiers.indexOf(tier) < tiers.indexOf(currentTier);

          return (
            <div
              key={tier}
              className={`
                relative rounded-2xl border-2 p-6 flex flex-col
                ${info.highlighted ? 'border-amber-500 shadow-xl' : 'border-stone-200'}
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
                <h3 className="text-xl font-bold text-stone-900">{info.name}</h3>
                <p className="text-stone-500 text-sm mt-1">{info.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-stone-900">
                  {formatPrice(price)}
                </span>
                {price > 0 && (
                  <span className="text-stone-500 ml-1">/month</span>
                )}
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
                onClick={() => handleUpgrade(tier)}
                disabled={
                  isCurrent ||
                  tier === 'FREE' ||
                  isDowngrade ||
                  loadingTier !== null ||
                  isLoading
                }
                className={`
                  w-full py-3 px-4 rounded-xl font-medium transition-all
                  flex items-center justify-center gap-2
                  ${
                    isCurrent
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : tier === 'FREE' || isDowngrade
                      ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                      : info.highlighted
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'bg-stone-900 text-white hover:bg-stone-800'
                  }
                `}
              >
                {loadingTier === tier ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : isCurrent ? (
                  'Current Plan'
                ) : tier === 'FREE' ? (
                  'Free Forever'
                ) : isDowngrade ? (
                  'Contact Support'
                ) : (
                  `Upgrade to ${info.name}`
                )}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-stone-500 mt-8">
        All plans include full access to every feature. Only the number of horses differs.
      </p>
    </div>
  );
}

export function CurrentPlanCard() {
  const { subscription, tier, openBillingPortal, isLoading } = useSubscription();
  const [isOpening, setIsOpening] = useState(false);

  const handleManageBilling = async () => {
    try {
      setIsOpening(true);
      await openBillingPortal();
    } catch (err) {
      console.error('Failed to open billing portal:', err);
    } finally {
      setIsOpening(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-6 animate-pulse">
        <div className="h-6 w-32 bg-stone-200 rounded mb-4" />
        <div className="h-4 w-48 bg-stone-100 rounded" />
      </div>
    );
  }

  const info = TIER_INFO[tier];
  const limits = TIER_LIMITS[tier];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-stone-900">
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
                  : 'bg-stone-100 text-stone-700'
              }
            `}
            >
              {subscription?.status || 'Active'}
            </span>
          </div>
          <p className="text-stone-500 text-sm mt-1">{info.description}</p>
        </div>

        <div className="text-right">
          <span className="text-2xl font-bold text-stone-900">
            {formatPrice(TIER_PRICING[tier])}
          </span>
          {TIER_PRICING[tier] > 0 && (
            <span className="text-stone-500">/month</span>
          )}
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
        <div className="p-3 bg-stone-50 rounded-lg">
          <p className="text-xs text-stone-500 uppercase tracking-wide">
            Storage
          </p>
          <p className="text-lg font-semibold text-stone-900">
            {limits.storageGb} GB
          </p>
        </div>
        <div className="p-3 bg-stone-50 rounded-lg">
          <p className="text-xs text-stone-500 uppercase tracking-wide">
            Features
          </p>
          <p className="text-lg font-semibold text-stone-900">
            All
          </p>
        </div>
      </div>

      {(subscription as any)?.currentPeriodEnd && (
        <p className="text-sm text-stone-500 mt-4">
          {(subscription as any).cancelAtPeriodEnd
            ? 'Access until '
            : 'Next billing date: '}
          {new Date((subscription as any).currentPeriodEnd).toLocaleDateString()}
        </p>
      )}

      {tier !== 'FREE' && (
        <button
          onClick={handleManageBilling}
          disabled={isOpening}
          className="mt-4 w-full py-2 px-4 bg-stone-100 text-stone-700 rounded-lg font-medium hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
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
      )}
    </div>
  );
}
