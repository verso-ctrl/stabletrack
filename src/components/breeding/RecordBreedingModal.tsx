'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Plus, Trash2, FileText, UploadCloud } from 'lucide-react';

interface RecordBreedingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BreedingFormData) => Promise<void>;
  mares: { id: string; barnName: string }[];
  stallions: { id: string; barnName: string }[];
  externalStallions: { id: string; name: string; studFarm: string | null }[];
  onAddExternalStallion?: () => void;
  preselectedMareId?: string;
  editRecord?: EditableBreedingRecord | null;
  barnId?: string;
}

export interface EditableBreedingRecord {
  id: string;
  mareId: string;
  stallionId?: string | null;
  externalStallionId?: string | null;
  breedingDate: string;
  breedingType: string;
  estimatedDueDate?: string | null;
  veterinarian?: string | null;
  cost?: number | null;
  contractUrl?: string | null;
  notes?: string | null;
  pregnancyCheckDate?: string | null;
  pregnancyCheckResult?: string | null;
  pregnancyChecks?: Array<{ date: string; result: string }> | null;
  inUteroNominations?: Array<{ program: string; nominationDate: string; deadline: string; fee: string; notes: string }> | null;
  mare?: { barnName: string };
  stallion?: { barnName: string } | null;
  externalStallion?: { name: string } | null;
}

export interface BreedingFormData {
  mareId: string;
  stallionId: string;
  externalStallionId: string;
  breedingDate: string;
  breedingType: string;
  veterinarian: string;
  facility: string;
  cost: string;
  contractUrl: string;
  notes: string;
  estimatedDueDate: string;
  pregnancyChecks: Array<{ date: string; result: string }>;
  inUteroNominations: Array<{ program: string; nominationDate: string; deadline: string; fee: string; notes: string }>;
}

const BREEDING_TYPES = [
  { value: 'NATURAL', label: 'Natural Cover' },
  { value: 'AI_FRESH', label: 'AI (Fresh Semen)' },
  { value: 'AI_COOLED', label: 'AI (Cooled Semen)' },
  { value: 'AI_FROZEN', label: 'AI (Frozen Semen)' },
  { value: 'EMBRYO_TRANSFER', label: 'Embryo Transfer' },
];

const PREGNANCY_CHECK_RESULTS = [
  { value: '', label: 'Not checked yet' },
  { value: 'POSITIVE', label: 'Positive' },
  { value: 'NEGATIVE', label: 'Negative' },
  { value: 'INCONCLUSIVE', label: 'Inconclusive' },
];

function toDateInputValue(val: string | null | undefined): string {
  if (!val) return '';
  try {
    return new Date(val).toISOString().split('T')[0];
  } catch {
    return '';
  }
}

