// src/hooks/useStorage.ts
// React hooks for file uploads and storage management (Demo mode)

import { useState, useCallback } from 'react'
import { csrfFetch } from '@/lib/fetch'
import {
  uploadHorsePhoto,
  uploadDocument,
  formatBytes,
  STORAGE_BUCKETS,
  type UploadResult,
  type StorageQuota,
} from '@/lib/storage'

// =============================================================================
// TYPES
// =============================================================================

export interface FileMetadata {
  id: string
  name: string
  size: number
  mimeType: string
  path: string
  url: string
  createdAt: Date
}

// =============================================================================
// UPLOAD HOOK
// =============================================================================

interface UseUploadOptions {
  onSuccess?: (result: UploadResult) => void
  onError?: (error: string) => void
  maxSizeMB?: number
}

interface UseUploadReturn {
  upload: (file: File) => Promise<UploadResult>
  uploading: boolean
  progress: number
  error: string | null
  reset: () => void
}

/**
 * Generic upload hook with progress tracking
 */
export function useUpload(
  uploadFn: (file: File) => Promise<UploadResult>,
  options: UseUploadOptions = {}
): UseUploadReturn {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const { onSuccess, onError, maxSizeMB = 10 } = options

  const upload = useCallback(async (file: File): Promise<UploadResult> => {
    // Validate file size
    const maxBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxBytes) {
      const errorMsg = `File too large. Maximum size is ${maxSizeMB}MB`
      setError(errorMsg)
      onError?.(errorMsg)
      return { success: false, error: errorMsg }
    }

    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      const result = await uploadFn(file)

      clearInterval(progressInterval)
      setProgress(100)

      if (result.success) {
        onSuccess?.(result)
      } else {
        setError(result.error || 'Upload failed')
        onError?.(result.error || 'Upload failed')
      }

      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMsg)
      onError?.(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setUploading(false)
    }
  }, [uploadFn, onSuccess, onError, maxSizeMB])

  const reset = useCallback(() => {
    setUploading(false)
    setProgress(0)
    setError(null)
  }, [])

  return { upload, uploading, progress, error, reset }
}

// =============================================================================
// HORSE PHOTO UPLOAD HOOK
// =============================================================================

interface UseHorsePhotoUploadOptions extends UseUploadOptions {
  barnId: string
  horseId: string
  isPrimary?: boolean
}

export function useHorsePhotoUpload(options: UseHorsePhotoUploadOptions) {
  const { barnId, horseId, isPrimary = false, ...uploadOptions } = options

  const uploadFn = useCallback(
    (file: File) => uploadHorsePhoto(barnId, horseId, file, isPrimary),
    [barnId, horseId, isPrimary]
  )

  return useUpload(uploadFn, { ...uploadOptions, maxSizeMB: 10 })
}

// =============================================================================
// DOCUMENT UPLOAD HOOK
// =============================================================================

interface UseDocumentUploadOptions extends UseUploadOptions {
  barnId: string
  horseId: string
  documentType: string
}

export function useDocumentUpload(options: UseDocumentUploadOptions) {
  const { barnId, horseId, documentType, ...uploadOptions } = options

  const uploadFn = useCallback(
    (file: File) => uploadDocument(barnId, horseId, file, documentType),
    [barnId, horseId, documentType]
  )

  return useUpload(uploadFn, { ...uploadOptions, maxSizeMB: 25 })
}

// =============================================================================
// AVATAR UPLOAD HOOK (Stub for demo)
// =============================================================================

interface UseAvatarUploadOptions extends UseUploadOptions {
  userId: string
}

export function useAvatarUpload(options: UseAvatarUploadOptions) {
  const uploadFn = useCallback(
    async (_file: File): Promise<UploadResult> => {
      return { success: false, error: 'Avatar upload not available in demo mode' }
    },
    []
  )

  return useUpload(uploadFn, { ...options, maxSizeMB: 5 })
}

// =============================================================================
// BARN LOGO UPLOAD HOOK (Stub for demo)
// =============================================================================

interface UseBarnLogoUploadOptions extends UseUploadOptions {
  barnId: string
}

export function useBarnLogoUpload(options: UseBarnLogoUploadOptions) {
  const uploadFn = useCallback(
    async (_file: File): Promise<UploadResult> => {
      return { success: false, error: 'Logo upload not available in demo mode' }
    },
    []
  )

  return useUpload(uploadFn, { ...options, maxSizeMB: 5 })
}

