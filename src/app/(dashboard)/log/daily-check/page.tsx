'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBarn } from '@/contexts/BarnContext';
import { useHorses } from '@/hooks/useData';
import { toast } from '@/lib/toast';
import {
  Heart,
  Droplets,
  ChevronLeft,
  Check,
  Loader2,
  Eye,
  Clock,
} from 'lucide-react';

const overallConditions = [
  { value: 'Excellent', color: 'bg-emerald-500' },
  { value: 'Good', color: 'bg-green-500' },
  { value: 'Fair', color: 'bg-yellow-500' },
  { value: 'Poor', color: 'bg-orange-500' },
  { value: 'Critical', color: 'bg-red-500' },
];
const appetiteOptions = ['Normal', 'Increased', 'Decreased', 'None'];
const manureOptions = ['Normal', 'Loose', 'Dry', 'Diarrhea', 'None observed'];
const attitudeOptions = ['Bright & Alert', 'Quiet', 'Dull', 'Depressed', 'Anxious'];
const waterLevels = ['Full', 'High', 'Medium', 'Low', 'Empty'];
const waterQuality = ['Clean', 'Slightly Dirty', 'Needs Cleaning'];

type HorseObservations = {
  selected: boolean;
  overallCondition: string;
  appetite: string;
  manure: string;
  attitude: string;
  waterLevel: string;
  waterQuality: string;
  refilled: boolean;
  notes: string;
};

