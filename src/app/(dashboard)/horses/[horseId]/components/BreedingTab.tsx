'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, Plus, Loader2, Calendar, Baby, GitBranch, Pencil, Trash2, FileText } from 'lucide-react';
import { HeatCycleTimeline } from '@/components/breeding/HeatCycleTimeline';
import { BreedingStatusBadge } from '@/components/breeding/BreedingStatusBadge';
import { LogHeatCycleModal } from '@/components/breeding/LogHeatCycleModal';
import { RecordBreedingModal, type BreedingFormData } from '@/components/breeding/RecordBreedingModal';
import { RecordFoalingModal } from '@/components/breeding/RecordFoalingModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/lib/toast';

interface HeatCycle {
  id: string;
  horseId: string;
  startDate: string;
  endDate?: string | null;
  intensity?: string | null;
  signs?: string[];
  notes?: string | null;
  predictedNextDate?: string | null;
  cycleLength: number;
}

interface BreedingRecord {
  id: string;
  mareId: string;
  stallionId?: string | null;
  externalStallionId?: string | null;
  breedingDate: string;
  breedingType: string;
  status: string;
  estimatedDueDate?: string | null;
  veterinarian?: string | null;
  cost?: number | null;
  notes?: string | null;
  pregnancyCheckDate?: string | null;
  pregnancyCheckResult?: string | null;
  mare?: { id: string; barnName: string; profilePhotoUrl?: string | null };
  stallion?: { id: string; barnName: string } | null;
  externalStallion?: { id: string; name: string; studFarm?: string | null } | null;
  foalingRecord?: { id: string; actualDate: string; foalName?: string | null; outcome: string; foalId?: string | null } | null;
}

interface FoalingRecord {
  id: string;
  breedingRecordId?: string;
  actualDate: string;
  foalName?: string | null;
  foalSex?: string | null;
  foalColor?: string | null;
  birthWeight?: number | null;
  outcome: string;
  complications?: string | null;
  veterinarian?: string | null;
  notes?: string | null;
  foal?: { id: string; barnName: string; profilePhotoUrl?: string | null } | null;
  breedingRecord?: {
    stallion?: { id: string; barnName: string } | null;
    externalStallion?: { id: string; name: string } | null;
  } | null;
}

interface SimpleHorse {
  id: string;
  barnName: string;
  sex?: string | null;
  profilePhotoUrl?: string | null;
  sireId?: string | null;
  damId?: string | null;
}

interface ExternalStallion {
  id: string;
  name: string;
  studFarm: string | null;
}

interface BreedingTabProps {
  horse: {
    id: string;
    barnName: string;
    sex?: string | null;
    sireId?: string | null;
    damId?: string | null;
    profilePhotoUrl?: string | null;
  };
  barnId: string;
  canEdit?: boolean;
}

const BREEDING_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED_PREGNANT', label: 'Confirmed Pregnant' },
  { value: 'NOT_PREGNANT', label: 'Not Pregnant' },
  { value: 'REBREED', label: 'Rebreed' },
  { value: 'FOALED', label: 'Foaled' },
];

