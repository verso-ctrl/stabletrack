'use client';

import React, { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import {
  TIER_LIMITS,
  TIER_PRICING,
  ADDON_PRICING,
  type SubscriptionTier,
  type AddOnType,
} from '@/types';

const TIER_INFO: Record<
  SubscriptionTier,
  { name: string; description: string; highlighted?: boolean }
> = {
  FREE: {
    name: 'Free',
    description: 'Perfect for small operations or trying out StableTrack',
  },
  PROFESSIONAL: {
    name: 'Professional',
    description: 'For growing farms with more horses',
    highlighted: true,
  },
  FARM: {
    name: 'Farm',
    description: 'Unlimited horses for established operations',
  },
  ENTERPRISE: {
    name: 'Enterprise',
    description: 'Multi-barn operations with advanced needs',
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

  const tiers: SubscriptionTier[] = ['FREE', 'PROFESSIONAL', 'FARM', 'ENTERPRISE'];

  return (
    <div className="py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-stone-900">
          Simple, transparent pricing
        </h2>
        <p className="mt-4 text-lg text-stone-600">
          Choose the plan that fits your farm's needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
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

              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>
                    <strong>{formatLimit(limits.maxHorses)}</strong> horses
                  </span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>
                    <strong>{formatLimit(limits.maxBarns)}</strong> barn
                    {limits.maxBarns !== 1 && 's'}
                  </span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>
                    <strong>{limits.storageGb} GB</strong> storage
                  </span>
                </li>
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
                  'Downgrade via Support'
                ) : (
                  `Upgrade to ${info.name}`
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AddOnsList() {
  const { hasAddOn, subscription } = useSubscription();

  const addOns: AddOnType[] = [
    'SMS_NOTIFICATIONS',
    'BREEDING_MODULE',
    'ADVANCED_ANALYTICS',
    'WHITE_LABEL',
    'API_ACCESS',
  ];

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-stone-900">Add-On Modules</h3>
        <p className="mt-2 text-stone-600">
          Extend your StableTrack with powerful add-ons
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {addOns.map((addOn) => {
          const info = ADDON_PRICING[addOn];
          const isActive = hasAddOn(addOn);

          return (
            <div
              key={addOn}
              className={`
                p-4 rounded-xl border-2 transition-all
                ${isActive ? 'border-green-500 bg-green-50' : 'border-stone-200'}
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-stone-900">{info.name}</h4>
                  <p className="text-sm text-stone-500 mt-1">
                    {info.description}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-stone-900">
                    {formatPrice(info.price)}
                  </span>
                  <span className="text-stone-500 text-sm">/mo</span>
                </div>
              </div>

              <button
                className={`
                  w-full mt-4 py-2 px-4 rounded-lg text-sm font-medium transition-all
                  ${
                    isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }
                `}
              >
                {isActive ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> Active
                  </span>
                ) : (
                  'Add to Plan'
                )}
              </button>
            </div>
          );
        })}
      </div>
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
        <div className="p-3 bg-stone-50 rounded-lg">
          <p className="text-xs text-stone-500 uppercase tracking-wide">
            Horses
          </p>
          <p className="text-lg font-semibold text-stone-900">
            {formatLimit(limits.maxHorses)}
          </p>
        </div>
        <div className="p-3 bg-stone-50 rounded-lg">
          <p className="text-xs text-stone-500 uppercase tracking-wide">Barns</p>
          <p className="text-lg font-semibold text-stone-900">
            {formatLimit(limits.maxBarns)}
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
