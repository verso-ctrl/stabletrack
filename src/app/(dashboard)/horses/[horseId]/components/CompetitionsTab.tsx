'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Trophy, X } from 'lucide-react';
import { toast } from '@/lib/toast';
import { csrfFetch } from '@/lib/fetch';

interface Competition {
  id: string;
  eventName: string;
  eventDate: string;
  location?: string;
  className?: string;
  placing?: number;
  score?: number;
  points?: number;
  prizeMoney?: number;
  isChampion: boolean;
  isReserve: boolean;
  isQualified: boolean;
}

interface CompetitionStats {
  totalShows?: number;
  totalWins?: number;
  championships?: number;
  totalPoints?: number;
}

interface CompetitionsTabProps {
  horse: {
    id: string;
    barnName: string;
  };
  barnId: string;
  canEdit?: boolean;
}

function getPlacingBadge(placing: number | null | undefined, isChampion: boolean, isReserve: boolean) {
  if (isChampion) return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '🏆 Champion' };
  if (isReserve) return { bg: 'bg-gray-100', text: 'text-gray-700', label: '🥈 Reserve' };
  if (placing === 1) return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '🥇 1st' };
  if (placing === 2) return { bg: 'bg-gray-100', text: 'text-gray-700', label: '🥈 2nd' };
  if (placing === 3) return { bg: 'bg-amber-100', text: 'text-amber-700', label: '🥉 3rd' };
  if (placing && placing <= 6) return { bg: 'bg-blue-50', text: 'text-blue-700', label: `${placing}th` };
  return null;
}

