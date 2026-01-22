'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBarn } from '@/contexts/BarnContext';
import { useHorses } from '@/hooks/useData';
import { toast } from '@/lib/toast';
import {
  Pill,
  ChevronLeft,
  Check,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function LogMedicationPage() {
  const router = useRouter();
  const { currentBarn } = useBarn();
  const { horses, isLoading } = useHorses();
  const [selectedHorse, setSelectedHorse] = useState<string | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<string | null>(null);
  const [medications, setMedications] = useState<any[]>([]);
  const [loadingMeds, setLoadingMeds] = useState(false);
  const [givenAt, setGivenAt] = useState(new Date().toISOString().slice(0, 16));
  const [skipped, setSkipped] = useState(false);
  const [skipReason, setSkipReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get horses with active medications
  const horsesWithMeds = horses.filter(h => (h.activeMedicationCount || 0) > 0);

  // Fetch medications when horse is selected
  useEffect(() => {
    const fetchMedications = async () => {
      if (!selectedHorse || !currentBarn?.id) return;

      setLoadingMeds(true);
      setMedications([]);
      setSelectedMedication(null);

      try {
        const response = await fetch(`/api/barns/${currentBarn.id}/horses/${selectedHorse}/medications`);
        const data = await response.json();
        setMedications(data.data || []);
      } catch {
        setMedications([]);
      } finally {
        setLoadingMeds(false);
      }
    };

    fetchMedications();
  }, [selectedHorse, currentBarn?.id]);

  const handleSubmit = async () => {
    if (!selectedHorse || !selectedMedication) {
      toast.warning('Missing selection', 'Please select a horse and medication');
      return;
    }

    if (skipped && !skipReason) {
      toast.warning('Missing reason', 'Please provide a reason for skipping');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(
        `/api/barns/${currentBarn?.id}/horses/${selectedHorse}/medications/${selectedMedication}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'log',
            givenAt: new Date(givenAt).toISOString(),
            skipped,
            skipReason: skipped ? skipReason : null,
            notes,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to log medication');
      }

      toast.success('Medication logged', skipped ? 'Medication skipped and recorded' : 'Medication recorded successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error logging medication:', error);
      toast.error('Failed to log medication', error instanceof Error ? error.message : 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentBarn) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-stone-500">Please select a barn first</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Log Medication</h1>
          <p className="text-stone-500 mt-0.5">Record medication given to a horse</p>
        </div>
      </div>

      {/* Select Horse */}
      <div className="card p-6">
        <h3 className="font-medium text-stone-900 mb-4 flex items-center gap-2">
          <Pill className="w-5 h-5 text-purple-500" />
          Select Horse
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          </div>
        ) : horsesWithMeds.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 mb-1">No horses currently on medication</p>
            <p className="text-sm text-stone-400 mb-4">Add medications from a horse's health tab first</p>
            <Link href="/horses" className="btn-secondary btn-sm">
              View Horses
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {horsesWithMeds.map((horse) => (
              <button
                key={horse.id}
                onClick={() => setSelectedHorse(horse.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedHorse === horse.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <p className="font-medium text-stone-900">{horse.barnName}</p>
                <p className="text-sm text-stone-500">{horse.activeMedicationCount} active medication(s)</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Select Medication */}
      {selectedHorse && (
        <div className="card p-6">
          <h3 className="font-medium text-stone-900 mb-4">Select Medication</h3>
          
          {loadingMeds ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            </div>
          ) : medications.length === 0 ? (
            <p className="text-stone-500 text-center py-4">No active medications found</p>
          ) : (
            <div className="space-y-3">
              {medications.filter(m => m.status === 'ACTIVE').map((med) => (
                <button
                  key={med.id}
                  onClick={() => setSelectedMedication(med.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedMedication === med.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-stone-900">{med.name}</p>
                      <p className="text-sm text-stone-500">
                        {med.dosage} • {med.frequency} • {med.route || 'Oral'}
                      </p>
                    </div>
                    {selectedMedication === med.id && (
                      <Check className="w-5 h-5 text-purple-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Time and Status */}
      {selectedMedication && (
        <div className="card p-6">
          <h3 className="font-medium text-stone-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-stone-500" />
            Administration Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={givenAt}
                onChange={(e) => setGivenAt(e.target.value)}
                className="input w-full"
              />
            </div>
            
            <div>
              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-stone-50">
                <input
                  type="checkbox"
                  checked={skipped}
                  onChange={(e) => setSkipped(e.target.checked)}
                  className="w-5 h-5 rounded border-stone-300 text-red-600 focus:ring-red-500"
                />
                <div>
                  <p className="font-medium text-stone-900">Skipped this dose</p>
                  <p className="text-sm text-stone-500">Mark if the medication was not given</p>
                </div>
              </label>
            </div>
            
            {skipped && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Reason for Skipping *
                </label>
                <select
                  value={skipReason}
                  onChange={(e) => setSkipReason(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Select a reason</option>
                  <option value="refused">Horse refused medication</option>
                  <option value="vet_instruction">Per veterinarian instruction</option>
                  <option value="side_effects">Due to side effects</option>
                  <option value="unavailable">Medication unavailable</option>
                  <option value="other">Other reason</option>
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input w-full h-24 resize-none"
                placeholder="Any observations..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-3">
        <Link href="/dashboard" className="btn-secondary flex-1">
          Cancel
        </Link>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedHorse || !selectedMedication}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              {skipped ? 'Log Skipped Dose' : 'Log Medication'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
