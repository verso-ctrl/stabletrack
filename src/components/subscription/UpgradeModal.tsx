// src/components/subscription/UpgradeModal.tsx
// Modal for upgrading to the next plan tier

'use client'

import React, { useState } from 'react'
import { X, Check, Sparkles, Crown } from 'lucide-react'
import { useSubscription } from '@/contexts/SubscriptionContext'
import {
  type TierFeatures,
  getNextTier,
  getTierPricing,
  getTierLimits,
  formatBytes,
} from '@/lib/tiers'
import { cn } from '@/lib/utils'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  highlightedFeature?: keyof TierFeatures
  highlightedLimit?: 'horses' | 'teamMembers' | 'storage'
}

export function UpgradeModal({
  open,
  onClose,
  highlightedLimit,
}: UpgradeModalProps) {
  const { tier: currentTier } = useSubscription()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const nextTier = getNextTier(currentTier)
  if (!nextTier) return null // Already on highest tier

  const pricing = getTierPricing(nextTier)
  const limits = getTierLimits(nextTier)
  const currentLimits = getTierLimits(currentTier)
  const price = billingCycle === 'annual'
    ? pricing.annualPriceCents / 12
    : pricing.monthlyPriceCents

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: nextTier,
          billingCycle,
        }),
      })

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Upgrade error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              Upgrade to {pricing.displayName}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Remove all limits and grow your operation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Billing toggle */}
        <div className="px-6 py-4 flex justify-center">
          <div className="inline-flex items-center bg-muted rounded-full p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                billingCycle === 'monthly'
                  ? 'bg-card shadow text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                billingCycle === 'annual'
                  ? 'bg-card shadow text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              Annual
              <span className="ml-1 text-xs text-green-600">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Pro card */}
        <div className="px-6 pb-6">
          <div className="border-2 border-primary rounded-xl p-5 bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold">{pricing.displayName}</h3>
            </div>

            <div className="mb-4">
              <span className="text-3xl font-bold">${Math.round(price / 100)}</span>
              <span className="text-muted-foreground">/month</span>
              {billingCycle === 'annual' && (
                <p className="text-xs text-green-600">
                  Billed ${pricing.annualPriceCents / 100}/year
                </p>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {pricing.description}
            </p>

            {/* What you get */}
            <div className="space-y-2 text-sm">
              <div className={cn(
                'flex items-center gap-2',
                highlightedLimit === 'horses' && 'text-primary font-medium'
              )}>
                <Check className="w-4 h-4 text-green-500" />
                Unlimited horses (you have up to {currentLimits.maxHorses} now)
              </div>
              <div className={cn(
                'flex items-center gap-2',
                highlightedLimit === 'teamMembers' && 'text-primary font-medium'
              )}>
                <Check className="w-4 h-4 text-green-500" />
                Unlimited team members
              </div>
              <div className={cn(
                'flex items-center gap-2',
                highlightedLimit === 'storage' && 'text-primary font-medium'
              )}>
                <Check className="w-4 h-4 text-green-500" />
                {formatBytes(limits.maxStorageBytes)} storage
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Unlimited photos per horse
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Priority support
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Cancel or change your plan anytime.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className={cn(
                'px-6 py-2 bg-primary text-primary-foreground rounded-lg',
                'hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center gap-2'
              )}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Upgrade to {pricing.displayName}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
