'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, FileText, Loader2, Pencil, Pill, Plus, Printer, Trash2, X } from 'lucide-react';
import { FamilyTree } from './FamilyTree';
import { csrfFetch } from '@/lib/fetch';
import { toast } from '@/lib/toast';

interface HealthRecord {
  id: string;
  type: string;
  date: string;
  provider?: string;
  diagnosis?: string;
  treatment?: string;
  findings?: string;
  followUpNotes?: string;
  followUpDate?: string;
  cost?: number;
  attachments?: Array<{ id: string; url: string; filename?: string }>;
}

interface Vaccination {
  id: string;
  type: string;
  dateGiven: string;
  nextDueDate?: string;
  veterinarian?: string | null;
  notes?: string | null;
  manufacturer?: string | null;
  lotNumber?: string | null;
}

interface Weight {
  id: string;
  date: string;
  weight: number;
  bodyScore?: number;
}

interface CogginsRecord {
  id: string;
  testDate: string;
  expiryDate: string;
  veterinarian?: string;
  accessionNumber?: string;
  documentUrl?: string;
}

interface CogginsData {
  current?: CogginsRecord;
  isExpired?: boolean;
  expiresIn?: number;
  data?: CogginsRecord[];
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route?: string | null;
  instructions?: string | null;
  status?: string;
  logs?: Array<{
    id: string;
    givenAt: string;
    givenBy?: string | null;
    skipped: boolean;
    skipReason?: string | null;
    notes?: string | null;
  }>;
}

interface HealthTabProps {
  horse: {
    id: string;
    barnName?: string;
    registeredName?: string | null;
    breed?: string | null;
    color?: string | null;
    sex?: string | null;
    age?: number | null;
    ownerName?: string | null;
    sireId?: string | null;
    damId?: string | null;
    sireName?: string | null;
    damName?: string | null;
    profilePhotoUrl?: string | null;
    vaccinations?: Vaccination[];
    weights?: Weight[];
  };
  onLogWeight: () => void;
  onLogVaccination: () => void;
  onLogCoggins: () => void;
  barnId: string;
  canEdit?: boolean;
  onUpdate?: () => void;
  refreshKey?: number;
}

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

const vaccinationTypes = [
  { value: 'RABIES', label: 'Rabies' },
  { value: 'TETANUS', label: 'Tetanus' },
  { value: 'EWT_EEE_WEE_TETANUS', label: 'EWT / EEE / WEE / Tetanus' },
  { value: 'WEST_NILE', label: 'West Nile' },
  { value: 'INFLUENZA', label: 'Influenza' },
  { value: 'RHINOPNEUMONITIS', label: 'Rhinopneumonitis' },
  { value: 'STRANGLES', label: 'Strangles' },
  { value: 'POTOMAC_HORSE_FEVER', label: 'Potomac Horse Fever' },
  { value: 'BOTULISM', label: 'Botulism' },
  { value: 'OTHER', label: 'Other' },
];

