'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useHorses } from '@/hooks/useData';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useBarn } from '@/contexts/BarnContext';
import { Plus, Search, Grid, List, ChevronRight, Loader2, Filter } from 'lucide-react';
import { hasPermission, BarnRole } from '@/types';

const HorseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12c0-4-3-8-8-8-3 0-5.5 1.5-7 3.5L3 10l1 3-2 4 3 1 2-1 2 3h4l1-2 2 1 4-3c1-1 2-2.5 2-4z"/>
    <circle cx="18" cy="9" r="1"/>
  </svg>
);

type ViewMode = 'grid' | 'list';
type StatusFilter = 'all' | 'ACTIVE' | 'LAYUP' | 'RETIRED';

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  ACTIVE: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  LAYUP: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  RETIRED: { bg: 'bg-stone-100', text: 'text-stone-600', dot: 'bg-stone-400' },
  SOLD: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
};

export default function HorsesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const { currentBarn } = useBarn();
  
  const { horses, total, isLoading, error } = useHorses({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
  });
  
  const { canAddHorses } = useSubscription();
  const canAdd = canAddHorses(total);
  
  // Check if user has permission to add horses
  const currentRole = (currentBarn?.role || 'CLIENT') as BarnRole;
  const canWrite = hasPermission(currentRole, 'horses:write');

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-red-600">Error loading horses: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-stone-900">Horses</h1>
          <p className="text-stone-500 mt-0.5 text-sm">{total} total in barn</p>
        </div>

        {canWrite && (
          canAdd ? (
            <Link href="/horses/new" className="btn-primary w-full sm:w-auto justify-center touch-target">
              <Plus className="w-4 h-4" />
              <span>Add Horse</span>
            </Link>
          ) : (
            <Link href="/settings/billing" className="btn-primary w-full sm:w-auto justify-center text-sm touch-target">
              Upgrade to Add More
            </Link>
          )
        )}
      </div>

      {/* Filters */}
      <div className="card p-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search horses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 text-sm h-10"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="input flex-1 sm:flex-initial text-sm h-10"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="LAYUP">On Layup</option>
              <option value="RETIRED">Retired</option>
            </select>

            <div className="flex border border-stone-200 rounded-lg overflow-hidden flex-shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-colors touch-target ${viewMode === 'grid' ? 'bg-amber-50 text-amber-600' : 'bg-white text-stone-400 hover:bg-stone-50 active:bg-stone-100'}`}
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 transition-colors touch-target ${viewMode === 'list' ? 'bg-amber-50 text-amber-600' : 'bg-white text-stone-400 hover:bg-stone-50 active:bg-stone-100'}`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && horses.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <HorseIcon className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold text-stone-900 mb-1">
            {searchQuery || statusFilter !== 'all' ? 'No horses found' : 'No horses yet'}
          </h2>
          <p className="text-stone-500 mb-6">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Add your first horse to get started'
            }
          </p>
          {!searchQuery && statusFilter === 'all' && canAdd && (
            <Link href="/horses/new" className="btn-primary">
              <Plus className="w-4 h-4" />
              Add Horse
            </Link>
          )}
        </div>
      )}

      {/* Grid View */}
      {!isLoading && horses.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {horses.map((horse) => {
            const status = statusConfig[horse.status] || statusConfig.ACTIVE;
            return (
              <Link
                key={horse.id}
                href={`/horses/${horse.id}`}
                className="card overflow-hidden hover:shadow-md hover:border-stone-300 transition-all group active:scale-[0.98] no-tap-highlight"
              >
                {/* Photo */}
                <div className="aspect-square sm:aspect-[4/3] bg-stone-100 relative overflow-hidden">
                  {horse.profilePhotoUrl ? (
                    <img
                      src={horse.profilePhotoUrl}
                      alt={horse.barnName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                      <span className="text-3xl sm:text-5xl font-bold text-amber-300">
                        {horse.barnName?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${status.bg} ${status.text}`}>
                    <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${status.dot}`} />
                    {horse.status}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-sm sm:text-base text-stone-900 group-hover:text-amber-600 transition-colors truncate">
                    {horse.barnName}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 mt-0.5 truncate">
                    {horse.breed || 'Unknown breed'}
                    {horse.age && ` · ${horse.age} yrs`}
                  </p>

                  {horse.stallName && (
                    <p className="text-[10px] sm:text-xs text-stone-400 mt-1.5 sm:mt-2 truncate">
                      Stall {horse.stallName}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* List View */}
      {!isLoading && horses.length > 0 && viewMode === 'list' && (
        <div className="card divide-y divide-stone-100">
          {horses.map((horse) => {
            const status = statusConfig[horse.status] || statusConfig.ACTIVE;
            return (
              <Link
                key={horse.id}
                href={`/horses/${horse.id}`}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-stone-50 active:bg-stone-100 transition-colors group no-tap-highlight"
              >
                {/* Avatar */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {horse.profilePhotoUrl ? (
                    <img src={horse.profilePhotoUrl} alt={horse.barnName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-base sm:text-lg font-bold text-amber-600">
                      {horse.barnName?.charAt(0) || '?'}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm sm:text-base text-stone-900 group-hover:text-amber-600 transition-colors truncate">
                      {horse.barnName}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-500 mt-0.5 truncate">
                    {horse.breed || 'Unknown breed'}
                    {horse.age && ` · ${horse.age} yrs`}
                    {horse.stallName && ` · Stall ${horse.stallName}`}
                  </p>
                </div>

                {/* Status - hidden on very small screens */}
                <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {horse.status}
                </div>

                {/* Status dot on mobile */}
                <div className={`sm:hidden w-2 h-2 rounded-full ${status.dot}`} />

                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-stone-300 group-hover:text-stone-400 transition-colors flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
