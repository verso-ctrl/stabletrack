// src/lib/tiers.ts
// SINGLE SOURCE OF TRUTH for all tier configuration
// Simple 3-tier system: Free, Basic, Advanced
// The only difference is the number of horses allowed

export type SubscriptionTier = 'FREE' | 'BASIC' | 'ADVANCED'

// =============================================================================
// TIER LIMITS
// =============================================================================

export interface TierLimits {
  // Core limits
  maxHorses: number              // -1 = unlimited
  maxTeamMembers: number         // -1 = unlimited
  maxStorageBytes: number        // Storage in bytes

  // Photo limits
  maxPhotosPerHorse: number      // -1 = unlimited
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  FREE: {
    maxHorses: 3,
    maxTeamMembers: 2,
    maxStorageBytes: 5 * 1024 * 1024 * 1024,      // 5 GB
    maxPhotosPerHorse: 10,
  },
  BASIC: {
    maxHorses: 15,
    maxTeamMembers: 5,
    maxStorageBytes: 25 * 1024 * 1024 * 1024,     // 25 GB
    maxPhotosPerHorse: 50,
  },
  ADVANCED: {
    maxHorses: -1,               // Unlimited
    maxTeamMembers: -1,          // Unlimited
    maxStorageBytes: 100 * 1024 * 1024 * 1024,    // 100 GB
    maxPhotosPerHorse: -1,       // Unlimited
  },
}

// =============================================================================
// TIER FEATURES
// All tiers have the same features - only horse limits differ
// =============================================================================

export interface TierFeatures {
  // Core features (all tiers)
  horseProfiles: boolean
  basicHealthRecords: boolean
  simpleCalendar: boolean

  // Photo features
  canUploadPhotos: boolean
  canSetPrimaryPhoto: boolean
  canViewPhotoGallery: boolean
  canDownloadOriginals: boolean
  canBulkUpload: boolean

  // Document features
  canUploadDocuments: boolean
  canTrackDocumentExpiry: boolean
  canShareDocuments: boolean

  // Care features
  taskManagement: boolean
  feedCalendar: boolean
  medicationTracking: boolean
  vaccinationReminders: boolean
  basicReporting: boolean

  // Additional features
  trainingScheduling: boolean
  lessonManagement: boolean
  invoicing: boolean
  expenseTracking: boolean
  customFields: boolean
  activityLogs: boolean

  // Enterprise-level (disabled for now)
  multiLocation: boolean
  advancedAnalytics: boolean
  apiAccess: boolean
  rolePermissions: boolean
  prioritySupport: boolean

  // Add-ons (disabled)
  breedingManagement: boolean
  clientPortal: boolean
  smsNotifications: boolean
}

// All tiers get full features - only horse count differs
const ALL_FEATURES: TierFeatures = {
  // Core
  horseProfiles: true,
  basicHealthRecords: true,
  simpleCalendar: true,

  // Photos
  canUploadPhotos: true,
  canSetPrimaryPhoto: true,
  canViewPhotoGallery: true,
  canDownloadOriginals: true,
  canBulkUpload: true,

  // Documents
  canUploadDocuments: true,
  canTrackDocumentExpiry: true,
  canShareDocuments: true,

  // Care
  taskManagement: true,
  feedCalendar: true,
  medicationTracking: true,
  vaccinationReminders: true,
  basicReporting: true,

  // Additional
  trainingScheduling: true,
  lessonManagement: true,
  invoicing: true,
  expenseTracking: true,
  customFields: true,
  activityLogs: true,

  // Enterprise-level (all tiers get basic access)
  multiLocation: false,
  advancedAnalytics: false,
  apiAccess: false,
  rolePermissions: true,
  prioritySupport: false,

  // Add-ons
  breedingManagement: false,
  clientPortal: true,
  smsNotifications: false,
}

export const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
  FREE: { ...ALL_FEATURES },
  BASIC: { ...ALL_FEATURES, prioritySupport: true },
  ADVANCED: { ...ALL_FEATURES, prioritySupport: true },
}

