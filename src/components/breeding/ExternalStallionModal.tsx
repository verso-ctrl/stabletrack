'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

export interface ExternalStallionFormData {
  name: string;
  registrationNumber: string;
  breed: string;
  color: string;
  studFarm: string;
  studFarmLocation: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  fee: string;
  notes: string;
}

interface ExternalStallionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ExternalStallionFormData) => Promise<void>;
  editStallion?: {
    id: string;
    name: string;
    registrationNumber?: string | null;
    breed?: string | null;
    color?: string | null;
    studFarm?: string | null;
    studFarmLocation?: string | null;
    contactName?: string | null;
    contactPhone?: string | null;
    contactEmail?: string | null;
    fee?: number | null;
    notes?: string | null;
  } | null;
}

const EMPTY_FORM: ExternalStallionFormData = {
  name: '',
  registrationNumber: '',
  breed: '',
  color: '',
  studFarm: '',
  studFarmLocation: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  fee: '',
  notes: '',
};

export function ExternalStallionModal({ open, onClose, onSubmit, editStallion }: ExternalStallionModalProps) {
  const [form, setForm] = useState<ExternalStallionFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editStallion?.id) {
      setForm({
        name: editStallion.name || '',
        registrationNumber: editStallion.registrationNumber || '',
        breed: editStallion.breed || '',
        color: editStallion.color || '',
        studFarm: editStallion.studFarm || '',
        studFarmLocation: editStallion.studFarmLocation || '',
        contactName: editStallion.contactName || '',
        contactPhone: editStallion.contactPhone || '',
        contactEmail: editStallion.contactEmail || '',
        fee: editStallion.fee != null ? String(editStallion.fee) : '',
        notes: editStallion.notes || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editStallion?.id]);

  if (!open) return null;

  const isEditing = !!editStallion;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
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
          <h2 className="text-lg font-semibold text-foreground">
            {isEditing ? 'Edit External Stallion' : 'Add External Stallion'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input w-full"
              required
              placeholder="Stallion name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Registration Number</label>
            <input
              type="text"
              value={form.registrationNumber}
              onChange={e => setForm(f => ({ ...f, registrationNumber: e.target.value }))}
              className="input w-full"
              placeholder="e.g. AQHA 12345678"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Breed</label>
              <input
                type="text"
                value={form.breed}
                onChange={e => setForm(f => ({ ...f, breed: e.target.value }))}
                className="input w-full"
                placeholder="e.g. Quarter Horse"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Color</label>
              <input
                type="text"
                value={form.color}
                onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                className="input w-full"
                placeholder="e.g. Bay"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Stud Farm</label>
              <input
                type="text"
                value={form.studFarm}
                onChange={e => setForm(f => ({ ...f, studFarm: e.target.value }))}
                className="input w-full"
                placeholder="Farm name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Location</label>
              <input
                type="text"
                value={form.studFarmLocation}
                onChange={e => setForm(f => ({ ...f, studFarmLocation: e.target.value }))}
                className="input w-full"
                placeholder="City, State"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Contact Name</label>
            <input
              type="text"
              value={form.contactName}
              onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))}
              className="input w-full"
              placeholder="Farm contact person"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Contact Phone</label>
              <input
                type="tel"
                value={form.contactPhone}
                onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
                className="input w-full"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Contact Email</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                className="input w-full"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Stud Fee ($)</label>
            <input
              type="number"
              step="0.01"
              value={form.fee}
              onChange={e => setForm(f => ({ ...f, fee: e.target.value }))}
              className="input w-full"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="input w-full"
              rows={2}
              placeholder="Additional notes about this stallion..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary btn-md flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving || !form.name.trim()} className="btn-primary btn-md flex-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? 'Save Changes' : 'Add Stallion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