export function BreedingTab({ horse, barnId, canEdit = true }: BreedingTabProps) {
  const router = useRouter();
  const isMare = horse.sex === 'MARE' || horse.sex === 'FILLY';
  const isStallion = horse.sex === 'STALLION' || horse.sex === 'COLT';

  const [heatCycles, setHeatCycles] = useState<HeatCycle[]>([]);
  const [breedingRecords, setBreedingRecords] = useState<BreedingRecord[]>([]);
  const [foalings, setFoalings] = useState<FoalingRecord[]>([]);
  const [allHorses, setAllHorses] = useState<SimpleHorse[]>([]);
  const [externalStallions, setExternalStallions] = useState<ExternalStallion[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showHeatCycleModal, setShowHeatCycleModal] = useState(false);
  const [showBreedingModal, setShowBreedingModal] = useState(false);
  const [showFoalingModal, setShowFoalingModal] = useState(false);

  // Edit states
  const [editingCycle, setEditingCycle] = useState<HeatCycle | null>(null);
  const [editingFoaling, setEditingFoaling] = useState<FoalingRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<BreedingRecord | null>(null);

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; title: string; description: string; onConfirm: () => void;
  }>({ open: false, title: '', description: '', onConfirm: () => {} });

  const mares = allHorses.filter(h => h.sex === 'MARE' || h.sex === 'FILLY');
  const stallions = allHorses.filter(h => h.sex === 'STALLION' || h.sex === 'COLT');

  const sire = horse.sireId ? allHorses.find(h => h.id === horse.sireId) ?? null : null;
  const dam = horse.damId ? allHorses.find(h => h.id === horse.damId) ?? null : null;
  const offspring = allHorses.filter(h =>
    (isStallion && h.sireId === horse.id) || (isMare && h.damId === horse.id)
  );

  const fetchData = useCallback(async () => {
    if (!barnId || !horse?.id) return;
    setLoading(true);
    try {
      const fetches: Promise<Response>[] = [
        fetch(`/api/barns/${barnId}/horses?pageSize=200`),
        fetch(`/api/barns/${barnId}/breeding/external-stallions`),
      ];
      if (isMare) {
        fetches.push(
          fetch(`/api/barns/${barnId}/breeding/heat-cycles?mareId=${horse.id}`),
          fetch(`/api/barns/${barnId}/breeding/records?mareId=${horse.id}`),
          fetch(`/api/barns/${barnId}/breeding/foalings?mareId=${horse.id}`),
        );
      } else if (isStallion) {
        fetches.push(fetch(`/api/barns/${barnId}/breeding/records?stallionId=${horse.id}`));
      }
      const responses = await Promise.all(fetches);
      const jsonData = await Promise.all(responses.map(r => r.json()));
      setAllHorses(jsonData[0]?.data || []);
      setExternalStallions(jsonData[1]?.data || []);
      if (isMare) {
        setHeatCycles(jsonData[2]?.data || []);
        setBreedingRecords(jsonData[3]?.data || []);
        setFoalings(jsonData[4]?.data || []);
      } else if (isStallion) {
        setBreedingRecords(jsonData[2]?.data || []);
      }
    } catch {
      // Errors handled silently
    } finally {
      setLoading(false);
    }
  }, [barnId, horse?.id, isMare, isStallion]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ---- Create handlers ----

  const handleLogHeatCycle = async (data: { horseId: string; startDate: string; endDate: string; intensity: string; signs: string[]; notes: string }) => {
    const res = await fetch(`/api/barns/${barnId}/breeding/heat-cycles`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      toast.error('Failed to log heat cycle', err.error || 'Please try again');
      throw new Error(err.error);
    }
    toast.success('Heat cycle logged');
    fetchData();
  };

  const handleRecordBreeding = async (data: BreedingFormData) => {
    const res = await fetch(`/api/barns/${barnId}/breeding/records`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, stallionId: data.stallionId || undefined, externalStallionId: data.externalStallionId || undefined }),
    });
    if (!res.ok) {
      const err = await res.json();
      toast.error('Failed to record breeding', err.error || 'Please try again');
      throw new Error(err.error);
    }
    toast.success('Breeding recorded');
    fetchData();
  };

  const handleRecordFoaling = async (data: { breedingRecordId: string; actualDate: string; foalSex: string; foalColor: string; foalName: string; birthWeight: string; outcome: string; complications: string; veterinarian: string; notes: string }) => {
    const res = await fetch(`/api/barns/${barnId}/breeding/foalings`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      toast.error('Failed to record foaling', err.error || 'Please try again');
      throw new Error(err.error);
    }
    const result = await res.json();
    if (data.outcome === 'LIVE' && result.data?.foalId) {
      toast.success('Foal added to barn!', 'Redirecting to their profile...');
      fetchData();
      router.push(`/horses/${result.data.foalId}`);
    } else {
      toast.success('Foaling recorded');
      fetchData();
    }
  };

  // ---- Edit handlers ----

  const handleEditHeatCycle = async (data: { horseId: string; startDate: string; endDate: string; intensity: string; signs: string[]; notes: string }) => {
    if (!editingCycle) return;
    const res = await fetch(`/api/barns/${barnId}/breeding/heat-cycles/${editingCycle.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endDate: data.endDate || null, intensity: data.intensity, signs: data.signs, notes: data.notes }),
    });
    if (!res.ok) { const err = await res.json(); toast.error('Failed to update heat cycle', err.error); throw new Error(err.error); }
    toast.success('Heat cycle updated');
    setEditingCycle(null);
    fetchData();
  };

  const handleEditFoaling = async (data: { breedingRecordId: string; actualDate: string; foalSex: string; foalColor: string; foalName: string; birthWeight: string; outcome: string; complications: string; veterinarian: string; notes: string }) => {
    if (!editingFoaling) return;
    const res = await fetch(`/api/barns/${barnId}/breeding/foalings/${editingFoaling.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foalName: data.foalName, foalSex: data.foalSex, foalColor: data.foalColor, birthWeight: data.birthWeight, complications: data.complications, veterinarian: data.veterinarian, notes: data.notes }),
    });
    if (!res.ok) { const err = await res.json(); toast.error('Failed to update foaling record', err.error); throw new Error(err.error); }
    toast.success('Foaling record updated');
    setEditingFoaling(null);
    fetchData();
  };

  const handleEditBreedingRecord = async (data: BreedingFormData) => {
    if (!editingRecord) return;
    const res = await fetch(`/api/barns/${barnId}/breeding/records/${editingRecord.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estimatedDueDate: data.estimatedDueDate || null,
        veterinarian: data.veterinarian || null,
        cost: data.cost || null,
        notes: data.notes || null,
        pregnancyCheckDate: data.pregnancyCheckDate || null,
        pregnancyCheckResult: data.pregnancyCheckResult || null,
      }),
    });
    if (!res.ok) { const err = await res.json(); toast.error('Failed to update breeding record', err.error); throw new Error(err.error); }
    toast.success('Breeding record updated');
    setEditingRecord(null);
    fetchData();
  };

  const handleUpdateStatus = async (recordId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/barns/${barnId}/breeding/records/${recordId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) { const err = await res.json(); toast.error('Failed to update status', err.error); return; }
      toast.success('Status updated');
      fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  // ---- Delete handlers ----

  const handleDeleteHeatCycle = async (cycleId: string) => {
    try {
      const res = await fetch(`/api/barns/${barnId}/breeding/heat-cycles/${cycleId}`, { method: 'DELETE' });
      if (!res.ok) { const err = await res.json(); toast.error('Failed to delete', err.error); return; }
      toast.success('Heat cycle deleted');
      fetchData();
    } catch { toast.error('Failed to delete heat cycle'); }
  };

  const handleDeleteBreedingRecord = async (recordId: string) => {
    try {
      const res = await fetch(`/api/barns/${barnId}/breeding/records/${recordId}`, { method: 'DELETE' });
      if (!res.ok) { const err = await res.json(); toast.error('Cannot delete', err.error); return; }
      toast.success('Breeding record deleted');
      fetchData();
    } catch { toast.error('Failed to delete breeding record'); }
  };

  const handleDeleteFoaling = async (foalingId: string) => {
    try {
      const res = await fetch(`/api/barns/${barnId}/breeding/foalings/${foalingId}`, { method: 'DELETE' });
      if (!res.ok) { const err = await res.json(); toast.error('Failed to delete', err.error); return; }
      toast.success('Foaling record deleted');
      fetchData();
    } catch { toast.error('Failed to delete foaling record'); }
  };

  const confirmDelete = (title: string, description: string, onConfirm: () => void) => {
    setConfirmDialog({ open: true, title, description, onConfirm: () => { setConfirmDialog(prev => ({ ...prev, open: false })); onConfirm(); } });
  };

  // ---- Helpers ----

  const getCurrentStatus = (): { label: string; color: string } => {
    const pregnant = breedingRecords.find(r => r.status === 'CONFIRMED_PREGNANT');
    if (pregnant) return { label: 'Pregnant', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' };
    if (heatCycles.length > 0) {
      const latest = heatCycles[0];
      const start = new Date(latest.startDate);
      const end = latest.endDate ? new Date(latest.endDate) : new Date(start.getTime() + 5 * 24 * 60 * 60 * 1000);
      if (new Date() >= start && new Date() <= end) {
        return { label: 'In Heat', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400' };
      }
    }
    return { label: 'Not in Heat', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' };
  };

  const getStallionName = (record: BreedingRecord): string =>
    record.stallion?.barnName || record.externalStallion?.name || 'Unknown Stallion';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mare sections */}
      {isMare && (
        <>
          {/* Current Status */}
          <div className="card p-4 sm:p-6">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-pink-500" />
              Current Status
            </h3>
            {(() => {
              const status = getCurrentStatus();
              const pregnantRecord = breedingRecords.find(r => r.status === 'CONFIRMED_PREGNANT');
              return (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                      {status.label}
                    </span>
                    {status.label === 'Pregnant' && pregnantRecord?.estimatedDueDate && (
                      <span className="text-sm text-muted-foreground">
                        Due {new Date(pregnantRecord.estimatedDueDate).toLocaleDateString()}
                      </span>
                    )}
                    {status.label === 'Not in Heat' && heatCycles.length > 0 && heatCycles[0].predictedNextDate && (
                      <span className="text-sm text-muted-foreground">
                        Next predicted: {new Date(heatCycles[0].predictedNextDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {/* Pregnancy document upload prompt */}
                  {status.label === 'Pregnant' && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                      <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-blue-900 dark:text-blue-300">
                          Track pregnancy progress — upload ultrasound photos, milk test results, and vet reports.
                        </p>
                        <Link
                          href="/documents"
                          className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          Upload Pregnancy Documents
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Heat Cycle Timeline */}
          <div className="card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-pink-500" />
                Heat Cycles
              </h3>
              {canEdit && (
                <button onClick={() => { setEditingCycle(null); setShowHeatCycleModal(true); }} className="btn-secondary btn-sm" aria-label="Log heat cycle">
                  <Plus className="w-4 h-4" />
                  Log Cycle
                </button>
              )}
            </div>
            <HeatCycleTimeline cycles={heatCycles} />
            {canEdit && heatCycles.length > 0 && (
              <div className="mt-3 space-y-1">
                {heatCycles.map(cycle => (
                  <div key={cycle.id} className="flex items-center justify-between text-xs text-muted-foreground py-1">
                    <span>{new Date(cycle.startDate).toLocaleDateString()}{cycle.endDate ? ` - ${new Date(cycle.endDate).toLocaleDateString()}` : ''}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingCycle(cycle); setShowHeatCycleModal(true); }} className="p-1 rounded hover:bg-muted" aria-label="Edit heat cycle">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => confirmDelete('Delete heat cycle?', 'This action cannot be undone.', () => handleDeleteHeatCycle(cycle.id))} className="p-1 rounded hover:bg-muted hover:text-destructive transition-colors" aria-label="Delete heat cycle">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Breeding History */}
          <div className="card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-500" />
                Breeding History
              </h3>
              {canEdit && (
                <button onClick={() => { setEditingRecord(null); setShowBreedingModal(true); }} className="btn-secondary btn-sm" aria-label="Record breeding">
                  <Plus className="w-4 h-4" />
                  Record Breeding
                </button>
              )}
            </div>
            {breedingRecords.length > 0 ? (
              <div className="space-y-2">
                {breedingRecords.map(record => (
                  <div key={record.id} className="p-3 rounded-xl bg-background">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{getStallionName(record)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(record.breedingDate).toLocaleDateString()}
                          {record.estimatedDueDate && <> &middot; Due {new Date(record.estimatedDueDate).toLocaleDateString()}</>}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <BreedingStatusBadge status={record.breedingType} />
                        {canEdit ? (
                          <select
                            value={record.status}
                            onChange={(e) => handleUpdateStatus(record.id, e.target.value)}
                            className="text-xs rounded-lg border border-border bg-card px-2 py-1 text-foreground"
                            aria-label={`Update status`}
                          >
                            {BREEDING_STATUSES.map(s => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        ) : (
                          <BreedingStatusBadge status={record.status} />
                        )}
                        {canEdit && (
                          <>
                            <button
                              onClick={() => { setEditingRecord(record); setShowBreedingModal(true); }}
                              className="p-1 rounded hover:bg-muted text-muted-foreground"
                              aria-label="Edit breeding record"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => confirmDelete('Delete breeding record?', 'Records with foaling data cannot be deleted.', () => handleDeleteBreedingRecord(record.id))}
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                              aria-label="Delete breeding record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No breeding records</p>
            )}
          </div>

          {/* Foaling History */}
          <div className="card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Baby className="w-4 h-4 text-emerald-500" />
                Foaling History
              </h3>
              {canEdit && breedingRecords.length > 0 && (
                <button onClick={() => { setEditingFoaling(null); setShowFoalingModal(true); }} className="btn-secondary btn-sm" aria-label="Record foaling">
                  <Plus className="w-4 h-4" />
                  Record Foaling
                </button>
              )}
            </div>
            {foalings.length > 0 ? (
              <div className="space-y-2">
                {foalings.map(foaling => {
                  const sireDisplay = foaling.breedingRecord?.stallion?.barnName || foaling.breedingRecord?.externalStallion?.name || 'Unknown';
                  return (
                    <div key={foaling.id} className="p-3 rounded-xl bg-background">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="min-w-0">
                          {foaling.foal ? (
                            <Link href={`/horses/${foaling.foal.id}`} className="font-medium text-foreground text-sm hover:text-primary transition-colors truncate block">
                              {foaling.foal.barnName}
                            </Link>
                          ) : (
                            <p className="font-medium text-foreground text-sm truncate">{foaling.foalName || 'Unnamed Foal'}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(foaling.actualDate).toLocaleDateString()} &middot; Sire: {sireDisplay}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <BreedingStatusBadge status={foaling.outcome} />
                          {canEdit && (
                            <>
                              <button onClick={() => { setEditingFoaling(foaling); setShowFoalingModal(true); }} className="p-1 rounded hover:bg-muted text-muted-foreground" aria-label="Edit foaling record">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => confirmDelete('Delete foaling record?', 'This will reset the breeding record status.', () => handleDeleteFoaling(foaling.id))} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors" aria-label="Delete foaling record">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No foaling records</p>
            )}
          </div>
        </>
      )}

      {/* Stallion sections */}
      {isStallion && (
        <>
          {/* Breeding History */}
          <div className="card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-500" />
                Breeding History
              </h3>
              {canEdit && (
                <button onClick={() => { setEditingRecord(null); setShowBreedingModal(true); }} className="btn-secondary btn-sm" aria-label="Record breeding">
                  <Plus className="w-4 h-4" />
                  Record Breeding
                </button>
              )}
            </div>
            {breedingRecords.length > 0 ? (
              <div className="space-y-2">
                {breedingRecords.map(record => (
                  <div key={record.id} className="p-3 rounded-xl bg-background">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{record.mare?.barnName || 'Unknown Mare'}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(record.breedingDate).toLocaleDateString()}
                          {record.estimatedDueDate && <> &middot; Due {new Date(record.estimatedDueDate).toLocaleDateString()}</>}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <BreedingStatusBadge status={record.breedingType} />
                        {canEdit ? (
                          <select
                            value={record.status}
                            onChange={(e) => handleUpdateStatus(record.id, e.target.value)}
                            className="text-xs rounded-lg border border-border bg-card px-2 py-1 text-foreground"
                            aria-label={`Update status`}
                          >
                            {BREEDING_STATUSES.map(s => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        ) : (
                          <BreedingStatusBadge status={record.status} />
                        )}
                        {canEdit && (
                          <>
                            <button
                              onClick={() => { setEditingRecord(record); setShowBreedingModal(true); }}
                              className="p-1 rounded hover:bg-muted text-muted-foreground"
                              aria-label="Edit breeding record"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => confirmDelete('Delete breeding record?', 'Records with foaling data cannot be deleted.', () => handleDeleteBreedingRecord(record.id))}
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                              aria-label="Delete breeding record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No breeding records</p>
            )}
          </div>

          {/* Offspring */}
          <div className="card p-4 sm:p-6">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
              <Baby className="w-4 h-4 text-emerald-500" />
              Offspring ({offspring.length})
            </h3>
            {offspring.length > 0 ? (
              <div className="space-y-2">
                {offspring.map(foal => (
                  <Link key={foal.id} href={`/horses/${foal.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-background hover:bg-accent transition-colors">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                      {foal.profilePhotoUrl ? (
                        <Image src={foal.profilePhotoUrl} alt="" fill unoptimized className="object-cover" />
                      ) : (
                        <Baby className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground truncate">{foal.barnName}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No registered offspring</p>
            )}
          </div>
        </>
      )}

      {/* Sire & Dam (quick reference — full family tree on main page) */}
      {(sire || dam) && (
        <div className="card p-4 sm:p-6">
          <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
            <GitBranch className="w-4 h-4 text-indigo-500" />
            Sire &amp; Dam
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Sire</p>
              {sire ? (
                <Link href={`/horses/${sire.id}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  {sire.barnName}
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">Unknown</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Dam</p>
              {dam ? (
                <Link href={`/horses/${dam.id}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  {dam.barnName}
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">Unknown</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <LogHeatCycleModal
        open={showHeatCycleModal}
        onClose={() => { setShowHeatCycleModal(false); setEditingCycle(null); }}
        onSubmit={editingCycle ? handleEditHeatCycle : handleLogHeatCycle}
        mares={mares.map(m => ({ id: m.id, barnName: m.barnName }))}
        preselectedMareId={isMare ? horse.id : undefined}
        editCycle={editingCycle}
      />
      <RecordBreedingModal
        open={showBreedingModal}
        onClose={() => { setShowBreedingModal(false); setEditingRecord(null); }}
        onSubmit={editingRecord ? handleEditBreedingRecord : handleRecordBreeding}
        mares={mares.map(m => ({ id: m.id, barnName: m.barnName }))}
        stallions={stallions.map(s => ({ id: s.id, barnName: s.barnName }))}
        externalStallions={externalStallions}
        preselectedMareId={isMare ? horse.id : undefined}
        editRecord={editingRecord}
      />
      <RecordFoalingModal
        open={showFoalingModal}
        onClose={() => { setShowFoalingModal(false); setEditingFoaling(null); }}
        onSubmit={editingFoaling ? handleEditFoaling : handleRecordFoaling}
        breedingRecords={breedingRecords.map(r => ({
          id: r.id,
          mareId: r.mareId,
          mare: r.mare ? { barnName: r.mare.barnName } : undefined,
          stallion: r.stallion ? { barnName: r.stallion.barnName } : null,
          externalStallion: r.externalStallion ? { name: r.externalStallion.name } : null,
          estimatedDueDate: r.estimatedDueDate,
        }))}
        editFoaling={editingFoaling}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant="danger"
        confirmLabel="Delete"
      />
    </div>
  );
}