// =============================================================================
// FILE LIST HOOK
// =============================================================================

interface UseFileListOptions {
  barnId: string
  horseId: string
  type: 'photos' | 'documents'
}

interface UseFileListReturn {
  files: FileMetadata[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  remove: (fileId: string) => Promise<boolean>
}

export function useFileList(options: UseFileListOptions): UseFileListReturn {
  const { barnId, horseId, type } = options
  const [files, setFiles] = useState<FileMetadata[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch from API based on type
      const endpoint = type === 'photos' 
        ? `/api/barns/${barnId}/horses/${horseId}/photos`
        : `/api/barns/${barnId}/horses/${horseId}/documents`
      
      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error('Failed to fetch files')
      }
      
      const data = await response.json()
      const fileList = data[type] || data.photos || data.documents || []
      
      setFiles(fileList.map((f: any) => ({
        id: f.id,
        name: f.fileName || f.name || f.title,
        size: f.fileSize || 0,
        mimeType: f.mimeType || 'application/octet-stream',
        path: f.storagePath || f.url,
        url: f.url || f.fileUrl,
        createdAt: new Date(f.createdAt || f.uploadedAt),
      })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files')
    } finally {
      setLoading(false)
    }
  }, [barnId, horseId, type])

  const remove = useCallback(async (fileId: string): Promise<boolean> => {
    try {
      const response = await csrfFetch('/api/storage/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barnId,
          fileId,
          fileType: type === 'photos' ? 'photo' : 'document',
        }),
      })

      if (response.ok) {
        setFiles(prev => prev.filter(f => f.id !== fileId))
        return true
      }
      return false
    } catch (error) {
      console.error('Delete error:', error)
      return false
    }
  }, [barnId, type])

  return { files, loading, error, refresh, remove }
}

// =============================================================================
// STORAGE QUOTA HOOK
// =============================================================================

interface UseStorageQuotaOptions {
  barnId: string
}

interface UseStorageQuotaReturn {
  quota: StorageQuota | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  formattedUsed: string
  formattedLimit: string
}

export function useStorageQuota(options: UseStorageQuotaOptions): UseStorageQuotaReturn {
  const { barnId } = options
  const [quota, setQuota] = useState<StorageQuota | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/storage/quota?barnId=${barnId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch quota')
      }

      const data = await response.json()
      setQuota(data.quota)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quota')
    } finally {
      setLoading(false)
    }
  }, [barnId])

  return {
    quota,
    loading,
    error,
    refresh,
    formattedUsed: quota ? formatBytes(quota.used) : '0 Bytes',
    formattedLimit: quota ? formatBytes(quota.limit) : '0 Bytes',
  }
}

// =============================================================================
// DRAG & DROP HOOK
// =============================================================================

interface UseDragDropOptions {
  onDrop: (files: File[]) => void
  accept?: string[]
  multiple?: boolean
}

interface UseDragDropReturn {
  isDragging: boolean
  dragProps: {
    onDragOver: (e: React.DragEvent) => void
    onDragEnter: (e: React.DragEvent) => void
    onDragLeave: (e: React.DragEvent) => void
    onDrop: (e: React.DragEvent) => void
  }
}

export function useDragDrop(options: UseDragDropOptions): UseDragDropReturn {
  const { onDrop, accept, multiple = true } = options
  const [isDragging, setIsDragging] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter(prev => prev + 1)
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter(prev => {
      const newCount = prev - 1
      if (newCount === 0) {
        setIsDragging(false)
      }
      return newCount
    })
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setDragCounter(0)

    const droppedFiles = Array.from(e.dataTransfer.files)
    
    let filteredFiles = droppedFiles
    if (accept && accept.length > 0) {
      filteredFiles = droppedFiles.filter(file => {
        return accept.some(acceptType => {
          if (acceptType.endsWith('/*')) {
            const baseType = acceptType.replace('/*', '')
            return file.type.startsWith(baseType)
          }
          return file.type === acceptType
        })
      })
    }

    if (!multiple && filteredFiles.length > 1) {
      filteredFiles = [filteredFiles[0]]
    }

    if (filteredFiles.length > 0) {
      onDrop(filteredFiles)
    }
  }, [onDrop, accept, multiple])

  return {
    isDragging,
    dragProps: {
      onDragOver: handleDragOver,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  }
}

// Re-export for compatibility
export { STORAGE_BUCKETS, formatBytes }
export type { UploadResult, StorageQuota }
