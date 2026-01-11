// src/components/subscription/FeatureGate.tsx
// Components for gating features based on subscription tier

'use client'

import React from 'react'
import { Lock, Sparkles, ArrowRight, Crown } from 'lucide-react'
import { useSubscription, useFeature } from '@/contexts/SubscriptionContext'
import { 
  TierFeatures, 
  FEATURE_LABELS, 
  SubscriptionTier,
  getTierFeatures,
  getTierPricing,
  formatBytes,
} from '@/lib/tiers'
import { cn } from '@/lib/utils'

// =============================================================================
// FEATURE GATE - Hides content if feature not available
// =============================================================================

interface FeatureGateProps {
  feature: keyof TierFeatures
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgradePrompt?: boolean
}

export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
}: FeatureGateProps) {
  const hasAccess = useFeature(feature)

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (showUpgradePrompt) {
    return <FeatureLockedCard feature={feature} />
  }

  return null
}

// =============================================================================
// FEATURE LOCKED CARD - Shows when feature is not available
// =============================================================================

interface FeatureLockedCardProps {
  feature: keyof TierFeatures
  compact?: boolean
}

export function FeatureLockedCard({ feature, compact = false }: FeatureLockedCardProps) {
  const { tier, openUpgradeModal } = useSubscription()
  const featureLabel = FEATURE_LABELS[feature]
  
  // Find minimum tier that has this feature
  const requiredTier = findMinimumTierForFeature(feature)

  if (compact) {
    return (
      <button
        onClick={openUpgradeModal}
        className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
      >
        <Lock className="w-4 h-4" />
        <span>Upgrade to unlock {featureLabel}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    )
  }

  return (
    <div className="border border-dashed rounded-lg p-6 text-center bg-muted/30">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
        <Lock className="w-6 h-6 text-primary" />
      </div>
      
      <h3 className="font-semibold mb-1">{featureLabel}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        This feature is available on the {requiredTier} plan and above.
      </p>
      
      <button
        onClick={openUpgradeModal}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        <Sparkles className="w-4 h-4" />
        Upgrade to {requiredTier}
      </button>
    </div>
  )
}

function findMinimumTierForFeature(feature: keyof TierFeatures): string {
  const tierOrder: SubscriptionTier[] = ['FREE', 'PROFESSIONAL', 'FARM', 'ENTERPRISE']
  
  for (const tierName of tierOrder) {
    const features = getTierFeatures(tierName)
    if (features[feature]) {
      return getTierPricing(tierName).displayName
    }
  }
  
  return 'Enterprise'
}

// =============================================================================
// LIMIT GATE - Shows upgrade prompt when limit reached
// =============================================================================

interface LimitGateProps {
  type: 'horses' | 'teamMembers' | 'storage'
  children: React.ReactNode
}

export function LimitGate({ type, children }: LimitGateProps) {
  const sub = useSubscription()
  
  const canProceed = {
    horses: sub.canAddHorses(),
    teamMembers: sub.canAddTeamMembers(),
    storage: sub.storagePercentUsed < 100,
  }

  if (canProceed[type]) {
    return <>{children}</>
  }

  return <LimitReachedCard type={type} />
}

// =============================================================================
// LIMIT REACHED CARD
// =============================================================================

interface LimitReachedCardProps {
  type: 'horses' | 'teamMembers' | 'storage'
  compact?: boolean
}

export function LimitReachedCard({ type, compact = false }: LimitReachedCardProps) {
  const { tier, limits, usage, openUpgradeModal, getUpgradeMessage } = useSubscription()
  const tierPricing = getTierPricing(tier)

  const labels = {
    horses: 'Horse Limit Reached',
    teamMembers: 'Team Member Limit Reached',
    storage: 'Storage Limit Reached',
  }

  const descriptions = {
    horses: `You have ${usage.horses} of ${limits.maxHorses === -1 ? 'unlimited' : limits.maxHorses} horses on your ${tierPricing.displayName} plan.`,
    teamMembers: `You have ${usage.teamMembers} of ${limits.maxTeamMembers === -1 ? 'unlimited' : limits.maxTeamMembers} team members on your ${tierPricing.displayName} plan.`,
    storage: `You've used 100% of your storage on the ${tierPricing.displayName} plan.`,
  }

  if (compact) {
    return (
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">{descriptions[type]}</p>
        <button
          onClick={openUpgradeModal}
          className="text-sm text-yellow-700 font-medium hover:underline mt-1"
        >
          Upgrade for more →
        </button>
      </div>
    )
  }

  return (
    <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-6 text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
        <Crown className="w-6 h-6 text-yellow-600" />
      </div>
      
      <h3 className="font-semibold mb-1 text-yellow-900">{labels[type]}</h3>
      <p className="text-sm text-yellow-700 mb-2">{descriptions[type]}</p>
      <p className="text-sm text-yellow-600 mb-4">{getUpgradeMessage(type)}</p>
      
      <button
        onClick={openUpgradeModal}
        className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
      >
        <Sparkles className="w-4 h-4" />
        Upgrade Plan
      </button>
    </div>
  )
}

