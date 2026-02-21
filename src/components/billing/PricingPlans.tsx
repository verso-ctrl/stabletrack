'use client';

import React, { useState } from 'react';
import { Check, Loader2, ArrowUp, ArrowDown, Star, Calendar } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { csrfFetch } from '@/lib/fetch';
import { useBarn } from '@/contexts/BarnContext';
import { AddOnCard } from './AddOnCard';
import {
  TIER_PRICING,
  STARTER_FEATURES,
  FARM_FEATURES,
  ADD_ONS,
  formatBytes,
  type SubscriptionTier,
} from '@/lib/tiers';
import {
  TIER_LIMITS,
} from '@/types';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/lib/toast';

function formatLimit(value: number): string {
  return value === -1 ? 'Unlimited' : value.toString();
}

export function PricingPlans() {
  const { tier: currentTier, isLoading, changeTier, activeAddOns, currentPeriodEnd } = useSubscription();
  const { currentBarn, refreshBarn } = useBarn();
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);
  const [confirmUpgrade, setConfirmUpgrade] = useState<SubscriptionTier | null>(null);
  const [confirmDowngrade, setConfirmDowngrade] = useState<SubscriptionTier | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (!currentBarn?.id) return;

    try {
      setLoadingTier(tier);
      setError(null);

      const response = await csrfFetch('/api/billing/create-checkout', {
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
        const upgradeResponse = await csrfFetch(`/api/barns/${currentBarn.id}/subscription`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier }),
        });

        if (upgradeResponse.ok) {
          await changeTier(tier);
          await refreshBarn?.();
          toast.success('Plan upgraded!', `You are now on the ${TIER_PRICING[tier].displayName} plan.`);
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
      setConfirmUpgrade(null);
    }
  };

  const handleDowngrade = async (tier: SubscriptionTier) => {
    if (!currentBarn?.id) return;

    try {
      setLoadingTier(tier);
      setError(null);

      const response = await csrfFetch(`/api/barns/${currentBarn.id}/subscription`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to downgrade');
      }

      await changeTier(tier);
      await refreshBarn?.();
      const effectDate = currentPeriodEnd
        ? ` effective ${currentPeriodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        : '';
      toast.success('Downgrade scheduled', `You'll switch to the ${TIER_PRICING[tier].displayName} plan${effectDate}. You won't be charged for the higher plan after that.`);
    } catch (err) {
      console.error('Downgrade failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to downgrade');
    } finally {
      setLoadingTier(null);
      setConfirmDowngrade(null);
    }
  };

  const handleAddOn = async (addOnId: string) => {
    if (!currentBarn?.id) return;
    try {
      setError(null);
      const response = await csrfFetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_addon',
          addOnId,
          barnId: currentBarn.id,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add add-on');
      }
      if (data.demoMode) {
        await refreshBarn?.();
        toast.success('Add-on activated!', `${ADD_ONS[addOnId]?.name} has been added to your plan.`);
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Add-on activation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to add add-on');
    }
  };

  const handleRemoveAddOn = async (addOnId: string) => {
    if (!currentBarn?.id) return;
    try {
      setError(null);
      const response = await csrfFetch('/api/billing/remove-addon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barnId: currentBarn.id,
          addOnId,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove add-on');
      }
      await refreshBarn?.();
      toast.info('Add-on removed', `${ADD_ONS[addOnId]?.name} has been removed from your plan.`);
    } catch (err) {
      console.error('Add-on removal failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove add-on');
    }
  };

  const plans: {
    tier: SubscriptionTier
    features: string[]
    bestValue?: boolean
  }[] = [
    { tier: 'STARTER', features: STARTER_FEATURES },
    { tier: 'FARM', features: FARM_FEATURES, bestValue: true },
  ];

  return (
    <div className="space-y-8">
      {/* Change Plan */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Change Plan</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map(({ tier, features, bestValue }) => {
            const pricing = TIER_PRICING[tier];
            const isCurrent = tier === currentTier;
            const isUpgrade = tier === 'FARM' && currentTier === 'STARTER';
            const isDowngrade = tier === 'STARTER' && currentTier === 'FARM';

            return (
              <div
                key={tier}
                className={`
                  relative rounded-xl border-2 p-5 flex flex-col
                  ${bestValue ? 'border-primary/50' : 'border-border'}
                  ${isCurrent ? 'ring-2 ring-green-500 ring-offset-2' : ''}
                `}
              >
                {bestValue && !isCurrent && (
                  <span className="absolute -top-3 right-4 inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-medium px-2.5 py-0.5 rounded-full">
                    <Star className="w-3 h-3" />
                    Best Value
                  </span>
                )}

                {isCurrent && (
                  <span className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-medium px-3 py-0.5 rounded-full">
                    Current Plan
                  </span>
                )}

                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-foreground">{pricing.displayName}</h3>
                  <p className="text-sm text-muted-foreground">{pricing.description}</p>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-foreground">
                    ${pricing.monthlyPriceCents / 100}
                  </span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    if (isUpgrade) setConfirmUpgrade(tier);
                    else if (isDowngrade) setConfirmDowngrade(tier);
                  }}
                  disabled={isCurrent || loadingTier !== null || isLoading}
                  className={`
                    w-full py-2.5 px-4 rounded-lg font-medium transition-all
                    flex items-center justify-center gap-2 text-sm
                    ${
                      isCurrent
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-default'
                        : isUpgrade
                        ? 'bg-primary text-primary-foreground hover:opacity-90'
                        : 'border border-border text-muted-foreground hover:bg-muted'
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
                      Upgrade to {pricing.displayName}
                    </>
                  ) : (
                    <>
                      <ArrowDown className="w-4 h-4" />
                      Switch to {pricing.displayName}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Upgrade is prorated. Downgrade takes effect next billing cycle.
        </p>
      </div>

      {/* Add-Ons */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Add-Ons</h2>

        <div className="space-y-3">
          {/* Available add-ons */}
          {Object.values(ADD_ONS).filter(a => a.available).map((addOn) => (
            <AddOnCard
              key={addOn.id}
              addOn={addOn}
              isActive={activeAddOns.includes(addOn.id)}
              onAdd={() => handleAddOn(addOn.id)}
              onRemove={() => handleRemoveAddOn(addOn.id)}
            />
          ))}

          {/* Coming soon */}
          {Object.values(ADD_ONS).filter(a => !a.available).map((addOn) => (
            <AddOnCard
              key={addOn.id}
              addOn={addOn}
              compact
            />
          ))}
        </div>
      </div>

      {/* Upgrade Confirmation */}
      {confirmUpgrade && (
        <ConfirmDialog
          open={true}
          onCancel={() => setConfirmUpgrade(null)}
          onConfirm={() => handleUpgrade(confirmUpgrade)}
          title={`Upgrade to ${TIER_PRICING[confirmUpgrade].displayName}?`}
          description={`Your plan will be upgraded immediately. You'll be charged the prorated difference today. Your next bill will be $${TIER_PRICING[confirmUpgrade].monthlyPriceCents / 100}/month.`}
          confirmLabel="Upgrade"
          variant="default"
        />
      )}

      {/* Downgrade Confirmation */}
      {confirmDowngrade && (
        <ConfirmDialog
          open={true}
          onCancel={() => setConfirmDowngrade(null)}
          onConfirm={() => handleDowngrade(confirmDowngrade)}
          title={`Downgrade to ${TIER_PRICING[confirmDowngrade].displayName}?`}
          description={
            <div className="space-y-3">
              <p>
                Your current {TIER_PRICING[currentTier].displayName} plan will remain active until the end of your billing period.
                {currentPeriodEnd && (
                  <> You will <strong>not be charged</strong> for the {TIER_PRICING[currentTier].displayName} plan after <strong>{currentPeriodEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>.</>
                )}
              </p>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-300 text-xs space-y-1">
                <p className="font-medium">What changes with Starter:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Limited to 10 horses and 5 team members</li>
                  <li>Storage reduced to 10 GB</li>
                  <li>20 photos per horse</li>
                </ul>
              </div>
              {currentPeriodEnd && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Next charge: ${TIER_PRICING[confirmDowngrade].monthlyPriceCents / 100}/mo starting {currentPeriodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              )}
            </div>
          }
          confirmLabel="Confirm downgrade"
          variant="warning"
        />
      )}
    </div>
  );
}

export function CurrentPlanCard() {
  const { subscription, tier, isLoading, usage, limits, trial, storagePercentUsed, currentPeriodEnd } = useSubscription();
  const { currentBarn } = useBarn();
  const [isOpening, setIsOpening] = useState(false);

  const handleManageBilling = async () => {
    if (!currentBarn?.id) return;

    try {
      setIsOpening(true);

      const response = await csrfFetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barnId: currentBarn.id }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.demoMode) {
        toast.info('Demo Mode', 'In production, this would open the Stripe billing portal.');
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

  const pricing = TIER_PRICING[tier];
  const horsePercent = limits.maxHorses === -1 ? 0 : Math.round((usage.horses / limits.maxHorses) * 100);
  const teamPercent = limits.maxTeamMembers === -1 ? 0 : Math.round((usage.teamMembers / limits.maxTeamMembers) * 100);

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">
              {pricing.displayName} Plan
            </h3>
            <span
              className={`
              px-2 py-0.5 rounded-full text-xs font-medium
              ${trial.isTrialing
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : subscription?.status === 'ACTIVE'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : subscription?.status === 'PAST_DUE'
                ? 'bg-red-100 text-red-700'
                : 'bg-muted text-muted-foreground'
              }
            `}
            >
              {trial.isTrialing
                ? `Trial: ${trial.daysRemaining} days remaining`
                : subscription?.status || 'Active'
              }
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">{pricing.description}</p>
        </div>

        <div className="text-right">
          <span className="text-2xl font-bold text-foreground">
            ${pricing.monthlyPriceCents / 100}
          </span>
          <span className="text-muted-foreground">/month</span>
        </div>
      </div>

      {/* Next Billing Date */}
      {currentPeriodEnd && !trial.isTrialing && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>
            Next charge: <span className="font-medium text-foreground">${pricing.monthlyPriceCents / 100}</span> on{' '}
            <span className="font-medium text-foreground">
              {currentPeriodEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </span>
        </div>
      )}

      {/* Usage Bars */}
      <div className="mt-6 space-y-4">
        {/* Horses */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Horses</span>
            <span className="font-medium text-foreground">
              {usage.horses} / {formatLimit(limits.maxHorses)}
            </span>
          </div>
          {limits.maxHorses !== -1 && (
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  horsePercent >= 90 ? 'bg-red-500' : horsePercent >= 70 ? 'bg-amber-500' : 'bg-primary'
                }`}
                style={{ width: `${Math.min(100, horsePercent)}%` }}
              />
            </div>
          )}
        </div>

        {/* Team Members */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Team members</span>
            <span className="font-medium text-foreground">
              {usage.teamMembers} / {formatLimit(limits.maxTeamMembers)}
            </span>
          </div>
          {limits.maxTeamMembers !== -1 && (
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  teamPercent >= 90 ? 'bg-red-500' : teamPercent >= 70 ? 'bg-amber-500' : 'bg-primary'
                }`}
                style={{ width: `${Math.min(100, teamPercent)}%` }}
              />
            </div>
          )}
        </div>

        {/* Storage */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Storage</span>
            <span className="font-medium text-foreground">
              {formatBytes(usage.storageBytes)} / {limits.maxStorageBytes === -1 ? '∞' : formatBytes(limits.maxStorageBytes)}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                storagePercentUsed >= 90 ? 'bg-red-500' : storagePercentUsed >= 70 ? 'bg-amber-500' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(100, storagePercentUsed)}%` }}
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleManageBilling}
        disabled={isOpening}
        className="mt-5 w-full py-2 px-4 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-accent transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
      >
        {isOpening ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Opening...
          </>
        ) : (
          'Manage billing'
        )}
      </button>
    </div>
  );
}
