// src/components/storage/HorsePhotoGallery.tsx
// Photo gallery component for horse profiles with tier-based restrictions

'use client'

import React, { useState, useEffect } from 'react'
import { 
  Camera, 
  Trash2, 
  Star, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Plus,
  Lock,
  Crown,
  Download
} from 'lucide-react'
import { useHorsePhotoUpload, useFileList } from '@/hooks/useStorage'
import { FileUpload } from './FileUpload'
import { UpgradePrompt } from './UpgradePrompt'
import { deleteFile, STORAGE_BUCKETS } from '@/lib/storage'
import { getTierLimits, getTierDisplayName, getNextTier, type SubscriptionTier } from '@/lib/tiers'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { toast } from '@/lib/toast'

interface HorsePhotoGalleryProps {
  barnId: string
  horseId: string
  primaryPhotoUrl?: string | null
  onPrimaryPhotoChange?: (url: string | null) => void
  editable?: boolean
  initialPhotoCount?: number
}

export function HorsePhotoGallery({
  barnId,
  horseId,
  primaryPhotoUrl,
  onPrimaryPhotoChange,
  editable = true,
  initialPhotoCount = 0,
}: HorsePhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [showUpload, setShowUpload] = useState(false)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [deletePhotoId, setDeletePhotoId] = useState<string | null>(null)
  const [isSettingPrimary, setIsSettingPrimary] = useState(false)

  // Demo mode: STARTER tier (use actual tier limits)
  const tier: SubscriptionTier = 'STARTER'
  const tierLimits = getTierLimits(tier)
  const canUploadPhotos = true
  const canBulkUpload = true
  const canDownloadOriginals = true
  const maxPhotosPerHorse = tierLimits.maxPhotosPerHorse
  const tierDisplayName = getTierDisplayName(tier)
  const nextTier = getNextTier(tier)

  // File list hook
  const { files, loading, refresh, remove } = useFileList({
    barnId,
    horseId,
    type: 'photos',
  })

  const photoCount = files.length + (primaryPhotoUrl ? 1 : 0)
  const atPhotoLimit = photoCount >= maxPhotosPerHorse
  const remainingSlots = maxPhotosPerHorse - photoCount

  // Limits object for display
  const limits = { maxPhotosPerHorse }

  // Upload hook
  const { upload, uploading, progress, error, reset } = useHorsePhotoUpload({
    barnId,
    horseId,
    onSuccess: () => {
      refresh()
      setShowUpload(false)
      toast.success('Photo uploaded', 'Your photo has been added to the gallery')
    },
  })

  // Primary photo upload hook
  const primaryUpload = useHorsePhotoUpload({
    barnId,
    horseId,
    isPrimary: true,
    onSuccess: (result) => {
      onPrimaryPhotoChange?.(result.url || null)
    },
  })

  // Load photos on mount
  useEffect(() => {
    refresh()
  }, [refresh])

  const handleUploadClick = () => {
    if (atPhotoLimit) {
      setShowUpgradePrompt(true)
    } else {
      setShowUpload(!showUpload)
    }
  }

  const handleUpload = async (selectedFiles: File[]) => {
    // Limit files to remaining slots
    const filesToUpload = canBulkUpload 
      ? selectedFiles.slice(0, remainingSlots === Infinity ? selectedFiles.length : remainingSlots)
      : [selectedFiles[0]]

    for (const file of filesToUpload) {
      await upload(file)
    }
  }

  const handleSetPrimary = async (url: string) => {
    setIsSettingPrimary(true)
    try {
      const res = await fetch(`/api/barns/${barnId}/horses/${horseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePhotoUrl: url }),
      })
      if (!res.ok) throw new Error('Failed to set primary photo')
      onPrimaryPhotoChange?.(url)
      toast.success('Primary photo updated', 'This photo is now the profile photo')
    } catch {
      toast.error('Error', 'Failed to set primary photo')
    } finally {
      setIsSettingPrimary(false)
    }
  }

  const handleDeleteClick = (photoId: string) => {
    setDeletePhotoId(photoId)
  }

  const handleDeleteConfirm = async () => {
    if (!deletePhotoId) return
    const id = deletePhotoId
    setDeletePhotoId(null)

    // If deleting the primary photo, clear it from the horse profile
    if (id === '__primary__') {
      try {
        const res = await fetch(`/api/barns/${barnId}/horses/${horseId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profilePhotoUrl: null }),
        })
        if (!res.ok) throw new Error('Failed')
        onPrimaryPhotoChange?.(null)
        toast.success('Photo removed', 'Primary photo has been cleared')
      } catch {
        toast.error('Error', 'Failed to remove primary photo')
      }
      return
    }

    const success = await remove(id)
    if (success) {
      toast.success('Photo deleted', 'The photo has been removed')
    } else {
      toast.error('Error', 'Failed to delete photo')
    }
  }

  const handleDownload = async (url: string, filename: string) => {
    if (!canDownloadOriginals) {
      setShowUpgradePrompt(true)
      return
    }

    // Trigger download
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const allPhotos = primaryPhotoUrl
    ? [{ id: '__primary__', url: primaryPhotoUrl, path: 'primary', name: 'primary.jpg', isPrimary: true }, ...files.map(f => ({ ...f, isPrimary: false }))]
    : files.map(f => ({ ...f, isPrimary: false }))

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4" />
          <h3 className="font-medium">Photos ({photoCount})</h3>
          {limits.maxPhotosPerHorse !== -1 && (
            <span className="text-xs text-muted-foreground">
              / {limits.maxPhotosPerHorse} max
            </span>
          )}
        </div>
        {editable && canUploadPhotos && (
          <button
            onClick={handleUploadClick}
            className={cn(
              "text-sm flex items-center gap-1",
              atPhotoLimit 
                ? "text-muted-foreground" 
                : "text-primary hover:underline"
            )}
          >
            {atPhotoLimit ? (
              <>
                <Lock className="w-3 h-3" />
                Limit Reached
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Photos
              </>
            )}
          </button>
        )}
      </div>

      {/* Photo limit warning */}
      {atPhotoLimit && editable && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <Crown className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Photo limit reached
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              {tierDisplayName} plan allows {limits.maxPhotosPerHorse} photos per horse.
              {nextTier && ` Upgrade to ${getTierDisplayName(nextTier)} for more.`}
            </p>
          </div>
        </div>
      )}

      {/* Upgrade prompt modal */}
      {showUpgradePrompt && (
        <UpgradePrompt
          currentTier={tier}
          feature="more photos"
          onClose={() => setShowUpgradePrompt(false)}
          onUpgrade={() => {
            // Navigate to billing page
            window.location.href = '/settings/billing'
          }}
        />
      )}

      {/* Upload area */}
      {showUpload && !atPhotoLimit && (
        <div className="space-y-2">
          <FileUpload
            onFilesSelected={handleUpload}
            accept={['image/*']}
            multiple={canBulkUpload}
            maxSizeMB={10}
            uploading={uploading}
            progress={progress}
            error={error}
            className="mb-4"
          />
          {!canBulkUpload && (
            <p className="text-xs text-muted-foreground text-center">
              <Lock className="w-3 h-3 inline mr-1" />
              Bulk upload available on Farm plan and above
            </p>
          )}
          {remainingSlots !== Infinity && (
            <p className="text-xs text-muted-foreground text-center">
              {remainingSlots} photo slot{remainingSlots !== 1 ? 's' : ''} remaining
            </p>
          )}
        </div>
      )}

      {/* Photo grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : allPhotos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No photos yet</p>
          {editable && canUploadPhotos && !atPhotoLimit && (
            <button
              onClick={() => setShowUpload(true)}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Upload the first photo
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {allPhotos.map((photo, index) => (
            <div
              key={photo.id || photo.path}
              className={cn(
                'relative aspect-square rounded-lg overflow-hidden group cursor-pointer',
                photo.isPrimary && 'ring-2 ring-primary'
              )}
              onClick={() => openLightbox(index)}
            >
              <img
                src={photo.url}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Primary badge */}
              {photo.isPrimary && (
                <div className="absolute top-1 left-1 bg-primary text-primary-foreground px-1.5 py-0.5 rounded text-xs font-medium">
                  Primary
                </div>
              )}

              {/* Hover overlay */}
              {editable && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!photo.isPrimary && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSetPrimary(photo.url)
                      }}
                      className={cn(
                        "p-2 bg-card/20 rounded-full hover:bg-card/30",
                        isSettingPrimary && "opacity-50 pointer-events-none"
                      )}
                      title="Set as primary"
                      aria-label="Set as primary photo"
                      disabled={isSettingPrimary}
                    >
                      <Star className="w-4 h-4 text-white" />
                    </button>
                  )}
                  {canDownloadOriginals && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(photo.url, photo.name || 'photo.jpg')
                      }}
                      className="p-2 bg-card/20 rounded-full hover:bg-card/30"
                      title="Download original"
                      aria-label="Download original photo"
                    >
                      <Download className="w-4 h-4 text-white" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteClick(photo.id)
                    }}
                    className="p-2 bg-card/20 rounded-full hover:bg-red-500/50"
                    title="Delete"
                    aria-label="Delete photo"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deletePhotoId}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletePhotoId(null)}
        title="Delete photo?"
        description="This photo will be permanently removed. This action cannot be undone."
        variant="danger"
        confirmLabel="Delete"
      />

      {/* Lightbox */}
      {lightboxOpen && (
        <PhotoLightbox
          photos={allPhotos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
          canDownload={canDownloadOriginals}
          onDownload={handleDownload}
        />
      )}
    </div>
  )
}

