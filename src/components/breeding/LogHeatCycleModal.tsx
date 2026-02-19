'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

interface LogHeatCycleModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: HeatCycleFormData) => Promise<void>;
  mares: { id: string; barnName: string }[];
  preselectedMareId?: string;
  editCycle?: {
    id: string;
    horseId: string;
    startDate: string;
    endDate?: string | null;
    intensity?: string | null;
    signs?: string[];
    notes?: string | null;
  } | null;
}

interface HeatCycleFormData {
  horseId: string;
  startDate: string;
  endDate: string;
  intensity: string;
  signs: string[];
  notes: string;
}

const HEAT_SIGNS = [
  { id: 'winking', label: 'Winking' },
  { id: 'squatting', label: 'Squatting' },
  { id: 'tail_raising', label: 'Tail Raising' },
  { id: 'frequent_urination', label: 'Frequent Urination' },
  { id: 'receptive_to_stallion', label: 'Receptive to Stallion' },
  { id: 'swollen_vulva', label: 'Swollen Vulva' },
  { id: 'mucus_discharge', label: 'Mucus Discharge' },
  { id: 'restlessness', label: 'Restlessness' },
];

export function LogHeatCycleModal({ open, onClose, onSubmit, mares, preselectedMareId, editCycle }: LogHeatCycleModalProps) {
  const [form, setForm] = useState<HeatCycleFormData>({
    horseId: preselectedMareId || '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    intensity: 'MODERATE',
    signs: [],
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editCycle) {
      setForm({
        horseId: editCycle.horseId,
        startDate: editCycle.startDate.split('T')[0],
        endDate: editCycle.endDate ? editCycle.endDate.split('T')[0] : '',
        intensity: editCycle.intensity || 'MODERATE',
        signs: editCycle.signs || [],
        notes: editCycle.notes || '',
      });
    } else {
      setForm({
        horseId: preselectedMareId || '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        intensity: 'MODERATE',
        signs: [],
        notes: '',
      });
    }
  }, [editCycle, preselectedMareId]);

  if (!open) return null;

  const toggleSign = (sign: string) => {
    setForm(f => ({
      ...f,
      signs: f.signs.includes(sign)
        ? f.signs.filter(s => s !== sign)
        : [...f.signs, sign],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.horseId || !form.startDate) return;
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
          <h2 className="text-lg font-semibold text-foreground">{editCycle ? 'Edit Heat Cycle' : 'Log Heat Cycle'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {!preselectedMareId && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Mare *</label>
              <select
                value={form.horseId}
                onChange={e => setForm(f => ({ ...f, horseId: e.target.value }))}
                className="input w-full"
                required
                disabled={!!editCycle}
              >
                <option value="">Select a mare</option>
                {mares.map(m => (
                  <option key={m.id} value={m.id}>{m.barnName}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Start Date *</label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Intensity</label>
            <div className="flex gap-2">
              {['MILD', 'MODERATE', 'STRONG'].map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, intensity: level }))}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    form.intensity === level
                      ? level === 'MILD' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400 ring-2 ring-pink-400'
                        : level === 'MODERATE' ? 'bg-pink-200 text-pink-900 dark:bg-pink-900/40 dark:text-pink-300 ring-2 ring-pink-500'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 ring-2 ring-red-500'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {level.charAt(0) + level.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Signs Observed</label>
            <div className="flex flex-wrap gap-2">
              {HEAT_SIGNS.map(sign => (
                <button
                  key={sign.id}
                  type="button"
                  onClick={() => toggleSign(sign.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    form.signs.includes(sign.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {sign.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="input w-full"
              rows={2}
              placeholder="Additional observations..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary btn-md flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving || !form.horseId} className="btn-primary btn-md flex-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editCycle ? 'Save Changes' : 'Log Cycle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
