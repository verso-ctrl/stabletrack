// src/components/storage/DocumentManager.tsx
// Document management component with tier-based restrictions

'use client'

import React, { useState, useEffect } from 'react'
import {
  FileText,
  Upload,
  Trash2,
  Download,
  Calendar,
  AlertTriangle,
  Lock,
  Plus,
  ExternalLink,
  Share2,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useDocumentUpload, useFileList } from '@/hooks/useStorage'
import { useTier } from '@/hooks/useTierPermissions'
import { FileUpload } from './FileUpload'
import { UpgradeBanner, FeatureLocked } from './UpgradePrompt'
import { 
  DOCUMENT_TYPES, 
  getDocumentTypeDisplayName,
  getTierDisplayName,
  formatBytes,
  type DocumentType 
} from '@/lib/tiers'
import { cn } from '@/lib/utils'

interface DocumentManagerProps {
  barnId: string
  horseId: string
  editable?: boolean
}

interface DocumentItem {
  id: string
  name: string
  type: DocumentType
  url: string
  path: string
  size: number
  mimeType: string
  expiryDate?: Date | null
  uploadedAt: Date
}

export function DocumentManager({
  barnId,
  horseId,
  editable = true,
}: DocumentManagerProps) {
  const [showUpload, setShowUpload] = useState(false)
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null)
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)

  // Tier permissions
  const {
    tier,
    features,
    canUploadDocuments,
    canTrackDocumentExpiry,
    checkDocumentType,
    nextTier,
    tierDisplayName,
  } = useTier()

  // Fetch documents
  useEffect(() => {
    async function fetchDocuments() {
      try {
        const response = await fetch(`/api/barns/${barnId}/documents?horseId=${horseId}`)
        if (response.ok) {
          const data = await response.json()
          setDocuments(data.documents || [])
        }
      } catch (error) {
        console.error('Failed to fetch documents:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [barnId, horseId])

  // Upload hook
  const { upload, uploading, progress, error } = useDocumentUpload({
    barnId,
    horseId,
    documentType: selectedType || 'other',
    onSuccess: () => {
      setShowUpload(false)
      setSelectedType(null)
      // Refresh documents
      window.location.reload() // Simple refresh, could be optimized
    },
  })

  // If documents not available on this tier
  if (!canUploadDocuments) {
    return (
      <FeatureLocked
        feature="Document Management"
        requiredTier="PROFESSIONAL"
        onUpgrade={() => window.location.href = '/settings/billing'}
      />
    )
  }

  const handleUploadClick = (type: DocumentType) => {
    if (!checkDocumentType(type)) {
      return // Type not allowed on this tier
    }
    setSelectedType(type)
    setShowUpload(true)
  }

  const handleUpload = async (files: File[]) => {
    if (files[0]) {
      await upload(files[0])
    }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document?')) return

    try {
      await fetch(`/api/barns/${barnId}/documents/${docId}`, { method: 'DELETE' })
      setDocuments(prev => prev.filter(d => d.id !== docId))
    } catch (error) {
      console.error('Failed to delete document:', error)
    }
  }

  const handleShare = async (doc: DocumentItem) => {
    if (!features.canShareDocuments) {
      alert(`Document sharing requires ${getTierDisplayName('FARM')} plan`)
      return
    }
    // Implement sharing logic
    navigator.clipboard.writeText(doc.url)
    alert('Document link copied to clipboard')
  }

  // Group documents by type
  const documentsByType = documents.reduce((acc, doc) => {
    const type = doc.type || 'other'
    if (!acc[type]) acc[type] = []
    acc[type].push(doc)
    return acc
  }, {} as Record<string, DocumentItem[]>)

  // Check for expiring documents
  const expiringDocs = canTrackDocumentExpiry 
    ? documents.filter(d => {
        if (!d.expiryDate) return false
        const daysUntilExpiry = Math.ceil(
          (new Date(d.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0
      })
    : []

  const expiredDocs = canTrackDocumentExpiry
    ? documents.filter(d => d.expiryDate && new Date(d.expiryDate) < new Date())
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <h3 className="font-medium">Documents</h3>
          <span className="text-sm text-muted-foreground">
            ({documents.length})
          </span>
        </div>
      </div>

      {/* Expiry warnings */}
      {canTrackDocumentExpiry && (expiredDocs.length > 0 || expiringDocs.length > 0) && (
        <div className="space-y-2">
          {expiredDocs.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  {expiredDocs.length} expired document{expiredDocs.length > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-red-600">
                  {expiredDocs.map(d => d.name).join(', ')}
                </p>
              </div>
            </div>
          )}
          {expiringDocs.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  {expiringDocs.length} document{expiringDocs.length > 1 ? 's' : ''} expiring soon
                </p>
                <p className="text-xs text-amber-600">
                  {expiringDocs.map(d => d.name).join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expiry tracking upgrade banner */}
      {!canTrackDocumentExpiry && documents.length > 0 && (
        <UpgradeBanner
          currentTier={tier}
          feature="document expiry tracking"
          compact
          onUpgrade={() => window.location.href = '/settings/billing'}
        />
      )}

      {/* Document type sections */}
      {editable && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.values(DOCUMENT_TYPES).map(type => {
            const isAllowed = checkDocumentType(type)
            const count = documentsByType[type]?.length || 0

            return (
              <button
                key={type}
                onClick={() => isAllowed && handleUploadClick(type)}
                disabled={!isAllowed}
                className={cn(
                  'p-3 border rounded-lg text-left transition-colors',
                  isAllowed 
                    ? 'hover:border-primary hover:bg-primary/5 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed bg-muted'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {getDocumentTypeDisplayName(type)}
                  </span>
                  {!isAllowed && <Lock className="w-3 h-3 text-muted-foreground" />}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {count} file{count !== 1 ? 's' : ''}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Upload modal */}
      {showUpload && selectedType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h4 className="font-medium mb-4">
              Upload {getDocumentTypeDisplayName(selectedType)}
            </h4>
            
            {!uploading && !error ? (
              <FileUpload
                onFilesSelected={handleUpload}
                accept={['application/pdf', 'image/*', '.doc', '.docx']}
                maxSizeMB={25}
                uploading={false}
                progress={0}
                error={null}
              />
            ) : uploading ? (
              <div className="py-8 text-center">
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-amber-500 animate-spin" />
                <p className="text-sm text-stone-600">Uploading document...</p>
                <div className="w-full max-w-xs mx-auto bg-stone-200 rounded-full h-2 overflow-hidden mt-4">
                  <div
                    className="h-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : error ? (
              <div className="py-8 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <p className="text-sm text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => {
                    setShowUpload(false)
                    setSelectedType(null)
                  }}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded hover:bg-stone-200"
                >
                  Close
                </button>
              </div>
            ) : null}

            {canTrackDocumentExpiry && !uploading && !error && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">
                  Expiry Date (optional)
                </label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2 text-sm"
                  // Would need to wire this up to the upload
                />
              </div>
            )}

            {!uploading && !error && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowUpload(false)
                    setSelectedType(null)
                  }}
                  className="flex-1 px-4 py-2 border rounded text-sm hover:bg-stone-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document list */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading documents...
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No documents uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map(doc => (
            <DocumentRow
              key={doc.id}
              document={doc}
              canShare={features.canShareDocuments}
              canTrackDocumentExpiry={canTrackDocumentExpiry}
              onDelete={() => handleDelete(doc.id)}
              onShare={() => handleShare(doc)}
            />
          ))}
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
  canShare: boolean
  canTrackDocumentExpiry: boolean
  onDelete: () => void
  onShare: () => void
}

function DocumentRow({
  document,
  canShare,
  canTrackDocumentExpiry,
  onDelete,
  onShare,
}: DocumentRowProps) {
  const isExpired = document.expiryDate && new Date(document.expiryDate) < new Date()
  const isExpiringSoon = document.expiryDate && !isExpired && (() => {
    const daysUntil = Math.ceil(
      (new Date(document.expiryDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    return daysUntil <= 30
  })()

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 border rounded-lg',
      isExpired && 'border-red-200 bg-red-50',
      isExpiringSoon && !isExpired && 'border-amber-200 bg-amber-50'
    )}>
      <div className="p-2 bg-muted rounded">
        <FileText className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{document.name}</p>
          {isExpired && (
            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">
              Expired
            </span>
          )}
          {isExpiringSoon && (
            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
              Expiring soon
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{getDocumentTypeDisplayName(document.type)}</span>
          <span>•</span>
          <span>{formatBytes(document.size)}</span>
          {canTrackDocumentExpiry && document.expiryDate && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(document.expiryDate).toLocaleDateString()}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <a
          href={document.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
          title="View"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
        <a
          href={document.url}
          download={document.name}
          className="p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
          title="Download"
        >
          <Download className="w-4 h-4" />
        </a>
        {canShare && (
          <button
            onClick={onShare}
            className="p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onDelete}
          className="p-2 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
