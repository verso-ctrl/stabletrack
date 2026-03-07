'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { csrfFetch } from '@/lib/fetch';
import { useBarn } from '@/contexts/BarnContext';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatBytes } from '@/lib/tiers';
import {
  StickyNote,
  FileText,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Upload,
  Download,
  ExternalLink,
  Tag,
  X,
  Filter,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BarnNote {
  id: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  authorName: string;
}

interface BarnDoc {
  id: string;
  title: string;
  type: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  notes: string | null;
  uploadedAt: string;
}

const TAG_SUGGESTIONS = [
  'Insurance', 'Contract', 'Invoice', 'Permit', 'Certificate',
  'Inspection', 'Lease', 'Policy', 'Receipt', 'Other',
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BarnNotesPage() {
  const { currentBarn } = useBarn();
  const barnId = currentBarn?.id;

  // Notes state
  const [notes, setNotes] = useState<BarnNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [editNoteContent, setEditNoteContent] = useState('');
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

  // Documents state
  const [docs, setDocs] = useState<BarnDoc[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', notes: '', tag: '', file: null as File | null });
  const [editDocId, setEditDocId] = useState<string | null>(null);
  const [editDocForm, setEditDocForm] = useState({ title: '', notes: '', tag: '' });
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchNotes = useCallback(async () => {
    if (!barnId) return;
    try {
      const res = await fetch(`/api/barns/${barnId}/barn-notes`);
      if (res.ok) setNotes((await res.json()).data || []);
    } catch { /* silent */ } finally { setNotesLoading(false); }
  }, [barnId]);

  const fetchDocs = useCallback(async () => {
    if (!barnId) return;
    try {
      const res = await fetch(`/api/barns/${barnId}/barn-documents`);
      if (res.ok) setDocs((await res.json()).data || []);
    } catch { /* silent */ } finally { setDocsLoading(false); }
  }, [barnId]);

  useEffect(() => { fetchNotes(); fetchDocs(); }, [fetchNotes, fetchDocs]);

  // ── Note handlers ──────────────────────────────────────────────────────────

  const handleAddNote = async () => {
    if (!barnId || !newNoteContent.trim()) return;
    setSavingNote(true);
    try {
      const res = await csrfFetch(`/api/barns/${barnId}/barn-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNoteContent.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(prev => [data.data, ...prev]);
        setNewNoteContent('');
        setShowAddNote(false);
        toast.success('Note saved');
      }
    } catch { toast.error('Failed to save note'); }
    finally { setSavingNote(false); }
  };

  const handleEditNote = async (id: string) => {
    if (!barnId || !editNoteContent.trim()) return;
    try {
      const res = await csrfFetch(`/api/barns/${barnId}/barn-notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editNoteContent.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(prev => prev.map(n => n.id === id ? data.data : n));
        setEditNoteId(null);
        toast.success('Note updated');
      }
    } catch { toast.error('Failed to update note'); }
  };

  const handleDeleteNote = async () => {
    if (!barnId || !deleteNoteId) return;
    const id = deleteNoteId;
    setDeleteNoteId(null);
    try {
      await csrfFetch(`/api/barns/${barnId}/barn-notes/${id}`, { method: 'DELETE' });
      setNotes(prev => prev.filter(n => n.id !== id));
      toast.success('Note deleted');
    } catch { toast.error('Failed to delete note'); }
  };

  // ── Document handlers ──────────────────────────────────────────────────────

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { toast.warning('File too large', 'Max 25MB'); return; }
    setUploadForm(prev => ({ ...prev, file, title: prev.title || file.name.replace(/\.[^/.]+$/, '') }));
    setShowUploadModal(true);
  };

  const handleUpload = async () => {
    if (!barnId || !uploadForm.file || !uploadForm.title.trim()) {
      toast.warning('Missing fields', 'Please select a file and enter a name');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', uploadForm.file);
      fd.append('title', uploadForm.title.trim());
      fd.append('tag', uploadForm.tag.trim() || 'Other');
      if (uploadForm.notes.trim()) fd.append('notes', uploadForm.notes.trim());

      const res = await csrfFetch(`/api/barns/${barnId}/barn-documents`, { method: 'POST', body: fd });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Upload failed');

      await fetchDocs();
      setShowUploadModal(false);
      setUploadForm({ title: '', notes: '', tag: '', file: null });
      toast.success('Document uploaded');
    } catch (err) {
      toast.error('Upload failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleEditDocSave = async () => {
    if (!barnId || !editDocId) return;
    try {
      const res = await csrfFetch(`/api/barns/${barnId}/barn-documents/${editDocId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editDocForm.title, type: editDocForm.tag, notes: editDocForm.notes || null }),
      });
      if (res.ok) {
        await fetchDocs();
        setEditDocId(null);
        toast.success('Document updated');
      }
    } catch { toast.error('Failed to update document'); }
  };

  const handleDeleteDoc = async () => {
    if (!barnId || !deleteDocId) return;
    const id = deleteDocId;
    setDeleteDocId(null);
    try {
      await csrfFetch(`/api/barns/${barnId}/barn-documents/${id}`, { method: 'DELETE' });
      setDocs(prev => prev.filter(d => d.id !== id));
      toast.success('Document deleted');
    } catch { toast.error('Failed to delete document'); }
  };

  const allTags = Array.from(new Set(docs.map(d => d.type).filter(Boolean)));
  const filteredDocs = filterTag ? docs.filter(d => d.type === filterTag) : docs;

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!barnId) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <p>Select a barn to view notes and documents.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Barn Notes & Documents</h1>
        <p className="text-muted-foreground mt-1">
          Notes and files for {currentBarn?.name || 'your barn'} — not tied to any specific horse.
        </p>
      </div>

      {/* ── Notes ─────────────────────────────────────────────────────────── */}
      <section className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-foreground">Notes</h2>
            <span className="text-sm text-muted-foreground">({notes.length})</span>
          </div>
          {!showAddNote && (
            <button
              onClick={() => setShowAddNote(true)}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Add note
            </button>
          )}
        </div>

        {showAddNote && (
          <div className="p-3 border border-border rounded-lg bg-muted/20 space-y-2">
            <textarea
              autoFocus
              value={newNoteContent}
              onChange={e => setNewNoteContent(e.target.value)}
              placeholder="Write a barn-wide note..."
              rows={4}
              className="input w-full resize-none text-sm"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowAddNote(false); setNewNoteContent(''); }}
                className="btn-secondary btn-sm"
                disabled={savingNote}
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                className="btn-primary btn-sm flex items-center gap-1.5"
                disabled={savingNote || !newNoteContent.trim()}
              >
                {savingNote && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        )}

        {notesLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : notes.length === 0 && !showAddNote ? (
          <p className="text-sm text-muted-foreground py-2">No notes yet. Add one above.</p>
        ) : (
          <div className="space-y-2">
            {notes.map(note => (
              <div key={note.id} className="p-4 border border-border rounded-xl bg-background">
                {editNoteId === note.id ? (
                  <div className="space-y-2">
                    <textarea
                      autoFocus
                      value={editNoteContent}
                      onChange={e => setEditNoteContent(e.target.value)}
                      rows={4}
                      className="input w-full resize-none text-sm"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditNoteId(null)} className="btn-secondary btn-sm">Cancel</button>
                      <button
                        onClick={() => handleEditNote(note.id)}
                        className="btn-primary btn-sm"
                        disabled={!editNoteContent.trim()}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <p className="flex-1 text-sm text-foreground whitespace-pre-wrap leading-relaxed">{note.content}</p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => { setEditNoteId(note.id); setEditNoteContent(note.content); }}
                        className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteNoteId(note.id)}
                        className="p-1.5 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                  <span>{note.authorName}</span>
                  <span>·</span>
                  <span>{new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  {note.updatedAt !== note.createdAt && <span className="italic">· edited</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        <ConfirmDialog
          open={!!deleteNoteId}
          onConfirm={handleDeleteNote}
          onCancel={() => setDeleteNoteId(null)}
          title="Delete note?"
          description="This note will be permanently removed."
          variant="danger"
          confirmLabel="Delete"
        />
      </section>

      {/* ── Documents ─────────────────────────────────────────────────────── */}
      <section className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-foreground">Documents</h2>
            <span className="text-sm text-muted-foreground">({docs.length})</span>
          </div>
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
        </div>

        {allTags.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <button
              onClick={() => setFilterTag(null)}
              className={cn('px-2.5 py-1 text-xs rounded-full border transition-colors', !filterTag ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted')}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                className={cn('px-2.5 py-1 text-xs rounded-full border transition-colors', filterTag === tag ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted')}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {docsLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">{filterTag ? `No documents tagged "${filterTag}"` : 'No barn documents yet.'}</p>
            {!filterTag && (
              <button onClick={() => fileInputRef.current?.click()} className="mt-2 text-sm text-primary hover:underline">
                Upload your first document
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDocs.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="p-2 bg-muted rounded flex-shrink-0">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.title || doc.fileName}</p>
                  {doc.notes && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{doc.notes}</p>}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    {doc.type && doc.type !== 'Other' && (
                      <>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                          <Tag className="w-2.5 h-2.5" />{doc.type}
                        </span>
                        <span>·</span>
                      </>
                    )}
                    {doc.fileSize != null && <span>{formatBytes(doc.fileSize)}</span>}
                    {doc.uploadedAt && <><span>·</span><span>{new Date(doc.uploadedAt).toLocaleDateString()}</span></>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                    title="View"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href={doc.fileUrl}
                    download={doc.fileName}
                    className="p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => { setEditDocId(doc.id); setEditDocForm({ title: doc.title, notes: doc.notes || '', tag: doc.type === 'Other' ? '' : doc.type }); }}
                    className="p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteDocId(doc.id)}
                    className="p-2 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <ConfirmDialog
          open={!!deleteDocId}
          onConfirm={handleDeleteDoc}
          onCancel={() => setDeleteDocId(null)}
          title="Delete document?"
          description="This document will be permanently removed."
          variant="danger"
          confirmLabel="Delete"
        />
      </section>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload Document</h3>
              <button onClick={() => { setShowUploadModal(false); setUploadForm({ title: '', notes: '', tag: '', file: null }); }} className="p-1 rounded hover:bg-accent">
                <X className="w-5 h-5" />
              </button>
            </div>
            {uploadForm.file && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg mb-4">
                <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadForm.file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(uploadForm.file.size)}</p>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Document Name *</label>
                <input type="text" value={uploadForm.title} onChange={e => setUploadForm(p => ({ ...p, title: e.target.value }))} className="input w-full" placeholder="e.g. Farm Insurance Policy" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Description <span className="text-xs font-normal">(optional)</span></label>
                <textarea value={uploadForm.notes} onChange={e => setUploadForm(p => ({ ...p, notes: e.target.value }))} className="input w-full resize-none" rows={2} placeholder="Add any notes..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Tag <span className="text-xs font-normal">(optional)</span></label>
                <input type="text" value={uploadForm.tag} onChange={e => setUploadForm(p => ({ ...p, tag: e.target.value }))} className="input w-full" placeholder="e.g. Insurance, Contract..." />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {TAG_SUGGESTIONS.map(tag => (
                    <button key={tag} type="button" onClick={() => setUploadForm(p => ({ ...p, tag: p.tag === tag ? '' : tag }))}
                      className={cn('px-2 py-0.5 text-xs rounded-full border transition-colors', uploadForm.tag === tag ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted')}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowUploadModal(false); setUploadForm({ title: '', notes: '', tag: '', file: null }); }} className="btn-secondary flex-1" disabled={uploading}>Cancel</button>
              <button onClick={handleUpload} className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={uploading || !uploadForm.file || !uploadForm.title.trim()}>
                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4" />Upload</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Doc Modal */}
      {editDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Document</h3>
              <button onClick={() => setEditDocId(null)} className="p-1 rounded hover:bg-accent"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Document Name</label>
                <input type="text" value={editDocForm.title} onChange={e => setEditDocForm(p => ({ ...p, title: e.target.value }))} className="input w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                <textarea value={editDocForm.notes} onChange={e => setEditDocForm(p => ({ ...p, notes: e.target.value }))} className="input w-full resize-none" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Tag</label>
                <input type="text" value={editDocForm.tag} onChange={e => setEditDocForm(p => ({ ...p, tag: e.target.value }))} className="input w-full" />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {TAG_SUGGESTIONS.map(tag => (
                    <button key={tag} type="button" onClick={() => setEditDocForm(p => ({ ...p, tag: p.tag === tag ? '' : tag }))}
                      className={cn('px-2 py-0.5 text-xs rounded-full border transition-colors', editDocForm.tag === tag ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted')}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditDocId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleEditDocSave} className="btn-primary flex-1" disabled={!editDocForm.title.trim()}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
