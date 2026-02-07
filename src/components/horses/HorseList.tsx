'use client';

import React, { useState } from 'react';
import { useHorses } from '@/hooks/useData';
import { HorseCard } from './HorseCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Search,
  Plus,
  Filter,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import type { HorseStatus } from '@/types';

const STATUS_FILTERS: { value: HorseStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Horses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'LAYUP', label: 'On Layup' },
  { value: 'RETIRED', label: 'Retired' },
  { value: 'LEASED_OUT', label: 'Leased Out' },
];

interface HorseListProps {
  onAddHorse?: () => void;
  onSelectHorse?: (horseId: string) => void;
}

export function HorseList({ onAddHorse, onSelectHorse }: HorseListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<HorseStatus | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { horses, total, totalPages, isLoading, error, refetch } = useHorses({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    search: search || undefined,
    page,
    pageSize,
  });

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleStatusChange = (status: HorseStatus | 'ALL') => {
    setStatusFilter(status);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Horses</h1>
          <p className="text-muted-foreground mt-1">
            {total} {total === 1 ? 'horse' : 'horses'} in your barn
          </p>
        </div>
        
        {onAddHorse && (
          <Button onClick={onAddHorse} leftIcon={<Plus className="w-4 h-4" />}>
            Add Horse
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search horses..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleStatusChange(filter.value)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                ${
                  statusFilter === filter.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* View mode toggle */}
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
          <p>{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="mt-2"
          >
            Try again
          </Button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && horses.length === 0 && (
        <div className="text-center py-12 bg-background rounded-2xl">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            🐴
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {search || statusFilter !== 'ALL'
              ? 'No horses found'
              : 'No horses yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {search || statusFilter !== 'ALL'
              ? 'Try adjusting your search or filters'
              : 'Add your first horse to get started'}
          </p>
          {onAddHorse && !search && statusFilter === 'ALL' && (
            <Button onClick={onAddHorse} leftIcon={<Plus className="w-4 h-4" />}>
              Add Horse
            </Button>
          )}
        </div>
      )}

      {/* Horse grid/list */}
      {!isLoading && !error && horses.length > 0 && (
        <>
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-3'
            }
          >
            {horses.map((horse) => (
              <HorseCard
                key={horse.id}
                horse={horse}
                variant={viewMode === 'list' ? 'compact' : 'default'}
                onClick={() => onSelectHorse?.(horse.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1} to{' '}
                {Math.min(page * pageSize, total)} of {total} horses
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                          page === pageNum
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
