// src/components/storage/FileUpload.tsx
// Reusable file upload component with drag & drop support

'use client'

import React, { useRef, useCallback } from 'react'
import NextImage from 'next/image'
import { Upload, X, Check, AlertCircle, Loader2, Image, FileText } from 'lucide-react'
import { useDragDrop } from '@/hooks/useStorage'
import { formatBytes } from '@/lib/storage'
import { cn } from '@/lib/utils'

// =============================================================================
// FILE UPLOAD DROPZONE
// =============================================================================

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  accept?: string[]
  multiple?: boolean
  maxSizeMB?: number
  disabled?: boolean
  uploading?: boolean
  progress?: number
  error?: string | null
  className?: string
  children?: React.ReactNode
}

export function FileUpload({
  onFilesSelected,
  accept = ['image/*'],
  multiple = false,
  maxSizeMB = 10,
  disabled = false,
  uploading = false,
  progress = 0,
  error = null,
  className,
  children,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback((files: File[]) => {
    // Filter by size
    const maxBytes = maxSizeMB * 1024 * 1024
    const validFiles = files.filter(f => f.size <= maxBytes)
    
    if (validFiles.length > 0) {
      onFilesSelected(validFiles)
    }
  }, [onFilesSelected, maxSizeMB])

  const { isDragging, dragProps } = useDragDrop({
    onDrop: handleFiles,
    accept,
    multiple,
  })

  const handleClick = () => {
    if (!disabled && !uploading) {
      inputRef.current?.click()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(Array.from(files))
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const acceptString = accept.join(',')

  return (
    <div
      {...dragProps}
      onClick={handleClick}
      className={cn(
        'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
        isDragging && 'border-primary bg-primary/5',
        !isDragging && !error && 'border-muted-foreground/25 hover:border-muted-foreground/50',
        error && 'border-destructive bg-destructive/5',
        (disabled || uploading) && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptString}
        multiple={multiple}
        onChange={handleInputChange}
        disabled={disabled || uploading}
        className="hidden"
      />

      {uploading ? (
        <div className="space-y-3">
          <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin" />
          <div className="text-sm text-muted-foreground">Uploading...</div>
          <div className="w-full max-w-xs mx-auto bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : children ? (
        children
      ) : (
        <div className="space-y-3">
          <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {accept.includes('image/*') && 'PNG, JPG, GIF up to '}
              {accept.includes('application/pdf') && 'PDF, '}
              {maxSizeMB}MB
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// IMAGE PREVIEW WITH UPLOAD
// =============================================================================

interface ImageUploadPreviewProps {
  currentUrl?: string | null
  onUpload: (file: File) => Promise<void>
  onRemove?: () => void
  uploading?: boolean
  progress?: number
  error?: string | null
  shape?: 'square' | 'circle'
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export function ImageUploadPreview({
  currentUrl,
  onUpload,
  onRemove,
  uploading = false,
  progress = 0,
  error = null,
  shape = 'square',
  size = 'md',
  label,
}: ImageUploadPreviewProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  }

  const handleClick = () => {
    if (!uploading) {
      inputRef.current?.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await onUpload(file)
    }
    e.target.value = ''
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      
      <div
        onClick={handleClick}
        className={cn(
          'relative overflow-hidden border-2 border-dashed cursor-pointer transition-colors',
          'hover:border-primary/50 group',
          shape === 'circle' ? 'rounded-full' : 'rounded-lg',
          sizeClasses[size],
          uploading && 'pointer-events-none'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {currentUrl ? (
          <>
            <img
              src={currentUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            {onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove()
                }}
                className="absolute top-1 right-1 p-1 bg-destructive rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </>
        ) : uploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Image className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}

// =============================================================================
// UPLOAD PROGRESS ITEM
// =============================================================================

interface UploadProgressItemProps {
  filename: string
  size: number
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  onCancel?: () => void
}

export function UploadProgressItem({
  filename,
  size,
  progress,
  status,
  error,
  onCancel,
}: UploadProgressItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
      <div className="flex-shrink-0">
        {status === 'success' ? (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-4 h-4 text-green-600" />
          </div>
        ) : status === 'error' ? (
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
        ) : status === 'uploading' ? (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-muted-foreground/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{filename}</p>
        <p className="text-xs text-muted-foreground">
          {error || formatBytes(size)}
        </p>
        {status === 'uploading' && (
          <div className="mt-1 h-1 bg-muted-foreground/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {onCancel && status !== 'success' && (
        <button
          onClick={onCancel}
          className="p-1 hover:bg-muted-foreground/20 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

// =============================================================================
// FILE LIST ITEM
// =============================================================================

interface FileListItemProps {
  name: string
  size: number
  url: string
  mimeType: string
  onDelete?: () => void
  onView?: () => void
}

export function FileListItem({
  name,
  size,
  url,
  mimeType,
  onDelete,
  onView,
}: FileListItemProps) {
  const isImage = mimeType.startsWith('image/')

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="relative flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-muted">
        {isImage ? (
          <NextImage src={url} alt={name} fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground">{formatBytes(size)}</p>
      </div>

      <div className="flex items-center gap-1">
        {onView && (
          <button
            onClick={onView}
            className="p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
          >
            <Image className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-2 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
