'use client';

import React, { useState } from 'react';
import { Check, Loader2, ArrowUp, ArrowDown, CreditCard, Sparkles } from 'lucide-react';
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
  const { tier: currentTier, changeTier, isLoading } = useSubscription();
  const { currentBarn } = useBarn();
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<{ tier: SubscriptionTier; isDowngrade: boolean } | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState<SubscriptionTier | null>(null);

  const handleChangePlan = async (tier: SubscriptionTier) => {
    if (tier === currentTier) return;

    try {
      setLoadingTier(tier);
      await changeTier(tier);
      setShowConfirmModal(null);
    } catch (err) {
      console.error('Plan change failed:', err);
    } finally {
      setLoadingTier(null);
    }
  };

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (!currentBarn?.id) return;

    try {
      setLoadingTier(tier);

      // Call the Stripe checkout API
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

      if (data.demoMode) {
        // Demo mode: Simulate the upgrade
        await changeTier(tier);
        setShowUpgradeModal(null);
      } else if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        console.error('Checkout error:', data.error);
      }
    } catch (err) {
      console.error('Upgrade failed:', err);
    } finally {
      setLoadingTier(null);
    }
  };

  const handlePlanClick = (tier: SubscriptionTier, isDowngrade: boolean) => {
    if (tier === currentTier) return;

    // Show confirmation for downgrades
    if (isDowngrade) {
      setShowConfirmModal({ tier, isDowngrade });
    } else {
      // Show upgrade confirmation modal with Stripe checkout
      setShowUpgradeModal(tier);
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
                onClick={() => handlePlanClick(tier, isDowngrade)}
                disabled={isCurrent || loadingTier !== null || isLoading}
                className={`
                  w-full py-3 px-4 rounded-xl font-medium transition-all
                  flex items-center justify-center gap-2
                  ${
                    isCurrent
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : isDowngrade
                      ? 'bg-stone-100 text-stone-700 hover:bg-stone-200'
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
                ) : isDowngrade ? (
                  <>
                    <ArrowDown className="w-4 h-4" />
                    Downgrade to {info.name}
                  </>
                ) : (
                  <>
                    <ArrowUp className="w-4 h-4" />
                    Upgrade to {info.name}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-stone-500 mt-8">
        All plans include full access to every feature. Only the number of horses differs.
      </p>

      {/* Downgrade Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              Confirm Plan Change
            </h3>
            <p className="text-stone-600 mb-4">
              Are you sure you want to downgrade to the{' '}
              <span className="font-semibold">{TIER_INFO[showConfirmModal.tier].name}</span> plan?
            </p>

            {showConfirmModal.tier === 'FREE' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> The Free plan only supports up to 3 horses.
                  If you have more than 3 horses, you will need to archive some before downgrading.
                </p>
              </div>
            )}

            {showConfirmModal.tier === 'BASIC' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> The Basic plan supports up to 15 horses.
                  If you have more horses, you will need to archive some before downgrading.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(null)}
                className="flex-1 py-2 px-4 bg-stone-100 text-stone-700 rounded-lg font-medium hover:bg-stone-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleChangePlan(showConfirmModal.tier)}
                disabled={loadingTier !== null}
                className="flex-1 py-2 px-4 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
              >
                {loadingTier === showConfirmModal.tier ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Downgrade'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Confirmation Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-stone-900">
                  Upgrade to {TIER_INFO[showUpgradeModal].name}
                </h3>
                <p className="text-sm text-stone-500">
                  {TIER_INFO[showUpgradeModal].price}
                </p>
              </div>
            </div>

            <div className="bg-stone-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-stone-900 mb-2">What you'll get:</h4>
              <ul className="space-y-2">
                {showUpgradeModal === 'BASIC' && (
                  <>
                    <li className="flex items-start gap-2 text-sm text-stone-700">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Up to 15 horses</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-stone-700">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>5GB storage</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-stone-700">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Document uploads</span>
                    </li>
                  </>
                )}
                {showUpgradeModal === 'ADVANCED' && (
                  <>
                    <li className="flex items-start gap-2 text-sm text-stone-700">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Unlimited horses</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-stone-700">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Unlimited storage</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-stone-700">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Advanced analytics & reporting</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-stone-700">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Priority support</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(null)}
                disabled={loadingTier !== null}
                className="flex-1 py-2 px-4 bg-stone-100 text-stone-700 rounded-lg font-medium hover:bg-stone-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpgrade(showUpgradeModal)}
                disabled={loadingTier !== null}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingTier === showUpgradeModal ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Continue to Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
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