// =============================================================================
// DOCUMENT TYPES
// =============================================================================

export const DOCUMENT_TYPES = {
  COGGINS: 'coggins',
  VET_RECORD: 'vet_record',
  REGISTRATION: 'registration',
  INSURANCE: 'insurance',
  HEALTH_CERTIFICATE: 'health_certificate',
  BREEDING_RECORD: 'breeding_record',
  TRAINING_LOG: 'training_log',
  CONTRACT: 'contract',
  INVOICE: 'invoice',
  OTHER: 'other',
} as const

export type DocumentType = typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPES]

// All tiers can upload all document types
export const TIER_DOCUMENT_TYPES: Record<SubscriptionTier, DocumentType[]> = {
  FREE: Object.values(DOCUMENT_TYPES),
  BASIC: Object.values(DOCUMENT_TYPES),
  ADVANCED: Object.values(DOCUMENT_TYPES),
}

// =============================================================================
// PRICING
// =============================================================================

export interface TierPricing {
  monthlyPriceCents: number
  annualPriceCents: number
  displayName: string
  description: string
  popular?: boolean
}

export const TIER_PRICING: Record<SubscriptionTier, TierPricing> = {
  FREE: {
    monthlyPriceCents: 0,
    annualPriceCents: 0,
    displayName: 'Free',
    description: 'Perfect for getting started with up to 3 horses',
  },
  BASIC: {
    monthlyPriceCents: 1900,
    annualPriceCents: 19000,
    displayName: 'Basic',
    description: 'For growing operations with up to 15 horses',
    popular: true,
  },
  ADVANCED: {
    monthlyPriceCents: 3900,
    annualPriceCents: 39000,
    displayName: 'Advanced',
    description: 'Unlimited horses for larger farms',
  },
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Normalize tier string to SubscriptionTier type
 */
export function normalizeTier(tier: string): SubscriptionTier {
  const normalized = tier.toUpperCase()

  // Handle legacy tier names
  if (normalized === 'PROFESSIONAL' || normalized === 'FARM') {
    return 'BASIC'
  }
  if (normalized === 'ENTERPRISE') {
    return 'ADVANCED'
  }

  if (normalized in TIER_LIMITS) {
    return normalized as SubscriptionTier
  }
  return 'FREE'
}

/**
 * Get limits for a tier
 */
export function getTierLimits(tier: string): TierLimits {
  return TIER_LIMITS[normalizeTier(tier)]
}

/**
 * Get features for a tier
 */
export function getTierFeatures(tier: string, activeAddOns: string[] = []): TierFeatures {
  const normalizedTier = normalizeTier(tier)
  return { ...TIER_FEATURES[normalizedTier] }
}

/**
 * Get pricing info for a tier
 */
export function getTierPricing(tier: string): TierPricing {
  return TIER_PRICING[normalizeTier(tier)]
}

/**
 * Get display name for a tier
 */
export function getTierDisplayName(tier: string): string {
  return TIER_PRICING[normalizeTier(tier)].displayName
}

/**
 * Check if a feature is available for a tier
 */
export function hasFeature(
  tier: string,
  feature: keyof TierFeatures,
  activeAddOns: string[] = []
): boolean {
  const features = getTierFeatures(tier, activeAddOns)
  return features[feature]
}

/**
 * Get next tier for upgrade path
 */
export function getNextTier(currentTier: string): SubscriptionTier | null {
  const order: SubscriptionTier[] = ['FREE', 'BASIC', 'ADVANCED']
  const current = normalizeTier(currentTier)
  const currentIndex = order.indexOf(current)

  if (currentIndex === -1 || currentIndex >= order.length - 1) {
    return null
  }

  return order[currentIndex + 1]
}

/**
 * Check if document type is allowed for tier
 */
export function canUploadDocumentType(tier: string, documentType: DocumentType): boolean {
  const normalizedTier = normalizeTier(tier)
  return TIER_DOCUMENT_TYPES[normalizedTier].includes(documentType)
}

/**
 * Check if horse limit is reached
 */
export function hasReachedHorseLimit(tier: string, currentCount: number): boolean {
  const limits = getTierLimits(tier)
  if (limits.maxHorses === -1) return false
  return currentCount >= limits.maxHorses
}

/**
 * Check if team member limit is reached
 */
export function hasReachedTeamMemberLimit(tier: string, currentCount: number): boolean {
  const limits = getTierLimits(tier)
  if (limits.maxTeamMembers === -1) return false
  return currentCount >= limits.maxTeamMembers
}

/**
 * Check if photo limit per horse is reached
 */
export function hasReachedPhotoLimit(tier: string, currentPhotoCount: number): boolean {
  const limits = getTierLimits(tier)
  if (limits.maxPhotosPerHorse === -1) return false
  return currentPhotoCount >= limits.maxPhotosPerHorse
}

/**
 * Get remaining photo slots for a horse
 */
export function getRemainingPhotoSlots(tier: string, currentPhotoCount: number): number {
  const limits = getTierLimits(tier)
  if (limits.maxPhotosPerHorse === -1) return Infinity
  return Math.max(0, limits.maxPhotosPerHorse - currentPhotoCount)
}

/**
 * Check if storage limit would be exceeded
 */
export function wouldExceedStorageLimit(
  tier: string,
  currentUsageBytes: number,
  newFileSizeBytes: number
): boolean {
  const limits = getTierLimits(tier)
  return currentUsageBytes + newFileSizeBytes > limits.maxStorageBytes
}

/**
 * Get document type display name
 */
export function getDocumentTypeDisplayName(type: DocumentType): string {
  const names: Record<DocumentType, string> = {
    coggins: 'Coggins Test',
    vet_record: 'Veterinary Record',
    registration: 'Registration Papers',
    insurance: 'Insurance Document',
    health_certificate: 'Health Certificate',
    breeding_record: 'Breeding Record',
    training_log: 'Training Log',
    contract: 'Contract',
    invoice: 'Invoice',
    other: 'Other Document',
  }
  return names[type] || type
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format price for display
 */
export function formatPrice(cents: number, annual: boolean = false): string {
  if (cents === 0) return 'Free'
  const dollars = cents / 100
  return annual ? `$${dollars}/year` : `$${dollars}/month`
}

// =============================================================================
// FEATURE LABELS FOR UI
// =============================================================================

export const FEATURE_LABELS: Record<keyof TierFeatures, string> = {
  horseProfiles: 'Horse Profiles',
  basicHealthRecords: 'Health Records',
  simpleCalendar: 'Calendar & Scheduling',

  canUploadPhotos: 'Photo Uploads',
  canSetPrimaryPhoto: 'Set Primary Photo',
  canViewPhotoGallery: 'Photo Gallery',
  canDownloadOriginals: 'Download Original Photos',
  canBulkUpload: 'Bulk Photo Upload',

  canUploadDocuments: 'Document Uploads',
  canTrackDocumentExpiry: 'Document Expiry Tracking',
  canShareDocuments: 'Document Sharing',

  taskManagement: 'Task Management',
  feedCalendar: 'Feed Calendar',
  medicationTracking: 'Medication Tracking',
  vaccinationReminders: 'Vaccination Reminders',
  basicReporting: 'Basic Reports',

  trainingScheduling: 'Training Scheduling',
  lessonManagement: 'Lesson Management',
  invoicing: 'Invoicing',
  expenseTracking: 'Expense Tracking',
  customFields: 'Custom Fields',
  activityLogs: 'Activity Logs',

  multiLocation: 'Multi-Location Support',
  advancedAnalytics: 'Advanced Analytics',
  apiAccess: 'API Access',
  rolePermissions: 'Role-Based Permissions',
  prioritySupport: 'Priority Support',

  breedingManagement: 'Breeding Management',
  clientPortal: 'Client Portal',
  smsNotifications: 'SMS Notifications',
}