// =============================================================================
// USAGE METER - Shows current usage vs limit
// =============================================================================

interface UsageMeterProps {
  type: 'horses' | 'teamMembers' | 'storage'
  showUpgradePrompt?: boolean
  className?: string
}

export function UsageMeter({ type, showUpgradePrompt = true, className }: UsageMeterProps) {
  const { tier, limits, usage, openUpgradeModal } = useSubscription()

  const config = {
    horses: {
      label: 'Horses',
      current: usage.horses,
      max: limits.maxHorses,
      format: (n: number) => n.toString(),
    },
    teamMembers: {
      label: 'Team Members',
      current: usage.teamMembers,
      max: limits.maxTeamMembers,
      format: (n: number) => n.toString(),
    },
    storage: {
      label: 'Storage',
      current: usage.storageBytes,
      max: limits.maxStorageBytes,
      format: (bytes: number) => formatBytes(bytes),
    },
  }

  const { label, current, max, format } = config[type]
  const percentage = max === -1 ? 0 : Math.min(100, Math.round((current / max) * 100))
  const isNearLimit = percentage >= 80
  const isAtLimit = percentage >= 100

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn(
          'font-medium',
          isAtLimit && 'text-destructive',
          isNearLimit && !isAtLimit && 'text-yellow-600'
        )}>
          {format(current)} / {max === -1 ? '∞' : format(max)}
        </span>
      </div>

      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-500',
            isAtLimit && 'bg-destructive',
            isNearLimit && !isAtLimit && 'bg-yellow-500',
            !isNearLimit && 'bg-primary'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {showUpgradePrompt && isNearLimit && (
        <button
          onClick={openUpgradeModal}
          className="text-xs text-muted-foreground hover:text-primary"
        >
          {isAtLimit ? 'Upgrade to add more' : `${100 - percentage}% remaining`} →
        </button>
      )}
    </div>
  )
}

// =============================================================================
// TIER BADGE - Shows current tier
// =============================================================================

interface TierBadgeProps {
  tier?: SubscriptionTier
  size?: 'sm' | 'md' | 'lg'
}

export function TierBadge({ tier: propTier, size = 'md' }: TierBadgeProps) {
  const { tier: contextTier } = useSubscription()
  const tier = propTier || contextTier
  const tierPricing = getTierPricing(tier)

  const colors: Record<SubscriptionTier, string> = {
    FREE: 'bg-gray-100 text-gray-700',
    PROFESSIONAL: 'bg-blue-100 text-blue-700',
    FARM: 'bg-green-100 text-green-700',
    ENTERPRISE: 'bg-purple-100 text-purple-700',
  }

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  return (
    <span className={cn(
      'inline-flex items-center font-medium rounded-full',
      colors[tier],
      sizes[size]
    )}>
      {tier === 'ENTERPRISE' && <Crown className="w-3 h-3 mr-1" />}
      {tierPricing.displayName}
    </span>
  )
}

// =============================================================================
// FEATURE LIST - Shows what's included in current tier
// =============================================================================

interface FeatureListProps {
  showLocked?: boolean
}

export function FeatureList({ showLocked = false }: FeatureListProps) {
  const { features } = useSubscription()

  const allFeatures = Object.entries(features) as [keyof TierFeatures, boolean][]

  return (
    <ul className="space-y-2">
      {allFeatures
        .filter(([_, enabled]) => showLocked || enabled)
        .map(([feature, enabled]) => (
          <li
            key={feature}
            className={cn(
              'flex items-center gap-2 text-sm',
              !enabled && 'text-muted-foreground'
            )}
          >
            {enabled ? (
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                <Lock className="w-3 h-3 text-muted-foreground" />
              </div>
            )}
            {FEATURE_LABELS[feature]}
          </li>
        ))}
    </ul>
  )
}
