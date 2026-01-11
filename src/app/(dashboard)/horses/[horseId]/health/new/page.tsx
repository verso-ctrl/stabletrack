'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBarn } from '@/contexts/BarnContext';
import { useHorse } from '@/hooks/useData';
import {
  Stethoscope,
  ChevronLeft,
  Save,
  Loader2,
  Upload,
  Calendar,
  DollarSign,
  User,
  FileText,
} from 'lucide-react';

const recordTypes = [
  { id: 'EXAM', name: 'Physical Exam' },
  { id: 'LAMENESS', name: 'Lameness Exam' },
  { id: 'DENTAL', name: 'Dental' },
  { id: 'VACCINATION', name: 'Vaccination' },
  { id: 'COGGINS', name: 'Coggins Test' },
  { id: 'BLOODWORK', name: 'Bloodwork' },
  { id: 'IMAGING', name: 'X-Ray / Ultrasound' },
  { id: 'SURGERY', name: 'Surgery' },
  { id: 'EMERGENCY', name: 'Emergency' },
  { id: 'OTHER', name: 'Other' },
];

export default function AddHealthRecordPage({ params }: { params: Promise<{ horseId: string }> }) {
  const { horseId } = use(params);
  const router = useRouter();
  const { currentBarn } = useBarn();
  const { horse, isLoading: horseLoading } = useHorse(horseId);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    date: new Date().toISOString().split('T')[0],
    provider: '',
    diagnosis: '',
    treatment: '',
    findings: '',
    followUpDate: '',
    followUpNotes: '',
    cost: '',
    cogginsExpiry: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.date) {
      alert('Please fill in required fields');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const response = await fetch(
        `/api/barns/${currentBarn?.id}/horses/${horseId}/health`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: formData.type,
            date: new Date(formData.date).toISOString(),
            provider: formData.provider || null,
            diagnosis: formData.diagnosis || null,
            treatment: formData.treatment || null,
            findings: formData.findings || null,
            followUpDate: formData.followUpDate ? new Date(formData.followUpDate).toISOString() : null,
            followUpNotes: formData.followUpNotes || null,
            cost: formData.cost ? parseInt(formData.cost) : null,
            cogginsExpiry: formData.cogginsExpiry ? new Date(formData.cogginsExpiry).toISOString() : null,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create health record');
      }

      router.push(`/horses/${horseId}`);
    } catch (error) {
      console.error('Error creating health record:', error);
      alert(error instanceof Error ? error.message : 'Failed to create health record');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentBarn) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-stone-500">Please select a barn first</p>
      </div>
    );
  }

  if (horseLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!horse) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">Horse not found</p>
        <Link href="/horses" className="btn-primary">Back to Horses</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/horses/${horseId}`}
          className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Add Health Record</h1>
          <p className="text-stone-500 mt-1">for {horse.barnName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6">
          <h3 className="font-medium text-stone-900 mb-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-blue-500" />
            Record Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Record Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input w-full"
                required
              >
                <option value="">Select type</option>
                {recordTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Veterinarian / Provider
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="input pl-10 w-full"
                    placeholder="Dr. Smith"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Details */}
        <div className="card p-6">
          <h3 className="font-medium text-stone-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-stone-500" />
            Medical Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Diagnosis
              </label>
              <input
                type="text"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                className="input w-full"
                placeholder="e.g., Mild colic, resolved"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Treatment / Procedures
              </label>
              <textarea
                value={formData.treatment}
                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                className="input w-full h-24 resize-none"
                placeholder="Describe treatments, medications administered, procedures performed..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Findings / Notes
              </label>
              <textarea
                value={formData.findings}
                onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                className="input w-full h-24 resize-none"
                placeholder="Additional observations, recommendations..."
              />
            </div>
          </div>
        </div>

        {/* Follow-up */}
        <div className="card p-6">
          <h3 className="font-medium text-stone-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-stone-500" />
            Follow-up
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Follow-up Date
              </label>
              <input
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Follow-up Notes
              </label>
              <textarea
                value={formData.followUpNotes}
                onChange={(e) => setFormData({ ...formData, followUpNotes: e.target.value })}
                className="input w-full h-20 resize-none"
                placeholder="Instructions for follow-up care..."
              />
            </div>
          </div>
        </div>

        {/* Coggins (conditional) */}
        {formData.type === 'COGGINS' && (
          <div className="card p-6 bg-green-50 border-green-200">
            <h3 className="font-medium text-green-800 mb-4">Coggins Test Details</h3>
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">
                Expiration Date
              </label>
              <input
                type="date"
                value={formData.cogginsExpiry}
                onChange={(e) => setFormData({ ...formData, cogginsExpiry: e.target.value })}
                className="input w-full"
              />
              <p className="text-xs text-green-600 mt-1">
                Typically valid for 12 months from test date
              </p>
            </div>
          </div>
        )}

        {/* Cost */}
        <div className="card p-6">
          <h3 className="font-medium text-stone-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-stone-500" />
            Cost (Optional)
          </h3>
          <div className="relative max-w-xs">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              className="input pl-10 w-full"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Attachments */}
        <div className="card p-6">
          <h3 className="font-medium text-stone-900 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-stone-500" />
            Attachments
          </h3>
          <div className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center">
            <Upload className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <p className="text-stone-600 font-medium">Drop files here or click to upload</p>
            <p className="text-sm text-stone-500 mt-1">PDF, images up to 10MB each</p>
            <p className="text-xs text-stone-400 mt-3">File uploads disabled in demo mode</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href={`/horses/${horseId}`} className="btn-secondary flex-1">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Record
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
