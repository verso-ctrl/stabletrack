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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Horses</h1>
          <p className="text-stone-500 mt-0.5">{total} total in barn</p>
        </div>
        
        {canWrite && (
          canAdd ? (
            <Link href="/horses/new" className="btn-primary">
              <Plus className="w-4 h-4" />
              Add Horse
            </Link>
          ) : (
            <Link href="/settings/billing" className="btn-primary">
              Upgrade to Add More
            </Link>
          )
        )}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by name, breed, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="input w-auto"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="LAYUP">On Layup</option>
              <option value="RETIRED">Retired</option>
            </select>

            <div className="flex border border-stone-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-amber-50 text-amber-600' : 'bg-white text-stone-400 hover:bg-stone-50'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-amber-50 text-amber-600' : 'bg-white text-stone-400 hover:bg-stone-50'}`}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {horses.map((horse) => {
            const status = statusConfig[horse.status] || statusConfig.ACTIVE;
            return (
              <Link
                key={horse.id}
                href={`/horses/${horse.id}`}
                className="card overflow-hidden hover:shadow-md hover:border-stone-300 transition-all group"
              >
                {/* Photo */}
                <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden">
                  {horse.profilePhotoUrl ? (
                    <img 
                      src={horse.profilePhotoUrl} 
                      alt={horse.barnName} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                      <span className="text-5xl font-bold text-amber-300">
                        {horse.barnName?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {horse.status}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-stone-900 group-hover:text-amber-600 transition-colors">
                    {horse.barnName}
                  </h3>
                  <p className="text-sm text-stone-500 mt-0.5">
                    {horse.breed || 'Unknown breed'}
                    {horse.age && ` · ${horse.age} yrs`}
                  </p>
                  
                  {horse.stallName && (
                    <p className="text-xs text-stone-400 mt-2">
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
                className="flex items-center gap-4 p-4 hover:bg-stone-50 transition-colors group"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {horse.profilePhotoUrl ? (
                    <img src={horse.profilePhotoUrl} alt={horse.barnName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-amber-600">
                      {horse.barnName?.charAt(0) || '?'}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-stone-900 group-hover:text-amber-600 transition-colors">
                      {horse.barnName}
                    </h3>
                    {horse.registeredName && horse.registeredName !== horse.barnName && (
                      <span className="text-xs text-stone-400">({horse.registeredName})</span>
                    )}
                  </div>
                  <p className="text-sm text-stone-500 mt-0.5">
                    {horse.breed || 'Unknown breed'}
                    {horse.age && ` · ${horse.age} yrs`}
                    {horse.stallName && ` · Stall ${horse.stallName}`}
                  </p>
                </div>

                {/* Status */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {horse.status}
                </div>
                
                <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-stone-400 transition-colors" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
