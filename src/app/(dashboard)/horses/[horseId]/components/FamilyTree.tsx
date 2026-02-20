'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GitBranch, Loader2, User, Plus, Pencil, X, Search } from 'lucide-react';
import { toast } from '@/lib/toast';
import { csrfFetch } from '@/lib/fetch';

interface SimpleHorse {
  id: string;
  barnName: string;
  sex?: string | null;
  profilePhotoUrl?: string | null;
  sireId?: string | null;
  damId?: string | null;
}

interface FamilyTreeProps {
  horse: {
    id: string;
    barnName: string;
    sireId?: string | null;
    damId?: string | null;
    sireName?: string | null;
    damName?: string | null;
    profilePhotoUrl?: string | null;
    sex?: string | null;
  };
  barnId: string;
  canEdit?: boolean;
  onUpdate?: () => void;
}

// Color helpers based on sex
function isMale(sex?: string | null) {
  return sex === 'STALLION' || sex === 'COLT';
}
function isFemale(sex?: string | null) {
  return sex === 'MARE' || sex === 'FILLY';
}

function sexColors(sex?: string | null) {
  if (isMale(sex)) return {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-600',
    avatar: 'bg-blue-100 dark:bg-blue-900/50',
    text: 'text-blue-700 dark:text-blue-300',
    label: 'text-blue-500 dark:text-blue-400',
  };
  if (isFemale(sex)) return {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    border: 'border-rose-200 dark:border-rose-800',
    hoverBorder: 'hover:border-rose-400 dark:hover:border-rose-600',
    avatar: 'bg-rose-100 dark:bg-rose-900/50',
    text: 'text-rose-700 dark:text-rose-300',
    label: 'text-rose-500 dark:text-rose-400',
  };
  return {
    bg: 'bg-muted/50',
    border: 'border-border',
    hoverBorder: 'hover:border-primary/40',
    avatar: 'bg-muted',
    text: 'text-muted-foreground',
    label: 'text-muted-foreground',
  };
}

