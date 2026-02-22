'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useBarn } from '@/contexts/BarnContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { FeatureGate } from '@/components/subscription/FeatureGate';
import { LogHeatCycleModal } from '@/components/breeding/LogHeatCycleModal';
import { RecordBreedingModal, type BreedingFormData } from '@/components/breeding/RecordBreedingModal';
import { RecordFoalingModal } from '@/components/breeding/RecordFoalingModal';
import { ExternalStallionModal, type ExternalStallionFormData } from '@/components/breeding/ExternalStallionModal';
import { BreedingStatusBadge } from '@/components/breeding/BreedingStatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/lib/toast';
import { csrfFetch } from '@/lib/fetch';
import { hasPermission, BarnRole } from '@/types';
import { Heart, Baby, Calendar, Star, Plus, Loader2, Pencil, Trash2, User, ArrowRight, CheckCircle2, Search } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

interface BreedingStats {
  maresInHeat: number;
  activePregnancies: number;
  upcomingDueDates: number;
  foalsThisYear: number;
}
interface HeatCycle {
  id: string; horseId: string;
  horse: { id: string; barnName: string; profilePhotoUrl?: string | null };
  startDate: string; endDate: string | null; intensity: string | null;
  signs: string[]; notes: string | null; predictedNextDate: string | null;
  cycleLength: number;
}
interface BreedingRecord {
  id: string; mareId: string;
  mare: { id: string; barnName: string; profilePhotoUrl?: string | null };
  stallion: { id: string; barnName: string } | null;
  externalStallion: { id: string; name: string; studFarm: string | null } | null;
  breedingDate: string; breedingType: string; status: string;
  estimatedDueDate: string | null;
  veterinarian?: string | null; cost?: number | null; notes?: string | null;
  pregnancyCheckDate?: string | null; pregnancyCheckResult?: string | null;
  foalingRecord: { id: string; actualDate: string; foalName: string | null; outcome: string; foalId: string | null } | null;
}
interface FoalingRecord {
  id: string; mareId: string;
  breedingRecordId?: string;
  mare: { id: string; barnName: string; profilePhotoUrl?: string | null };
  foal: { id: string; barnName: string; profilePhotoUrl?: string | null } | null;
  actualDate: string; foalName: string | null; foalSex: string | null; foalColor?: string | null;
  birthWeight?: number | null; outcome: string; complications?: string | null;
  veterinarian?: string | null; notes?: string | null;
  breedingRecord: {
    stallion: { id: string; barnName: string } | null;
    externalStallion: { id: string; name: string } | null;
  } | null;
}
interface Horse { id: string; barnName: string; sex: string | null }
interface ExternalStallionFull {
  id: string; name: string; registrationNumber?: string | null;
  breed?: string | null; color?: string | null;
  studFarm?: string | null; studFarmLocation?: string | null;
  contactName?: string | null; contactPhone?: string | null; contactEmail?: string | null;
  fee?: number | null; notes?: string | null;
}

type Tab = 'heat-cycles' | 'records' | 'pregnancies' | 'foalings' | 'stallions';
const TABS: { key: Tab; label: string }[] = [
  { key: 'heat-cycles', label: 'Heat Cycles' },
  { key: 'records', label: 'Breeding Records' },
  { key: 'pregnancies', label: 'Pregnancies' },
  { key: 'foalings', label: 'Foaling History' },
  { key: 'stallions', label: 'External Stallions' },
];

