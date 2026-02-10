// src/contexts/SubscriptionContext.tsx
// React context for subscription and tier state management
// Demo mode: Persists tier to localStorage

'use client'

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import {
  SubscriptionTier,
  TierFeatures,
  TierLimits,
  TierPricing,
  getTierFeatures,
  getTierLimits,
  getTierPricing,
  hasFeature,
  hasReachedHorseLimit,
  hasReachedTeamMemberLimit,
  getNextTier,
  normalizeTier,
} from '@/lib/tiers'
import { toast } from '@/lib/toast'

// =============================================================================
// TYPES
// =============================================================================

interface BarnUsage {
  horses: number
  teamMembers: number
  storageBytes: number
}

export interface SubscriptionContextType {
  // Current tier info
  tier: SubscriptionTier
  tierDisplayName: string
  features: TierFeatures
  limits: TierLimits
  tierPricing: TierPricing
  
  // Usage tracking
  usage: BarnUsage
  
  // Loading state
  loading: boolean
  isLoading: boolean // Alias for loading
  error: string | null
  
  // Permission checks
  hasFeature: (feature: keyof TierFeatures) => boolean
  canAddHorses: (currentCount?: number) => boolean
  canAddTeamMembers: (currentCount?: number) => boolean
  hasAddOn: (addOn: string) => boolean
  
  // Upgrade helpers
  nextTier: SubscriptionTier | null
  upgradeMessage: string | null
  getUpgradeMessage: (feature: string) => string
  getUpgradeMessageForLimit: (limitType: 'horses' | 'team' | 'storage') => string
  storagePercentUsed: number
  
  // Actions
  changeTier: (tier: SubscriptionTier) => Promise<void>
  upgradeTier: (tier: SubscriptionTier) => Promise<void>
  openBillingPortal: () => Promise<void>
  openUpgradeModal: () => void
  refetch: () => Promise<void>
  