export function HealthTab({ horse, onLogWeight, onLogVaccination, onLogCoggins, barnId, canEdit = true, onUpdate, refreshKey }: HealthTabProps) {
  const [coggins, setCoggins] = useState<CogginsData | null>(null);
  const [cogginsLoading, setCogginsLoading] = useState(true);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [healthRecordsLoading, setHealthRecordsLoading] = useState(true);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationsLoading, setMedicationsLoading] = useState(true);
  const [selectedHealthRecord, setSelectedHealthRecord] = useState<HealthRecord | null>(null);
  const [showHealthRecordModal, setShowHealthRecordModal] = useState(false);

  // Edit medication modal
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [editMedForm, setEditMedForm] = useState({ name: '', dosage: '', frequency: '', route: '', instructions: '', status: '' });
  const [savingMed, setSavingMed] = useState(false);

  // Edit vaccination modal
  const [editingVax, setEditingVax] = useState<Vaccination | null>(null);
  const [editVaxForm, setEditVaxForm] = useState({ type: '', dateGiven: '', nextDueDate: '', veterinarian: '', notes: '', manufacturer: '', lotNumber: '' });
  const [savingVax, setSavingVax] = useState(false);

  // Deleting state
  const [deletingMedId, setDeletingMedId] = useState<string | null>(null);
  const [deletingVaxId, setDeletingVaxId] = useState<string | null>(null);
  const [deletingWeightId, setDeletingWeightId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      if (!barnId || !horse?.id) return;

      try {
        const [cogginsResponse, healthResponse, medsResponse] = await Promise.all([
          fetch(`/api/barns/${barnId}/horses/${horse.id}/coggins`),
          fetch(`/api/barns/${barnId}/horses/${horse.id}/health`),
          fetch(`/api/barns/${barnId}/horses/${horse.id}/medications?status=ACTIVE`),
        ]);

        const cogginsData = await cogginsResponse.json();
        setCoggins(cogginsData);

        const healthData = await healthResponse.json();
        setHealthRecords(healthData.data || []);

        const medsData = await medsResponse.json();
        setMedications(medsData.data || []);
      } catch {
        // Errors handled silently
      } finally {
        setCogginsLoading(false);
        setHealthRecordsLoading(false);
        setMedicationsLoading(false);
      }
    };

    fetchHealthData();
  }, [barnId, horse?.id, refreshKey]);

  const openEditMed = (med: Medication) => {
    setEditingMed(med);
    setEditMedForm({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      route: med.route || 'ORAL',
      instructions: med.instructions || '',
      status: med.status || 'ACTIVE',
    });
  };

  const handleSaveMed = async () => {
    if (!editingMed) return;
    setSavingMed(true);
    try {
      const res = await csrfFetch(`/api/barns/${barnId}/horses/${horse.id}/medications/${editingMed.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editMedForm),
      });
      if (!res.ok) throw new Error('Failed to update');
      const { data } = await res.json();
      setMedications(prev => prev.map(m => m.id === data.id ? { ...m, ...data } : m).filter(m => m.status === 'ACTIVE'));
      setEditingMed(null);
      toast.success('Medication updated');
    } catch {
      toast.error('Failed to update medication');
    } finally {
      setSavingMed(false);
    }
  };

  const openEditVax = (vax: Vaccination) => {
    setEditingVax(vax);
    setEditVaxForm({
      type: vax.type,
      dateGiven: vax.dateGiven ? new Date(vax.dateGiven).toISOString().split('T')[0] : '',
      nextDueDate: vax.nextDueDate ? new Date(vax.nextDueDate).toISOString().split('T')[0] : '',
      veterinarian: vax.veterinarian || '',
      notes: vax.notes || '',
      manufacturer: vax.manufacturer || '',
      lotNumber: vax.lotNumber || '',
    });
  };

  const handleSaveVax = async () => {
    if (!editingVax) return;
    setSavingVax(true);
    try {
      const res = await csrfFetch(`/api/barns/${barnId}/horses/${horse.id}/vaccinations/${editingVax.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: editVaxForm.type,
          dateGiven: editVaxForm.dateGiven,
          nextDueDate: editVaxForm.nextDueDate || null,
          veterinarian: editVaxForm.veterinarian || null,
          notes: editVaxForm.notes || null,
          manufacturer: editVaxForm.manufacturer || null,
          lotNumber: editVaxForm.lotNumber || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setEditingVax(null);
      toast.success('Vaccination updated');
      onUpdate?.();
    } catch {
      toast.error('Failed to update vaccination');
    } finally {
      setSavingVax(false);
    }
  };

  const handleDeleteMed = async (medId: string) => {
    setDeletingMedId(medId);
    try {
      const res = await csrfFetch(`/api/barns/${barnId}/horses/${horse.id}/medications/${medId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setMedications(prev => prev.filter(m => m.id !== medId));
      toast.success('Medication removed');
    } catch {
      toast.error('Failed to delete medication');
    } finally {
      setDeletingMedId(null);
    }
  };

  const handleDeleteVax = async (vaxId: string) => {
    setDeletingVaxId(vaxId);
    try {
      const res = await csrfFetch(`/api/barns/${barnId}/horses/${horse.id}/vaccinations/${vaxId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Vaccination record removed');
      onUpdate?.();
    } catch {
      toast.error('Failed to delete vaccination');
    } finally {
      setDeletingVaxId(null);
    }
  };

  const handleDeleteWeight = async (weightId: string) => {
    setDeletingWeightId(weightId);
    try {
      const res = await csrfFetch(`/api/barns/${barnId}/horses/${horse.id}/weights/${weightId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Weight record removed');
      onUpdate?.();
    } catch {
      toast.error('Failed to delete weight record');
    } finally {
      setDeletingWeightId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Family Tree */}
      {barnId && horse.barnName && (
        <FamilyTree horse={{ ...horse, barnName: horse.barnName }} barnId={barnId} canEdit={canEdit} onUpdate={onUpdate} />
      )}

      {/* Print Button */}
      <div className="flex justify-end">
        <button onClick={() => window.print()} className="btn-secondary btn-sm">
          <Printer className="w-4 h-4" />
          Print Medical Report
        </button>
      </div>

      {/* Current Medications */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Pill className="w-4 h-4 text-purple-500" />
            Current Medications
          </h3>
          {canEdit && (
            <Link href={`/horses/${horse.id}/medications/new`} className="btn-secondary btn-sm">
              <Plus className="w-4 h-4" />
              Add Medication
            </Link>
          )}
        </div>
        {medicationsLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : medications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {medications.map((med) => (
              <div key={med.id} className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{med.name}</p>
                    <p className="text-sm text-muted-foreground">{med.dosage} &bull; {med.frequency}</p>
                    {med.route && <p className="text-xs text-muted-foreground mt-1">Route: {med.route}</p>}
                    {med.instructions && <p className="text-xs text-muted-foreground mt-1">{med.instructions}</p>}
                    {med.logs && med.logs.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-purple-100 dark:border-purple-900/50">
                        Last given: {new Date(med.logs[0].givenAt).toLocaleDateString()}
                        {med.logs[0].givenBy && ` by ${med.logs[0].givenBy}`}
                      </p>
                    )}
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditMed(med)}
                        className="p-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit medication"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMed(med.id)}
                        disabled={deletingMedId === med.id}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Delete medication"
                      >
                        {deletingMedId === med.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No active medications</p>
        )}
      </div>

      {/* Coggins Status */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Coggins Test</h3>
          {canEdit && (
            <button onClick={onLogCoggins} className="btn-secondary btn-sm">
              <Plus className="w-4 h-4" />
              Add Coggins
            </button>
          )}
        </div>
        {cogginsLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : coggins?.current ? (
          <div className={`p-4 rounded-xl ${coggins.isExpired ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {coggins.isExpired ? (
                <>
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="font-medium text-red-700">Expired</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="font-medium text-green-700">Valid</span>
                  {coggins.expiresIn && coggins.expiresIn <= 30 && (
                    <span className="badge-warning ml-2">Expires in {coggins.expiresIn} days</span>
                  )}
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Test Date</p>
                <p className="font-medium">{new Date(coggins.current.testDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Expiry Date</p>
                <p className="font-medium">{new Date(coggins.current.expiryDate).toLocaleDateString()}</p>
              </div>
              {coggins.current.veterinarian && (
                <div>
                  <p className="text-muted-foreground">Veterinarian</p>
                  <p className="font-medium">{coggins.current.veterinarian}</p>
                </div>
              )}
              {coggins.current.accessionNumber && (
                <div>
                  <p className="text-muted-foreground">Accession #</p>
                  <p className="font-medium">{coggins.current.accessionNumber}</p>
                </div>
              )}
            </div>
            {coggins.current.documentUrl && (
              <a
                href={coggins.current.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700"
              >
                <FileText className="w-4 h-4" />
                View Document
              </a>
            )}
          </div>
        ) : (
          <div className="text-center py-6 bg-background rounded-xl">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm mb-3">No Coggins on file</p>
            {canEdit && (
              <button onClick={onLogCoggins} className="btn-primary btn-sm">
                <Plus className="w-4 h-4" />
                Add Coggins Record
              </button>
            )}
          </div>
        )}

        {/* Coggins History */}
        {coggins?.data && coggins.data.length > 1 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm font-medium text-muted-foreground mb-2">History</p>
            <div className="space-y-2">
              {coggins.data.slice(1, 4).map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm p-2 rounded bg-background">
                  <span className="text-muted-foreground">{new Date(c.testDate).toLocaleDateString()}</span>
                  <span className={new Date(c.expiryDate) > new Date() ? 'text-green-600' : 'text-muted-foreground'}>
                    Exp: {new Date(c.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Vaccinations */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Vaccinations</h3>
          {canEdit && (
            <button onClick={onLogVaccination} className="btn-secondary btn-sm">
              <Plus className="w-4 h-4" />
              Log Vaccination
            </button>
          )}
        </div>
        {horse.vaccinations && horse.vaccinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {horse.vaccinations.map((vax) => {
              const isExpiringSoon = vax.nextDueDate &&
                new Date(vax.nextDueDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

              return (
                <div key={vax.id} className="p-3 rounded-xl bg-background">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{vax.type.replace(/_/g, ' ')}</p>
                        {isExpiringSoon && <span className="badge-warning">Due Soon</span>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Given: {new Date(vax.dateGiven).toLocaleDateString()}
                      </p>
                      {vax.nextDueDate && (
                        <p className="text-sm text-muted-foreground">
                          Next due: {new Date(vax.nextDueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {canEdit && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEditVax(vax)}
                          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit vaccination"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteVax(vax.id)}
                          disabled={deletingVaxId === vax.id}
                          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Delete vaccination record"
                        >
                          {deletingVaxId === vax.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No vaccination records</p>
        )}
      </div>

      {/* Weight History */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Weight History</h3>
          {canEdit && (
            <button onClick={onLogWeight} className="btn-secondary btn-sm">
              <Plus className="w-4 h-4" />
              Log Weight
            </button>
          )}
        </div>
        {horse.weights && horse.weights.length > 0 ? (
          <div className="space-y-2">
            {horse.weights.slice(0, 5).map((w) => (
              <div key={w.id} className="flex items-center justify-between p-3 rounded-xl bg-background">
                <span className="text-muted-foreground">{new Date(w.date).toLocaleDateString()}</span>
                <span className="font-medium text-foreground">{w.weight} lbs</span>
                {w.bodyScore && (
                  <span className="text-sm text-muted-foreground">BCS: {w.bodyScore.toFixed(1)}</span>
                )}
                {canEdit && (
                  <button
                    onClick={() => handleDeleteWeight(w.id)}
                    disabled={deletingWeightId === w.id}
                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Delete weight record"
                  >
                    {deletingWeightId === w.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No weight records</p>
        )}
      </div>

      {/* All Health Records */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Health Records</h3>
          {canEdit && (
            <Link href={`/horses/${horse.id}/health/new`} className="btn-secondary btn-sm">
              <Plus className="w-4 h-4" />
              Add Record
            </Link>
          )}
        </div>
        {healthRecordsLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : healthRecords.length > 0 ? (
          <div className="space-y-2">
            {healthRecords.map((record) => (
              <button
                key={record.id}
                onClick={() => {
                  setSelectedHealthRecord(record);
                  setShowHealthRecordModal(true);
                }}
                className="w-full p-3 rounded-xl bg-background hover:bg-accent transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{record.type.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-muted-foreground">{new Date(record.date).toLocaleDateString()}</p>
                    {record.provider && (
                      <p className="text-xs text-muted-foreground mt-1">Provider: {record.provider}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm mb-3">No health records</p>
            {canEdit && (
              <Link href={`/horses/${horse.id}/health/new`} className="btn-primary btn-sm inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add First Record
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Edit Vaccination Modal */}
      {editingVax && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">Edit Vaccination</h3>
              <button onClick={() => setEditingVax(null)} className="p-1 rounded hover:bg-accent">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Vaccine Type</label>
                <select className="input w-full" value={editVaxForm.type} onChange={e => setEditVaxForm(f => ({ ...f, type: e.target.value }))}>
                  {vaccinationTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Date Given</label>
                  <input type="date" className="input w-full" value={editVaxForm.dateGiven} onChange={e => setEditVaxForm(f => ({ ...f, dateGiven: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Next Due Date</label>
                  <input type="date" className="input w-full" value={editVaxForm.nextDueDate} onChange={e => setEditVaxForm(f => ({ ...f, nextDueDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Veterinarian</label>
                <input className="input w-full" value={editVaxForm.veterinarian} onChange={e => setEditVaxForm(f => ({ ...f, veterinarian: e.target.value }))} placeholder="Dr. Smith" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Manufacturer</label>
                  <input className="input w-full" value={editVaxForm.manufacturer} onChange={e => setEditVaxForm(f => ({ ...f, manufacturer: e.target.value }))} placeholder="e.g. Zoetis" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Lot Number</label>
                  <input className="input w-full" value={editVaxForm.lotNumber} onChange={e => setEditVaxForm(f => ({ ...f, lotNumber: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
                <textarea className="input w-full h-20 resize-none" value={editVaxForm.notes} onChange={e => setEditVaxForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-border">
              <button onClick={() => setEditingVax(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSaveVax} disabled={savingVax} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {savingVax ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Medication Modal */}
      {editingMed && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">Edit Medication</h3>
              <button onClick={() => setEditingMed(null)} className="p-1 rounded hover:bg-accent">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
                <input className="input w-full" value={editMedForm.name} onChange={e => setEditMedForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Dosage</label>
                  <input className="input w-full" value={editMedForm.dosage} onChange={e => setEditMedForm(f => ({ ...f, dosage: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
                  <select className="input w-full" value={editMedForm.status} onChange={e => setEditMedForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Discontinued</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Frequency</label>
                <select className="input w-full" value={editMedForm.frequency} onChange={e => setEditMedForm(f => ({ ...f, frequency: e.target.value }))}>
                  {frequencyOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Route</label>
                <select className="input w-full" value={editMedForm.route} onChange={e => setEditMedForm(f => ({ ...f, route: e.target.value }))}>
                  {routeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Instructions</label>
                <textarea className="input w-full h-20 resize-none" value={editMedForm.instructions} onChange={e => setEditMedForm(f => ({ ...f, instructions: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-border">
              <button onClick={() => setEditingMed(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSaveMed} disabled={savingMed} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {savingMed ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Health Record Detail Modal */}
      {showHealthRecordModal && selectedHealthRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                {selectedHealthRecord.type.replace(/_/g, ' ')}
              </h2>
              <button
                onClick={() => {
                  setShowHealthRecordModal(false);
                  setSelectedHealthRecord(null);
                }}
                className="text-muted-foreground hover:text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date</label>
                <p className="text-foreground">{new Date(selectedHealthRecord.date).toLocaleDateString()}</p>
              </div>

              {selectedHealthRecord.provider && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Provider</label>
                  <p className="text-foreground">{selectedHealthRecord.provider}</p>
                </div>
              )}

              {selectedHealthRecord.diagnosis && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Diagnosis</label>
                  <p className="text-foreground whitespace-pre-wrap">{selectedHealthRecord.diagnosis}</p>
                </div>
              )}

              {selectedHealthRecord.treatment && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Treatment</label>
                  <p className="text-foreground whitespace-pre-wrap">{selectedHealthRecord.treatment}</p>
                </div>
              )}

              {selectedHealthRecord.findings && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Findings</label>
                  <p className="text-foreground whitespace-pre-wrap">{selectedHealthRecord.findings}</p>
                </div>
              )}

              {selectedHealthRecord.followUpNotes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="text-foreground whitespace-pre-wrap">{selectedHealthRecord.followUpNotes}</p>
                </div>
              )}

              {selectedHealthRecord.followUpDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Follow-up Date</label>
                  <p className="text-foreground">{new Date(selectedHealthRecord.followUpDate).toLocaleDateString()}</p>
                </div>
              )}

              {selectedHealthRecord.cost && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cost</label>
                  <p className="text-foreground">${selectedHealthRecord.cost.toFixed(2)}</p>
                </div>
              )}

              {selectedHealthRecord.attachments && selectedHealthRecord.attachments.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Attachments</label>
                  <div className="space-y-2">
                    {selectedHealthRecord.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded bg-background hover:bg-accent text-amber-600 hover:text-amber-700"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{att.filename || 'View Document'}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Printable Medical Report — hidden on screen, visible on print */}
      {/* ============================================================ */}
      <div className="printable-medical-report-wrapper">
        <div className="printable-horse-sheet">
          {/* Header */}
          <div className="horse-sheet-header">
            <h1 className="horse-sheet-name">{horse.barnName || 'Horse'}</h1>
            {horse.registeredName && (
              <p className="horse-sheet-reg">{horse.registeredName}</p>
            )}
            <p className="horse-sheet-meta">
              {[horse.breed, horse.color, horse.sex, horse.age ? `${horse.age}y` : null]
                .filter(Boolean)
                .join('  \u2022  ')}
            </p>
            <p className="horse-sheet-date">
              Medical Report &mdash; {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="horse-sheet-grid">
            {/* Medications */}
            <div className="horse-sheet-section">
              <h2 className="horse-sheet-section-title">Current Medications</h2>
              {medications.length > 0 ? (
                <table className="horse-sheet-table">
                  <thead>
                    <tr>
                      <th className="horse-sheet-th">Medication</th>
                      <th className="horse-sheet-th">Dosage</th>
                      <th className="horse-sheet-th">Frequency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medications.map((med) => (
                      <tr key={med.id}>
                        <td className="horse-sheet-td horse-sheet-td-name">{med.name}</td>
                        <td className="horse-sheet-td">{med.dosage}</td>
                        <td className="horse-sheet-td">{med.frequency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="horse-sheet-empty">No active medications</p>
              )}
            </div>

            {/* Coggins */}
            <div className="horse-sheet-section">
              <h2 className="horse-sheet-section-title">Coggins Status</h2>
              {coggins?.current ? (
                <table className="horse-sheet-table">
                  <tbody>
                    <tr>
                      <td className="horse-sheet-td horse-sheet-td-name">Status</td>
                      <td className="horse-sheet-td">{coggins.isExpired ? 'EXPIRED' : 'Valid'}</td>
                    </tr>
                    <tr>
                      <td className="horse-sheet-td horse-sheet-td-name">Test Date</td>
                      <td className="horse-sheet-td">{new Date(coggins.current.testDate).toLocaleDateString()}</td>
                    </tr>
                    <tr>
                      <td className="horse-sheet-td horse-sheet-td-name">Expiry</td>
                      <td className="horse-sheet-td">{new Date(coggins.current.expiryDate).toLocaleDateString()}</td>
                    </tr>
                    {coggins.current.veterinarian && (
                      <tr>
                        <td className="horse-sheet-td horse-sheet-td-name">Veterinarian</td>
                        <td className="horse-sheet-td">{coggins.current.veterinarian}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <p className="horse-sheet-empty">No Coggins on file</p>
              )}
            </div>
          </div>

          <div className="horse-sheet-grid">
            {/* Vaccinations */}
            <div className="horse-sheet-section">
              <h2 className="horse-sheet-section-title">Vaccinations</h2>
              {horse.vaccinations && horse.vaccinations.length > 0 ? (
                <table className="horse-sheet-table">
                  <thead>
                    <tr>
                      <th className="horse-sheet-th">Vaccine</th>
                      <th className="horse-sheet-th">Date Given</th>
                      <th className="horse-sheet-th">Next Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horse.vaccinations.map((vax) => (
                      <tr key={vax.id}>
                        <td className="horse-sheet-td horse-sheet-td-name">{vax.type.replace(/_/g, ' ')}</td>
                        <td className="horse-sheet-td">{new Date(vax.dateGiven).toLocaleDateString()}</td>
                        <td className="horse-sheet-td">{vax.nextDueDate ? new Date(vax.nextDueDate).toLocaleDateString() : '\u2014'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="horse-sheet-empty">No vaccination records</p>
              )}
            </div>

            {/* Weight History */}
            <div className="horse-sheet-section">
              <h2 className="horse-sheet-section-title">Weight History</h2>
              {horse.weights && horse.weights.length > 0 ? (
                <table className="horse-sheet-table">
                  <thead>
                    <tr>
                      <th className="horse-sheet-th">Date</th>
                      <th className="horse-sheet-th">Weight</th>
                      <th className="horse-sheet-th">BCS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horse.weights.slice(0, 10).map((w) => (
                      <tr key={w.id}>
                        <td className="horse-sheet-td">{new Date(w.date).toLocaleDateString()}</td>
                        <td className="horse-sheet-td horse-sheet-td-name">{w.weight} lbs</td>
                        <td className="horse-sheet-td">{w.bodyScore?.toFixed(1) || '\u2014'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="horse-sheet-empty">No weight records</p>
              )}
            </div>
          </div>

          {/* Health Records */}
          {healthRecords.length > 0 && (
            <div className="horse-sheet-section" style={{ marginTop: '12px' }}>
              <h2 className="horse-sheet-section-title">Health Records</h2>
              <table className="horse-sheet-table">
                <thead>
                  <tr>
                    <th className="horse-sheet-th">Type</th>
                    <th className="horse-sheet-th">Date</th>
                    <th className="horse-sheet-th">Provider</th>
                    <th className="horse-sheet-th">Diagnosis / Treatment</th>
                  </tr>
                </thead>
                <tbody>
                  {healthRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="horse-sheet-td horse-sheet-td-name">{record.type.replace(/_/g, ' ')}</td>
                      <td className="horse-sheet-td">{new Date(record.date).toLocaleDateString()}</td>
                      <td className="horse-sheet-td">{record.provider || '\u2014'}</td>
                      <td className="horse-sheet-td">{record.diagnosis || record.treatment || '\u2014'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {horse.ownerName && (
            <p className="horse-sheet-owner">Owner: {horse.ownerName}</p>
          )}

          <div className="horse-sheet-footer">
            Printed from BarnKeep &mdash; {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
