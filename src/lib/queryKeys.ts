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
export const staleTimes = {
  horses: 2 * 60 * 1000,      // 2 minutes - static, rarely changes
  events: 30 * 1000,          // 30 seconds - schedule-sensitive
  tasks: 30 * 1000,           // 30 seconds - active workflow
  clients: 5 * 60 * 1000,     // 5 minutes - very static
  lessons: 60 * 1000,         // 1 minute
  invoices: 60 * 1000,        // 1 minute
  alerts: 30 * 1000,          // 30 seconds - time-sensitive
  activity: 60 * 1000,        // 1 minute
  team: 5 * 60 * 1000,        // 5 minutes - static
  services: 5 * 60 * 1000,    // 5 minutes - static
  dashboard: 60 * 1000,       // 1 minute
  paddocks: 2 * 60 * 1000,    // 2 minutes - facility data
  stalls: 2 * 60 * 1000,      // 2 minutes - facility data
  turnouts: 30 * 1000,        // 30 seconds - active tracking
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
