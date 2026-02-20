// src/components/storage/DocumentManager.tsx
// Document management component — upload, tag, and filter

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  FileText,
  Upload,
  Trash2,
  Download,
  ExternalLink,
  Share2,
  Loader2,
  AlertCircle,
  Tag,
  X,
  Filter,
  Plus,
} from 'lucide-react'
import { toast } from '@/lib/toast'
import { formatBytes } from '@/lib/tiers'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface DocumentManagerProps {
  barnId: string
  horseId: string
  editable?: boolean
}

interface DocumentItem {
  id: string
  title: string
  name: string | null
  fileName: string
  type: string
  url: string | null
  fileUrl: string
  fileSize: number | null
  mimeType: string | null
  uploadedAt: string
}

// Common tag suggestions
const TAG_SUGGESTIONS = [
  'Coggins',
  'Vet Record',
  'Registration',
  'Insurance',
  'Health Certificate',
  'Farrier',
  'Dental',
  'Contract',
  'Invoice',
  'Other',
]

export function DocumentManager({
  barnId,
  horseId,
  editable = true,
}: DocumentManagerProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null)
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Tagging state for newly uploaded doc
  const [pendingTagDocId, setPendingTagDocId] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    try {
      const url = `/api/barns/${barnId}/documents?horseId=${horseId}`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }, [barnId, horseId])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  // Upload handler
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]

    // 25MB limit
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File too large. Maximum size is 25MB.')
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('barnId', barnId)
      formData.append('horseId', horseId)
      formData.append('type', 'document')
      formData.append('documentType', 'Untagged')

      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // Refresh and prompt for tag
      await fetchDocuments()
      const newDocId = result.document?.id
      if (newDocId) {
        setPendingTagDocId(newDocId)
        setTagInput('')
        setShowTagSuggestions(true)
      }
      toast.success('Document uploaded', file.name)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      setUploadError(msg)
      toast.error('Upload failed', msg)
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Tag a document (update type field)
  const handleTagDocument = async (docId: string, tag: string) => {
    const trimmedTag = tag.trim()
    if (!trimmedTag) return

    try {
      const response = await fetch(`/api/barns/${barnId}/documents/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: trimmedTag }),
      })

      if (response.ok) {
        setDocuments(prev =>
          prev.map(d => (d.id === docId ? { ...d, type: trimmedTag } : d))
        )
        toast.success('Tag updated', trimmedTag)
      }
    } catch {
      toast.error('Failed to update tag')
    } finally {
      setPendingTagDocId(null)
      setTagInput('')
      setShowTagSuggestions(false)
    }
  }

  // Delete handler
  const handleDeleteConfirm = async () => {
    if (!deleteDocId) return
    const docId = deleteDocId
    setDeleteDocId(null)

    try {
      await fetch(`/api/barns/${barnId}/documents/${docId}`, { method: 'DELETE' })
      setDocuments(prev => prev.filter(d => d.id !== docId))
      toast.success('Document deleted')
    } catch {
      toast.error('Failed to delete document')
    }
  }

  // Get unique tags from documents
  const allTags = Array.from(new Set(documents.map(d => d.type).filter(Boolean)))

  // Filtered documents
  const filteredDocs = filterTag
    ? documents.filter(d => d.type === filterTag)
    : documents

  return (
    <div className="space-y-5">
      {/* Header with upload button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <h3 className="font-medium">Documents</h3>
          <span className="text-sm text-muted-foreground">
            ({documents.length})
          </span>
        </div>

        {editable && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={e => handleUpload(e.target.files)}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.rtf,.jpg,.jpeg,.png,.gif,.heic,.heif,.webp,.tiff,.tif,.bmp"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Upload error */}
      {uploadError && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {uploadError}
          <button onClick={() => setUploadError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tag prompt for newly uploaded doc */}
      {pendingTagDocId && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
          <p className="text-sm font-medium flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Tag this document
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && tagInput.trim()) {
                  handleTagDocument(pendingTagDocId, tagInput)
                }
              }}
              placeholder="e.g. Coggins, Vet Record..."
              className="flex-1 px-3 py-2 text-sm border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
            <button
              onClick={() => handleTagDocument(pendingTagDocId, tagInput || 'Untagged')}
              className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
            >
              Save
            </button>
            <button
              onClick={() => {
                setPendingTagDocId(null)
                setTagInput('')
                setShowTagSuggestions(false)
              }}
              className="px-3 py-2 border rounded-lg text-sm hover:bg-muted"
            >
              Skip
            </button>
          </div>
          {/* Quick-pick tag suggestions */}
          <div className="flex flex-wrap gap-1.5">
            {TAG_SUGGESTIONS.map(suggestion => (
              <button
                key={suggestion}
                onClick={() => handleTagDocument(pendingTagDocId, suggestion)}
                className="px-2.5 py-1 text-xs rounded-full border hover:bg-muted transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tag filter bar */}
      {allTags.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <button
            onClick={() => setFilterTag(null)}
            className={cn(
              'px-2.5 py-1 text-xs rounded-full border transition-colors',
              !filterTag
                ? 'bg-primary text-primary-foreground border-primary'
                : 'hover:bg-muted'
            )}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setFilterTag(filterTag === tag ? null : tag)}
              className={cn(
                'px-2.5 py-1 text-xs rounded-full border transition-colors',
                filterTag === tag
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'hover:bg-muted'
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Document list */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
          Loading documents...
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{filterTag ? `No documents tagged "${filterTag}"` : 'No documents uploaded yet'}</p>
          {editable && !filterTag && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Upload your first document
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDocs.map(doc => (
            <DocumentRow
              key={doc.id}
              document={doc}
              editable={editable}
              isTagging={pendingTagDocId === doc.id}
              onDelete={() => setDeleteDocId(doc.id)}
              onTagClick={() => {
                setPendingTagDocId(doc.id)
                setTagInput(doc.type === 'Untagged' ? '' : doc.type)
                setShowTagSuggestions(true)
              }}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteDocId}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDocId(null)}
        title="Delete document?"
        description="This document will be permanently removed. This action cannot be undone."
        variant="danger"
        confirmLabel="Delete"
      />
    </div>
  )
}

// =============================================================================
// DOCUMENT ROW COMPONENT
// =============================================================================

interface DocumentRowProps {
  document: DocumentItem
  editable: boolean
  isTagging: boolean
  onDelete: () => void
  onTagClick: () => void
}

function DocumentRow({
  document,
  editable,
  isTagging,
  onDelete,
  onTagClick,
}: DocumentRowProps) {
  const downloadUrl = document.fileUrl || document.url || ''

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
      <div className="p-2 bg-muted rounded">
        <FileText className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{document.title || document.fileName}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          {document.type && document.type !== 'Untagged' && (
            <>
              <button
                onClick={editable ? onTagClick : undefined}
                className={cn(
                  'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs',
                  editable && 'hover:bg-primary/20 cursor-pointer'
                )}
              >
                <Tag className="w-2.5 h-2.5" />
                {document.type}
              </button>
              <span>·</span>
            </>
          )}
          {document.type === 'Untagged' && editable && (
            <>
              <button
                onClick={onTagClick}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-dashed text-muted-foreground hover:bg-muted cursor-pointer text-xs"
              >
                <Plus className="w-2.5 h-2.5" />
                Add tag
              </button>
              <span>·</span>
            </>
          )}
          {document.fileSize != null && (
            <span>{formatBytes(document.fileSize)}</span>
          )}
          {document.uploadedAt && (
            <>
              <span>·</span>
              <span>{new Date(document.uploadedAt).toLocaleDateString()}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {downloadUrl && (
          <>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
              title="View"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={downloadUrl}
              download={document.fileName}
              className="p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </a>
          </>
        )}
        {editable && (
          <button
            onClick={onDelete}
            className="p-2 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
