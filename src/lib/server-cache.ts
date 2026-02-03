/**
 * Server-side LRU cache for expensive operations
 * Used to cache permission checks, count queries, and other frequently accessed data
 */

import { LRUCache } from 'lru-cache';

// ============================================================================
// Permission Cache
// ============================================================================

interface PermissionCacheEntry {
  hasPermission: boolean;
  timestamp: number;
}

// Cache for permission lookups
// Key format: `${userId}:${barnId}:${permission}`
const permissionCache = new LRUCache<string, PermissionCacheEntry>({
  max: 1000, // Maximum number of entries
  ttl: 5 * 60 * 1000, // 5 minutes TTL
});

/**
 * Get cached permission check result
 */
export function getCachedPermission(
  userId: string,
  barnId: string,
  permission: string
): boolean | null {
  const key = `${userId}:${barnId}:${permission}`;
  const entry = permissionCache.get(key);
  return entry?.hasPermission ?? null;
}

/**
 * Cache a permission check result
 */
export function setCachedPermission(
  userId: string,
  barnId: string,
  permission: string,
  hasPermission: boolean
): void {
  const key = `${userId}:${barnId}:${permission}`;
  permissionCache.set(key, {
    hasPermission,
    timestamp: Date.now(),
  });
}

/**
 * Invalidate all permissions for a user in a barn
 * Called when user role changes
 */
export function invalidateUserBarnPermissions(userId: string, barnId: string): void {
  const prefix = `${userId}:${barnId}:`;
  for (const key of permissionCache.keys()) {
    if (key.startsWith(prefix)) {
      permissionCache.delete(key);
    }
  }
}

/**
 * Invalidate all permissions for a barn
 * Called when barn settings change
 */
export function invalidateBarnPermissions(barnId: string): void {
  const suffix = `:${barnId}:`;
  for (const key of permissionCache.keys()) {
    if (key.includes(suffix)) {
      permissionCache.delete(key);
    }
  }
}

// ============================================================================
// Barn Membership Cache
// ============================================================================

interface MembershipCacheEntry {
  membership: unknown | null;
  timestamp: number;
}

// Cache for barn membership lookups
// Key format: `${userId}:${barnId}`
const membershipCache = new LRUCache<string, MembershipCacheEntry>({
  max: 500,
  ttl: 5 * 60 * 1000, // 5 minutes TTL
});

/**
 * Get cached barn membership
 */
export function getCachedMembership(userId: string, barnId: string): unknown | null {
  const key = `${userId}:${barnId}`;
  const entry = membershipCache.get(key);
  return entry?.membership ?? null;
}

/**
 * Cache a barn membership lookup
 */
export function setCachedMembership(
  userId: string,
  barnId: string,
  membership: unknown | null
): void {
  const key = `${userId}:${barnId}`;
  membershipCache.set(key, {
    membership,
    timestamp: Date.now(),
  });
}

/**
 * Invalidate membership cache for a user
 */
export function invalidateUserMemberships(userId: string): void {
  for (const key of membershipCache.keys()) {
    if (key.startsWith(`${userId}:`)) {
      membershipCache.delete(key);
    }
  }
}

/**
 * Invalidate membership cache for a barn
 */
export function invalidateBarnMemberships(barnId: string): void {
  for (const key of membershipCache.keys()) {
    if (key.endsWith(`:${barnId}`)) {
      membershipCache.delete(key);
    }
  }
}

// ============================================================================
// Count Cache (for subscription limit checks)
// ============================================================================

interface CountCacheEntry {
  count: number;
  timestamp: number;
}

// Cache for count queries (horses, members, etc.)
// Key format: `${barnId}:${type}`
const countCache = new LRUCache<string, CountCacheEntry>({
  max: 200,
  ttl: 60 * 1000, // 1 minute TTL (shorter for counts that change more often)
});

type CountType = 'horses' | 'members' | 'clients' | 'activeHorses' | 'pendingTasks';

/**
 * Get cached count
 */
export function getCachedCount(barnId: string, type: CountType): number | null {
  const key = `${barnId}:${type}`;
  const entry = countCache.get(key);
  return entry?.count ?? null;
}

/**
 * Cache a count value
 */
export function setCachedCount(barnId: string, type: CountType, count: number): void {
  const key = `${barnId}:${type}`;
  countCache.set(key, {
    count,
    timestamp: Date.now(),
  });
}

/**
 * Invalidate a specific count for a barn
 */
export function invalidateCount(barnId: string, type: CountType): void {
  const key = `${barnId}:${type}`;
  countCache.delete(key);
}

/**
 * Invalidate all counts for a barn
 */
export function invalidateBarnCounts(barnId: string): void {
  for (const key of countCache.keys()) {
    if (key.startsWith(`${barnId}:`)) {
      countCache.delete(key);
    }
  }
}

// ============================================================================
// Generic Cache
// ============================================================================

interface GenericCacheEntry<T> {
  data: T;
  timestamp: number;
}

// Generic cache for arbitrary data with configurable TTL
const genericCache = new LRUCache<string, GenericCacheEntry<unknown>>({
  max: 500,
  ttl: 5 * 60 * 1000, // Default 5 minutes TTL
});

/**
 * Get cached data
 */
export function getCached<T>(key: string): T | null {
  const entry = genericCache.get(key);
  return (entry?.data as T) ?? null;
}

/**
 * Cache data with optional custom TTL (in milliseconds)
 */
export function setCached<T>(key: string, data: T, ttl?: number): void {
  if (ttl) {
    genericCache.set(key, { data, timestamp: Date.now() }, { ttl });
  } else {
    genericCache.set(key, { data, timestamp: Date.now() });
  }
}

/**
 * Delete cached data
 */
export function deleteCached(key: string): void {
  genericCache.delete(key);
}

/**
 * Delete all cached data matching a prefix
 */
export function deleteCachedByPrefix(prefix: string): void {
  for (const key of genericCache.keys()) {
    if (key.startsWith(prefix)) {
      genericCache.delete(key);
    }
  }
}

// ============================================================================
// Cache Stats (for debugging/monitoring)
// ============================================================================

export function getCacheStats() {
  return {
    permissions: {
      size: permissionCache.size,
      max: permissionCache.max,
    },
    memberships: {
      size: membershipCache.size,
      max: membershipCache.max,
    },
    counts: {
      size: countCache.size,
      max: countCache.max,
    },
    generic: {
      size: genericCache.size,
      max: genericCache.max,
    },
  };
}

/**
 * Clear all caches (useful for testing or manual cache invalidation)
 */
export function clearAllCaches(): void {
  permissionCache.clear();
  membershipCache.clear();
  countCache.clear();
  genericCache.clear();
}
