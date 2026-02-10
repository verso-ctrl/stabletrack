'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBarn } from '@/contexts/BarnContext';
import { useHorses } from '@/hooks/useData';
import { toast } from '@/lib/toast';
import {
  FileText,
  Upload,
  Search,
  FolderOpen,
  File,
  Download,
  Trash2,
  Plus,
  Calendar,
  Loader2,
  X,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface Document {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  type: string;
  uploadedAt: string;
  expiryDate: string | null;
  horse?: { id: string; barnName: string };
}

const documentTypes = [
  { id: 'REGISTRATION', name: 'Registration' },
  { id: 'COGGINS', name: 'Coggins' },
  { id: 'HEALTH_CERTIFICATE', name: 'Health Certificate' },
  { id: 'INSURANCE', name: 'Insurance' },
  { id: 'PURCHASE_AGREEMENT', name: 'Purchase Agreement' },
  { id: 'LEASE', name: 'Lease' },
  { id: 'VET_RECORDS', name: 'Vet Records' },
  { id: 'OTHER', name: 'Other' },
];

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return 'Unknown';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return '🖼️';
  if (['pdf'].includes(ext || '')) return '📄';
  if (['doc', 'docx'].includes(ext || '')) return '📝';
  if (['xls', 'xlsx'].includes(ext || '')) return '📊';
  return '📎';
};

export default function DocumentsPage() {
  const { currentBarn, isMember } = useBarn();
  const canEdit = isMember && currentBarn?.role !== 'CLIENT';
  const { horses } = useHorses();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: 'OTHER',
    horseId: '',
    expiryDate: '',
    file: null as File | null,
  });

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!currentBarn) return;
      
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (typeFilter) params.append('type', typeFilter);
        
        const response = await fetch(`/api/barns/${currentBarn.id}/documents?${params}`);
        if (response.ok) {
          const result = await response.json();
          setDocuments(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, [currentBarn, searchQuery, typeFilter]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast.warning('File too large', 'File must be less than 10MB');
      return;
    }
    
    setUploadForm(prev => ({
      ...prev,
      file,
      title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
    }));
  };

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.title || !uploadForm.horseId || !currentBarn) {
      toast.warning('Missing fields', 'Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(uploadForm.file!);
      });

      const response = await fetch(`/api/barns/${currentBarn.id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadForm.title,
          type: uploadForm.type,
          horseId: uploadForm.horseId,
          fileName: uploadForm.file.name,
          fileBase64: base64,
          expiryDate: uploadForm.expiryDate || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload');
      }

      const result = await response.json();
      setDocuments(prev => [result.data, ...prev]);
      setShowUploadModal(false);
      setUploadForm({ title: '', type: 'OTHER', horseId: '', expiryDate: '', file: null });
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error('Upload failed', error instanceof Error ? error.message : 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteClick = (docId: string) => {
    setDeleteDocId(docId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDocId) return;
    const docId = deleteDocId;
    setDeleteDocId(null);

    try {
      const response = await fetch(`/api/barns/${currentBarn?.id}/documents/${docId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
        toast.success('Document deleted');
      } else {
        toast.error('Delete failed', 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Delete failed', 'Failed to delete document');
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !typeFilter || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (!currentBarn) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a barn first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-1">{canEdit ? 'Store and manage important files' : 'View documents'}</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Upload Document
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input w-full sm:w-48"
        >
          <option value="">All Types</option>
          {documentTypes.map((type) => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
      </div>

      {/* Documents List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="card p-12 text-center">
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Documents Found
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || typeFilter ? 'Try adjusting your filters' : 'Upload your first document to get started'}
          </p>
          {!searchQuery && !typeFilter && canEdit && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary"
            >
              Upload Document
            </button>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-border">
            {filteredDocs.map((doc) => (
              <div key={doc.id} className="p-4 hover:bg-accent transition-all">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{getFileIcon(doc.fileName)}</div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{doc.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                      <span>{doc.fileName}</span>
                      <span>{formatFileSize(doc.fileSize)}</span>
                      {doc.horse && (
                        <span className="text-amber-600">{doc.horse.barnName}</span>
                      )}
                      {doc.expiryDate && (
                        <span className={`flex items-center gap-1 ${
                          new Date(doc.expiryDate) < new Date() ? 'text-red-600' : ''
                        }`}>
                          <Calendar className="w-3 h-3" />
                          Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-muted-foreground hover:text-muted-foreground hover:bg-accent transition-all"
                      title="View"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <a
                      href={doc.fileUrl}
                      download={doc.fileName}
                      className="p-2 rounded-lg text-muted-foreground hover:text-muted-foreground hover:bg-accent transition-all"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteClick(doc.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded hover:bg-accent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* File Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                uploadForm.file ? 'border-green-300 bg-green-50' : 'border-border hover:border-amber-400'
              }`}
            >
              {uploadForm.file ? (
                <>
                  <div className="text-4xl mb-2">{getFileIcon(uploadForm.file.name)}</div>
                  <p className="text-foreground font-medium">{uploadForm.file.name}</p>
                  <p className="text-sm text-muted-foreground">{formatFileSize(uploadForm.file.size)}</p>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">Click to select a file</p>
                  <p className="text-sm text-muted-foreground mt-1">PDF, DOC, XLS, JPG up to 10MB</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
              />
            </div>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  className="input w-full"
                  placeholder="Enter document title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Horse *
                </label>
                <select
                  value={uploadForm.horseId}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, horseId: e.target.value }))}
                  className="input w-full"
                >
                  <option value="">Select horse</option>
                  {horses.map((horse) => (
                    <option key={horse.id} value={horse.id}>{horse.barnName}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Type
                </label>
                <select
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, type: e.target.value }))}
                  className="input w-full"
                >
                  {documentTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Expiry Date (optional)
                </label>
                <input
                  type="date"
                  value={uploadForm.expiryDate}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="input w-full"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="btn-secondary flex-1"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                disabled={isUploading || !uploadForm.file}
              >
                {isUploading ? (
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
    </div>
  );
}
