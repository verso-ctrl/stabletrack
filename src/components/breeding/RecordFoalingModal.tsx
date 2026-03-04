'use client';

import { useState, useEffect } from 'react';
import { formatLocalDate } from '@/lib/utils';
import { X, Loader2 } from 'lucide-react';

interface RecordFoalingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FoalingFormData) => Promise<void>;
  breedingRecords: {
    id: string;
    mareId: string;
    mare?: { barnName: string };
    stallion?: { barnName: string } | null;
    externalStallion?: { name: string } | null;
    estimatedDueDate?: string | Date | null;
  }[];
  preselectedRecordId?: string;
  editFoaling?: {
    id: string;
    breedingRecordId?: string;
    actualDate: string;
    foalSex?: string | null;
    foalColor?: string | null;
    foalName?: string | null;
    birthWeight?: number | null;
    outcome: string;
    complications?: string | null;
    veterinarian?: string | null;
    notes?: string | null;
  } | null;
}

interface FoalingFormData {
  breedingRecordId: string;
  actualDate: string;
  foalSex: string;
  foalColor: string;
  foalName: string;
  outcome: string;
  complications: string;
  veterinarian: string;
  notes: string;
}

export function RecordFoalingModal({ open, onClose, onSubmit, breedingRecords, preselectedRecordId, editFoaling }: RecordFoalingModalProps) {
  const [form, setForm] = useState<FoalingFormData>({
    breedingRecordId: preselectedRecordId || '',
    actualDate: new Date().toISOString().split('T')[0],
    foalSex: '',
    foalColor: '',
    foalName: '',
    outcome: 'LIVE',
    complications: '',
    veterinarian: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editFoaling) {
      setForm({
        breedingRecordId: editFoaling.breedingRecordId || '',
        actualDate: editFoaling.actualDate.split('T')[0],
        foalSex: editFoaling.foalSex || '',
        foalColor: editFoaling.foalColor || '',
        foalName: editFoaling.foalName || '',
        outcome: editFoaling.outcome || 'LIVE',
        complications: editFoaling.complications || '',
        veterinarian: editFoaling.veterinarian || '',
        notes: editFoaling.notes || '',
      });
    } else {
      setForm({
        breedingRecordId: preselectedRecordId || '',
        actualDate: new Date().toISOString().split('T')[0],
        foalSex: '',
        foalColor: '',
        foalName: '',
        outcome: 'LIVE',
        complications: '',
        veterinarian: '',
        notes: '',
      });
    }
  }, [editFoaling, preselectedRecordId]);

  if (!open) return null;

  const selectedRecord = breedingRecords.find(r => r.id === form.breedingRecordId);
  const stallionName = selectedRecord?.stallion?.barnName || selectedRecord?.externalStallion?.name || 'Unknown';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.breedingRecordId || !form.actualDate) return;
    setSaving(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{editFoaling ? 'Edit Foaling Record' : 'Record Foaling'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Breeding Record *</label>
            <select
              value={form.breedingRecordId}
              onChange={e => setForm(f => ({ ...f, breedingRecordId: e.target.value }))}
              className="input w-full"
              required
              disabled={!!editFoaling || !!preselectedRecordId}
            >
              <option value="">Select breeding record</option>
              {breedingRecords.map(r => (
                <option key={r.id} value={r.id}>
                  {r.mare?.barnName} x {r.stallion?.barnName || r.externalStallion?.name || 'Unknown'}
                  {r.estimatedDueDate ? ` (due ${formatLocalDate(r.estimatedDueDate)})` : ''}
                </option>
              ))}
            </select>
            {selectedRecord && (
              <p className="text-xs text-muted-foreground mt-1">
                {selectedRecord.mare?.barnName} x {stallionName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Outcome *</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'LIVE', label: 'Live Birth', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
                { value: 'STILLBORN', label: 'Loss at Birth', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' },
                { value: 'DYSTOCIA', label: 'Difficult Birth', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
                { value: 'ABORTION', label: 'Pregnancy Loss', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' },
              ].map(o => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, outcome: o.value }))}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    form.outcome === o.value ? `${o.color} ring-2 ring-current` : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Birth Date *</label>
            <input
              type="date"
              value={form.actualDate}
              onChange={e => setForm(f => ({ ...f, actualDate: e.target.value }))}
              className="input w-full"
              required
            />
          </div>

          {form.outcome === 'LIVE' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Foal Name</label>
                  <input
                    type="text"
                    value={form.foalName}
                    onChange={e => setForm(f => ({ ...f, foalName: e.target.value }))}
                    className="input w-full"
                    placeholder="Barn name for foal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Sex</label>
                  <select
                    value={form.foalSex}
                    onChange={e => setForm(f => ({ ...f, foalSex: e.target.value }))}
                    className="input w-full"
                  >
                    <option value="">Unknown</option>
                    <option value="COLT">Colt</option>
                    <option value="FILLY">Filly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Color</label>
                <input
                  type="text"
                  value={form.foalColor}
                  onChange={e => setForm(f => ({ ...f, foalColor: e.target.value }))}
                  className="input w-full"
                  placeholder="e.g. Bay, Chestnut"
                />
              </div>
            </>
          )}

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
            <label className="block text-sm font-medium text-foreground mb-1">Complications</label>
            <textarea
              value={form.complications}
              onChange={e => setForm(f => ({ ...f, complications: e.target.value }))}
              className="input w-full"
              rows={2}
              placeholder="Any complications during foaling..."
            />
          </div>

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
            <button type="submit" disabled={saving || !form.breedingRecordId} className="btn-primary btn-md flex-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editFoaling ? 'Save Changes' : 'Record Foaling'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
