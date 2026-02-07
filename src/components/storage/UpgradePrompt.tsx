// src/components/storage/UpgradePrompt.tsx
// Modal prompting users to upgrade their subscription tier

'use client'

import React from 'react'
import { X, Crown, Check, Zap } from 'lucide-react'
import { 
  getTierDisplayName, 
  getNextTier, 
  getTierFeatures,
  getTierLimits,
  formatBytes,
  type SubscriptionTier 
} from '@/lib/tiers'
import { cn } from '@/lib/utils'

interface UpgradePromptProps {
  currentTier: SubscriptionTier
  feature?: string
  onClose: () => void
  onUpgrade: () => void
}

export function UpgradePrompt({
  currentTier,
  feature,
  onClose,
  onUpgrade,
}: UpgradePromptProps) {
  const nextTier = getNextTier(currentTier)
  
  if (!nextTier) {
    return null // Already on highest tier
  }

  const improvements = getImprovements(currentTier, nextTier)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-card/20 rounded"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-card/20 rounded-full">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Upgrade to {getTierDisplayName(nextTier)}</h2>
              <p className="text-white/80 text-sm">
                {feature ? `Unlock ${feature} and more` : 'Get more features'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            You're currently on the <strong>{getTierDisplayName(currentTier)}</strong> plan. 
            Upgrade to unlock:
          </p>

          {/* Improvements list */}
          <ul className="space-y-3">
            {improvements.map((improvement, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="p-1 bg-green-100 rounded-full mt-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm">{improvement}</span>
              </li>
            ))}
          </ul>

          {/* Pricing hint */}
          <div className="pt-2">
            <PricingHint tier={nextTier} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted"
          >
            Maybe Later
          </button>
          <button
            onClick={onUpgrade}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// INLINE UPGRADE BANNER
// =============================================================================

interface UpgradeBannerProps {
  currentTier: SubscriptionTier
  feature: string
  compact?: boolean
  onUpgrade: () => void
}

export function UpgradeBanner({
  currentTier,
  feature,
  compact = false,
  onUpgrade,
}: UpgradeBannerProps) {
  const nextTier = getNextTier(currentTier)
  
  if (!nextTier) return null

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-600" />
          <span className="text-sm text-amber-800">
            {feature} requires {getTierDisplayName(nextTier)}
          </span>
        </div>
        <button
          onClick={onUpgrade}
          className="text-sm font-medium text-amber-700 hover:underline"
        >
          Upgrade
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-full">
          <Crown className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-amber-900">
            Unlock {feature}
          </h4>
          <p className="text-sm text-amber-700 mt-1">
            Upgrade to {getTierDisplayName(nextTier)} to access this feature and more.
          </p>
          <button
            onClick={onUpgrade}
            className="mt-3 px-4 py-1.5 bg-amber-600 text-white text-sm font-medium rounded hover:bg-amber-700"
          >
            View Plans
          </button>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// FEATURE LOCKED PLACEHOLDER
// =============================================================================

interface FeatureLockedProps {
  feature: string
  requiredTier: SubscriptionTier
  onUpgrade: () => void
  children?: React.ReactNode
}

export function FeatureLocked({
  feature,
  requiredTier,
  onUpgrade,
  children,
}: FeatureLockedProps) {
  return (
    <div className="relative">
      {/* Blurred content */}
      {children && (
        <div className="blur-sm pointer-events-none select-none opacity-50">
          {children}
        </div>
      )}
      
      {/* Overlay */}
      <div className={cn(
        "flex flex-col items-center justify-center text-center p-8",
        children ? "absolute inset-0 bg-card/80" : "bg-muted rounded-lg"
      )}>
        <div className="p-3 bg-amber-100 rounded-full mb-4">
          <Crown className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="font-semibold text-lg">{feature}</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Available on {getTierDisplayName(requiredTier)} and above
        </p>
        <button
          onClick={onUpgrade}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          Upgrade to Unlock
        </button>
      </div>
    </div>
  )
}

// =============================================================================
// HELPERS
// =============================================================================

function getImprovements(from: SubscriptionTier, to: SubscriptionTier): string[] {
  const improvements: string[] = []
  const fromFeatures = getTierFeatures(from)
  const toFeatures = getTierFeatures(to)
  const fromLimits = getTierLimits(from)
  const toLimits = getTierLimits(to)

  // Storage
  if (toLimits.maxStorageBytes > fromLimits.maxStorageBytes) {
    improvements.push(`${formatBytes(toLimits.maxStorageBytes)} storage (up from ${formatBytes(fromLimits.maxStorageBytes)})`)
  }

  // Photos
  if (toLimits.maxPhotosPerHorse !== fromLimits.maxPhotosPerHorse) {
    if (toLimits.maxPhotosPerHorse === -1) {
      improvements.push('Unlimited photos per horse')
    } else {
      improvements.push(`${toLimits.maxPhotosPerHorse} photos per horse`)
    }
  }

  // Documents
  if (!fromFeatures.canUploadDocuments && toFeatures.canUploadDocuments) {
    improvements.push('Document uploads (Coggins, vet records, etc.)')
  }

  // Bulk upload
  if (!fromFeatures.canBulkUpload && toFeatures.canBulkUpload) {
    improvements.push('Bulk photo uploads')
  }

  // Downloads
  if (!fromFeatures.canDownloadOriginals && toFeatures.canDownloadOriginals) {
    improvements.push('Download original photos')
  }

  // Document expiry
  if (!fromFeatures.canTrackDocumentExpiry && toFeatures.canTrackDocumentExpiry) {
    improvements.push('Document expiry tracking & reminders')
  }

  // Sharing
  if (!fromFeatures.canShareDocuments && toFeatures.canShareDocuments) {
    improvements.push('Share documents with vets & clients')
  }

  // API
  if (!fromFeatures.apiAccess && toFeatures.apiAccess) {
    improvements.push('API access for integrations')
  }

  return improvements
}

function PricingHint({ tier }: { tier: SubscriptionTier }) {
  const prices: Record<SubscriptionTier, string> = {
    FREE: 'Free',
    BASIC: '$19/month',
    ADVANCED: '$39/month',
  }

  return (
    <div className="text-center text-sm text-muted-foreground">
      {getTierDisplayName(tier)} starts at <strong>{prices[tier]}</strong>
    </div>
  )
}