function HorseNode({ horse, label, unknown, role, onEdit, canEdit, externalName }: {
  horse?: SimpleHorse | null;
  label?: string;
  unknown?: boolean;
  role?: 'sire' | 'dam';
  onEdit?: () => void;
  canEdit?: boolean;
  externalName?: string | null;
}) {
  const colors = role === 'sire' ? sexColors('STALLION') : role === 'dam' ? sexColors('MARE') : sexColors(horse?.sex);

  // External parent (name only, no linked horse)
  if (!horse && externalName) {
    return (
      <div className="flex flex-col items-center gap-1">
        {label && <p className={`text-[10px] uppercase tracking-wide font-medium ${colors.label}`}>{label}</p>}
        <div className="relative group">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${colors.bg} border ${colors.border}`}>
            <div className={`w-8 h-8 rounded-full ${colors.avatar} flex items-center justify-center flex-shrink-0`}>
              <User className={`w-3.5 h-3.5 ${colors.text}`} />
            </div>
            <span className={`text-xs font-semibold truncate max-w-[90px] ${colors.text}`}>{externalName}</span>
          </div>
          {canEdit && onEdit && (
            <button
              onClick={onEdit}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-card border border-border shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`Edit ${label || 'parent'}`}
            >
              <Pencil className="w-2.5 h-2.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (unknown || !horse) {
    // Editable: show dashed "Add" button
    if (canEdit && onEdit) {
      return (
        <div className="flex flex-col items-center gap-1">
          {label && <p className={`text-[10px] uppercase tracking-wide font-medium ${colors.label}`}>{label}</p>}
          <button
            onClick={onEdit}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed ${colors.border} ${colors.hoverBorder} transition-all group`}
          >
            <div className={`w-8 h-8 rounded-full ${colors.avatar} flex items-center justify-center flex-shrink-0`}>
              <Plus className={`w-3.5 h-3.5 ${colors.text} opacity-60 group-hover:opacity-100 transition-opacity`} />
            </div>
            <span className={`text-xs font-medium ${colors.text} opacity-60 group-hover:opacity-100 transition-opacity`}>
              Add {role === 'sire' ? 'Sire' : role === 'dam' ? 'Dam' : 'Parent'}
            </span>
          </button>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center gap-1">
        {label && <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${colors.bg} border ${colors.border}`}>
          <div className={`w-8 h-8 rounded-full ${colors.avatar} flex items-center justify-center flex-shrink-0`}>
            <User className="w-3.5 h-3.5 text-muted-foreground/50" />
          </div>
          <span className="text-xs text-muted-foreground/60">Unknown</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {label && <p className={`text-[10px] uppercase tracking-wide font-medium ${colors.label}`}>{label}</p>}
      <div className="relative group">
        <Link
          href={`/horses/${horse.id}`}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl ${colors.bg} border ${colors.border} ${colors.hoverBorder} hover:shadow-md transition-all`}
        >
          <div className={`relative w-8 h-8 rounded-full ${colors.avatar} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
            {horse.profilePhotoUrl ? (
              <Image src={horse.profilePhotoUrl} alt="" fill unoptimized className="object-cover" />
            ) : (
              <User className={`w-3.5 h-3.5 ${colors.text}`} />
            )}
          </div>
          <span className={`text-xs font-semibold truncate max-w-[90px] ${colors.text}`}>{horse.barnName}</span>
        </Link>
        {canEdit && onEdit && (
          <button
            onClick={(e) => { e.preventDefault(); onEdit(); }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-card border border-border shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`Edit ${label || 'parent'}`}
          >
            <Pencil className="w-2.5 h-2.5 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}

function CenterHorseNode({ horse }: { horse: FamilyTreeProps['horse'] }) {
  const colors = sexColors(horse.sex);
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl ${colors.bg} border-2 ${colors.border} shadow-sm`}>
        <div className={`relative w-11 h-11 rounded-full ${colors.avatar} flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-white dark:ring-gray-800`}>
          {horse.profilePhotoUrl ? (
            <Image src={horse.profilePhotoUrl} alt="" fill unoptimized className="object-cover" />
          ) : (
            <User className={`w-5 h-5 ${colors.text}`} />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground">{horse.barnName}</span>
          {horse.sex && (
            <span className={`text-[10px] font-medium ${colors.label}`}>
              {horse.sex.charAt(0) + horse.sex.slice(1).toLowerCase()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Branch connector lines
function VerticalLine() {
  return <div className="w-px h-5 bg-border/60 mx-auto" />;
}

function BranchDown() {
  return (
    <div className="flex items-start justify-center">
      <div className="w-px h-5 bg-border/60" />
    </div>
  );
}

function BranchUp({ count }: { count: number }) {
  if (count <= 1) return <VerticalLine />;
  return (
    <div className="flex items-end justify-center px-4">
      <div className="flex-1 border-t border-border/60" />
      <div className="w-px h-3 bg-border/60" />
      <div className="flex-1 border-t border-border/60" />
    </div>
  );
}

// Horse picker modal
function HorsePickerModal({ open, onClose, onSelect, onClear, onSetName, horses, role, currentId, currentName }: {
  open: boolean;
  onClose: () => void;
  onSelect: (horseId: string) => void;
  onClear?: () => void;
  onSetName: (name: string) => void;
  horses: SimpleHorse[];
  role: 'sire' | 'dam';
  currentId?: string | null;
  currentName?: string | null;
}) {
  const [search, setSearch] = useState('');
  const [manualName, setManualName] = useState(currentName || '');
  const [showManual, setShowManual] = useState(false);

  if (!open) return null;

  const sexFilter = role === 'sire' ? ['STALLION', 'COLT'] : ['MARE', 'FILLY'];
  const filtered = horses
    .filter(h => sexFilter.includes(h.sex || ''))
    .filter(h => h.barnName.toLowerCase().includes(search.toLowerCase()));

  const colors = role === 'sire' ? sexColors('STALLION') : sexColors('MARE');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-card rounded-2xl shadow-xl max-w-sm w-full max-h-[70vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">
            {showManual ? `Enter ${role === 'sire' ? 'Sire' : 'Dam'} Name` : `Select ${role === 'sire' ? 'Sire' : 'Dam'}`}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted" aria-label="Close">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {showManual ? (
          /* Manual name entry */
          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {role === 'sire' ? 'Sire' : 'Dam'} name
              </label>
              <input
                type="text"
                placeholder="e.g. Thunder Ridge"
                value={manualName}
                onChange={e => setManualName(e.target.value)}
                className="input w-full"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                For horses not in your barn
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowManual(false)} className="btn-secondary btn-sm flex-1">
                Back
              </button>
              <button
                onClick={() => { if (manualName.trim()) onSetName(manualName.trim()); }}
                disabled={!manualName.trim()}
                className="btn-primary btn-sm flex-1"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={`Search ${role === 'sire' ? 'stallions' : 'mares'}...`}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input w-full pl-9"
                  autoFocus
                />
              </div>
            </div>

            {/* Type a name option */}
            <div className="px-3 pt-2">
              <button
                onClick={() => setShowManual(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-muted transition-colors border border-dashed border-border"
              >
                <div className={`w-9 h-9 rounded-full ${colors.avatar} flex items-center justify-center flex-shrink-0`}>
                  <Plus className={`w-4 h-4 ${colors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Enter name manually</p>
                  <p className="text-xs text-muted-foreground">For horses not in your barn</p>
                </div>
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No {role === 'sire' ? 'stallions or colts' : 'mares or fillies'} in your barn
                </p>
              ) : (
                <div className="space-y-1">
                  {filtered.map(h => (
                    <button
                      key={h.id}
                      onClick={() => onSelect(h.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                        h.id === currentId
                          ? `${colors.bg} ${colors.border} border`
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className={`relative w-9 h-9 rounded-full ${colors.avatar} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                        {h.profilePhotoUrl ? (
                          <Image src={h.profilePhotoUrl} alt="" fill unoptimized className="object-cover" />
                        ) : (
                          <User className={`w-4 h-4 ${colors.text}`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{h.barnName}</p>
                        <p className="text-xs text-muted-foreground">
                          {h.sex ? h.sex.charAt(0) + h.sex.slice(1).toLowerCase() : 'Unknown sex'}
                        </p>
                      </div>
                      {h.id === currentId && (
                        <span className={`text-xs font-medium ${colors.text}`}>Current</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {onClear && (
              <div className="p-3 border-t border-border">
                <button
                  onClick={onClear}
                  className="w-full btn-secondary btn-sm text-destructive hover:text-destructive"
                >
                  Remove {role === 'sire' ? 'Sire' : 'Dam'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function FamilyTree({ horse, barnId, canEdit = false, onUpdate }: FamilyTreeProps) {
  const [allHorses, setAllHorses] = useState<SimpleHorse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerRole, setPickerRole] = useState<'sire' | 'dam' | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchHorses = useCallback(async () => {
    if (!barnId) return;
    try {
      const res = await fetch(`/api/barns/${barnId}/horses?pageSize=200`);
      const data = await res.json();
      setAllHorses(data?.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [barnId]);

  useEffect(() => { fetchHorses(); }, [fetchHorses]);

  // Resolve family members
  const find = (id?: string | null) => id ? allHorses.find(h => h.id === id) ?? null : null;

  const sire = find(horse.sireId);
  const dam = find(horse.damId);
  const paternalGrandsire = find(sire?.sireId);
  const paternalGranddam = find(sire?.damId);
  const maternalGrandsire = find(dam?.sireId);
  const maternalGranddam = find(dam?.damId);

  const horseIsMare = isFemale(horse.sex);
  const horseIsStallion = isMale(horse.sex);
  const offspring = allHorses.filter(h =>
    (horseIsStallion && h.sireId === horse.id) || (horseIsMare && h.damId === horse.id)
  );

  const hasParents = !!sire || !!dam || !!horse.sireId || !!horse.damId || !!horse.sireName || !!horse.damName;
  const hasGrandparents = !!paternalGrandsire || !!paternalGranddam || !!maternalGrandsire || !!maternalGranddam;
  const hasOffspring = offspring.length > 0;

  // Show if lineage data exists OR if editable (so user can add parents)
  if (!loading && !hasParents && !hasOffspring && !canEdit) return null;

  const handleSelectParent = async (parentId: string) => {
    if (!pickerRole) return;
    setSaving(true);
    try {
      const idField = pickerRole === 'sire' ? 'sireId' : 'damId';
      const nameField = pickerRole === 'sire' ? 'sireName' : 'damName';
      const res = await csrfFetch(`/api/barns/${barnId}/horses/${horse.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [idField]: parentId, [nameField]: null }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success(`${pickerRole === 'sire' ? 'Sire' : 'Dam'} updated`);
      setPickerRole(null);
      fetchHorses();
      onUpdate?.();
    } catch {
      toast.error('Failed to update lineage');
    } finally {
      setSaving(false);
    }
  };

  const handleSetName = async (name: string) => {
    if (!pickerRole) return;
    setSaving(true);
    try {
      const idField = pickerRole === 'sire' ? 'sireId' : 'damId';
      const nameField = pickerRole === 'sire' ? 'sireName' : 'damName';
      const res = await csrfFetch(`/api/barns/${barnId}/horses/${horse.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [idField]: null, [nameField]: name }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success(`${pickerRole === 'sire' ? 'Sire' : 'Dam'} set to ${name}`);
      setPickerRole(null);
      fetchHorses();
      onUpdate?.();
    } catch {
      toast.error('Failed to update lineage');
    } finally {
      setSaving(false);
    }
  };

  const handleClearParent = async () => {
    if (!pickerRole) return;
    setSaving(true);
    try {
      const idField = pickerRole === 'sire' ? 'sireId' : 'damId';
      const nameField = pickerRole === 'sire' ? 'sireName' : 'damName';
      const res = await csrfFetch(`/api/barns/${barnId}/horses/${horse.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [idField]: null, [nameField]: null }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success(`${pickerRole === 'sire' ? 'Sire' : 'Dam'} removed`);
      setPickerRole(null);
      fetchHorses();
      onUpdate?.();
    } catch {
      toast.error('Failed to update lineage');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Pedigree</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Eligible horses for picker (exclude self)
  const pickerHorses = allHorses.filter(h => h.id !== horse.id);
  const currentPickerId = pickerRole === 'sire' ? horse.sireId : horse.damId;

  return (
    <>
      <div className="card p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-6">
          <GitBranch className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">Pedigree</h3>
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground ml-auto" />}
        </div>

        <div className="flex flex-col items-center gap-0 overflow-x-auto pb-2">
          {/* Grandparents row */}
          {hasGrandparents && (
            <>
              <div className="flex items-end gap-3 sm:gap-6">
                {sire && (
                  <div className="flex items-end gap-2">
                    <HorseNode horse={paternalGrandsire} label="Grandsire" unknown={!paternalGrandsire} role="sire" />
                    <HorseNode horse={paternalGranddam} label="Granddam" unknown={!paternalGranddam} role="dam" />
                  </div>
                )}
                {dam && (
                  <div className="flex items-end gap-2">
                    <HorseNode horse={maternalGrandsire} label="Grandsire" unknown={!maternalGrandsire} role="sire" />
                    <HorseNode horse={maternalGranddam} label="Granddam" unknown={!maternalGranddam} role="dam" />
                  </div>
                )}
              </div>
              <VerticalLine />
            </>
          )}

          {/* Parents row */}
          <div className="flex items-end gap-6 sm:gap-12">
            <HorseNode
              horse={sire}
              label="Sire"
              unknown={!sire && !horse.sireName}
              externalName={!sire ? horse.sireName : null}
              role="sire"
              canEdit={canEdit}
              onEdit={() => setPickerRole('sire')}
            />
            <HorseNode
              horse={dam}
              label="Dam"
              unknown={!dam && !horse.damName}
              externalName={!dam ? horse.damName : null}
              role="dam"
              canEdit={canEdit}
              onEdit={() => setPickerRole('dam')}
            />
          </div>

          <BranchDown />

          {/* Center horse */}
          <CenterHorseNode horse={horse} />

          {/* Offspring */}
          {hasOffspring && (
            <>
              <VerticalLine />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-2">
                Offspring ({offspring.length})
              </p>
              <div className="flex flex-wrap items-start justify-center gap-2">
                {offspring.map(foal => (
                  <HorseNode key={foal.id} horse={foal} role={isMale(foal.sex) ? 'sire' : isFemale(foal.sex) ? 'dam' : undefined} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Horse picker modal */}
      {pickerRole && (
        <HorsePickerModal
          open={!!pickerRole}
          onClose={() => setPickerRole(null)}
          onSelect={handleSelectParent}
          onSetName={handleSetName}
          onClear={
            (pickerRole === 'sire' && (horse.sireId || horse.sireName)) || (pickerRole === 'dam' && (horse.damId || horse.damName))
              ? handleClearParent
              : undefined
          }
          horses={pickerHorses}
          role={pickerRole}
          currentId={currentPickerId}
          currentName={pickerRole === 'sire' ? horse.sireName : horse.damName}
        />
      )}
    </>
  );
}
