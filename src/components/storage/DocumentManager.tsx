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
  Loader2,
  AlertCircle,
  Tag,
  X,
  Filter,
  Plus,
  Pencil,
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
  notes: string | null
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    notes: '',
    tag: '',
    file: null as File | null,
  })

  // Edit modal state
  const [editDocId, setEditDocId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ title: '', notes: '', tag: '' })

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

  // File select handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 25 * 1024 * 1024) {
      toast.warning('File too large', 'Maximum file size is 25MB')
      return
    }

    setUploadForm(prev => ({
      ...prev,
      file,
      title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
    }))
    setShowUploadModal(true)
  }

  // Upload handler
  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.title.trim()) {
      toast.warning('Missing fields', 'Please select a file and enter a name')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', uploadForm.file)
      formData.append('barnId', barnId)
      formData.append('horseId', horseId)
      formData.append('type', 'document')
      formData.append('documentType', uploadForm.tag.trim() || 'Untagged')
      formData.append('documentTitle', uploadForm.title.trim())
      if (uploadForm.notes.trim()) {
        formData.append('documentNotes', uploadForm.notes.trim())
      }

      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      await fetchDocuments()
      setShowUploadModal(false)
      setUploadForm({ title: '', notes: '', tag: '', file: null })
      toast.success('Document uploaded', uploadForm.file.name)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      toast.error('Upload failed', msg)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Edit handler
  const handleEditSave = async () => {
    if (!editDocId) return

    try {
      const response = await fetch(`/api/barns/${barnId}/documents/${editDocId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title.trim() || undefined,
          type: editForm.tag.trim() || undefined,
          notes: editForm.notes.trim() || null,
        }),
      })

      if (response.ok) {
        setDocuments(prev =>
          prev.map(d =>
            d.id === editDocId
              ? {
                  ...d,
                  title: editForm.title.trim() || d.title,
                  type: editForm.tag.trim() || d.type,
                  notes: editForm.notes.trim() || null,
                }
              : d
          )
        )
        toast.success('Document updated')
      }
    } catch {
      toast.error('Failed to update document')
    } finally {
      setEditDocId(null)
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

  // Open edit modal
  const openEdit = (doc: DocumentItem) => {
    setEditDocId(doc.id)
    setEditForm({
      title: doc.title,
      notes: doc.notes || '',
      tag: doc.type === 'Untagged' ? '' : doc.type,
    })
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
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.rtf,.jpg,.jpeg,.png,.gif,.heic,.heif,.webp,.tiff,.tif,.bmp"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>
        )}
      </div>

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
              onDelete={() => setDeleteDocId(doc.id)}
              onEdit={() => openEdit(doc)}
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload Document</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setUploadForm({ title: '', notes: '', tag: '', file: null })
                }}
                className="p-1 rounded hover:bg-accent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected file */}
            {uploadForm.file && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg mb-4">
                <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadForm.file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(uploadForm.file.size)}</p>
                </div>
                <button
                  onClick={() => {
                    fileInputRef.current?.click()
                  }}
                  className="text-xs text-primary hover:underline flex-shrink-0"
                >
                  Change
                </button>
              </div>
            )}

            <div className="space-y-4">
              {/* Document Name */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Document Name *
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  className="input w-full"
                  placeholder="e.g. 2024 Coggins Test"
                />
              </div>

              {/* Description (optional) */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Description <span className="text-xs font-normal">(optional)</span>
                </label>
                <textarea
                  value={uploadForm.notes}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="input w-full resize-none"
                  rows={2}
                  placeholder="Add any notes about this document..."
                />
              </div>

              {/* Tag */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Tag <span className="text-xs font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={uploadForm.tag}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, tag: e.target.value }))}
                  className="input w-full"
                  placeholder="e.g. Coggins, Vet Record..."
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {TAG_SUGGESTIONS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setUploadForm(prev => ({ ...prev, tag: prev.tag === tag ? '' : tag }))}
                      className={cn(
                        'px-2 py-0.5 text-xs rounded-full border transition-colors',
                        uploadForm.tag === tag
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover:bg-muted'
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setUploadForm({ title: '', notes: '', tag: '', file: null })
                }}
                className="btn-secondary flex-1"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                disabled={uploading || !uploadForm.file || !uploadForm.title.trim()}
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
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Document</h3>
              <button
                onClick={() => setEditDocId(null)}
                className="p-1 rounded hover:bg-accent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Document Name
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Description <span className="text-xs font-normal">(optional)</span>
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="input w-full resize-none"
                  rows={2}
                  placeholder="Add any notes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Tag
                </label>
                <input
                  type="text"
                  value={editForm.tag}
                  onChange={(e) => setEditForm(prev => ({ ...prev, tag: e.target.value }))}
                  className="input w-full"
                  placeholder="e.g. Coggins, Vet Record..."
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {TAG_SUGGESTIONS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setEditForm(prev => ({ ...prev, tag: prev.tag === tag ? '' : tag }))}
                      className={cn(
                        'px-2 py-0.5 text-xs rounded-full border transition-colors',
                        editForm.tag === tag
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover:bg-muted'
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditDocId(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="btn-primary flex-1"
                disabled={!editForm.title.trim()}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// DOCUMENT ROW COMPONENT
// =============================================================================

interface DocumentRowProps {
  document: DocumentItem
  editable: boolean
  onDelete: () => void
  onEdit: () => void
}

function DocumentRow({
  document,
  editable,
  onDelete,
  onEdit,
}: DocumentRowProps) {
  const downloadUrl = document.fileUrl || document.url || ''

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
      <div className="p-2 bg-muted rounded">
        <FileText className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{document.title || document.fileName}</p>
        {document.notes && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{document.notes}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          {document.type && document.type !== 'Untagged' && (
            <>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                <Tag className="w-2.5 h-2.5" />
                {document.type}
              </span>
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
          <>
            <button
              onClick={onEdit}
              className="p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
