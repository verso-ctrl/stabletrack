'use client';

import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Calendar,
  Camera,
  CheckSquare,
  Clock,
  FileText,
  Heart,
  Stethoscope,
  Utensils,
} from 'lucide-react';

// Horse icon component
export const HorseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12c0-4-3-8-8-8-3 0-5.5 1.5-7 3.5L3 10l1 3-2 4 3 1 2-1 2 3h4l1-2 2 1 4-3c1-1 2-2.5 2-4z"/>
    <circle cx="18" cy="9" r="1"/>
  </svg>
);

// Tab types and configuration
export type TabId = 'overview' | 'health' | 'tasks' | 'events' | 'care' | 'breeding' | 'activity' | 'photos' | 'documents';

export type TabIcon = LucideIcon | typeof HorseIcon;

export const tabs: { id: TabId; label: string; icon: TabIcon }[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'health', label: 'Health Records', icon: Stethoscope },
  { id: 'tasks', label: 'Horse Tasks', icon: CheckSquare },
  { id: 'events', label: 'Horse Events', icon: Calendar },
  { id: 'care', label: 'Feeding Plan', icon: Utensils },
  { id: 'breeding', label: 'Breeding', icon: Heart },
  { id: 'activity', label: 'Activity Log', icon: Clock },
  { id: 'photos', label: 'Photos', icon: Camera },
  { id: 'documents', label: 'Documents', icon: FileText },
];

// Status badge colors
export const statusColors: Record<string, string> = {
  ACTIVE: 'badge-success',
  LAYUP: 'badge-warning',
  RETIRED: 'badge-neutral',
};

// Vaccination types
export const vaccinationTypes = [
  'RABIES',
  'TETANUS',
  'EWT_EEE_WEE_TETANUS',
  'WEST_NILE',
  'INFLUENZA',
  'RHINOPNEUMONITIS',
  'STRANGLES',
  'POTOMAC_HORSE_FEVER',
  'BOTULISM',
  'OTHER',
];

// Reusable InfoItem component
export function InfoItem({
  label,
  value,
  subValue,
  icon: Icon
}: {
  label: string;
  value: string | number | null | undefined;
  subValue?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide mb-0.5 sm:mb-1 truncate">{label}</p>
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />}
        <p className="text-xs sm:text-sm font-medium text-foreground truncate">
          {value || '—'}
        </p>
      </div>
      {subValue && <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{subValue}</p>}
    </div>
  );
}
