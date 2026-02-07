/**
 * Centralized query key factory for React Query
 * Ensures consistent cache key generation across the application
 */

export const queryKeys = {
  // Horses
  horses: {
    all: (barnId: string) => ['horses', barnId] as const,
    list: (barnId: string, filters?: { status?: string; search?: string; page?: number; pageSize?: number }) =>
      ['horses', barnId, 'list', filters] as const,
    detail: (barnId: string, horseId: string) => ['horses', barnId, horseId] as const,
    health: (barnId: string, horseId: string) => ['horses', barnId, horseId, 'health'] as const,
    documents: (barnId: string, horseId: string) => ['horses', barnId, horseId, 'documents'] as const,
    photos: (barnId: string, horseId: string) => ['horses', barnId, horseId, 'photos'] as const,
    feed: (barnId: string, horseId: string) => ['horses', barnId, horseId, 'feed'] as const,
  },

  // Events
  events: {
    all: (barnId: string) => ['events', barnId] as const,
    list: (barnId: string, filters?: {
      horseId?: string;
      status?: string;
      type?: string;
      startDate?: string;
      endDate?: string
    }) => ['events', barnId, 'list', filters] as const,
    detail: (barnId: string, eventId: string) => ['events', barnId, eventId] as const,
    upcoming: (barnId: string) => ['events', barnId, 'upcoming'] as const,
  },

  // Tasks
  tasks: {
    all: (barnId: string) => ['tasks', barnId] as const,
    list: (barnId: string, filters?: {
      status?: string;
      assigneeId?: string;
      horseId?: string;
      farmOnly?: boolean;
      dueDate?: string
    }) => ['tasks', barnId, 'list', filters] as const,
    detail: (barnId: string, taskId: string) => ['tasks', barnId, taskId] as const,
    pending: (barnId: string) => ['tasks', barnId, 'pending'] as const,
  },

  // Clients
  clients: {
    all: (barnId: string) => ['clients', barnId] as const,
    list: (barnId: string, filters?: { status?: string; search?: string }) =>
      ['clients', barnId, 'list', filters] as const,
    detail: (barnId: string, clientId: string) => ['clients', barnId, clientId] as const,
    invoices: (barnId: string, clientId: string) => ['clients', barnId, clientId, 'invoices'] as const,
  },

  // Lessons
  lessons: {
    all: (barnId: string) => ['lessons', barnId] as const,
    list: (barnId: string, filters?: {
      clientId?: string;
      instructorId?: string;
      status?: string;
      unbilled?: boolean;
    }) => ['lessons', barnId, 'list', filters] as const,
    detail: (barnId: string, lessonId: string) => ['lessons', barnId, lessonId] as const,
  },

  // Invoices
  invoices: {
    all: (barnId: string) => ['invoices', barnId] as const,
    list: (barnId: string, filters?: { status?: string; clientId?: string }) =>
      ['invoices', barnId, 'list', filters] as const,
    detail: (barnId: string, invoiceId: string) => ['invoices', barnId, invoiceId] as const,
  },

  // Alerts
  alerts: {
    all: (barnId: string) => ['alerts', barnId] as const,
    list: (barnId: string) => ['alerts', barnId, 'list'] as const,
  },

  // Activity Log
  activity: {
    all: (barnId: string) => ['activity', barnId] as const,
    list: (barnId: string, limit?: number) => ['activity', barnId, 'list', limit] as const,
  },

  // Team/Members
  team: {
    all: (barnId: string) => ['team', barnId] as const,
    list: (barnId: string) => ['team', barnId, 'list'] as const,
    detail: (barnId: string, memberId: string) => ['team', barnId, memberId] as const,
  },

  // User barns
  barns: {
    all: () => ['barns'] as const,
    list: () => ['barns', 'list'] as const,
    detail: (barnId: string) => ['barns', barnId] as const,
  },

  // Services
  services: {
    all: (barnId: string) => ['services', barnId] as const,
    list: (barnId: string) => ['services', barnId, 'list'] as const,
    detail: (barnId: string, serviceId: string) => ['services', barnId, serviceId] as const,
  },

  // Dashboard stats
  dashboard: {
    stats: (barnId: string) => ['dashboard', barnId, 'stats'] as const,
  },

  // Paddocks (Pastures)
  paddocks: {
    all: (barnId: string) => ['paddocks', barnId] as const,
    list: (barnId: string) => ['paddocks', barnId, 'list'] as const,
    detail: (barnId: string, paddockId: string) => ['paddocks', barnId, paddockId] as const,
  },

  // Stalls
  stalls: {
    all: (barnId: string) => ['stalls', barnId] as const,
    list: (barnId: string) => ['stalls', barnId, 'list'] as const,
    detail: (barnId: string, stallId: string) => ['stalls', barnId, stallId] as const,
  },

  // Turnouts
  turnouts: {
    all: (barnId: string) => ['turnouts', barnId] as const,
    list: (barnId: string) => ['turnouts', barnId, 'list'] as const,
    active: (barnId: string) => ['turnouts', barnId, 'active'] as const,
  },
} as const;

// Stale time constants (in milliseconds)
// Data stays fresh during navigation — mutations invalidate the cache when changes happen
export const staleTimes = {
  horses: 5 * 60 * 1000,      // 5 minutes - rarely changes without a mutation
  events: 3 * 60 * 1000,      // 3 minutes - invalidated on create/update
  tasks: 3 * 60 * 1000,       // 3 minutes - invalidated on create/update
  clients: 5 * 60 * 1000,     // 5 minutes - very static
  lessons: 3 * 60 * 1000,     // 3 minutes
  invoices: 3 * 60 * 1000,    // 3 minutes
  alerts: 2 * 60 * 1000,      // 2 minutes - time-sensitive but not instant
  activity: 2 * 60 * 1000,    // 2 minutes
  team: 5 * 60 * 1000,        // 5 minutes - static
  services: 5 * 60 * 1000,    // 5 minutes - static
  dashboard: 2 * 60 * 1000,   // 2 minutes
  paddocks: 5 * 60 * 1000,    // 5 minutes - facility data
  stalls: 5 * 60 * 1000,      // 5 minutes - facility data
  turnouts: 2 * 60 * 1000,    // 2 minutes - active tracking
} as const;

// Helper to invalidate all data for a barn
export function getBarnInvalidationKeys(barnId: string) {
  return [
    queryKeys.horses.all(barnId),
    queryKeys.events.all(barnId),
    queryKeys.tasks.all(barnId),
    queryKeys.clients.all(barnId),
    queryKeys.lessons.all(barnId),
    queryKeys.invoices.all(barnId),
    queryKeys.alerts.all(barnId),
    queryKeys.activity.all(barnId),
    queryKeys.paddocks.all(barnId),
    queryKeys.stalls.all(barnId),
    queryKeys.turnouts.all(barnId),
  ];
}