export default function DailyCheckPage() {
  const router = useRouter();
  const { currentBarn } = useBarn();
  const { horses, isLoading } = useHorses();
  const [observations, setObservations] = useState<Record<string, HorseObservations>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString());
    setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
  }, []);

  useEffect(() => {
    // Initialize observations for all horses
    const initialObservations: Record<string, HorseObservations> = {};
    horses.forEach((horse) => {
      initialObservations[horse.id] = {
        selected: false,
        overallCondition: 'Good',
        appetite: 'Normal',
        manure: 'Normal',
        attitude: 'Bright & Alert',
        waterLevel: 'Full',
        waterQuality: 'Clean',
        refilled: false,
        notes: '',
      };
    });
    setObservations(initialObservations);
  }, [horses]);

  const toggleHorse = (horseId: string) => {
    setObservations({
      ...observations,
      [horseId]: {
        ...observations[horseId],
        selected: !observations[horseId]?.selected,
      },
    });
  };

  const selectAll = () => {
    const newObservations = { ...observations };
    Object.keys(newObservations).forEach((horseId) => {
      newObservations[horseId].selected = true;
    });
    setObservations(newObservations);
  };

  const updateObservation = (horseId: string, field: keyof HorseObservations, value: any) => {
    setObservations({
      ...observations,
      [horseId]: {
        ...observations[horseId],
        [field]: value,
      },
    });
  };

  const handleSubmit = async () => {
    const selectedHorses = Object.entries(observations).filter(([_, obs]) => obs.selected);

    if (selectedHorses.length === 0) {
      toast.warning('No horses selected', 'Please select at least one horse');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit health checks
      const healthChecks = selectedHorses.map(([horseId, obs]) => ({
        horseId,
        overallCondition: obs.overallCondition,
        appetite: obs.appetite,
        manure: obs.manure,
        attitude: obs.attitude,
        notes: obs.notes || null,
      }));

      const healthResponse = await fetch(`/api/barns/${currentBarn?.id}/health-checks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checks: healthChecks }),
      });

      if (!healthResponse.ok) {
        throw new Error('Failed to log health checks');
      }

      // Submit water checks
      const waterChecks = selectedHorses.map(([horseId, obs]) => ({
        horseId,
        waterLevel: obs.waterLevel,
        waterQuality: obs.waterQuality,
        refilled: obs.refilled,
      }));

      const waterResponse = await fetch(`/api/barns/${currentBarn?.id}/water-checks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checks: waterChecks }),
      });

      if (!waterResponse.ok) {
        throw new Error('Failed to log water checks');
      }

      toast.success('Daily checks logged', `Logged checks for ${selectedHorses.length} horse${selectedHorses.length > 1 ? 's' : ''}`);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error logging daily checks:', error);
      toast.error('Failed to log checks', error instanceof Error ? error.message : 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCount = Object.values(observations).filter((obs) => obs.selected).length;

  if (!currentBarn) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-stone-500">Please select a barn first</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Daily Check</h1>
          <p className="text-stone-500 mt-0.5">Log health observations and water checks</p>
        </div>
      </div>

      {/* Time */}
      <div className="card p-4 bg-gradient-to-r from-blue-50 to-amber-50 border-blue-200">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-medium text-stone-800">Logging at {currentTime || '...'}</p>
            <p className="text-sm text-stone-600">{currentDate || 'Loading...'}</p>
          </div>
        </div>
      </div>

      {/* Horse Selection */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-stone-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Select Horses to Check
          </h3>
          <button
            onClick={selectAll}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Select All
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="space-y-3">
            {horses.map((horse) => {
              const obs = observations[horse.id];
              if (!obs) return null;

              return (
                <div
                  key={horse.id}
                  className={`rounded-xl border-2 transition-all ${
                    obs.selected
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div
                    className="p-4 flex items-center gap-3 cursor-pointer"
                    onClick={() => toggleHorse(horse.id)}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        obs.selected ? 'border-amber-500 bg-amber-500' : 'border-stone-300'
                      }`}
                    >
                      {obs.selected && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-stone-900">{horse.barnName}</p>
                      <p className="text-sm text-stone-500">
                        {horse.breed} • {horse.stallName || 'No stall assigned'}
                      </p>
                    </div>
                  </div>

                  {obs.selected && (
                    <div className="px-4 pb-4 space-y-5 border-t border-stone-200 pt-4 mt-2">
                      {/* Health Observations */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Health Observations
                        </h4>

                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-2">
                            Overall Condition
                          </label>
                          <div className="flex flex-wrap gap-1">
                            {overallConditions.map(({ value, color }) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => updateObservation(horse.id, 'overallCondition', value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                                  obs.overallCondition === value
                                    ? 'bg-stone-900 text-white'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
                                {value}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-stone-600 mb-2">
                              Appetite
                            </label>
                            <div className="flex flex-wrap gap-1">
                              {appetiteOptions.map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => updateObservation(horse.id, 'appetite', option)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    obs.appetite === option
                                      ? 'bg-stone-900 text-white'
                                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-stone-600 mb-2">
                              Attitude
                            </label>
                            <div className="flex flex-wrap gap-1">
                              {attitudeOptions.map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => updateObservation(horse.id, 'attitude', option)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    obs.attitude === option
                                      ? 'bg-stone-900 text-white'
                                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-2">
                            Manure
                          </label>
                          <div className="flex flex-wrap gap-1">
                            {manureOptions.map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => updateObservation(horse.id, 'manure', option)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  obs.manure === option
                                    ? 'bg-stone-900 text-white'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Water Check */}
                      <div className="space-y-4 pt-4 border-t border-stone-200">
                        <h4 className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          Water Check
                        </h4>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-stone-600 mb-2">
                              Water Level
                            </label>
                            <div className="flex flex-wrap gap-1">
                              {waterLevels.map((level) => (
                                <button
                                  key={level}
                                  type="button"
                                  onClick={() => updateObservation(horse.id, 'waterLevel', level)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    obs.waterLevel === level
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                  }`}
                                >
                                  {level}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-stone-600 mb-2">
                              Water Quality
                            </label>
                            <div className="flex flex-wrap gap-1">
                              {waterQuality.map((quality) => (
                                <button
                                  key={quality}
                                  type="button"
                                  onClick={() => updateObservation(horse.id, 'waterQuality', quality)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    obs.waterQuality === quality
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                  }`}
                                >
                                  {quality}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={obs.refilled}
                            onChange={(e) =>
                              updateObservation(horse.id, 'refilled', e.target.checked)
                            }
                            className="w-4 h-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-stone-700">Refilled water bucket</span>
                        </label>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-2">
                          Notes (optional)
                        </label>
                        <textarea
                          value={obs.notes}
                          onChange={(e) => updateObservation(horse.id, 'notes', e.target.value)}
                          className="input w-full h-16 text-sm resize-none"
                          placeholder="Any concerns or additional observations..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 shadow-lg md:relative md:border-0 md:shadow-none md:p-0">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Link href="/dashboard" className="btn-secondary flex-1">
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedCount === 0}
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
                Log Daily Check ({selectedCount})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
