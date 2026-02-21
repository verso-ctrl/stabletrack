'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBarn } from '@/contexts/BarnContext';
import { useHorses } from '@/hooks/useData';
import { toast } from '@/lib/toast';
import { csrfFetch } from '@/lib/fetch';
import {
  Utensils,
  ChevronLeft,
  Check,
  Clock,
  Loader2,
} from 'lucide-react';

const feedingTimes = ['Morning', 'Midday', 'Evening', 'Night'];
const amountOptions = ['All', 'Most', 'Half', 'Little', 'None'];

export default function LogFeedPage() {
  const router = useRouter();
  const { currentBarn } = useBarn();
  const { horses, isLoading } = useHorses();
  const [selectedHorses, setSelectedHorses] = useState<string[]>([]);
  const [feedingTime, setFeedingTime] = useState('Morning');
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleHorse = (horseId: string) => {
    if (selectedHorses.includes(horseId)) {
      setSelectedHorses(selectedHorses.filter(id => id !== horseId));
    } else {
      setSelectedHorses([...selectedHorses, horseId]);
      if (!amounts[horseId]) {
        setAmounts({ ...amounts, [horseId]: 'All' });
      }
    }
  };

  const selectAll = () => {
    const allIds = horses.map(h => h.id);
    setSelectedHorses(allIds);
    const newAmounts: Record<string, string> = {};
    allIds.forEach(id => { newAmounts[id] = 'All'; });
    setAmounts(newAmounts);
  };

  const handleSubmit = async () => {
    if (selectedHorses.length === 0) {
      toast.warning('No horses selected', 'Please select at least one horse');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const logs = selectedHorses.map(horseId => ({
        horseId,
        amountEaten: amounts[horseId]?.toUpperCase() || 'ALL',
      }));

      const feedingTimeMap: Record<string, string> = {
        'Morning': 'AM',
        'Midday': 'MIDDAY',
        'Evening': 'PM',
        'Night': 'NIGHT',
      };

      const response = await csrfFetch(`/api/barns/${currentBarn?.id}/feed-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logs,
          feedingTime: feedingTimeMap[feedingTime] || 'AM',
          notes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to log feed');
      }

      toast.success('Feeding logged', `Logged ${feedingTime.toLowerCase()} feeding for ${selectedHorses.length} horse${selectedHorses.length > 1 ? 's' : ''}`);
      router.push('/daily-care');
    } catch (error) {
      console.error('Error logging feed:', error);
      toast.error('Failed to log feed', error instanceof Error ? error.message : 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentBarn) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a barn first</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2 rounded-lg text-muted-foreground hover:bg-accent transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Log Feeding</h1>
          <p className="text-muted-foreground mt-1">Record feed given to horses</p>
        </div>
      </div>

      {/* Feeding Time */}
      <div className="card p-6">
        <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-muted-foreground" />
          Feeding Time
        </h3>
        <div className="flex flex-wrap gap-2">
          {feedingTimes.map((time) => (
            <button
              key={time}
              onClick={() => setFeedingTime(time)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                feedingTime === time
                  ? 'bg-amber-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Horse Selection */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-foreground flex items-center gap-2">
            <Utensils className="w-5 h-5 text-muted-foreground" />
            Select Horses
          </h3>
          <button
            onClick={selectAll}
            className="text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            Select All
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          </div>
        ) : horses.length === 0 ? (
          <div className="text-center py-8">
            <Utensils className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No horses in this barn yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first horse to start logging feedings</p>
          </div>
        ) : (
          <div className="space-y-3">
            {horses.map((horse) => {
              const isSelected = selectedHorses.includes(horse.id);
              return (
                <div
                  key={horse.id}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-border hover:border-border'
                  }`}
                  onClick={() => toggleHorse(horse.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-amber-500 bg-amber-500' : 'border-border'
                      }`}>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{horse.barnName}</p>
                        <p className="text-sm text-muted-foreground">{horse.breed}</p>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        {amountOptions.map((amount) => (
                          <button
                            key={amount}
                            onClick={() => setAmounts({ ...amounts, [horse.id]: amount })}
                            className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                              amounts[horse.id] === amount
                                ? 'bg-amber-500 text-white'
                                : 'bg-muted text-muted-foreground hover:bg-accent'
                            }`}
                          >
                            {amount}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="card p-6">
        <h3 className="font-medium text-foreground mb-4">Notes (Optional)</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input w-full h-24 resize-none"
          placeholder="Any observations about feeding..."
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <Link href="/dashboard" className="btn-secondary flex-1">
          Cancel
        </Link>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || selectedHorses.length === 0}
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
              Log Feeding ({selectedHorses.length})
            </>
          )}
        </button>
      </div>
    </div>
  );
}
