// src/hooks/useTierPermissions.ts
// React hook for checking subscription tier permissions

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import {
  getTierFeatures,
  getTierLimits,
  hasFeature,
  canUploadDocumentType,
  hasReachedPhotoLimit,
  getRemainingPhotoSlots,
  getNextTier,
  getTierDisplayName,
  normalizeTier,
  type TierFeatures,
  type TierLimits,
  type SubscriptionTier,
  type DocumentType,
} from '@/lib/tiers'

// =============================================================================
// TYPES
// =============================================================================

interface TierContextValue {
  tier: SubscriptionTier
  features: TierFeatures
  limits: TierLimits
  loading: boolean
  
  // Permission checks
  canUploadPhotos: boolean
  canUploadDocuments: boolean
  canBulkUpload: boolean
  canTrackDocumentExpiry: boolean
  
  // Helpers
  checkDocumentType: (type: DocumentType) => boolean
  checkPhotoLimit: (currentCount: number) => boolean
  getRemainingPhotos: (currentCount: number) => number
  
  // Upgrade info
  nextTier: SubscriptionTier | null
  tierDisplayName: string
}

interface UseTierPermissionsOptions {
  barnId: string
}

// =============================================================================
// CONTEXT
// =============================================================================

const TierContext = createContext<TierContextValue | null>(null)

export function TierProvider({ 
  children, 
  barnId 
}: { 
  children: React.ReactNode
  barnId: string 
}) {
  const value = useTierPermissions({ barnId })
  
  return (
    <TierContext.Provider value={value}>
      {children}
    </TierContext.Provider>
  )
}

export function useTier(): TierContextValue {
  const context = useContext(TierContext)
  
  // If no provider, return default FARM tier values (demo mode)
  if (!context) {
    const tier: SubscriptionTier = 'FARM'
    const features = getTierFeatures(tier)
    const limits = getTierLimits(tier)
    
    return {
      tier,
      features,
      limits,
      loading: false,
      canUploadPhotos: features.canUploadPhotos,
      canUploadDocuments: features.canUploadDocuments,
      canBulkUpload: features.canBulkUpload,
      canTrackDocumentExpiry: features.canTrackDocumentExpiry,
      checkDocumentType: (type: DocumentType) => canUploadDocumentType(tier, type),
      checkPhotoLimit: (currentCount: number) => hasReachedPhotoLimit(tier, currentCount),
      getRemainingPhotos: (currentCount: number) => getRemainingPhotoSlots(tier, currentCount),
      nextTier: getNextTier(tier),
      tierDisplayName: getTierDisplayName(tier),
    }
  }
  
  return context
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export function useTierPermissions(options: UseTierPermissionsOptions): TierContextValue {
  const { barnId } = options
  const [tier, setTier] = useState<SubscriptionTier>('FREE')
  const [loading, setLoading] = useState(true)

  // Fetch tier from API
  useEffect(() => {
    async function fetchTier() {
      try {
        const response = await fetch(`/api/barns/${barnId}/subscription`)
        
        if (response.ok) {
          const data = await response.json()
          setTier(normalizeTier(data.tier || 'FREE'))
        }
      } catch (error) {
        console.error('Failed to fetch subscription tier:', error)
      } finally {
        setLoading(false)
      }
    }

    if (barnId) {
      fetchTier()
    }
  }, [barnId])

  const features = getTierFeatures(tier)
  const limits = getTierLimits(tier)

  const checkDocumentType = useCallback(
    (type: DocumentType) => canUploadDocumentType(tier, type),
    [tier]
  )

  const checkPhotoLimit = useCallback(
    (currentCount: number) => hasReachedPhotoLimit(tier, currentCount),
    [tier]
  )

  const getRemainingPhotos = useCallback(
    (currentCount: number) => getRemainingPhotoSlots(tier, currentCount),
    [tier]
  )

  return {
    tier,
    features,
    limits,
    loading,
    
    canUploadPhotos: features.canUploadPhotos,
    canUploadDocuments: features.canUploadDocuments,
    canBulkUpload: features.canBulkUpload,
    canTrackDocumentExpiry: features.canTrackDocumentExpiry,
    
    checkDocumentType,
    checkPhotoLimit,
    getRemainingPhotos,
    
    nextTier: getNextTier(tier),
    tierDisplayName: getTierDisplayName(tier),
  }
}

// =============================================================================
// PERMISSION GATE COMPONENT
// =============================================================================

interface PermissionGateProps {
  feature: keyof TierFeatures
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgradePrompt?: boolean
}

export function PermissionGate({
  feature,
  children,
  fallback,
  showUpgradePrompt = false,
}: PermissionGateProps) {
  const { tier, features, nextTier, tierDisplayName } = useTier()
  
  const hasAccess = hasFeature(tier, feature)

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (showUpgradePrompt && nextTier) {
    return (
      <div className="p-4 bg-muted rounded-lg text-center">
        <p className="text-sm text-muted-foreground mb-2">
          This feature requires {getTierDisplayName(nextTier)} or higher.
        </p>
        <p className="text-xs text-muted-foreground">
          You're currently on the {tierDisplayName} plan.
        </p>
      </div>
    )
  }

  return null
}

// =============================================================================
// DOCUMENT TYPE GATE
// =============================================================================

interface DocumentTypeGateProps {
  documentType: DocumentType
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function DocumentTypeGate({
  documentType,
  children,
  fallback,
}: DocumentTypeGateProps) {
  const { checkDocumentType } = useTier()
  
  if (checkDocumentType(documentType)) {
    return <>{children}</>
  }

  return fallback ? <>{fallback}</> : null
}

// =============================================================================
// PHOTO LIMIT GATE
// =============================================================================

interface PhotoLimitGateProps {
  currentPhotoCount: number
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PhotoLimitGate({
  currentPhotoCount,
  children,
  fallback,
}: PhotoLimitGateProps) {
  const { checkPhotoLimit, getRemainingPhotos, tierDisplayName, nextTier } = useTier()
  
  const atLimit = checkPhotoLimit(currentPhotoCount)
  const remaining = getRemainingPhotos(currentPhotoCount)

  if (!atLimit) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
      <p className="text-sm text-amber-800 mb-1">
        Photo limit reached ({currentPhotoCount} photos)
      </p>
      <p className="text-xs text-amber-600">
        {nextTier 
          ? `Upgrade to ${getTierDisplayName(nextTier)} for more photos`
          : `You're on the ${tierDisplayName} plan`
        }
      </p>
    </div>
  )
}