const BREEDING_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED_PREGNANT', label: 'Confirmed Pregnant' },
  { value: 'NOT_PREGNANT', label: 'Not Pregnant' },
  { value: 'REBREED', label: 'Rebreed' },
  { value: 'FOALED', label: 'Foaled' },
];

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
function dueDateBadge(dateStr: string) {
  const days = daysUntil(dateStr);
  if (days < 0) return { label: 'Overdue', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
  if (days < 30) return { label: `${days}d`, color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
  if (days <= 60) return { label: `${days}d`, color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' };
  return { label: `${days}d`, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
}
function getStallionName(r: BreedingRecord) {
  return r.stallion?.barnName || r.externalStallion?.name || 'Unknown Stallion';
}

export default function BreedingPage() {
  const { currentBarn, isMember } = useBarn();
  useSubscription();
  const barnId = currentBarn?.id;
  const canEdit = isMember && currentBarn?.role
    ? hasPermission(currentBarn.role as BarnRole, 'horses:write') : false;

  const [stats, setStats] = useState<BreedingStats>({ maresInHeat: 0, activePregnancies: 0, upcomingDueDates: 0, foalsThisYear: 0 });
  const [heatCycles, setHeatCycles] = useState<HeatCycle[]>([]);
  const [breedingRecords, setBreedingRecords] = useState<BreedingRecord[]>([]);
  const [foalings, setFoalings] = useState<FoalingRecord[]>([]);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [externalStallions, setExternalStallions] = useState<ExternalStallionFull[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('heat-cycles');

  // Modal states
  const [showHeatModal, setShowHeatModal] = useState(false);
  const [showBreedingModal, setShowBreedingModal] = useState(false);
  const [showFoalingModal, setShowFoalingModal] = useState(false);
  const [showStallionModal, setShowStallionModal] = useState(false);

  // Edit states
  const [editingCycle, setEditingCycle] = useState<HeatCycle | null>(null);
  const [editingFoaling, setEditingFoaling] = useState<FoalingRecord | null>(null);
  const [editingStallion, setEditingStallion] = useState<ExternalStallionFull | null>(null);
  const [editingRecord, setEditingRecord] = useState<BreedingRecord | null>(null);

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; title: string; description: string; onConfirm: () => void;
  }>({ open: false, title: '', description: '', onConfirm: () => {} });

  const mares = horses.filter(h => h.sex === 'MARE' || h.sex === 'FILLY');
  const stallions = horses.filter(h => h.sex === 'STALLION' || h.sex === 'COLT');
  const pregnancies = breedingRecords.filter(r => r.status === 'CONFIRMED_PREGNANT');
  const foalableRecords = breedingRecords.filter(r => r.status === 'CONFIRMED_PREGNANT' && !r.foalingRecord);

  const fetchData = useCallback(async () => {
    if (!barnId) return;
    setIsLoading(true);
    try {
      const [statsRes, cyclesRes, recordsRes, foalingsRes, horsesRes, extRes] = await Promise.all([
        fetch(`/api/barns/${barnId}/breeding/stats`),
        fetch(`/api/barns/${barnId}/breeding/heat-cycles`),
        fetch(`/api/barns/${barnId}/breeding/records`),
        fetch(`/api/barns/${barnId}/breeding/foalings`),
        fetch(`/api/barns/${barnId}/horses`),
        fetch(`/api/barns/${barnId}/breeding/external-stallions`),
      ]);
      if (statsRes.ok) { const j = await statsRes.json(); setStats(j.data); }
      if (cyclesRes.ok) { const j = await cyclesRes.json(); setHeatCycles(j.data || []); }
      if (recordsRes.ok) { const j = await recordsRes.json(); setBreedingRecords(j.data || []); }
      if (foalingsRes.ok) { const j = await foalingsRes.json(); setFoalings(j.data || []); }
      if (horsesRes.ok) { const j = await horsesRes.json(); setHorses(j.data || []); }
      if (extRes.ok) { const j = await extRes.json(); setExternalStallions(j.data || []); }
    } catch (error) {
      console.error('Error fetching breeding data:', error);
      toast.error('Failed to load data', 'Could not fetch breeding information');
    } finally {
      setIsLoading(false);
    }
  }, [barnId]);

  useEffect(() => { if (barnId) fetchData(); }, [barnId, fetchData]);

  // ---- Create handlers ----

  const handleLogHeatCycle = async (data: { horseId: string; startDate: string; endDate: string; intensity: string; signs: string[]; notes: string }) => {
    const res = await csrfFetch(`/api/barns/${barnId}/breeding/heat-cycles`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    if (!res.ok) { const err = await res.json(); toast.error('Failed to log heat cycle', err.error || 'Please try again'); throw new Error(err.error); }
    toast.success('Heat cycle logged', 'Cycle recorded and next heat predicted');
    fetchData();
  };

  const handleRecordBreeding = async (data: { mareId: string; stallionId: string; externalStallionId: string; breedingDate: string; breedingType: string; veterinarian: string; facility: string; cost: string; notes: string }) => {
    const res = await csrfFetch(`/api/barns/${barnId}/breeding/records`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, stallionId: data.stallionId || null, externalStallionId: data.externalStallionId || null }),
    });
    if (!res.ok) { const err = await res.json(); toast.error('Failed to record breeding', err.error || 'Please try again'); throw new Error(err.error); }
    toast.success('Breeding recorded', 'Pregnancy check reminder created');
    fetchData();
  };

  const handleRecordFoaling = async (data: { breedingRecordId: string; actualDate: string; foalSex: string; foalColor: string; foalName: string; birthWeight: string; outcome: string; complications: string; veterinarian: string; notes: string }) => {
    const res = await csrfFetch(`/api/barns/${barnId}/breeding/foalings`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    if (!res.ok) { const err = await res.json(); toast.error('Failed to record foaling', err.error || 'Please try again'); throw new Error(err.error); }
    toast.success('Foaling recorded', 'Foal added to your herd');
    fetchData();
  };

  // ---- Edit handlers ----

  const handleEditHeatCycle = async (data: { horseId: string; startDate: string; endDate: string; intensity: string; signs: string[]; notes: string }) => {
    if (!editingCycle) return;
    const res = await csrfFetch(`/api/barns/${barnId}/breeding/heat-cycles/${editingCycle.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endDate: data.endDate || null, intensity: data.intensity, signs: data.signs, notes: data.notes }),
    });
    if (!res.ok) { const err = await res.json(); toast.error('Failed to update heat cycle', err.error || 'Please try again'); throw new Error(err.error); }
    toast.success('Heat cycle updated');
    setEditingCycle(null);
    fetchData();
  };

  const handleEditFoaling = async (data: { breedingRecordId: string; actualDate: string; foalSex: string; foalColor: string; foalName: string; birthWeight: string; outcome: string; complications: string; veterinarian: string; notes: string }) => {
    if (!editingFoaling) return;
    const res = await csrfFetch(`/api/barns/${barnId}/breeding/foalings/${editingFoaling.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foalName: data.foalName, foalSex: data.foalSex, foalColor: data.foalColor, birthWeight: data.birthWeight, complications: data.complications, veterinarian: data.veterinarian, notes: data.notes }),
    });
    if (!res.ok) { const err = await res.json(); toast.error('Failed to update foaling record', err.error || 'Please try again'); throw new Error(err.error); }
    toast.success('Foaling record updated');
    setEditingFoaling(null);
    fetchData();
  };

  const handleUpdateStatus = async (recordId: string, newStatus: string) => {
    try {
      const res = await csrfFetch(`/api/barns/${barnId}/breeding/records/${recordId}`, {
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

  const handleEditBreedingRecord = async (data: BreedingFormData) => {
    if (!editingRecord) return;
    const res = await csrfFetch(`/api/barns/${barnId}/breeding/records/${editingRecord.id}`, {
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

  // ---- Delete handlers ----

  const handleDeleteHeatCycle = async (cycleId: string) => {
    try {
      const res = await csrfFetch(`/api/barns/${barnId}/breeding/heat-cycles/${cycleId}`, { method: 'DELETE' });
      if (!res.ok) { const err = await res.json(); toast.error('Failed to delete', err.error); return; }
      toast.success('Heat cycle deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete heat cycle');
    }
  };

  const handleDeleteBreedingRecord = async (recordId: string) => {
    try {
      const res = await csrfFetch(`/api/barns/${barnId}/breeding/records/${recordId}`, { method: 'DELETE' });
      if (!res.ok) { const err = await res.json(); toast.error('Cannot delete', err.error); return; }
      toast.success('Breeding record deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete breeding record');
    }
  };

  const handleDeleteFoaling = async (foalingId: string) => {
    try {
      const res = await csrfFetch(`/api/barns/${barnId}/breeding/foalings/${foalingId}`, { method: 'DELETE' });
      if (!res.ok) { const err = await res.json(); toast.error('Failed to delete', err.error); return; }
      toast.success('Foaling record deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete foaling record');
    }
  };

  // ---- External stallion handlers ----

  const handleCreateStallion = async (data: ExternalStallionFormData) => {
    const res = await csrfFetch(`/api/barns/${barnId}/breeding/external-stallions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    if (!res.ok) { const err = await res.json(); toast.error('Failed to add stallion', err.error || 'Please try again'); throw new Error(err.error); }
    toast.success('External stallion added');
    fetchData();
  };

  const handleEditStallion = async (data: ExternalStallionFormData) => {
    if (!editingStallion) return;
    const res = await csrfFetch(`/api/barns/${barnId}/breeding/external-stallions/${editingStallion.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    if (!res.ok) { const err = await res.json(); toast.error('Failed to update stallion', err.error || 'Please try again'); throw new Error(err.error); }
    toast.success('External stallion updated');
    setEditingStallion(null);
    fetchData();
  };

  const handleDeleteStallion = async (stallionId: string) => {
    try {
      const res = await csrfFetch(`/api/barns/${barnId}/breeding/external-stallions/${stallionId}`, { method: 'DELETE' });
      if (!res.ok) { const err = await res.json(); toast.error('Cannot delete', err.error); return; }
      toast.success('External stallion deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete stallion');
    }
  };

  // ---- Confirm dialog helpers ----

  const confirmDelete = (title: string, description: string, onConfirm: () => void) => {
    setConfirmDialog({ open: true, title, description, onConfirm: () => { setConfirmDialog(prev => ({ ...prev, open: false })); onConfirm(); } });
  };

  // ---- Action buttons per tab ----

  const actionButtons: Record<Tab, { label: string; onClick: () => void }> = {
    'heat-cycles': { label: 'Log Heat Cycle', onClick: () => { setEditingCycle(null); setShowHeatModal(true); } },
    records: { label: 'Record Breeding', onClick: () => { setEditingRecord(null); setShowBreedingModal(true); } },
    pregnancies: { label: 'Record Foaling', onClick: () => { setEditingFoaling(null); setShowFoalingModal(true); } },
    foalings: { label: 'Record Foaling', onClick: () => { setEditingFoaling(null); setShowFoalingModal(true); } },
    stallions: { label: 'Add Stallion', onClick: () => { setEditingStallion(null); setShowStallionModal(true); } },
  };
  const action = actionButtons[activeTab];

  if (!currentBarn) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a barn first</p>
      </div>
    );
  }

  return (
    <FeatureGate feature="breedingManagement">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Breeding' }]} />
      <div className="space-y-6 mt-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Breeding Management</h1>
            <p className="text-muted-foreground mt-1">Track heat cycles, breeding records, and foaling</p>
          </div>
          {canEdit && (
            <button onClick={action.onClick} className="btn-primary btn-md flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {action.label}
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {([
                { value: stats.maresInHeat, label: 'Mares in Heat', icon: Heart, accent: 'bg-pink-500/10', iconColor: 'text-pink-600', tab: 'heat-cycles' as Tab },
                { value: stats.activePregnancies, label: 'Active Pregnancies', icon: Baby, accent: 'bg-blue-500/10', iconColor: 'text-blue-600', tab: 'pregnancies' as Tab },
                { value: stats.upcomingDueDates, label: 'Upcoming Due Dates', icon: Calendar, accent: 'bg-amber-500/10', iconColor: 'text-amber-600', tab: 'pregnancies' as Tab },
                { value: stats.foalsThisYear, label: 'Foals This Year', icon: Star, accent: 'bg-green-500/10', iconColor: 'text-green-600', tab: 'foalings' as Tab },
              ] as const).map((card) => (
                <button
                  key={card.label}
                  onClick={() => setActiveTab(card.tab)}
                  className={`card p-4 text-left transition-all hover:ring-2 hover:ring-primary/20 ${activeTab === card.tab ? 'ring-2 ring-primary/40' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${card.accent}`}>
                      <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{card.value}</p>
                      <p className="text-sm text-muted-foreground">{card.label}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Getting Started Guide - show when no data exists */}
            {heatCycles.length === 0 && breedingRecords.length === 0 && foalings.length === 0 && canEdit && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-1">Getting Started with Breeding</h2>
                <p className="text-sm text-muted-foreground mb-4">Follow these steps to track your breeding program</p>
                <div className="grid sm:grid-cols-4 gap-3">
                  {([
                    { step: 1, label: 'Log Heat Cycle', desc: 'Track your mare\'s estrus cycles', icon: Heart, done: heatCycles.length > 0, action: () => { setEditingCycle(null); setShowHeatModal(true); } },
                    { step: 2, label: 'Record Breeding', desc: 'Log a breeding event with mare & stallion', icon: Baby, done: breedingRecords.length > 0, action: () => { setEditingRecord(null); setShowBreedingModal(true); } },
                    { step: 3, label: 'Track Pregnancy', desc: 'Monitor gestation & schedule vet checks', icon: Calendar, done: breedingRecords.some(r => r.status === 'CONFIRMED_PREGNANT'), action: null },
                    { step: 4, label: 'Record Foaling', desc: 'Document the birth & add foal to herd', icon: Star, done: foalings.length > 0, action: null },
                  ] as const).map((item) => (
                    <button
                      key={item.step}
                      onClick={item.action ?? undefined}
                      disabled={!item.action}
                      className={`relative p-4 rounded-xl border text-left transition-all ${
                        item.done
                          ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                          : item.action
                            ? 'bg-card border-border hover:border-primary hover:shadow-sm cursor-pointer'
                            : 'bg-muted/50 border-border opacity-60 cursor-default'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {item.done ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">{item.step}</span>
                        )}
                        <item.icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-foreground text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      {item.action && !item.done && (
                        <ArrowRight className="w-4 h-4 text-primary absolute top-4 right-4" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab Filters */}
            <div className="flex rounded-xl bg-muted p-1 overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.key ? 'bg-card shadow text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'heat-cycles' && (
              <HeatCyclesTab
                cycles={heatCycles}
                canEdit={canEdit}
                onAdd={() => { setEditingCycle(null); setShowHeatModal(true); }}
                onEdit={(cycle) => { setEditingCycle(cycle); setShowHeatModal(true); }}
                onDelete={(id) => confirmDelete('Delete heat cycle?', 'This action cannot be undone.', () => handleDeleteHeatCycle(id))}
              />
            )}
            {activeTab === 'records' && (
              <BreedingRecordsTab
                records={breedingRecords}
                canEdit={canEdit}
                onAdd={() => { setEditingRecord(null); setShowBreedingModal(true); }}
                onUpdateStatus={handleUpdateStatus}
                onEdit={(record) => { setEditingRecord(record); setShowBreedingModal(true); }}
                onDelete={(id) => confirmDelete('Delete breeding record?', 'This action cannot be undone. Records with foaling data cannot be deleted.', () => handleDeleteBreedingRecord(id))}
              />
            )}
            {activeTab === 'pregnancies' && (
              <PregnanciesTab
                pregnancies={pregnancies}
                canEdit={canEdit}
                onRecordFoaling={() => { setEditingFoaling(null); setShowFoalingModal(true); }}
                onUpdateStatus={handleUpdateStatus}
                onEdit={(record) => { setEditingRecord(record); setShowBreedingModal(true); }}
              />
            )}
            {activeTab === 'foalings' && (
              <FoalingsTab
                foalings={foalings}
                canEdit={canEdit}
                onAdd={() => { setEditingFoaling(null); setShowFoalingModal(true); }}
                onEdit={(foaling) => { setEditingFoaling(foaling); setShowFoalingModal(true); }}
                onDelete={(id) => confirmDelete('Delete foaling record?', 'This will reset the breeding record status. This action cannot be undone.', () => handleDeleteFoaling(id))}
              />
            )}
            {activeTab === 'stallions' && (
              <ExternalStallionsTab
                stallions={externalStallions}
                canEdit={canEdit}
                onAdd={() => { setEditingStallion(null); setShowStallionModal(true); }}
                onEdit={(s) => { setEditingStallion(s); setShowStallionModal(true); }}
                onDelete={(id) => confirmDelete('Delete external stallion?', 'Stallions with breeding records cannot be deleted.', () => handleDeleteStallion(id))}
              />
            )}
          </>
        )}

        {/* Modals */}
        <LogHeatCycleModal
          open={showHeatModal}
          onClose={() => { setShowHeatModal(false); setEditingCycle(null); }}
          onSubmit={editingCycle ? handleEditHeatCycle : handleLogHeatCycle}
          mares={mares}
          editCycle={editingCycle}
        />
        <RecordBreedingModal
          open={showBreedingModal}
          onClose={() => { setShowBreedingModal(false); setEditingRecord(null); }}
          onSubmit={editingRecord ? handleEditBreedingRecord : handleRecordBreeding}
          mares={mares}
          stallions={stallions}
          externalStallions={externalStallions.map(s => ({ id: s.id, name: s.name, studFarm: s.studFarm ?? null }))}
          onAddExternalStallion={() => { setShowBreedingModal(false); setEditingStallion(null); setShowStallionModal(true); }}
          editRecord={editingRecord}
        />
        <RecordFoalingModal
          open={showFoalingModal}
          onClose={() => { setShowFoalingModal(false); setEditingFoaling(null); }}
          onSubmit={editingFoaling ? handleEditFoaling : handleRecordFoaling}
          breedingRecords={foalableRecords}
          editFoaling={editingFoaling}
        />
        <ExternalStallionModal
          open={showStallionModal}
          onClose={() => { setShowStallionModal(false); setEditingStallion(null); }}
          onSubmit={editingStallion ? handleEditStallion : handleCreateStallion}
          editStallion={editingStallion}
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
    </FeatureGate>
  );
}

// ============================================================================
// Tab: Heat Cycles
// ============================================================================
function HeatCyclesTab({ cycles, canEdit, onAdd, onEdit, onDelete }: {
  cycles: HeatCycle[]; canEdit: boolean; onAdd: () => void;
  onEdit: (cycle: HeatCycle) => void; onDelete: (id: string) => void;
}) {
  if (cycles.length === 0) {
    return (
      <div className="card p-12 text-center">
        <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-medium text-foreground mb-1">No heat cycles recorded</p>
        <p className="text-muted-foreground text-sm mb-6">Start tracking your mares&apos; heat cycles to predict breeding windows.</p>
        {canEdit && (
          <button onClick={onAdd} className="btn-primary btn-md"><Plus className="w-4 h-4" /> Log First Heat Cycle</button>
        )}
      </div>
    );
  }
  return (
    <div className="card divide-y divide-border">
      {cycles.map(cycle => {
        const isActive = !cycle.endDate || new Date(cycle.endDate) >= new Date();
        return (
          <div key={cycle.id} className="p-4 hover:bg-accent transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center flex-shrink-0">
                <Heart className={`w-5 h-5 ${isActive ? 'text-pink-600 fill-pink-600' : 'text-pink-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/horses/${cycle.horse.id}`} className="font-medium text-foreground hover:text-primary transition-colors">{cycle.horse.barnName}</Link>
                  {cycle.intensity && <BreedingStatusBadge status={cycle.intensity} />}
                  {isActive && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400">In Heat</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(cycle.startDate).toLocaleDateString()}
                    {cycle.endDate && ` - ${new Date(cycle.endDate).toLocaleDateString()}`}
                  </span>
                  <span>Cycle: {cycle.cycleLength}d</span>
                </div>
                {cycle.predictedNextDate && (
                  <p className="text-xs text-muted-foreground mt-1">Predicted next: {new Date(cycle.predictedNextDate).toLocaleDateString()}</p>
                )}
                {cycle.signs && cycle.signs.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {cycle.signs.map(sign => (
                      <span key={sign} className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">{sign.replace(/_/g, ' ')}</span>
                    ))}
                  </div>
                )}
              </div>
              {canEdit && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => onEdit(cycle)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" aria-label="Edit heat cycle">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(cycle.id)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors" aria-label="Delete heat cycle">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Tab: Breeding Records
// ============================================================================
function BreedingRecordsTab({ records, canEdit, onAdd, onUpdateStatus, onEdit, onDelete }: {
  records: BreedingRecord[]; canEdit: boolean; onAdd: () => void;
  onUpdateStatus: (recordId: string, status: string) => void;
  onEdit: (record: BreedingRecord) => void;
  onDelete: (id: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  if (records.length === 0) {
    return (
      <div className="card p-12 text-center">
        <Baby className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-medium text-foreground mb-1">No breeding records yet</p>
        <p className="text-muted-foreground text-sm mb-6">Record breeding events to track pregnancies and due dates.</p>
        {canEdit && (
          <button onClick={onAdd} className="btn-primary btn-md"><Plus className="w-4 h-4" /> Record First Breeding</button>
        )}
      </div>
    );
  }

  const filtered = records.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const mareName = r.mare.barnName.toLowerCase();
      const stallionName = (r.stallion?.barnName || r.externalStallion?.name || '').toLowerCase();
      if (!mareName.includes(q) && !stallionName.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by mare or stallion name..."
            className="input w-full pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="input w-full sm:w-44"
          aria-label="Filter by status"
        >
          <option value="ALL">All Statuses</option>
          {BREEDING_STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-muted-foreground text-sm">No records match your search.</p>
        </div>
      ) : (
        <div className="card divide-y divide-border">
          {filtered.map(record => (
            <div key={record.id} className="p-4 hover:bg-accent transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Baby className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground">
                      <Link href={`/horses/${record.mare.id}`} className="hover:text-primary transition-colors">{record.mare.barnName}</Link>
                      {' x '}
                      {record.stallion ? (
                        <Link href={`/horses/${record.stallion.id}`} className="hover:text-primary transition-colors">{record.stallion.barnName}</Link>
                      ) : (
                        <span>{record.externalStallion?.name || 'Unknown Stallion'}</span>
                      )}
                    </p>
                    <BreedingStatusBadge status={record.breedingType} />
                    {canEdit ? (
                      <select
                        value={record.status}
                        onChange={(e) => onUpdateStatus(record.id, e.target.value)}
                        className="text-xs rounded-lg border border-border bg-card px-2 py-1 text-foreground"
                        aria-label={`Update status for ${record.mare.barnName}`}
                      >
                        {BREEDING_STATUSES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    ) : (
                      <BreedingStatusBadge status={record.status} />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(record.breedingDate).toLocaleDateString()}
                    </span>
                    {record.estimatedDueDate && <span>Due: {new Date(record.estimatedDueDate).toLocaleDateString()}</span>}
                  </div>
                </div>
                {canEdit && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onEdit(record)}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                      aria-label="Edit breeding record"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(record.id)}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Delete breeding record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Tab: Pregnancies
// ============================================================================
function PregnanciesTab({ pregnancies, canEdit, onRecordFoaling, onUpdateStatus, onEdit }: {
  pregnancies: BreedingRecord[]; canEdit: boolean; onRecordFoaling: () => void;
  onUpdateStatus: (recordId: string, status: string) => void;
  onEdit: (record: BreedingRecord) => void;
}) {
  if (pregnancies.length === 0) {
    return (
      <div className="card p-12 text-center">
        <Baby className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-medium text-foreground mb-1">No active pregnancies</p>
        <p className="text-muted-foreground text-sm mb-6">Confirmed pregnancies from breeding records will appear here with due date countdowns.</p>
      </div>
    );
  }
  return (
    <div className="card divide-y divide-border">
      {pregnancies.map(record => {
        const badge = record.estimatedDueDate ? dueDateBadge(record.estimatedDueDate) : null;
        const days = record.estimatedDueDate ? daysUntil(record.estimatedDueDate) : null;
        return (
          <div key={record.id} className="p-4 hover:bg-accent transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Baby className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/horses/${record.mare.id}`} className="font-medium text-foreground hover:text-primary transition-colors">{record.mare.barnName}</Link>
                  {canEdit ? (
                    <select
                      value={record.status}
                      onChange={(e) => onUpdateStatus(record.id, e.target.value)}
                      className="text-xs rounded-lg border border-border bg-card px-2 py-1 text-foreground"
                      aria-label={`Update status for ${record.mare.barnName}`}
                    >
                      {BREEDING_STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  ) : (
                    <BreedingStatusBadge status="CONFIRMED_PREGNANT" />
                  )}
                  {badge && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
                  <span>Sire: {record.stallion ? (
                    <Link href={`/horses/${record.stallion.id}`} className="hover:text-primary transition-colors">{record.stallion.barnName}</Link>
                  ) : (
                    record.externalStallion?.name || 'Unknown Stallion'
                  )}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Bred: {new Date(record.breedingDate).toLocaleDateString()}
                  </span>
                </div>
                {record.estimatedDueDate && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Due:</span>
                        <span className="font-medium text-foreground">{new Date(record.estimatedDueDate).toLocaleDateString()}</span>
                      </div>
                      {days !== null && (
                        <span className={`text-xs font-medium ${days < 0 ? 'text-red-600' : days <= 30 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                          {days >= 0 ? `${days} days remaining` : `${Math.abs(days)} days overdue`}
                        </span>
                      )}
                    </div>
                    {(() => {
                      const elapsed = Math.max(0, Date.now() - new Date(record.breedingDate).getTime());
                      const elapsedDays = Math.round(elapsed / 86400000);
                      const pct = Math.min(100, Math.round((elapsed / (340 * 86400000)) * 100));
                      const barColor = pct >= 90 ? 'bg-red-500' : pct >= 67 ? 'bg-amber-500' : pct >= 33 ? 'bg-blue-500' : 'bg-emerald-500';
                      const trimester = elapsedDays <= 113 ? '1st' : elapsedDays <= 226 ? '2nd' : '3rd';
                      return (
                        <div>
                          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${barColor} transition-all duration-500 rounded-full`} style={{ width: `${pct}%` }} />
                            {/* Trimester markers */}
                            <div className="absolute top-0 bottom-0 w-px bg-border" style={{ left: '33.2%' }} />
                            <div className="absolute top-0 bottom-0 w-px bg-border" style={{ left: '66.5%' }} />
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-[10px] text-muted-foreground">T1</span>
                            <span className="text-[10px] text-muted-foreground">T2</span>
                            <span className="text-[10px] text-muted-foreground">T3</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {trimester} trimester &middot; Day {elapsedDays} of ~340
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
              {canEdit && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => onEdit(record)}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                    aria-label="Edit pregnancy details"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {!record.foalingRecord && (
                    <button onClick={onRecordFoaling} className="btn-secondary btn-md text-xs">Record Foaling</button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Tab: Foaling History
// ============================================================================
function FoalingsTab({ foalings, canEdit, onAdd, onEdit, onDelete }: {
  foalings: FoalingRecord[]; canEdit: boolean; onAdd: () => void;
  onEdit: (foaling: FoalingRecord) => void; onDelete: (id: string) => void;
}) {
  if (foalings.length === 0) {
    return (
      <div className="card p-12 text-center">
        <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-medium text-foreground mb-1">No foaling records yet</p>
        <p className="text-muted-foreground text-sm mb-6">Foaling records will appear here once you record births from active pregnancies.</p>
        {canEdit && (
          <button onClick={onAdd} className="btn-primary btn-md"><Plus className="w-4 h-4" /> Record Foaling</button>
        )}
      </div>
    );
  }
  return (
    <div className="card divide-y divide-border">
      {foalings.map(foaling => {
        const sire = foaling.breedingRecord?.stallion?.barnName || foaling.breedingRecord?.externalStallion?.name || 'Unknown';
        return (
          <div key={foaling.id} className="p-4 hover:bg-accent transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/horses/${foaling.mare.id}`} className="font-medium text-foreground hover:text-primary transition-colors">{foaling.mare.barnName}</Link>
                  <BreedingStatusBadge status={foaling.outcome} />
                  {foaling.foalSex && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      {foaling.foalSex === 'COLT' ? 'Colt' : 'Filly'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(foaling.actualDate).toLocaleDateString()}
                  </span>
                  <span>Sire: {sire}</span>
                </div>
                {foaling.foal ? (
                  <p className="text-sm mt-1">
                    <span className="text-muted-foreground">Foal: </span>
                    <Link href={`/horses/${foaling.foal.id}`} className="text-primary hover:underline font-medium">{foaling.foal.barnName}</Link>
                  </p>
                ) : foaling.foalName ? (
                  <p className="text-sm text-muted-foreground mt-1">Foal: {foaling.foalName}</p>
                ) : null}
              </div>
              {canEdit && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => onEdit(foaling)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" aria-label="Edit foaling record">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(foaling.id)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors" aria-label="Delete foaling record">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Tab: External Stallions
// ============================================================================
function ExternalStallionsTab({ stallions, canEdit, onAdd, onEdit, onDelete }: {
  stallions: ExternalStallionFull[]; canEdit: boolean; onAdd: () => void;
  onEdit: (stallion: ExternalStallionFull) => void; onDelete: (id: string) => void;
}) {
  if (stallions.length === 0) {
    return (
      <div className="card p-12 text-center">
        <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-medium text-foreground mb-1">No external stallions registered</p>
        <p className="text-muted-foreground text-sm mb-6">Add external stallions to track studs used for breeding your mares.</p>
        {canEdit && (
          <button onClick={onAdd} className="btn-primary btn-md"><Plus className="w-4 h-4" /> Add First Stallion</button>
        )}
      </div>
    );
  }
  return (
    <div className="card divide-y divide-border">
      {stallions.map(stallion => (
        <div key={stallion.id} className="p-4 hover:bg-accent transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{stallion.name}</p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                {stallion.breed && <span>{stallion.breed}</span>}
                {stallion.color && <span>{stallion.color}</span>}
                {stallion.registrationNumber && <span>Reg: {stallion.registrationNumber}</span>}
              </div>
              {(stallion.studFarm || stallion.studFarmLocation) && (
                <p className="text-sm text-muted-foreground mt-1">
                  {stallion.studFarm}{stallion.studFarmLocation ? `, ${stallion.studFarmLocation}` : ''}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
                {stallion.contactName && <span>Contact: {stallion.contactName}</span>}
                {stallion.contactPhone && <span>{stallion.contactPhone}</span>}
                {stallion.contactEmail && <span>{stallion.contactEmail}</span>}
                {stallion.fee != null && <span className="font-medium">${stallion.fee.toLocaleString()}</span>}
              </div>
            </div>
            {canEdit && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => onEdit(stallion)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" aria-label="Edit stallion">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(stallion.id)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors" aria-label="Delete stallion">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
