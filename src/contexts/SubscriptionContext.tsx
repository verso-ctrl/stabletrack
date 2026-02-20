// src/contexts/SubscriptionContext.tsx
// React context for subscription and tier state management

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

interface TrialState {
  isTrialing: boolean
  trialEndsAt: Date | null
  daysRemaining: number
  isExpired: boolean
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

  // Trial state
  trial: TrialState

  // Billing
  currentPeriodEnd: Date | null

  // Active add-ons
  activeAddOns: string[]

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
  trialEndsAt?: string | null
  barnAddOns?: string[]
  barnSubscriptionStatus?: string
}

const EMPTY_ADDONS: string[] = []

export function SubscriptionProvider({
  children,
  barnId,
  barnTier,
  defaultTier = 'STARTER',
  trialEndsAt: trialEndsAtProp,
  barnAddOns,
  barnSubscriptionStatus = 'TRIALING',
}: SubscriptionProviderProps) {
  const stableAddOns = barnAddOns ?? EMPTY_ADDONS

  // Use barn tier if provided, otherwise use default
  const [tier, setTier] = useState<SubscriptionTier>(barnTier || defaultTier)
  const [loading, setLoading] = useState(false)
  const [error] = useState<string | null>(null)
  const [activeAddOns, setActiveAddOns] = useState<string[]>(stableAddOns)

  // Real usage data fetched from API
  const [usage, setUsage] = useState<BarnUsage>({
    horses: 0,
    teamMembers: 0,
    storageBytes: 0,
  })

  // Next billing date
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<Date | null>(null)

  // Update tier when barn tier changes (normalize legacy tiers)
  useEffect(() => {
    if (barnTier) {
      setTier(normalizeTier(barnTier))
    }
  }, [barnTier])

  // Update add-ons when barn add-ons change
  const addOnsKey = stableAddOns.join(',')
  useEffect(() => {
    setActiveAddOns(stableAddOns)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addOnsKey])

  // Fetch real usage data and billing info from API
  const fetchUsage = useCallback(async () => {
    if (!barnId) return
    try {
      const [usageRes, subRes] = await Promise.all([
        fetch(`/api/barns/${barnId}/usage`),
        fetch(`/api/barns/${barnId}/subscription`),
      ])
      if (usageRes.ok) {
        const data = await usageRes.json()
        setUsage({
          horses: data.horses ?? 0,
          teamMembers: data.teamMembers ?? 0,
          storageBytes: data.storageBytes ?? 0,
        })
      }
      if (subRes.ok) {
        const subData = await subRes.json()
        if (subData.currentPeriodEnd) {
          setCurrentPeriodEnd(new Date(subData.currentPeriodEnd))
        }
      }
    } catch {
      // Silent fail — usage display is non-critical
    }
  }, [barnId])

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  // Trial state — use barnSubscriptionStatus to determine if actually trialing
  const trial = useMemo((): TrialState => {
    // Only show trial state if subscription status is TRIALING
    if (barnSubscriptionStatus !== 'TRIALING') {
      return {
        isTrialing: false,
        trialEndsAt: null,
        daysRemaining: 0,
        isExpired: false,
      }
    }

    if (!trialEndsAtProp) {
      // Demo mode: simulate a trial with 11 days remaining
      const demoTrialEnd = new Date()
      demoTrialEnd.setDate(demoTrialEnd.getDate() + 11)
      return {
        isTrialing: true,
        trialEndsAt: demoTrialEnd,
        daysRemaining: 11,
        isExpired: false,
      }
    }

    const trialEnd = new Date(trialEndsAtProp)
    const now = new Date()
    const diffMs = trialEnd.getTime() - now.getTime()
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))

    return {
      isTrialing: daysRemaining > 0,
      trialEndsAt: trialEnd,
      daysRemaining,
      isExpired: daysRemaining <= 0,
    }
  }, [trialEndsAtProp, barnSubscriptionStatus])

  // Computed tier data
  const features = useMemo(() => getTierFeatures(tier, activeAddOns), [tier, activeAddOns])
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
    return hasFeature(tier, feature, activeAddOns)
  }, [tier, activeAddOns])

  const canAddHorses = useCallback((currentCount?: number): boolean => {
    const count = currentCount ?? usage.horses
    return !hasReachedHorseLimit(tier, count)
  }, [tier, usage.horses])

  const canAddTeamMembers = useCallback((currentCount?: number): boolean => {
    const count = currentCount ?? usage.teamMembers
    return !hasReachedTeamMemberLimit(tier, count)
  }, [tier, usage.teamMembers])

  const hasAddOn = useCallback((addOn: string): boolean => {
    return activeAddOns.includes(addOn)
  }, [activeAddOns])

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
    window.location.href = '/settings/billing'
  }, [])

  const refetch = useCallback(async () => {
    await fetchUsage()
  }, [fetchUsage])

  // Context value
  const value: SubscriptionContextType = useMemo(() => ({
    tier,
    tierDisplayName,
    features,
    limits,
    tierPricing,
    usage,
    trial,
    currentPeriodEnd,
    activeAddOns,
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
      status: barnSubscriptionStatus,
      maxHorses: limits.maxHorses === -1 ? 999 : limits.maxHorses,
      maxBarns: 10,
      storageGb: Math.round(limits.maxStorageBytes / (1024 * 1024 * 1024)),
      addOns: activeAddOns,
    },
  }), [
    tier, tierDisplayName, features, limits, tierPricing, usage, trial, currentPeriodEnd,
    activeAddOns, loading, error, checkHasFeature, canAddHorses,
    canAddTeamMembers, hasAddOn, nextTier, upgradeMessage, getUpgradeMessage,
    getUpgradeMessageForLimit, storagePercentUsed, changeTier, upgradeTier,
    openBillingPortal, openUpgradeModal, refetch, barnSubscriptionStatus,
  ])

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