// =============================================================================
// LIGHTBOX COMPONENT
// =============================================================================

interface PhotoLightboxProps {
  photos: Array<{ url: string; path: string; name?: string }>
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
  canDownload?: boolean
  onDownload?: (url: string, filename: string) => void
}

function PhotoLightbox({ 
  photos, 
  currentIndex, 
  onClose, 
  onNavigate,
  canDownload = false,
  onDownload,
}: PhotoLightboxProps) {
  const currentPhoto = photos[currentIndex]
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < photos.length - 1

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(currentIndex - 1)
      if (e.key === 'ArrowRight' && hasNext) onNavigate(currentIndex + 1)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, hasPrev, hasNext, onClose, onNavigate])

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
        <div className="text-white/80 text-sm">
          {currentIndex + 1} / {photos.length}
        </div>
        <div className="flex items-center gap-2">
          {canDownload && onDownload && (
            <button
              onClick={() => onDownload(currentPhoto.url, currentPhoto.name || `photo-${currentIndex + 1}.jpg`)}
              className="p-2 text-white/80 hover:text-white hover:bg-card/10 rounded"
              title="Download original"
              aria-label="Download original photo"
            >
              <Download className="w-6 h-6" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-card/10 rounded"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Navigation arrows */}
      {hasPrev && (
        <button
          onClick={() => onNavigate(currentIndex - 1)}
          className="absolute left-4 p-2 text-white/80 hover:text-white"
          aria-label="Previous photo"
        >
          <ChevronLeft className="w-10 h-10" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={() => onNavigate(currentIndex + 1)}
          className="absolute right-4 p-2 text-white/80 hover:text-white"
          aria-label="Next photo"
        >
          <ChevronRight className="w-10 h-10" />
        </button>
      )}

      {/* Image */}
      <img
        src={currentPhoto.url}
        alt={`Photo ${currentIndex + 1}`}
        className="max-w-[90vw] max-h-[85vh] object-contain"
      />
    </div>
  )
}
