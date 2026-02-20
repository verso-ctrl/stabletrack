'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GitBranch, Loader2, User } from 'lucide-react';

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
    profilePhotoUrl?: string | null;
    sex?: string | null;
  };
  barnId: string;
}

function HorseNode({ horse, label, unknown }: { horse?: SimpleHorse | null; label?: string; unknown?: boolean }) {
  if (unknown || !horse) {
    return (
      <div className="flex flex-col items-center gap-1">
        {label && <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/40">
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <User className="w-3.5 h-3.5 text-muted-foreground/50" />
          </div>
          <span className="text-xs text-muted-foreground/60">Unknown</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {label && <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>}
      <Link
        href={`/horses/${horse.id}`}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border hover:border-primary/40 hover:shadow-sm transition-all"
      >
        <div className="relative w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
          {horse.profilePhotoUrl ? (
            <Image src={horse.profilePhotoUrl} alt="" fill unoptimized className="object-cover" />
          ) : (
            <User className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </div>
        <span className="text-xs font-medium text-foreground truncate max-w-[80px]">{horse.barnName}</span>
      </Link>
    </div>
  );
}

function CenterHorseNode({ horse }: { horse: FamilyTreeProps['horse'] }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-primary/10 border-2 border-primary/30">
        <div className="relative w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
          {horse.profilePhotoUrl ? (
            <Image src={horse.profilePhotoUrl} alt="" fill unoptimized className="object-cover" />
          ) : (
            <User className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        <span className="text-sm font-semibold text-foreground">{horse.barnName}</span>
      </div>
    </div>
  );
}

// Vertical connector line
function Connector({ className }: { className?: string }) {
  return <div className={`w-px h-4 bg-border mx-auto ${className || ''}`} />;
}

export function FamilyTree({ horse, barnId }: FamilyTreeProps) {
  const [allHorses, setAllHorses] = useState<SimpleHorse[]>([]);
  const [loading, setLoading] = useState(true);

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

  const isMare = horse.sex === 'MARE' || horse.sex === 'FILLY';
  const isStallion = horse.sex === 'STALLION' || horse.sex === 'COLT';
  const offspring = allHorses.filter(h =>
    (isStallion && h.sireId === horse.id) || (isMare && h.damId === horse.id)
  );

  const hasParents = !!sire || !!dam;
  const hasGrandparents = !!paternalGrandsire || !!paternalGranddam || !!maternalGrandsire || !!maternalGranddam;
  const hasOffspring = offspring.length > 0;

  // Don't render if no lineage data at all
  if (!loading && !hasParents && !hasOffspring) return null;

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Family Tree</h3>
        </div>
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-5">
        <GitBranch className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-foreground">Family Tree</h3>
      </div>

      <div className="flex flex-col items-center gap-0 overflow-x-auto">
        {/* Grandparents row */}
        {hasGrandparents && (
          <>
            <div className="flex items-end gap-4 sm:gap-8">
              {/* Paternal grandparents */}
              {(sire) && (
                <div className="flex items-end gap-2">
                  <HorseNode horse={paternalGrandsire} unknown={!paternalGrandsire} />
                  <HorseNode horse={paternalGranddam} unknown={!paternalGranddam} />
                </div>
              )}
              {/* Maternal grandparents */}
              {(dam) && (
                <div className="flex items-end gap-2">
                  <HorseNode horse={maternalGrandsire} unknown={!maternalGrandsire} />
                  <HorseNode horse={maternalGranddam} unknown={!maternalGranddam} />
                </div>
              )}
            </div>
            <Connector />
          </>
        )}

        {/* Parents row */}
        {hasParents && (
          <>
            <div className="flex items-end gap-6 sm:gap-12">
              <HorseNode horse={sire} label="Sire" unknown={!sire} />
              <HorseNode horse={dam} label="Dam" unknown={!dam} />
            </div>
            <Connector />
          </>
        )}

        {/* The horse */}
        <CenterHorseNode horse={horse} />

        {/* Offspring */}
        {hasOffspring && (
          <>
            <Connector />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
              Offspring ({offspring.length})
            </p>
            <div className="flex flex-wrap items-start justify-center gap-2">
              {offspring.map(foal => (
                <HorseNode key={foal.id} horse={foal} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