export function CompetitionsTab({ horse, barnId, canEdit = true }: CompetitionsTabProps) {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [stats, setStats] = useState<CompetitionStats>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchCompetitions = async () => {
    if (!barnId || !horse?.id) return;

    try {
      const response = await fetch(`/api/barns/${barnId}/competitions?horseId=${horse.id}`);
      const data = await response.json();
      setCompetitions(data.data || []);
      setStats(data.stats || {});
    } catch {
      // Error handled silently
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, [barnId, horse?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      {competitions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-blue-50 text-center">
            <p className="text-2xl font-semibold text-blue-700">{stats.totalShows || 0}</p>
            <p className="text-xs text-blue-600">Shows</p>
          </div>
          <div className="p-4 rounded-xl bg-yellow-50 text-center">
            <p className="text-2xl font-semibold text-yellow-700">{stats.totalWins || 0}</p>
            <p className="text-xs text-yellow-600">1st Place</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-50 text-center">
            <p className="text-2xl font-semibold text-purple-700">{stats.championships || 0}</p>
            <p className="text-xs text-purple-600">Championships</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 text-center">
            <p className="text-2xl font-semibold text-emerald-700">{stats.totalPoints?.toFixed(0) || 0}</p>
            <p className="text-xs text-emerald-600">Points</p>
          </div>
        </div>
      )}

      {/* Competition List */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Competition History</h3>
          {canEdit && (
            <button onClick={() => setShowAddModal(true)} className="btn-primary btn-sm">
              <Plus className="w-4 h-4" />
              Add Result
            </button>
          )}
        </div>

        {competitions.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No competition records yet</p>
            {canEdit && (
              <button onClick={() => setShowAddModal(true)} className="btn-secondary btn-sm mt-3">
                Add First Result
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {competitions.map((comp) => {
              const placingBadge = getPlacingBadge(comp.placing, comp.isChampion, comp.isReserve);

              return (
                <div key={comp.id} className="p-4 rounded-xl bg-background">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground">{comp.eventName}</p>
                        {placingBadge && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${placingBadge.bg} ${placingBadge.text}`}>
                            {placingBadge.label}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {comp.className && `${comp.className} · `}
                        {new Date(comp.eventDate).toLocaleDateString()}
                        {comp.location && ` · ${comp.location}`}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm">
                        {comp.score && (
                          <span className="text-muted-foreground">Score: <span className="font-medium">{comp.score}</span></span>
                        )}
                        {comp.points && (
                          <span className="text-emerald-600">+{comp.points} pts</span>
                        )}
                        {comp.prizeMoney && (
                          <span className="text-green-600">${comp.prizeMoney}</span>
                        )}
                        {comp.isQualified && (
                          <span className="text-purple-600">✓ Qualified</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Competition Modal */}
      {showAddModal && (
        <AddCompetitionModal
          horse={horse}
          barnId={barnId}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchCompetitions();
          }}
        />
      )}
    </div>
  );
}

interface AddCompetitionModalProps {
  horse: { id: string; barnName: string };
  barnId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function AddCompetitionModal({ horse, barnId, onClose, onSuccess }: AddCompetitionModalProps) {
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: new Date().toISOString().split('T')[0],
    location: '',
    discipline: '',
    className: '',
    placing: '',
    totalEntries: '',
    score: '',
    points: '',
    prizeMoney: '',
    isChampion: false,
    isReserve: false,
    isQualified: false,
    qualifiedFor: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.eventName) {
      toast.warning('Missing event name', 'Please enter an event name');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await csrfFetch(`/api/barns/${barnId}/competitions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          horseId: horse.id,
          placing: formData.placing ? parseInt(formData.placing) : null,
          totalEntries: formData.totalEntries ? parseInt(formData.totalEntries) : null,
          score: formData.score ? parseFloat(formData.score) : null,
          points: formData.points ? parseFloat(formData.points) : null,
          prizeMoney: formData.prizeMoney ? parseFloat(formData.prizeMoney) : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to add competition result');
      onSuccess();
    } catch (error) {
      console.error('Error adding competition:', error);
      toast.error('Failed to add result', 'Could not add competition result');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card">
          <div>
            <h3 className="text-lg font-semibold">Add Competition Result</h3>
            <p className="text-sm text-muted-foreground mt-0.5">for {horse.barnName}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Event Name & Date */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Event/Show Name *</label>
              <input
                type="text"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                className="input"
                placeholder="Spring Classic Horse Show"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Event Date *</label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          {/* Location & Discipline */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input"
                placeholder="Kentucky Horse Park"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Discipline</label>
              <input
                type="text"
                value={formData.discipline}
                onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                className="input"
                placeholder="Hunter, Jumper, Dressage, etc."
              />
            </div>
          </div>

          {/* Class Name */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Class Name</label>
            <input
              type="text"
              value={formData.className}
              onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              className="input"
              placeholder="Open Jumper 1.20m"
            />
          </div>

          {/* Results */}
          <div className="border-t border-border pt-4">
            <h4 className="font-medium text-foreground mb-3">Results</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Placing</label>
                <input
                  type="number"
                  min="1"
                  value={formData.placing}
                  onChange={(e) => setFormData({ ...formData, placing: e.target.value })}
                  className="input"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Total Entries</label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalEntries}
                  onChange={(e) => setFormData({ ...formData, totalEntries: e.target.value })}
                  className="input"
                  placeholder="20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Score</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  className="input"
                  placeholder="85.5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Points</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                  className="input"
                  placeholder="10"
                />
              </div>
            </div>
          </div>

          {/* Prize Money */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Prize Money ($)</label>
            <input
              type="number"
              step="0.01"
              value={formData.prizeMoney}
              onChange={(e) => setFormData({ ...formData, prizeMoney: e.target.value })}
              className="input"
              placeholder="0.00"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isChampion}
                onChange={(e) => setFormData({ ...formData, isChampion: e.target.checked })}
                className="rounded border-border"
              />
              <span className="text-sm text-muted-foreground">🏆 Champion</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isReserve}
                onChange={(e) => setFormData({ ...formData, isReserve: e.target.checked })}
                className="rounded border-border"
              />
              <span className="text-sm text-muted-foreground">🥈 Reserve Champion</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isQualified}
                onChange={(e) => setFormData({ ...formData, isQualified: e.target.checked })}
                className="rounded border-border"
              />
              <span className="text-sm text-muted-foreground">✓ Qualified</span>
            </label>
          </div>

          {formData.isQualified && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Qualified For</label>
              <input
                type="text"
                value={formData.qualifiedFor}
                onChange={(e) => setFormData({ ...formData, qualifiedFor: e.target.value })}
                className="input"
                placeholder="World Championship, Zone Finals, etc."
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input"
              rows={2}
              placeholder="Any additional details..."
            />
          </div>
        </form>

        <div className="flex gap-3 p-6 border-t border-border sticky bottom-0 bg-card">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.eventName}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Trophy className="w-4 h-4" />
                Save Result
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