export function RecordBreedingModal({
  open, onClose, onSubmit, mares, stallions, externalStallions, onAddExternalStallion, preselectedMareId, editRecord, barnId
}: RecordBreedingModalProps) {
  const isEditing = !!editRecord;

  const [form, setForm] = useState<BreedingFormData>({
    mareId: preselectedMareId || '',
    stallionId: '',
    externalStallionId: '',
    breedingDate: new Date().toISOString().split('T')[0],
    breedingType: 'NATURAL',
    veterinarian: '',
    facility: '',
    cost: '',
    contractUrl: '',
    notes: '',
    estimatedDueDate: '',
    pregnancyChecks: [],
    inUteroNominations: [],
  });
  const [stallionSource, setStallionSource] = useState<'internal' | 'external'>('internal');
  const [saving, setSaving] = useState(false);
  const [uploadingContract, setUploadingContract] = useState(false);
  const [contractFileName, setContractFileName] = useState('');

  // Pre-fill form when editRecord changes
  useEffect(() => {
    if (editRecord) {
      // Convert legacy single-check fields to array format if needed
      let checks: Array<{ date: string; result: string }> = [];
      if (editRecord.pregnancyChecks && editRecord.pregnancyChecks.length > 0) {
        checks = editRecord.pregnancyChecks;
      } else if (editRecord.pregnancyCheckDate) {
        checks = [{ date: toDateInputValue(editRecord.pregnancyCheckDate), result: editRecord.pregnancyCheckResult || '' }];
      }

      setForm({
        mareId: editRecord.mareId,
        stallionId: editRecord.stallionId || '',
        externalStallionId: editRecord.externalStallionId || '',
        breedingDate: toDateInputValue(editRecord.breedingDate),
        breedingType: editRecord.breedingType,
        veterinarian: editRecord.veterinarian || '',
        facility: '',
        cost: editRecord.cost != null ? String(editRecord.cost) : '',
        contractUrl: editRecord.contractUrl || '',
        notes: editRecord.notes || '',
        estimatedDueDate: toDateInputValue(editRecord.estimatedDueDate),
        pregnancyChecks: checks,
        inUteroNominations: editRecord.inUteroNominations || [],
      });
      setContractFileName(editRecord.contractUrl ? 'Uploaded contract' : '');
      setStallionSource(editRecord.externalStallionId ? 'external' : 'internal');
    } else {
      const today = new Date();
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + 340);
      setForm({
        mareId: preselectedMareId || '',
        stallionId: '',
        externalStallionId: '',
        breedingDate: today.toISOString().split('T')[0],
        breedingType: 'NATURAL',
        veterinarian: '',
        facility: '',
        cost: '',
        contractUrl: '',
        notes: '',
        estimatedDueDate: dueDate.toISOString().split('T')[0],
        pregnancyChecks: [],
        inUteroNominations: [],
      });
      setContractFileName('');
      setStallionSource('internal');
    }
  }, [editRecord, preselectedMareId]);

  if (!open) return null;

  const addPregnancyCheck = () => {
    setForm(f => ({
      ...f,
      pregnancyChecks: [...f.pregnancyChecks, { date: new Date().toISOString().split('T')[0], result: '' }],
    }));
  };

  const updatePregnancyCheck = (index: number, field: 'date' | 'result', value: string) => {
    setForm(f => ({
      ...f,
      pregnancyChecks: f.pregnancyChecks.map((c, i) => i === index ? { ...c, [field]: value } : c),
    }));
  };

  const removePregnancyCheck = (index: number) => {
    setForm(f => ({
      ...f,
      pregnancyChecks: f.pregnancyChecks.filter((_, i) => i !== index),
    }));
  };

  const addNomination = () => {
    setForm(f => ({
      ...f,
      inUteroNominations: [...f.inUteroNominations, { program: '', nominationDate: new Date().toISOString().split('T')[0], deadline: '', fee: '', notes: '' }],
    }));
  };

  const updateNomination = (index: number, field: keyof BreedingFormData['inUteroNominations'][0], value: string) => {
    setForm(f => ({
      ...f,
      inUteroNominations: f.inUteroNominations.map((n, i) => i === index ? { ...n, [field]: value } : n),
    }));
  };

  const removeNomination = (index: number) => {
    setForm(f => ({ ...f, inUteroNominations: f.inUteroNominations.filter((_, i) => i !== index) }));
  };

  const handleContractUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !barnId) return;

    // Use the mare's ID for the horseId (contract is tied to the mare)
    const mareId = form.mareId || editRecord?.mareId;
    if (!mareId) return;

    setUploadingContract(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('barnId', barnId);
      formData.append('horseId', mareId);
      formData.append('type', 'document');
      formData.append('documentType', 'other');
      formData.append('documentTitle', 'Breeding Contract');

      const res = await fetch('/api/storage/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Upload failed');
        return;
      }
      const data = await res.json();
      const url = data.url || data.document?.url || '';
      setForm(f => ({ ...f, contractUrl: url }));
      setContractFileName(file.name);
    } finally {
      setUploadingContract(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) {
      if (!form.mareId || !form.breedingDate || !form.breedingType) return;
      if (stallionSource === 'internal' && !form.stallionId) return;
      if (stallionSource === 'external' && !form.externalStallionId) return;
    }

    setSaving(true);
    try {
      await onSubmit({
        ...form,
        stallionId: stallionSource === 'internal' ? form.stallionId : '',
        externalStallionId: stallionSource === 'external' ? form.externalStallionId : '',
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  // Display names for read-only fields when editing
  const mareName = editRecord?.mare?.barnName || mares.find(m => m.id === form.mareId)?.barnName || '';
  const stallionName = editRecord?.stallion?.barnName || editRecord?.externalStallion?.name || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {isEditing ? 'Edit Breeding Record' : 'Record Breeding'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Mare - read-only when editing */}
          {isEditing ? (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Mare</label>
              <p className="input w-full bg-muted text-muted-foreground cursor-not-allowed py-2.5 px-3">{mareName}</p>
            </div>
          ) : !preselectedMareId ? (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Mare *</label>
              <select
                value={form.mareId}
                onChange={e => setForm(f => ({ ...f, mareId: e.target.value }))}
                className="input w-full"
                required
              >
                <option value="">Select a mare</option>
                {mares.map(m => (
                  <option key={m.id} value={m.id}>{m.barnName}</option>
                ))}
              </select>
            </div>
          ) : null}

          {/* Stallion - read-only when editing */}
          {isEditing ? (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Stallion</label>
              <p className="input w-full bg-muted text-muted-foreground cursor-not-allowed py-2.5 px-3">{stallionName}</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Stallion *</label>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => { setStallionSource('internal'); setForm(f => ({ ...f, externalStallionId: '' })); }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                    stallionSource === 'internal' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  Barn Stallion
                </button>
                <button
                  type="button"
                  onClick={() => { setStallionSource('external'); setForm(f => ({ ...f, stallionId: '' })); }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                    stallionSource === 'external' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  External Stud
                </button>
              </div>

              {stallionSource === 'internal' ? (
                <select
                  value={form.stallionId}
                  onChange={e => setForm(f => ({ ...f, stallionId: e.target.value }))}
                  className="input w-full"
                  required
                >
                  <option value="">Select a stallion</option>
                  {stallions.map(s => (
                    <option key={s.id} value={s.id}>{s.barnName}</option>
                  ))}
                </select>
              ) : (
                <div className="flex gap-2">
                  <select
                    value={form.externalStallionId}
                    onChange={e => setForm(f => ({ ...f, externalStallionId: e.target.value }))}
                    className="input flex-1"
                    required
                  >
                    <option value="">Select external stallion</option>
                    {externalStallions.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}{s.studFarm ? ` (${s.studFarm})` : ''}
                      </option>
                    ))}
                  </select>
                  {onAddExternalStallion && (
                    <button
                      type="button"
                      onClick={onAddExternalStallion}
                      className="btn-secondary btn-md flex-shrink-0"
                      title="Add new external stallion"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Breeding date & type - read-only when editing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Breeding Date {!isEditing && '*'}</label>
              <input
                type="date"
                value={form.breedingDate}
                onChange={e => {
                  const newDate = e.target.value;
                  setForm(f => {
                    const updates: Partial<BreedingFormData> = { breedingDate: newDate };
                    // Auto-calculate due date (340 days) if not manually set or if creating new
                    if (!isEditing && newDate) {
                      const due = new Date(newDate);
                      due.setDate(due.getDate() + 340);
                      updates.estimatedDueDate = due.toISOString().split('T')[0];
                    }
                    return { ...f, ...updates };
                  });
                }}
                className={`input w-full ${isEditing ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''}`}
                required={!isEditing}
                disabled={isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Type {!isEditing && '*'}</label>
              <select
                value={form.breedingType}
                onChange={e => setForm(f => ({ ...f, breedingType: e.target.value }))}
                className={`input w-full ${isEditing ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''}`}
                required={!isEditing}
                disabled={isEditing}
              >
                {BREEDING_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Estimated Due Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Estimated Due Date</label>
            <input
              type="date"
              value={form.estimatedDueDate}
              onChange={e => setForm(f => ({ ...f, estimatedDueDate: e.target.value }))}
              className="input w-full"
            />
            {form.breedingDate && (
              <p className="mt-1 text-xs text-muted-foreground">
                {form.estimatedDueDate
                  ? `${Math.round((new Date(form.estimatedDueDate).getTime() - new Date(form.breedingDate).getTime()) / (1000 * 60 * 60 * 24))} days from breeding date`
                  : 'Auto-calculated at ~340 days (11 months)'
                }
                {!isEditing && !form.estimatedDueDate && form.breedingDate && ' — will be set automatically'}
              </p>
            )}
          </div>

          {/* Pregnancy Checks - in edit mode */}
          {isEditing && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-foreground">Pregnancy Checks</label>
                <button
                  type="button"
                  onClick={addPregnancyCheck}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Plus className="w-3 h-3" /> Add Check
                </button>
              </div>
              {form.pregnancyChecks.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No checks recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {form.pregnancyChecks.map((check, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                      <input
                        type="date"
                        value={check.date}
                        onChange={e => updatePregnancyCheck(i, 'date', e.target.value)}
                        className="input w-full text-sm"
                      />
                      <select
                        value={check.result}
                        onChange={e => updatePregnancyCheck(i, 'result', e.target.value)}
                        className="input w-full text-sm"
                      >
                        {PREGNANCY_CHECK_RESULTS.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removePregnancyCheck(i)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        aria-label="Remove check"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Veterinarian</label>
              <input
                type="text"
                value={form.veterinarian}
                onChange={e => setForm(f => ({ ...f, veterinarian: e.target.value }))}
                className="input w-full"
                placeholder="Dr. Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Stud Fee ($)</label>
              <input
                type="number"
                value={form.cost}
                onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
                className="input w-full"
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          {/* Breeding Contract Upload */}
          {barnId && (form.mareId || editRecord?.mareId) && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Breeding Contract</label>
              {form.contractUrl ? (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted border border-border">
                  <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                  <a
                    href={form.contractUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex-1 truncate"
                  >
                    {contractFileName || 'View contract'}
                  </a>
                  <button
                    type="button"
                    onClick={() => { setForm(f => ({ ...f, contractUrl: '' })); setContractFileName(''); }}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className={`flex items-center gap-2 p-2 rounded-lg border border-dashed border-border cursor-pointer hover:bg-accent transition-colors ${uploadingContract ? 'opacity-50 pointer-events-none' : ''}`}>
                  {uploadingContract
                    ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    : <UploadCloud className="w-4 h-4 text-muted-foreground" />
                  }
                  <span className="text-sm text-muted-foreground">
                    {uploadingContract ? 'Uploading…' : 'Upload contract (PDF, Word)'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={handleContractUpload}
                    disabled={uploadingContract}
                  />
                </label>
              )}
            </div>
          )}

          {/* In-Utero Nominations */}
          {isEditing && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-foreground">In-Utero Nominations</label>
                <button
                  type="button"
                  onClick={addNomination}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Plus className="w-3 h-3" /> Add Nomination
                </button>
              </div>
              {form.inUteroNominations.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No nominations recorded. Use this to track futurity & stakes nominations for this foal.</p>
              ) : (
                <div className="space-y-3">
                  {form.inUteroNominations.map((nom, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={nom.program}
                          onChange={e => updateNomination(i, 'program', e.target.value)}
                          className="input flex-1 text-sm"
                          placeholder="Program / Registry name (e.g. AQHA Futurity)"
                        />
                        <button
                          type="button"
                          onClick={() => removeNomination(i)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex-shrink-0"
                          aria-label="Remove nomination"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] text-muted-foreground mb-0.5">Date Nominated</label>
                          <input
                            type="date"
                            value={nom.nominationDate}
                            onChange={e => updateNomination(i, 'nominationDate', e.target.value)}
                            className="input w-full text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-muted-foreground mb-0.5">Deadline</label>
                          <input
                            type="date"
                            value={nom.deadline}
                            onChange={e => updateNomination(i, 'deadline', e.target.value)}
                            className="input w-full text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-muted-foreground mb-0.5">Fee ($)</label>
                          <input
                            type="number"
                            value={nom.fee}
                            onChange={e => updateNomination(i, 'fee', e.target.value)}
                            className="input w-full text-sm"
                            placeholder="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <input
                        type="text"
                        value={nom.notes}
                        onChange={e => updateNomination(i, 'notes', e.target.value)}
                        className="input w-full text-sm"
                        placeholder="Notes (confirmation #, status, etc.)"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="input w-full"
              rows={2}
              placeholder="Additional details..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary btn-md flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving || uploadingContract} className="btn-primary btn-md flex-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? 'Save Changes' : 'Record Breeding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
