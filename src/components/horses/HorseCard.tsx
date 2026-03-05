'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Pill, Calendar, Weight, Ruler } from 'lucide-react';
import { cn, formatAge, formatWeight, formatHeight, getStatusColor } from '@/lib/utils';
import type { Horse } from '@/types';

interface HorseCardProps {
  horse: Horse & {
    stallName?: string | null;
    currentWeight?: number | null;
    activeMedicationCount?: number;
    age?: number | null;
  };
  onClick?: () => void;
  variant?: 'default' | 'compact';
}

export function HorseCard({ horse, onClick, variant = 'default' }: HorseCardProps) {
  const compactClassName = "group w-full text-left p-3 rounded-xl bg-card border border-border hover:shadow-md hover:border-border transition-all flex items-center gap-4";
  
  const CompactContent = () => (
    <>
      {/* Avatar */}
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-muted to-border flex items-center justify-center overflow-hidden flex-shrink-0 relative">
        {horse.profilePhotoUrl ? (
          <Image
            src={horse.profilePhotoUrl}
            alt={horse.barnName}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <span className="text-sm font-semibold text-muted-foreground">
            {horse.barnName.charAt(0)}
          </span>
        )}
      </div>

      {/* Name & breed */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate">{horse.barnName}</h3>
        <p className="text-xs text-muted-foreground truncate">
          {horse.breed || 'Unknown breed'}
        </p>
      </div>

      {/* Status */}
      <span
        className={cn(
          'px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0',
          getStatusColor(horse.status)
        )}
      >
        {horse.status.toLowerCase()}
      </span>

      {/* Stall */}
      {horse.stallName && (
        <span className="text-xs text-muted-foreground flex-shrink-0">
          Stall {horse.stallName}
        </span>
      )}

      {/* Medication badge */}
      {(horse as any).activeMedicationCount > 0 && (
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex-shrink-0">
          <Pill className="w-3 h-3" />
        </span>
      )}

      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-muted-foreground transition-colors flex-shrink-0" />
    </>
  );

  if (variant === 'compact') {
    if (onClick) {
      return (
        <button onClick={onClick} type="button" className={compactClassName}>
          <CompactContent />
        </button>
      );
    }
    return (
      <Link href={`/horses/${horse.id}`} className={compactClassName}>
        <CompactContent />
      </Link>
    );
  }

  // Default variant
  const defaultClassName = "group w-full text-left p-4 rounded-2xl bg-card border border-border hover:shadow-lg hover:-translate-y-0.5 transition-all";
  
  const DefaultContent = () => (
    <div className="flex items-start gap-4">
      {/* Avatar */}
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-muted to-border flex items-center justify-center overflow-hidden flex-shrink-0 relative">
        {horse.profilePhotoUrl ? (
          <Image
            src={horse.profilePhotoUrl}
            alt={horse.barnName}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <span className="text-xl font-semibold text-muted-foreground">
            {horse.barnName.charAt(0)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-foreground truncate">
              {horse.barnName}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {horse.breed || 'Unknown breed'}
            </p>
          </div>
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0',
              getStatusColor(horse.status)
              )}
            >
              {horse.status.toLowerCase()}
            </span>
          </div>

          {/* Details row */}
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            {horse.stallName && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                Stall {horse.stallName}
              </span>
            )}
            {horse.currentWeight && (
              <span className="flex items-center gap-1">
                <Weight className="w-3 h-3" />
                {formatWeight(horse.currentWeight)}
              </span>
            )}
            {horse.heightHands && (
              <span className="flex items-center gap-1">
                <Ruler className="w-3 h-3" />
                {formatHeight(horse.heightHands)}
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 mt-3">
            {(horse as any).activeMedicationCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                <Pill className="w-3 h-3" />
                On Medication
              </span>
            )}
            {horse.status === 'LAYUP' && horse.statusNote && (
              <span className="text-xs text-amber-600 truncate max-w-[150px]">
                {horse.statusNote}
              </span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-muted-foreground transition-colors flex-shrink-0" />
      </div>
    );

  if (onClick) {
    return (
      <button onClick={onClick} type="button" className={defaultClassName}>
        <DefaultContent />
      </button>
    );
  }
  
  return (
    <Link href={`/horses/${horse.id}`} className={defaultClassName}>
      <DefaultContent />
    </Link>
  );
}

interface HorseCardSkeletonProps {
  count?: number;
}

export function HorseCardSkeleton({ count = 3 }: HorseCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-2xl bg-card border border-border animate-pulse"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-muted" />
            <div className="flex-1">
              <div className="h-5 w-32 bg-muted rounded mb-2" />
              <div className="h-4 w-48 bg-muted rounded mb-3" />
              <div className="flex gap-3">
                <div className="h-3 w-16 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

interface HorseGridProps {
  horses: (Horse & {
    stallName?: string | null;
    currentWeight?: number | null;
    activeMedicationCount?: number;
    age?: number | null;
  })[];
  onHorseClick?: (horse: Horse) => void;
}

export function HorseGrid({ horses, onHorseClick }: HorseGridProps) {
  if (horses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🐴</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No horses yet</h3>
        <p className="text-muted-foreground mb-4">
          Add your first horse to get started
        </p>
        <Link
          href="/horses/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          Add Horse
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {horses.map((horse) => (
        <HorseCard
          key={horse.id}
          horse={horse}
          onClick={onHorseClick ? () => onHorseClick(horse) : undefined}
        />
      ))}
    </div>
  );
}
