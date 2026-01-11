// src/components/subscription/UpgradeModal.tsx
// Modal for upgrading subscription tier

'use client'

import React, { useState } from 'react'
import { X, Check, Sparkles, Crown, Zap } from 'lucide-react'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { 
  SubscriptionTier, 
  TierFeatures, 
  FEATURE_LABELS,
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
  highlightedFeature,
  highlightedLimit,
}: UpgradeModalProps) {
  const { tier: currentTier } = useSubscription()
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const tierOrder: SubscriptionTier[] = ['FREE', 'PROFESSIONAL', 'FARM', 'ENTERPRISE']
  const currentIndex = tierOrder.indexOf(currentTier)
  const availableTiers = tierOrder.slice(currentIndex + 1)

  const handleUpgrade = async () => {
    if (!selectedTier) return
    
    setLoading(true)
    try {
      // Redirect to Stripe checkout
      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedTier,
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
      <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Upgrade Your Plan
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Unlock more features and increase your limits
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
                  ? 'bg-white shadow text-foreground' 
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
                  ? 'bg-white shadow text-foreground' 
                  : 'text-muted-foreground'
              )}
            >
              Annual
              <span className="ml-1 text-xs text-green-600">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Tier cards */}
        <div className="px-6 pb-6 grid gap-4 md:grid-cols-3">
          {availableTiers.map((tierName) => {
            const pricing = getTierPricing(tierName)
            const limits = getTierLimits(tierName)
            const isSelected = selectedTier === tierName
            const price = billingCycle === 'annual' 
              ? pricing.annualPriceCents / 12 
              : pricing.monthlyPriceCents

            return (
              <div
                key={tierName}
                onClick={() => setSelectedTier(tierName)}
                className={cn(
                  'relative border-2 rounded-xl p-5 cursor-pointer transition-all',
                  isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted hover:border-muted-foreground/50',
                  pricing.popular && 'ring-2 ring-primary ring-offset-2'
                )}
              >
                {pricing.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  {tierName === 'ENTERPRISE' && <Crown className="w-5 h-5 text-purple-500" />}
                  {tierName === 'FARM' && <Zap className="w-5 h-5 text-green-500" />}
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

                {/* Limits */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className={cn(
                    'flex items-center gap-2',
                    highlightedLimit === 'horses' && 'text-primary font-medium'
                  )}>
                    <Check className="w-4 h-4 text-green-500" />
                    {limits.maxHorses === -1 ? 'Unlimited' : limits.maxHorses} horses
                  </div>
                  <div className={cn(
                    'flex items-center gap-2',
                    highlightedLimit === 'teamMembers' && 'text-primary font-medium'
                  )}>
                    <Check className="w-4 h-4 text-green-500" />
                    {limits.maxTeamMembers === -1 ? 'Unlimited' : limits.maxTeamMembers} team members
                  </div>
                  <div className={cn(
                    'flex items-center gap-2',
                    highlightedLimit === 'storage' && 'text-primary font-medium'
                  )}>
                    <Check className="w-4 h-4 text-green-500" />
                    {formatBytes(limits.maxStorageBytes)} storage
                  </div>
                </div>

                {/* Key features */}
                <div className="space-y-1 text-sm">
                  {getKeyFeatures(tierName).map((feature) => (
                    <div 
                      key={feature}
                      className={cn(
                        'flex items-center gap-2',
                        highlightedFeature === feature && 'text-primary font-medium'
                      )}
                    >
                      <Check className="w-4 h-4 text-green-500" />
                      {FEATURE_LABELS[feature]}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            You can cancel or change your plan anytime.
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
              disabled={!selectedTier || loading}
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
                  Upgrade to {selectedTier ? getTierPricing(selectedTier).displayName : 'Selected Plan'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper to get key differentiating features for each tier
function getKeyFeatures(tier: SubscriptionTier): (keyof TierFeatures)[] {
  switch (tier) {
    case 'PROFESSIONAL':
      return ['taskManagement', 'feedCalendar', 'basicReporting']
    case 'FARM':
      return ['trainingScheduling', 'lessonManagement', 'invoicing']
    case 'ENTERPRISE':
      return ['multiLocation', 'advancedAnalytics', 'apiAccess']
    default:
      return []
  }
}
