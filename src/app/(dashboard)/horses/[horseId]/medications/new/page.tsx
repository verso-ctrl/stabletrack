'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useBarn } from '@/contexts/BarnContext';
import { useHorse } from '@/hooks/useData';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from '@/lib/toast';
import { csrfFetch } from '@/lib/fetch';
import {
  Pill,
  ChevronLeft,
  Save,
  Loader2,
  Calendar,
  Clock,
  AlertCircle,
} from 'lucide-react';

const frequencyOptions = [
  { value: 'ONCE_DAILY', label: 'Once daily' },
  { value: 'ONCE_DAILY_WITH_FOOD', label: 'Once daily (with food)' },
  { value: 'TWICE_DAILY', label: 'Twice daily' },
  { value: 'TWICE_DAILY_WITH_FOOD', label: 'Twice daily (with food)' },
  { value: 'THREE_TIMES_DAILY', label: 'Three times daily' },
  { value: 'THREE_TIMES_DAILY_WITH_FOOD', label: 'Three times daily (with food)' },
  { value: 'EVERY_OTHER_DAY', label: 'Every other day' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'AS_NEEDED', label: 'As needed' },
  { value: 'OTHER', label: 'Other' },
];

const routeOptions = [
  { value: 'ORAL', label: 'Oral' },
  { value: 'IM', label: 'Intramuscular (IM)' },
  { value: 'IV', label: 'Intravenous (IV)' },
  { value: 'TOPICAL', label: 'Topical' },
  { value: 'OPHTHALMIC', label: 'Ophthalmic (Eye)' },
  { value: 'OTHER', label: 'Other' },
];

export default function AddMedicationPage({ params }: { params: Promise<{ horseId: string }> }) {
  const { horseId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentBarn } = useBarn();
  const { horse, isLoading: horseLoading } = useHorse(horseId);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'ONCE_DAILY',
    route: 'ORAL',
    prescribingVet: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isControlled: false,
    giveWithFood: false,
    giveWithFoodNotes: '',
    refillsRemaining: '',
    pharmacy: '',
    instructions: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.dosage.trim()) {
      toast.warning('Missing fields', 'Medication name and dosage are required');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const response = await csrfFetch(
        `/api/barns/${currentBarn?.id}/horses/${horseId}/medications`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            dosage: formData.dosage,
            frequency: formData.frequency,
            route: formData.route,
            prescribingVet: formData.prescribingVet || null,
            startDate: formData.startDate,
            endDate: formData.endDate || null,
            isControlled: formData.isControlled,
            giveWithFood: formData.giveWithFood || formData.frequency.includes('WITH_FOOD'),
            giveWithFoodNotes: formData.giveWithFoodNotes || null,
            refillsRemaining: formData.refillsRemaining || null,
            pharmacy: formData.pharmacy || null,
            instructions: formData.instructions || null,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add medication');
      }

      toast.success('Medication added', `${formData.name} has been added`);
      if (currentBarn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.horses.detail(currentBarn.id, horseId) });
      }
      router.push(`/horses/${horseId}`);
    } catch (error) {
      console.error('Error adding medication:', error);
      toast.error('Failed to add medication', error instanceof Error ? error.message : 'Please try again');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentBarn) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a barn first</p>
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
          className="p-2 rounded-lg text-muted-foreground hover:bg-accent transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add Medication</h1>
          <p className="text-muted-foreground mt-1">for {horse.barnName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Medication Info */}
        <div className="card p-6">
          <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
            <Pill className="w-5 h-5 text-purple-500" />
            Medication Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Medication Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input w-full"
                placeholder="e.g., Bute (Phenylbutazone)"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Dosage *
                </label>
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="input w-full"
                  placeholder="e.g., 2 grams"
                  required
                />
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Route
                  </label>
                  <select
                    value={formData.route}
                    onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                    className="input w-full"
                  >
                    {routeOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.giveWithFood}
                    onChange={(e) => setFormData({ ...formData, giveWithFood: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-foreground">Give with food</span>
                </label>
                {formData.giveWithFood && (
                  <input
                    type="text"
                    value={formData.giveWithFoodNotes}
                    onChange={(e) => setFormData({ ...formData, giveWithFoodNotes: e.target.value })}
                    className="input w-full text-sm"
                    placeholder="e.g., mix into grain, morning feed"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="input w-full"
              >
                {frequencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Instructions
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="input w-full h-24 resize-none"
                placeholder="Special instructions, timing, with food, etc."
              />
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="card p-6">
          <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            Schedule
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                End Date (optional)
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="input w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">Leave blank for ongoing medication</p>
            </div>
          </div>
        </div>

        {/* Prescriber & Pharmacy */}
        <div className="card p-6">
          <h3 className="font-medium text-foreground mb-4">Prescriber & Pharmacy</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Prescribing Veterinarian
              </label>
              <input
                type="text"
                value={formData.prescribingVet}
                onChange={(e) => setFormData({ ...formData, prescribingVet: e.target.value })}
                className="input w-full"
                placeholder="Dr. Smith"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Pharmacy
                </label>
                <input
                  type="text"
                  value={formData.pharmacy}
                  onChange={(e) => setFormData({ ...formData, pharmacy: e.target.value })}
                  className="input w-full"
                  placeholder="Valley Vet Supply"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Refills Remaining
                </label>
                <input
                  type="number"
                  value={formData.refillsRemaining}
                  onChange={(e) => setFormData({ ...formData, refillsRemaining: e.target.value })}
                  className="input w-full"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isControlled}
                onChange={(e) => setFormData({ ...formData, isControlled: e.target.checked })}
                className="w-5 h-5 rounded border-border text-amber-600 focus:ring-amber-500"
              />
              <div>
                <p className="font-medium text-amber-800">Controlled Substance</p>
                <p className="text-sm text-amber-700">Mark if this is a controlled medication requiring special handling</p>
              </div>
            </label>
          </div>
        </div>

        {/* Info Notice */}
        <div className="card p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">Medication Logging</p>
              <p className="text-sm text-blue-700 mt-1">
                Once added, you can log when medications are given from the Quick Actions menu 
                or from {horse.barnName}'s profile page.
              </p>
            </div>
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
                Save Medication
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
