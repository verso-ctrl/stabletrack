'use client';

import { useState } from 'react';
import { X, Loader2, Plus } from 'lucide-react';

interface RecordBreedingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BreedingFormData) => Promise<void>;
  mares: { id: string; barnName: string }[];
  stallions: { id: string; barnName: string }[];
  externalStallions: { id: string; name: string; studFarm: string | null }[];
  onAddExternalStallion?: () => void;
  preselectedMareId?: string;
}

interface BreedingFormData {
  mareId: string;
  stallionId: string;
  externalStallionId: string;
  breedingDate: string;
  breedingType: string;
  veterinarian: string;
  facility: string;
  cost: string;
  notes: string;
}

const BREEDING_TYPES = [
  { value: 'NATURAL', label: 'Natural Cover' },
  { value: 'AI_FRESH', label: 'AI (Fresh Semen)' },
  { value: 'AI_COOLED', label: 'AI (Cooled Semen)' },
  { value: 'AI_FROZEN', label: 'AI (Frozen Semen)' },
  { value: 'EMBRYO_TRANSFER', label: 'Embryo Transfer' },
];

export function RecordBreedingModal({
  open, onClose, onSubmit, mares, stallions, externalStallions, onAddExternalStallion, preselectedMareId
}: RecordBreedingModalProps) {
  const [form, setForm] = useState<BreedingFormData>({
    mareId: preselectedMareId || '',
    stallionId: '',
    externalStallionId: '',
    breedingDate: new Date().toISOString().split('T')[0],
    breedingType: 'NATURAL',
    veterinarian: '',
    facility: '',
    cost: '',
    notes: '',
  });
  const [stallionSource, setStallionSource] = useState<'internal' | 'external'>('internal');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mareId || !form.breedingDate || !form.breedingType) return;
    if (stallionSource === 'internal' && !form.stallionId) return;
    if (stallionSource === 'external' && !form.externalStallionId) return;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Record Breeding</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {!preselectedMareId && (
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
          )}

          {/* Stallion Source Toggle */}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Breeding Date *</label>
              <input
                type="date"
                value={form.breedingDate}
                onChange={e => setForm(f => ({ ...f, breedingDate: e.target.value }))}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Type *</label>
              <select
                value={form.breedingType}
                onChange={e => setForm(f => ({ ...f, breedingType: e.target.value }))}
                className="input w-full"
                required
              >
                {BREEDING_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

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
              <label className="block text-sm font-medium text-foreground mb-1">Cost ($)</label>
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
            <button type="submit" disabled={saving} className="btn-primary btn-md flex-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Record Breeding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
