import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isYesterday, isTomorrow } from 'date-fns';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string | null, formatStr: string = 'MMM d, yyyy'): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, formatStr);
}

/**
 * Format a date relative to now (e.g., "2 days ago")
 */
export function formatRelativeDate(date: Date | string | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  if (isTomorrow(d)) return 'Tomorrow';
  
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Format currency from cents
 */
export function formatCurrency(cents: number | null | undefined, currency: string = 'USD'): string {
  if (cents === null || cents === undefined) return '';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * Format a weight in pounds
 */
export function formatWeight(pounds: number | null): string {
  if (pounds === null) return '';
  return `${pounds.toLocaleString()} lbs`;
}

/**
 * Format height in hands
 */
export function formatHeight(hands: number | null): string {
  if (hands === null) return '';
  return `${hands} hh`;
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date | string | null): number | null {
  if (!dateOfBirth) return null;
  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  const ageDifMs = Date.now() - dob.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

/**
 * Format age with "yo" suffix
 */
export function formatAge(dateOfBirth: Date | string | null): string {
  const age = calculateAge(dateOfBirth);
  if (age === null) return '';
  return `${age} yo`;
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Generate a random invite code
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'STABLE-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Slugify a string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert enum-style string to readable format
 * e.g., "VET_APPOINTMENT" -> "Vet Appointment"
 */
export function formatEnumValue(value: string): string {
  return value
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Get status color class
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: 'status-active',
    LAYUP: 'status-layup',
    RETIRED: 'status-retired',
    SOLD: 'status-sold',
    DECEASED: 'bg-stone-200 text-stone-600',
    LEASED_OUT: 'bg-purple-100 text-purple-700',
  };
  return colors[status] || 'bg-stone-100 text-stone-600';
}

/**
 * Get priority color class
 */
export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    URGENT: 'priority-urgent',
    HIGH: 'priority-high',
    MEDIUM: 'priority-medium',
    LOW: 'priority-low',
  };
  return colors[priority] || 'priority-low';
}

/**
 * Get event type icon emoji
 */
export function getEventTypeEmoji(type: string): string {
  const emojis: Record<string, string> = {
    FARRIER: '🔨',
    DEWORMING: '💊',
    VACCINATION: '💉',
    VET_APPOINTMENT: '🩺',
    DENTAL: '🦷',
    TRAINING: '🏃',
    SHOW: '🏆',
    TRANSPORT: '🚚',
    BREEDING: '🐴',
    OTHER: '📋',
  };
  return emojis[type] || '📋';
}

/**
 * File size formatter
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if date is expired
 */
export function isExpired(date: Date | string | null): boolean {
  if (!date) return false;
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date();
}

/**
 * Check if date is expiring soon (within days)
 */
export function isExpiringSoon(date: Date | string | null, days: number = 30): boolean {
  if (!date) return false;
  const d = typeof date === 'string' ? new Date(date) : date;
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + days);
  return d <= threshold && d > new Date();
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Sort array by date key
 */
export function sortByDate<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'desc'): T[] {
  return [...array].sort((a, b) => {
    const dateA = new Date(a[key] as string).getTime();
    const dateB = new Date(b[key] as string).getTime();
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}
