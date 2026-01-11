// src/lib/storage.ts
// Storage utilities for StableTrack Demo - uses local file storage

import { getTierLimits, formatBytes } from './tiers'

// Re-export formatBytes for backward compatibility
export { formatBytes }

// =============================================================================
// TYPES
// =============================================================================

export interface UploadResult {
  success: boolean
  path?: string
  url?: string
  error?: string
  size?: number
}

export interface StorageQuota {
  used: number       // bytes
  limit: number      // bytes
  percentage: number // 0-100
}

export interface FileMetadata {
  id: string
  name: string
  size: number
  mimeType: string
  path: string
  url: string
  createdAt: Date
}

// Storage bucket types (kept for compatibility)
export const STORAGE_BUCKETS = {
  HORSE_PHOTOS: 'horse-photos',
  DOCUMENTS: 'documents',
  AVATARS: 'avatars',
  BARN_LOGOS: 'barn-logos',
} as const

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS]

// =============================================================================
// CLIENT-SIDE UPLOAD FUNCTIONS (use API routes)
// =============================================================================

/**
 * Upload a horse photo via API
 */
export async function uploadHorsePhoto(
  barnId: string,
  horseId: string,
  file: File,
  isPrimary: boolean = false,
  caption?: string
): Promise<UploadResult> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('barnId', barnId)
    formData.append('horseId', horseId)
    formData.append('type', 'photo')
    formData.append('isPrimary', String(isPrimary))
    if (caption) formData.append('caption', caption)

    const response = await fetch('/api/storage/upload', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Upload failed',
      }
    }

    return {
      success: true,
      path: result.photo?.storagePath,
      url: result.url,
      size: file.size,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

/**
 * Upload a document via API
 */
export async function uploadDocument(
  barnId: string,
  horseId: string,
  file: File,
  documentType: string
): Promise<UploadResult> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('barnId', barnId)
    formData.append('horseId', horseId)
    formData.append('type', 'document')
    formData.append('documentType', documentType)

    const response = await fetch('/api/storage/upload', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Upload failed',
      }
    }

    return {
      success: true,
      path: result.document?.storagePath,
      url: result.url,
      size: file.size,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

/**
 * Delete a file via API
 */
export async function deleteFile(
  barnId: string,
  fileId: string,
  fileType: 'photo' | 'document' = 'document'
): Promise<boolean> {
  try {
    const response = await fetch('/api/storage/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ barnId, fileId, fileType }),
    })

    return response.ok
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}

/**
 * Get storage quota via API
 */
export async function getStorageQuota(barnId: string): Promise<StorageQuota | null> {
  try {
    const response = await fetch(`/api/storage/quota?barnId=${barnId}`)
    
    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.quota
  } catch (error) {
    console.error('Failed to get storage quota:', error)
    return null
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if file type is allowed
 */
export function isAllowedFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      const baseType = type.replace('/*', '')
      return file.type.startsWith(baseType)
    }
    return file.type === type
  })
}

/**
 * Check if file size is within limit
 */
export function isFileSizeAllowed(file: File, maxSizeMB: number): boolean {
  return file.size <= maxSizeMB * 1024 * 1024
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Generate a unique filename
 */
export function generateUniqueFilename(originalName: string): string {
  const ext = getFileExtension(originalName)
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${random}.${ext}`
}

// =============================================================================
// IMAGE OPTIMIZATION (placeholder for future implementation)
// =============================================================================

/**
 * Get optimized image URL (no-op in demo mode)
 */
export function getOptimizedImageUrl(
  url: string,
  options: { width?: number; height?: number; quality?: number } = {}
): string {
  // In demo mode, just return the original URL
  return url
}

/**
 * Get thumbnail URL (no-op in demo mode)
 */
export function getThumbnailUrl(url: string): string {
  return url
}

// =============================================================================
// ADDITIONAL UPLOAD FUNCTIONS (Stubs for API compatibility)
// =============================================================================

/**
 * Upload avatar (stub - not implemented in demo)
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<UploadResult> {
  // In demo mode, avatars aren't stored in separate bucket
  // Could be implemented later
  return {
    success: false,
    error: 'Avatar upload not implemented in demo mode',
  }
}

/**
 * Upload barn logo (stub - not implemented in demo)
 */
export async function uploadBarnLogo(
  barnId: string,
  file: File
): Promise<UploadResult> {
  // In demo mode, logos aren't stored in separate bucket
  // Could be implemented later
  return {
    success: false,
    error: 'Logo upload not implemented in demo mode',
  }
}

/**
 * List horse photos from database
 */
export async function listHorsePhotos(
  barnId: string,
  horseId: string
): Promise<FileMetadata[]> {
  // This should be called from API route, not directly
  // Return empty array - actual listing happens via API
  return []
}

/**
 * List horse documents from database
 */
export async function listHorseDocuments(
  barnId: string,
  horseId: string
): Promise<FileMetadata[]> {
  // This should be called from API route, not directly
  // Return empty array - actual listing happens via API
  return []
}

/**
 * Get public URL for a file (in demo mode, URLs are already public)
 */
export function getPublicUrl(bucket: StorageBucket, path: string): string {
  // In demo mode, all files are served via API routes
  if (bucket === STORAGE_BUCKETS.HORSE_PHOTOS) {
    return `/api/uploads/photos/${path}`
  } else if (bucket === STORAGE_BUCKETS.DOCUMENTS) {
    return `/api/uploads/documents/${path}`
  }
  return path
}

// =============================================================================
// STORAGE CALCULATION (For server-side use)
// =============================================================================

/**
 * Calculate barn storage usage (call from API routes with prisma client)
 */
export async function calculateBarnStorageUsage(
  barnId: string,
  prisma: any
): Promise<number> {
  const [photoStats, documentStats] = await Promise.all([
    prisma.horsePhoto.aggregate({
      where: { horse: { barnId } },
      _sum: { fileSize: true },
    }),
    prisma.document.aggregate({
      where: { horse: { barnId } },
      _sum: { fileSize: true },
    }),
  ])
  
  return (photoStats._sum.fileSize || 0) + (documentStats._sum.fileSize || 0)
}
