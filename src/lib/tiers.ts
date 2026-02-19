// src/lib/tiers.ts
// SINGLE SOURCE OF TRUTH for all tier configuration
// Two plans: Starter ($25/mo, up to 10 horses) and Farm ($60/mo, unlimited)
// Add-ons: Breeding Tracker ($10/mo)

export type SubscriptionTier = 'STARTER' | 'FARM'

// =============================================================================
// ADD-ONS
// =============================================================================

export interface AddOnConfig {
  id: string
  name: string
  description: string
  monthlyPriceCents: number
  available: boolean // false = "Coming Soon"
}

export const ADD_ONS: Record<string, AddOnConfig> = {
  breeding: {
    id: 'breeding',
    name: 'Breeding Tracker',
    description: 'Heat cycles, breeding records, foaling management, stallion reports, and mare history.',
    monthlyPriceCents: 1000, // $10/mo
    available: true,
  },
  training: {
    id: 'training',
    name: 'Training & Lessons',
    description: 'Training logs, lesson scheduling, and competition tracking.',
    monthlyPriceCents: 1000,
    available: false,
  },
  client_billing: {
    id: 'client_billing',
    name: 'Client & Billing',
    description: 'Client management, invoicing, payments, and recurring billing.',
    monthlyPriceCents: 1000,
    available: false,
  },
  team_management: {
    id: 'team_management',
    name: 'Team Management',
    description: 'Multi-user access, role-based permissions, and team coordination.',
    monthlyPriceCents: 1000,
    available: false,
  },
}

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
  STARTER: {
    maxHorses: 10,
    maxTeamMembers: 5,
    maxStorageBytes: 10 * 1024 * 1024 * 1024,    // 10 GB
    maxPhotosPerHorse: 20,
  },
  FARM: {
    maxHorses: -1,               // Unlimited
    maxTeamMembers: -1,          // Unlimited
    maxStorageBytes: 50 * 1024 * 1024 * 1024,    // 50 GB
    maxPhotosPerHorse: -1,       // Unlimited
  },
}

// =============================================================================
// TIER FEATURES
// All features included on both plans — only limits differ
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

// Both plans get full features — only horse/storage limits differ
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

  // Enterprise-level
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
  STARTER: { ...ALL_FEATURES },
  FARM: { ...ALL_FEATURES, prioritySupport: true },
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

// Both plans can upload all document types
export const TIER_DOCUMENT_TYPES: Record<SubscriptionTier, DocumentType[]> = {
  STARTER: Object.values(DOCUMENT_TYPES),
  FARM: Object.values(DOCUMENT_TYPES),
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
  STARTER: {
    monthlyPriceCents: 2500,
    annualPriceCents: 25000,
    displayName: 'Starter',
    description: 'Perfect for small farms with a few horses',
    popular: false,
  },
  FARM: {
    monthlyPriceCents: 6000,
    annualPriceCents: 60000,
    displayName: 'Farm',
    description: 'For growing farms that need no limits',
    popular: true,
  },
}

// =============================================================================
// PLAN FEATURE LISTS (for display on pricing/onboarding)
// =============================================================================

export const STARTER_FEATURES = [
  'Up to 10 horses',
  'Horse profiles & management',
  'Feed tracking & feed charts',
  'Health & vet records',
  'Stall & pasture management',
  'Calendar & tasks',
  'Document storage (10 GB)',
  'Up to 5 team members',
  'Mobile access',
]

export const FARM_FEATURES = [
  'Unlimited horses',
  'Everything in Starter',
  'Unlimited team members',
  '50 GB document storage',
  'Unlimited photo uploads',
  'Priority support',
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Normalize tier string to SubscriptionTier type.
 * Maps legacy tier names to the closest modern equivalent.
 */
export function normalizeTier(tier: string): SubscriptionTier {
  const normalized = tier.toUpperCase()

  if (normalized === 'FARM') return 'FARM'

  // Legacy tiers that were "unlimited" map to FARM
  if (normalized === 'PRO' || normalized === 'ADVANCED' || normalized === 'ENTERPRISE') {
    return 'FARM'
  }

  // Everything else (FREE, BASIC, CORE, STARTER, etc.) maps to STARTER
  return 'STARTER'
}

/**
 * Get next tier for upgrade path
 */
export function getNextTier(currentTier: string): SubscriptionTier | null {
  const tier = normalizeTier(currentTier)
  if (tier === 'STARTER') return 'FARM'
  return null // Already on highest tier
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
  const features = { ...TIER_FEATURES[normalizedTier] }

  // Enable add-on features
  if (activeAddOns.includes('breeding')) {
    features.breedingManagement = true
  }

  return features
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
