// src/lib/tier-validation.ts
// Server-side tier validation and enforcement
// Demo mode: Always returns BASIC tier

import { prisma } from './prisma'
import {
  SubscriptionTier,
  TierFeatures,
  TierLimits,
  getTierFeatures,
  getTierLimits,
  normalizeTier,
  hasReachedHorseLimit,
  hasReachedTeamMemberLimit,
  hasReachedPhotoLimit,
  wouldExceedStorageLimit,
  canUploadDocumentType,
  type DocumentType,
} from './tiers'

// =============================================================================
// TYPES
// =============================================================================

export interface BarnSubscription {
  tier: SubscriptionTier
  activeAddOns: string[]
  features: TierFeatures
}

export interface BarnUsage {
  horses: number
  teamMembers: number
  storageBytes: number
  photosPerHorse: Map<string, number>
}

// =============================================================================
// FETCH SUBSCRIPTION DATA
// =============================================================================

/**
 * Get subscription info for a barn (Demo mode: always BASIC)
 */
export async function getBarnSubscription(barnId: string): Promise<BarnSubscription> {
  // Verify barn exists
  const barn = await prisma.barn.findUnique({
    where: { id: barnId },
  })

  if (!barn) {
    throw new Error('Barn not found')
  }

  // Demo mode: Always return BASIC tier
  const tier: SubscriptionTier = 'BASIC'

  return {
    tier,
    activeAddOns: [],
    features: getTierFeatures(tier),
  }
}

/**
 * Get current usage for a barn
 */
export async function getBarnUsage(barnId: string): Promise<BarnUsage> {
  const [horseCount, memberCount, photoStorage, docStorage] = await Promise.all([
    prisma.horse.count({
      where: { barnId, status: 'ACTIVE' },
    }),
    prisma.barnMember.count({
      where: { barnId },
    }),
    prisma.horsePhoto.aggregate({
      where: { horse: { barnId } },
      _sum: { fileSize: true },
    }),
    prisma.document.aggregate({
      where: { horse: { barnId } },
      _sum: { fileSize: true },
    }),
  ])

  // Get photo counts per horse
  const photoCounts = await prisma.horsePhoto.groupBy({
    by: ['horseId'],
    where: { horse: { barnId } },
    _count: true,
  })

  const photosPerHorse = new Map<string, number>()
  for (const { horseId, _count } of photoCounts) {
    photosPerHorse.set(horseId, _count)
  }

  return {
    horses: horseCount,
    teamMembers: memberCount,
    storageBytes: (photoStorage._sum.fileSize || 0) + (docStorage._sum.fileSize || 0),
    photosPerHorse,
  }
}

// =============================================================================
// ENFORCEMENT FUNCTIONS
// =============================================================================

/**
 * Check if barn can add more horses
 */
export async function canAddHorse(barnId: string): Promise<{ allowed: boolean; reason?: string }> {
  const [subscription, usage] = await Promise.all([
    getBarnSubscription(barnId),
    getBarnUsage(barnId),
  ])

  if (hasReachedHorseLimit(subscription.tier, usage.horses)) {
    const limits = getTierLimits(subscription.tier)
    return {
      allowed: false,
      reason: `Horse limit reached (${usage.horses}/${limits.maxHorses})`,
    }
  }

  return { allowed: true }
}

/**
 * Check if barn can add more team members
 */
export async function canAddTeamMember(barnId: string): Promise<{ allowed: boolean; reason?: string }> {
  const [subscription, usage] = await Promise.all([
    getBarnSubscription(barnId),
    getBarnUsage(barnId),
  ])

  if (hasReachedTeamMemberLimit(subscription.tier, usage.teamMembers)) {
    const limits = getTierLimits(subscription.tier)
    return {
      allowed: false,
      reason: `Team member limit reached (${usage.teamMembers}/${limits.maxTeamMembers})`,
    }
  }

  return { allowed: true }
}

/**
 * Check if horse can have more photos
 */
export async function canAddPhoto(
  barnId: string,
  horseId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const [subscription, usage] = await Promise.all([
    getBarnSubscription(barnId),
    getBarnUsage(barnId),
  ])

  const currentPhotos = usage.photosPerHorse.get(horseId) || 0

  if (hasReachedPhotoLimit(subscription.tier, currentPhotos)) {
    const limits = getTierLimits(subscription.tier)
    return {
      allowed: false,
      reason: `Photo limit reached (${currentPhotos}/${limits.maxPhotosPerHorse})`,
    }
  }

  return { allowed: true }
}

/**
 * Check if file can be uploaded within storage quota
 */
export async function canUploadFile(
  barnId: string,
  fileSizeBytes: number
): Promise<{ allowed: boolean; reason?: string }> {
  const [subscription, usage] = await Promise.all([
    getBarnSubscription(barnId),
    getBarnUsage(barnId),
  ])

  if (wouldExceedStorageLimit(subscription.tier, usage.storageBytes, fileSizeBytes)) {
    return {
      allowed: false,
      reason: 'Storage quota would be exceeded',
    }
  }

  return { allowed: true }
}

/**
 * Check if document type is allowed for tier
 */
export async function canUploadDocument(
  barnId: string,
  documentType: DocumentType
): Promise<{ allowed: boolean; reason?: string }> {
  const subscription = await getBarnSubscription(barnId)

  if (!canUploadDocumentType(subscription.tier, documentType)) {
    return {
      allowed: false,
      reason: `Document type '${documentType}' not available on your plan`,
    }
  }

  return { allowed: true }
}

// =============================================================================
// MIDDLEWARE HELPERS
// =============================================================================

/**
 * Enforce horse limit in API route
 */
export async function enforceHorseLimit(barnId: string): Promise<void> {
  const result = await canAddHorse(barnId)
  if (!result.allowed) {
    throw new Error(result.reason || 'Horse limit reached')
  }
}

/**
 * Enforce team member limit in API route
 */
export async function enforceTeamMemberLimit(barnId: string): Promise<void> {
  const result = await canAddTeamMember(barnId)
  if (!result.allowed) {
    throw new Error(result.reason || 'Team member limit reached')
  }
}

/**
 * Enforce photo limit in API route
 */
export async function enforcePhotoLimit(barnId: string, horseId: string): Promise<void> {
  const result = await canAddPhoto(barnId, horseId)
  if (!result.allowed) {
    throw new Error(result.reason || 'Photo limit reached')
  }
}

/**
 * Enforce storage limit in API route
 */
export async function enforceStorageLimit(barnId: string, fileSizeBytes: number): Promise<void> {
  const result = await canUploadFile(barnId, fileSizeBytes)
  if (!result.allowed) {
    throw new Error(result.reason || 'Storage quota exceeded')
  }
}

/**
 * Enforce document type access in API route
 */
export async function enforceDocumentTypeAccess(
  barnId: string,
  documentType: DocumentType
): Promise<void> {
  const result = await canUploadDocument(barnId, documentType)
  if (!result.allowed) {
    throw new Error(result.reason || 'Document type not allowed')
  }
}

/**
 * Enforce feature access in API route
 */
export async function enforceFeatureAccess(
  barnId: string,
  feature: keyof TierFeatures
): Promise<void> {
  const subscription = await getBarnSubscription(barnId)
  
  if (!subscription.features[feature]) {
    throw new Error(`Feature '${feature}' not available on your plan`)
  }
}
