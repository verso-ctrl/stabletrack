'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBarn } from '@/contexts/BarnContext';
import { useHorses } from '@/hooks/useData';
import { toast } from '@/lib/toast';
import { formatBytes } from '@/lib/tiers';
import {
  FileText,
  Upload,
  Search,
  FolderOpen,
  Download,
  Trash2,
  Plus,
  Loader2,
  X,
  ExternalLink,
  Filter,
  Tag,
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
  horse?: { id: string; barnName: string };
}

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
];

export default function DocumentsPage() {
  const { currentBarn, isMember } = useBarn();
  const canEdit = isMember && currentBarn?.role !== 'CLIENT';
  const { horses } = useHorses();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    tag: '',
    horseId: '',
    file: null as File | null,
  });

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!currentBarn) return;

      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (tagFilter) params.append('type', tagFilter);

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
  }, [currentBarn, searchQuery, tagFilter]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.warning('File too large', 'File must be less than 25MB');
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
      toast.warning('Missing fields', 'Please select a file, enter a title, and choose a horse');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('barnId', currentBarn.id);
      formData.append('horseId', uploadForm.horseId);
      formData.append('type', 'document');
      formData.append('documentType', uploadForm.tag || 'Untagged');

      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload');
      }

      const result = await response.json();

      // Add to list (refetch to get full data with horse relation)
      const refetchRes = await fetch(`/api/barns/${currentBarn.id}/documents`);
      if (refetchRes.ok) {
        const refetchData = await refetchRes.json();
        setDocuments(refetchData.data || []);
      }

      setShowUploadModal(false);
      setUploadForm({ title: '', tag: '', horseId: '', file: null });
      toast.success('Document uploaded', uploadForm.file.name);
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

  // Get unique tags
  const allTags = Array.from(new Set(documents.map(d => d.type).filter(Boolean)));

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !tagFilter || doc.type === tagFilter;
    return matchesSearch && matchesTag;
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-10 w-full"
        />
      </div>

      {/* Tag filter */}
      {allTags.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <button
            onClick={() => setTagFilter('')}
            className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
              !tagFilter ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setTagFilter(tagFilter === tag ? '' : tag)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                tagFilter === tag ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

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
            {searchQuery || tagFilter ? 'Try adjusting your filters' : 'Upload your first document to get started'}
          </p>
          {!searchQuery && !tagFilter && canEdit && (
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
                  <div className="p-2 bg-muted rounded">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{doc.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1">
                      {doc.type && doc.type !== 'Untagged' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                          <Tag className="w-2.5 h-2.5" />
                          {doc.type}
                        </span>
                      )}
                      <span>{doc.fileName}</span>
                      {doc.fileSize != null && <span>{formatBytes(doc.fileSize)}</span>}
                      {doc.horse && (
                        <span className="text-amber-600">{doc.horse.barnName}</span>
                      )}
                      <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                      title="View"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <a
                      href={doc.fileUrl}
                      download={doc.fileName}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    {canEdit && (
                      <button
                        onClick={() => handleDeleteClick(doc.id)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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
                uploadForm.file ? 'border-green-300 bg-green-50 dark:bg-green-950/20' : 'border-border hover:border-primary/50'
              }`}
            >
              {uploadForm.file ? (
                <>
                  <FileText className="w-10 h-10 text-green-600 mx-auto mb-2" />
                  <p className="text-foreground font-medium">{uploadForm.file.name}</p>
                  <p className="text-sm text-muted-foreground">{formatBytes(uploadForm.file.size)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Click to change file</p>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">Click to select a file</p>
                  <p className="text-sm text-muted-foreground mt-1">PDF, DOC, XLS, images, and more — up to 25MB</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.rtf,.jpg,.jpeg,.png,.gif,.heic,.heif,.webp,.tiff,.tif,.bmp"
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
                  Tag
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
                      onClick={() => setUploadForm(prev => ({ ...prev, tag }))}
                      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                        uploadForm.tag === tag
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
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
                disabled={isUploading || !uploadForm.file || !uploadForm.title || !uploadForm.horseId}
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