  // Legacy compatibility
  isFreeTier: boolean
  isPaidTier: boolean
  subscription: {
    tier: SubscriptionTier
    status: string
    maxHorses: number
    maxBarns: number
    storageGb: number
    addOns: string[]
  }
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

// =============================================================================
// PROVIDER
// =============================================================================

interface SubscriptionProviderProps {
  children: React.ReactNode
  barnId?: string
  barnTier?: SubscriptionTier  // Tier from current barn
  defaultTier?: SubscriptionTier
}

export function SubscriptionProvider({
  children,
  barnId,
  barnTier,
  defaultTier = 'CORE'  // Single plan: Core
}: SubscriptionProviderProps) {
  // Use barn tier if provided, otherwise use default
  const [tier, setTier] = useState<SubscriptionTier>(barnTier || defaultTier)
  const [loading, setLoading] = useState(false)
  const [error] = useState<string | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Update tier when barn tier changes (normalize legacy tiers to CORE)
  useEffect(() => {
    if (barnTier) {
      setTier(normalizeTier(barnTier))
    }
  }, [barnTier])

  // Demo usage - minimal usage to show features
  const [usage] = useState<BarnUsage>({
    horses: 5,
    teamMembers: 2,
    storageBytes: 500 * 1024 * 1024, // 500 MB used
  })

  // Computed tier data
  const features = useMemo(() => getTierFeatures(tier), [tier])
  const limits = useMemo(() => getTierLimits(tier), [tier])
  const tierPricing = useMemo(() => getTierPricing(tier), [tier])
  const tierDisplayName = tierPricing.displayName
  const nextTier = getNextTier(tier)

  // Storage percentage
  const storagePercentUsed = useMemo(() => {
    if (limits.maxStorageBytes === -1) return 0
    return Math.round((usage.storageBytes / limits.maxStorageBytes) * 100)
  }, [usage.storageBytes, limits.maxStorageBytes])

  // Permission checks
  const checkHasFeature = useCallback((feature: keyof TierFeatures): boolean => {
    return hasFeature(tier, feature)
  }, [tier])

  const canAddHorses = useCallback((currentCount?: number): boolean => {
    const count = currentCount ?? usage.horses
    return !hasReachedHorseLimit(tier, count)
  }, [tier, usage.horses])

  const canAddTeamMembers = useCallback((currentCount?: number): boolean => {
    const count = currentCount ?? usage.teamMembers
    return !hasReachedTeamMemberLimit(tier, count)
  }, [tier, usage.teamMembers])

  const hasAddOn = useCallback((addOn: string): boolean => {
    // Demo mode: No add-ons
    return false
  }, [])

  // Upgrade message
  const upgradeMessage = useMemo(() => {
    if (!nextTier) return null
    const nextPricing = getTierPricing(nextTier)
    return `Upgrade to ${nextPricing.displayName} for more features`
  }, [nextTier])

  const getUpgradeMessage = useCallback((feature: string): string => {
    if (!nextTier) return 'You are on the highest tier'
    const nextPricing = getTierPricing(nextTier)
    return `Upgrade to ${nextPricing.displayName} to unlock ${feature}`
  }, [nextTier])

  const getUpgradeMessageForLimit = useCallback((limitType: 'horses' | 'team' | 'storage'): string => {
    if (!nextTier) return 'You are on the highest tier'
    
    const nextLimits = getTierLimits(nextTier)
    const nextPricing = getTierPricing(nextTier)
    
    switch (limitType) {
      case 'horses':
        const horseLimit = nextLimits.maxHorses === -1 ? 'unlimited' : nextLimits.maxHorses
        return `Upgrade to ${nextPricing.displayName} for ${horseLimit} horses`
      case 'team':
        const teamLimit = nextLimits.maxTeamMembers === -1 ? 'unlimited' : nextLimits.maxTeamMembers
        return `Upgrade to ${nextPricing.displayName} for ${teamLimit} team members`
      case 'storage':
        const storageGB = Math.round(nextLimits.maxStorageBytes / (1024 * 1024 * 1024))
        return `Upgrade to ${nextPricing.displayName} for ${storageGB} GB storage`
      default:
        return upgradeMessage || ''
    }
  }, [nextTier, upgradeMessage])

  // Change tier - updates local state (actual change happens via API)
  const changeTier = useCallback(async (newTier: SubscriptionTier) => {
    setLoading(true)
    try {
      // Update local state immediately for responsiveness
      setTier(newTier)

      toast.success('Plan Changed', `You are now on the ${getTierPricing(newTier).displayName} plan.`)
    } catch (err) {
      toast.error('Failed to change plan', 'Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Alias for backwards compatibility
  const upgradeTier = changeTier

  const openBillingPortal = useCallback(async () => {
    toast.info('Demo Mode', 'In production, this would open the Stripe billing portal for payment methods and invoices.')
  }, [])

  const openUpgradeModal = useCallback(() => {
    // Could open a modal, but for now just show a toast
    toast.info('Upgrade', 'Visit Settings → Billing to change your plan.')
  }, [])

  const refetch = useCallback(async () => {
    // No-op in demo mode
  }, [])

  // Context value
  const value: SubscriptionContextType = {
    tier,
    tierDisplayName,
    features,
    limits,
    tierPricing,
    usage,
    loading,
    isLoading: loading,
    error,
    hasFeature: checkHasFeature,
    canAddHorses,
    canAddTeamMembers,
    hasAddOn,
    nextTier,
    upgradeMessage,
    getUpgradeMessage,
    getUpgradeMessageForLimit,
    storagePercentUsed,
    changeTier,
    upgradeTier,
    openBillingPortal,
    openUpgradeModal,
    refetch,
    
    // Legacy compatibility
    isFreeTier: false,
    isPaidTier: true,
    subscription: {
      tier,
      status: 'ACTIVE',
      maxHorses: limits.maxHorses === -1 ? 999 : limits.maxHorses,
      maxBarns: 10,
      storageGb: Math.round(limits.maxStorageBytes / (1024 * 1024 * 1024)),
      addOns: [],
    },
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}

// =============================================================================
// HOOKS
// =============================================================================

export function useSubscription(): SubscriptionContextType {
  const context = useContext(SubscriptionContext)
  
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  
  return context
}

// Alias for backwards compatibility
export const useTier = useSubscription

// Feature check hook
export function useFeature(feature: keyof TierFeatures): boolean {
  const { hasFeature } = useSubscription()
  return hasFeature(feature)
}
