'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useBarn } from '@/contexts/BarnContext';
import { csrfFetch } from '@/lib/fetch';
import {
  Utensils,
  Check,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  RefreshCw,
  Filter,
  MessageSquare,
} from 'lucide-react';

const feedingTimeLabels: Record<string, { label: string; icon: any; color: string }> = {
  EARLY_AM: { label: 'Early AM', icon: Moon, color: 'bg-indigo-100 text-indigo-700' },
  AM: { label: 'Morning', icon: Sunrise, color: 'bg-amber-100 text-amber-700' },
  MIDDAY: { label: 'Midday', icon: Sun, color: 'bg-yellow-100 text-yellow-700' },
  PM: { label: 'Afternoon', icon: Sunset, color: 'bg-orange-100 text-orange-700' },
  EVENING: { label: 'Evening', icon: Moon, color: 'bg-purple-100 text-purple-700' },
  NIGHT: { label: 'Night', icon: Moon, color: 'bg-slate-100 text-slate-700' },
};

export default function FeedChartPage() {
  const { currentBarn } = useBarn();
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [chartData, setChartData] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (currentBarn?.id) {
      fetchFeedChart();
    }
  }, [currentBarn?.id, date, statusFilter]);

  const fetchFeedChart = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ date });
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await fetch(`/api/barns/${currentBarn?.id}/feed-chart?${params}`);
      if (response.ok) {
        const data = await response.json();
        setChartData(data.data);
      }
    } catch (error) {
      console.error('Error fetching feed chart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFeeding = async (horseId: string, feedingTime: string, action: 'complete' | 'skip' | 'undo') => {
    setIsUpdating(`${horseId}-${feedingTime}`);
    try {
      const response = await csrfFetch(`/api/barns/${currentBarn?.id}/feed-chart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          horseId,
          feedingTime,
          date,
          completed: action === 'complete',
          skipped: action === 'skip',
        }),
      });

      if (response.ok) {
        // Update local state optimistically
        if (chartData) {
          setChartData({
            ...chartData,
            horses: chartData.horses.map((horse: any) => {
              if (horse.id === horseId && horse.feedSchedule[feedingTime]) {
                return {
                  ...horse,
                  feedSchedule: {
                    ...horse.feedSchedule,
                    [feedingTime]: {
                      ...horse.feedSchedule[feedingTime],
                      completed: action === 'complete',
                      skipped: action === 'skip',
                    },
                  },
                };
              }
              return horse;
            }),
          });
        }
      }
    } catch (error) {
      console.error('Error updating feed:', error);
      fetchFeedChart(); // Refresh on error
    } finally {
      setIsUpdating(null);
    }
  };

  const handleSaveNotes = async (horseId: string, feedingTime: string) => {
    setIsUpdating(`${horseId}-${feedingTime}`);
    try {
      await csrfFetch(`/api/barns/${currentBarn?.id}/feed-chart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          horseId,
          feedingTime,
          notes: noteText,
        }),
      });
      setShowNotes(null);
      setNoteText('');
      fetchFeedChart();
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    setDate(newDate.toISOString().split('T')[0]);
  };

  const isToday = date === new Date().toISOString().split('T')[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Feed Chart</h1>
          <p className="text-muted-foreground">Daily feeding schedule and tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchFeedChart} className="btn-secondary btn-sm">
            <RefreshCw className="w-4 h-4" />
          </button>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input py-2 px-3 text-sm"
          >
            <option value="">Active & Layup</option>
            <option value="ACTIVE">Active Only</option>
            <option value="LAYUP">Layup Only</option>
          </select>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 rounded-lg hover:bg-accent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input text-center font-medium"
            />
            {!isToday && (
              <button
                onClick={() => setDate(new Date().toISOString().split('T')[0])}
                className="text-sm text-amber-600 hover:text-amber-700"
              >
                Go to Today
              </button>
            )}
          </div>

          <button
            onClick={() => changeDate(1)}
            className="p-2 rounded-lg hover:bg-accent"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {chartData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-sm text-muted-foreground">Total Horses</p>
            <p className="text-2xl font-bold text-foreground">{chartData.summary.totalHorses}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-muted-foreground">With Feed Programs</p>
            <p className="text-2xl font-bold text-foreground">{chartData.summary.horsesWithPrograms}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-muted-foreground">Feeding Times</p>
            <p className="text-2xl font-bold text-foreground">{chartData.feedingTimes.length}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-muted-foreground">Completed Today</p>
            <p className="text-2xl font-bold text-green-600">
              {chartData.horses.reduce((acc: number, horse: any) => {
                return acc + Object.values(horse.feedSchedule).filter((s: any) => s.completed).length;
              }, 0)}
            </p>
          </div>
        </div>
      )}

      {/* Feed Chart Table */}
      {chartData && chartData.horses.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-background border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground sticky left-0 bg-background z-10 min-w-[180px]">
                    Horse
                  </th>
                  {chartData.feedingTimes.map((time: string) => {
                    const timeInfo = feedingTimeLabels[time] || { label: time, icon: Clock, color: 'bg-muted text-muted-foreground' };
                    const Icon = timeInfo.icon;
                    return (
                      <th key={time} className="text-center py-3 px-2 font-medium text-muted-foreground min-w-[140px]">
                        <div className="flex flex-col items-center gap-1">
                          <div className={`p-1.5 rounded-lg ${timeInfo.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-xs">{timeInfo.label}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {chartData.horses.map((horse: any) => (
                  <tr key={horse.id} className="hover:bg-accent">
                    <td className="py-3 px-4 sticky left-0 bg-card z-10">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden">
                          {horse.profilePhotoUrl ? (
                            <Image src={horse.profilePhotoUrl} alt={horse.barnName} fill className="object-cover" unoptimized />
                          ) : (
                            <span className="text-amber-700 font-medium text-sm">
                              {horse.barnName.substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{horse.barnName}</p>
                          <p className="text-xs text-muted-foreground">
                            {horse.stall}
                            {horse.section && ` • ${horse.section}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    {chartData.feedingTimes.map((time: string) => {
                      const schedule = horse.feedSchedule[time];
                      const cellKey = `${horse.id}-${time}`;
                      const isUpdatingCell = isUpdating === cellKey;
                      
                      if (!schedule || schedule.items.length === 0) {
                        return (
                          <td key={time} className="py-3 px-2 text-center">
                            <span className="text-muted-foreground">—</span>
                          </td>
                        );
                      }

                      return (
                        <td key={time} className="py-3 px-2">
                          <div className={`
                            rounded-lg p-2 text-xs
                            ${schedule.completed ? 'bg-green-50 border border-green-200' : 
                              schedule.skipped ? 'bg-red-50 border border-red-200' : 
                              'bg-background border border-border'}
                          `}>
                            {/* Feed Items */}
                            <div className="space-y-1 mb-2">
                              {schedule.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between gap-2">
                                  <span className={`
                                    ${schedule.completed ? 'text-green-700' : 
                                      schedule.skipped ? 'text-red-400 line-through' : 
                                      'text-muted-foreground'}
                                  `}>
                                    {item.name}
                                  </span>
                                  <span className="text-muted-foreground whitespace-nowrap">
                                    {item.amount} {item.unit}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Notes indicator */}
                            {schedule.notes && (
                              <div className="text-xs text-amber-600 mb-2 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {schedule.notes}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-center gap-1 pt-1 border-t border-border">
                              {isUpdatingCell ? (
                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                              ) : schedule.completed ? (
                                <button
                                  onClick={() => handleToggleFeeding(horse.id, time, 'undo')}
                                  className="p-1 rounded hover:bg-green-100 text-green-600"
                                  title="Undo"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              ) : schedule.skipped ? (
                                <button
                                  onClick={() => handleToggleFeeding(horse.id, time, 'undo')}
                                  className="p-1 rounded hover:bg-red-100 text-red-600"
                                  title="Undo"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleToggleFeeding(horse.id, time, 'complete')}
                                    className="p-1 rounded hover:bg-green-100 text-green-600"
                                    title="Mark Complete"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleToggleFeeding(horse.id, time, 'skip')}
                                    className="p-1 rounded hover:bg-red-100 text-red-600"
                                    title="Skip"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowNotes(cellKey);
                                      setNoteText(schedule.notes || '');
                                    }}
                                    className="p-1 rounded hover:bg-amber-100 text-amber-600"
                                    title="Add Note"
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center">
          <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No horses with feed programs</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add feed programs to horses to see them here
          </p>
        </div>
      )}

      {/* Special Instructions */}
      {chartData && chartData.horses.some((h: any) => h.specialNotes) && (
        <div className="card p-4">
          <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Special Instructions
          </h3>
          <div className="space-y-2">
            {chartData.horses.filter((h: any) => h.specialNotes).map((horse: any) => (
              <div key={horse.id} className="flex gap-3 p-2 bg-amber-50 rounded-lg">
                <span className="font-medium text-amber-700">{horse.barnName}:</span>
                <span className="text-amber-900">{horse.specialNotes}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold">Add Feeding Note</h3>
            </div>
            <div className="p-6">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="input w-full"
                rows={3}
                placeholder="Enter any notes about this feeding..."
              />
            </div>
            <div className="p-6 border-t border-border flex gap-3">
              <button
                onClick={() => {
                  setShowNotes(null);
                  setNoteText('');
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const lastDash = showNotes.lastIndexOf('-');
                  const horseId = showNotes.substring(0, lastDash);
                  const feedingTime = showNotes.substring(lastDash + 1);
                  handleSaveNotes(horseId, feedingTime);
                }}
                className="btn-primary flex-1"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
