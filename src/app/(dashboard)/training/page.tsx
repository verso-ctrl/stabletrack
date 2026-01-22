'use client';

import React, { useState, useEffect } from 'react';
import { useBarn } from '@/contexts/BarnContext';
import { toast } from '@/lib/toast';
import {
  Activity,
  Plus,
  Clock,
  Calendar,
  Star,
  X,
  Loader2,
  Filter,
} from 'lucide-react';

const HorseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12c0-4-3-8-8-8-3 0-5.5 1.5-7 3.5L3 10l1 3-2 4 3 1 2-1 2 3h4l1-2 2 1 4-3c1-1 2-2.5 2-4z"/>
  </svg>
);

const trainingTypes = [
  'TRAINING_RIDE', 'HACK', 'FLATWORK', 'JUMPING', 'GROUNDWORK', 
  'LUNGING', 'TRAIL_RIDE', 'COMPETITION', 'EVALUATION', 'OTHER'
];

const disciplines = ['HUNTER', 'JUMPER', 'DRESSAGE', 'EVENTING', 'WESTERN', 'TRAIL', 'GENERAL'];

export default function TrainingPage() {
  const { currentBarn, isMember } = useBarn();
  const canEdit = isMember && currentBarn?.role !== 'CLIENT';
  const [trainingLogs, setTrainingLogs] = useState<any[]>([]);
  const [horses, setHorses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterHorse, setFilterHorse] = useState('');

  const [form, setForm] = useState({
    horseId: '',
    type: 'TRAINING_RIDE',
    date: new Date().toISOString().split('T')[0],
    duration: 45,
    discipline: '',
    location: '',
    goals: '',
    exercises: '',
    notes: '',
    rating: 0,
  });

  useEffect(() => {
    if (currentBarn?.id) {
      fetchData();
    }
  }, [currentBarn?.id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [logsRes, horsesRes] = await Promise.all([
        fetch(`/api/barns/${currentBarn?.id}/training-logs`),
        fetch(`/api/barns/${currentBarn?.id}/horses`),
      ]);

      if (logsRes.ok) {
        const data = await logsRes.json();
        setTrainingLogs(data.data || []);
      }
      if (horsesRes.ok) {
        const data = await horsesRes.json();
        setHorses(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching training logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.horseId) {
      toast.warning('No horse selected', 'Please select a horse');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/barns/${currentBarn?.id}/training-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          horseId: form.horseId,
          type: form.type,
          date: form.date,
          duration: form.duration,
          discipline: form.discipline || null,
          location: form.location || null,
          goals: form.goals || null,
          exercises: form.exercises || null,
          notes: form.notes || null,
          rating: form.rating || null,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create training log');
      }

      setShowModal(false);
      setForm({
        horseId: '', type: 'TRAINING_RIDE',
        date: new Date().toISOString().split('T')[0],
        duration: 45, discipline: '', location: '',
        goals: '', exercises: '', notes: '', rating: 0,
      });
      fetchData();
      toast.success('Training logged', 'Training session has been recorded');
    } catch (err) {
      toast.error('Failed to create log', err instanceof Error ? err.message : 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLogs = filterHorse 
    ? trainingLogs.filter(log => log.horseId === filterHorse)
    : trainingLogs;

  const thisWeek = trainingLogs.filter(log => {
    const logDate = new Date(log.date);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return logDate >= weekAgo;
  });

  const totalMinutesThisWeek = thisWeek.reduce((sum, log) => sum + (log.duration || 0), 0);
  const avgRating = trainingLogs.filter(l => l.rating).length > 0
    ? trainingLogs.filter(l => l.rating).reduce((sum, l) => sum + l.rating, 0) / trainingLogs.filter(l => l.rating).length
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Training Logs</h1>
          <p className="text-stone-500">Track rides, training sessions, and progress</p>
        </div>
        {canEdit && (
          <button onClick={() => setShowModal(true)} className="btn-primary btn-md">
            <Plus className="w-4 h-4" />
            Log Training
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-stone-500">This Week</p>
          <p className="text-2xl font-bold text-stone-900">{thisWeek.length} rides</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-stone-500">Total Time (Week)</p>
          <p className="text-2xl font-bold text-stone-900">{Math.round(totalMinutesThisWeek / 60 * 10) / 10} hrs</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-stone-500">Total Logs</p>
          <p className="text-2xl font-bold text-stone-900">{trainingLogs.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-stone-500">Avg Rating</p>
          <div className="flex items-center gap-1">
            <p className="text-2xl font-bold text-stone-900">{avgRating.toFixed(1)}</p>
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Filter className="w-4 h-4 text-stone-400" />
        <select value={filterHorse} onChange={(e) => setFilterHorse(e.target.value)} className="input">
          <option value="">All Horses</option>
          {horses.map(h => (
            <option key={h.id} value={h.id}>{h.barnName}</option>
          ))}
        </select>
      </div>

      <div className="card divide-y divide-stone-100">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center">
            <Activity className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">No training logs yet</p>
            {canEdit && (
              <button onClick={() => setShowModal(true)} className="btn-primary btn-sm mt-4">
                Log First Training
              </button>
            )}
          </div>
        ) : (
          filteredLogs.map(log => (
            <div key={log.id} className="p-4 hover:bg-stone-50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <HorseIcon className="w-6 h-6 text-amber-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-stone-900">{log.horse?.barnName}</p>
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-xs">
                      {log.type.replace(/_/g, ' ')}
                    </span>
                    {log.discipline && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs">
                        {log.discipline}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-stone-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(log.date).toLocaleDateString()}
                    </span>
                    {log.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {log.duration} min
                      </span>
                    )}
                    {log.rating && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {log.rating}/5
                      </span>
                    )}
                  </div>
                  {(log.goals || log.notes) && (
                    <p className="text-sm text-stone-600 mt-2 line-clamp-2">
                      {log.goals || log.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Log Training Session</h3>
                <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-stone-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Horse *</label>
                <select
                  value={form.horseId}
                  onChange={(e) => setForm(prev => ({ ...prev, horseId: e.target.value }))}
                  className="input w-full"
                >
                  <option value="">Select horse...</option>
                  {horses.map(h => (
                    <option key={h.id} value={h.id}>{h.barnName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                    className="input w-full"
                  >
                    {trainingTypes.map(t => (
                      <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Discipline</label>
                  <select
                    value={form.discipline}
                    onChange={(e) => setForm(prev => ({ ...prev, discipline: e.target.value }))}
                    className="input w-full"
                  >
                    <option value="">Select...</option>
                    {disciplines.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                  className="input w-full"
                  placeholder="Indoor arena, outdoor ring, trail..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Goals</label>
                <textarea
                  value={form.goals}
                  onChange={(e) => setForm(prev => ({ ...prev, goals: e.target.value }))}
                  className="input w-full"
                  rows={2}
                  placeholder="What were you working on?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, rating: star }))}
                      className="p-1"
                    >
                      <Star 
                        className={`w-6 h-6 ${star <= form.rating ? 'text-amber-500 fill-amber-500' : 'text-stone-300'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="input w-full"
                  rows={2}
                />
              </div>
            </div>
            <div className="p-6 border-t border-stone-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1" disabled={isSubmitting}>
                Cancel
              </button>
              <button onClick={handleCreate} className="btn-primary flex-1" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Log'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
