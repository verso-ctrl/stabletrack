import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentBarn } from '@/contexts/BarnContext';
import { queryKeys, staleTimes } from '@/lib/queryKeys';
import type { Horse, Event, Task, ActivityLog, Alert } from '@/types';

// ============================================================================
// Shared fetch helper
// ============================================================================

async function fetchApi<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Request failed');
  }

  return result;
}

// ============================================================================
// useHorses - Fetch horses for current barn
// ============================================================================

interface UseHorsesOptions {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

interface HorsesResponse {
  data: Horse[];
  total: number;
  totalPages: number;
}

interface UseHorsesResult {
  horses: Horse[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHorses(options: UseHorsesOptions = {}): UseHorsesResult {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  const filters = {
    status: options.status,
    search: options.search,
    page: options.page,
    pageSize: options.pageSize,
  };

  const { data, isLoading, error, refetch: queryRefetch } = useQuery({
    queryKey: queryKeys.horses.list(barn?.id ?? '', filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.status) params.set('status', options.status);
      if (options.search) params.set('search', options.search);
      if (options.page) params.set('page', options.page.toString());
      if (options.pageSize) params.set('pageSize', options.pageSize.toString());

      return fetchApi<HorsesResponse>(`/api/barns/${barn!.id}/horses?${params.toString()}`);
    },
    enabled: !!barn,
    staleTime: staleTimes.horses,
  });

  const refetch = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.horses.all(barn?.id ?? '') });
    await queryRefetch();
  };

  return {
    horses: data?.data ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
}

// ============================================================================
// useHorse - Fetch single horse details
// ============================================================================

interface UseHorseResult {
  horse: Horse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHorse(horseId: string | null): UseHorseResult {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch: queryRefetch } = useQuery({
    queryKey: queryKeys.horses.detail(barn?.id ?? '', horseId ?? ''),
    queryFn: async () => {
      return fetchApi<{ data: Horse }>(`/api/barns/${barn!.id}/horses/${horseId}`);
    },
    enabled: !!barn && !!horseId,
    staleTime: staleTimes.horses,
  });

  const refetch = async () => {
    if (barn && horseId) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.horses.detail(barn.id, horseId),
      });
    }
    await queryRefetch();
  };

  return {
    horse: data?.data ?? null,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
}

// ============================================================================
// useEvents - Fetch events for current barn
// ============================================================================

interface UseEventsOptions {
  barnId?: string;
  horseId?: string;
  status?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  enabled?: boolean;
}

interface UseEventsResult {
  data: { data: Event[] } | null;
  events: Event[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEvents(options: UseEventsOptions = {}): UseEventsResult {
  const { barn } = useCurrentBarn();
  const barnId = options.barnId || barn?.id;
  const queryClient = useQueryClient();

  const filters = {
    horseId: options.horseId,
    status: options.status,
    type: options.type,
    startDate: options.startDate?.toISOString(),
    endDate: options.endDate?.toISOString(),
  };

  const { data, isLoading, error, refetch: queryRefetch } = useQuery({
    queryKey: queryKeys.events.list(barnId ?? '', filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.horseId) params.set('horseId', options.horseId);
      if (options.status) params.set('status', options.status);
      if (options.type) params.set('type', options.type);
      if (options.startDate) params.set('startDate', options.startDate.toISOString());
      if (options.endDate) params.set('endDate', options.endDate.toISOString());

      return fetchApi<{ data: Event[] }>(`/api/barns/${barnId}/events?${params.toString()}`);
    },
    enabled: !!barnId && options.enabled !== false,
    staleTime: staleTimes.events,
  });

  const refetch = async () => {
    if (barnId) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.events.all(barnId) });
    }
    await queryRefetch();
  };

  return {
    data: data ?? null,
    events: data?.data ?? [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
}

// ============================================================================
// useLessons - Fetch lessons for current barn
// ============================================================================

interface UseLessonsOptions {
  barnId?: string;
  clientId?: string;
  instructorId?: string;
  status?: string;
  unbilled?: boolean;
  enabled?: boolean;
}

interface Lesson {
  id: string;
  barnId: string;
  clientId: string;
  horseId: string | null;
  instructorId: string | null;
  type: string;
  discipline: string | null;
  date: string;
  scheduledDate: string;
  startTime: string;
  duration: number;
  price: number;
  status: string;
  billed: boolean;
  notes: string | null;
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  horse?: {
    id: string;
    barnName: string;
  };
  instructor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface UseLessonsResult {
  data: { data: Lesson[] } | null;
  lessons: Lesson[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useLessons(options: UseLessonsOptions = {}): UseLessonsResult {
  const { barn } = useCurrentBarn();
  const barnId = options.barnId || barn?.id;
  const queryClient = useQueryClient();

  const filters = {
    clientId: options.clientId,
    instructorId: options.instructorId,
    status: options.status,
    unbilled: options.unbilled,
  };

  const { data, isLoading, error, refetch: queryRefetch } = useQuery({
    queryKey: queryKeys.lessons.list(barnId ?? '', filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.clientId) params.set('clientId', options.clientId);
      if (options.instructorId) params.set('instructorId', options.instructorId);
      if (options.status) params.set('status', options.status);
      if (options.unbilled) params.set('unbilled', 'true');

      return fetchApi<{ data: Lesson[] }>(`/api/barns/${barnId}/lessons?${params.toString()}`);
    },
    enabled: !!barnId && options.enabled !== false,
    staleTime: staleTimes.lessons,
  });

  const refetch = async () => {
    if (barnId) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all(barnId) });
    }
    await queryRefetch();
  };

  return {
    data: data ?? null,
    lessons: data?.data ?? [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
}

// ============================================================================
// useTasks - Fetch tasks for current barn
// ============================================================================

interface UseTasksOptions {
  status?: string;
  assigneeId?: string;
  horseId?: string;
  farmOnly?: boolean;
  dueDate?: Date;
}

interface UseTasksResult {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTasks(options: UseTasksOptions = {}): UseTasksResult {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  const filters = {
    status: options.status,
    assigneeId: options.assigneeId,
    horseId: options.horseId,
    farmOnly: options.farmOnly,
    dueDate: options.dueDate?.toISOString(),
  };

  const { data, isLoading, error, refetch: queryRefetch } = useQuery({
    queryKey: queryKeys.tasks.list(barn?.id ?? '', filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.status) params.set('status', options.status);
      if (options.assigneeId) params.set('assigneeId', options.assigneeId);
      if (options.horseId) params.set('horseId', options.horseId);
      if (options.farmOnly) params.set('farmOnly', 'true');
      if (options.dueDate) params.set('dueDate', options.dueDate.toISOString());

      return fetchApi<{ data: Task[] }>(`/api/barns/${barn!.id}/tasks?${params.toString()}`);
    },
    enabled: !!barn,
    staleTime: staleTimes.tasks,
  });

  const refetch = async () => {
    if (barn) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(barn.id) });
    }
    await queryRefetch();
  };

  return {
    tasks: data?.data ?? [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
}

// ============================================================================
// useAlerts - Fetch alerts for current barn
// ============================================================================

export function useAlerts(): { alerts: Alert[]; isLoading: boolean } {
  const { barn } = useCurrentBarn();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.alerts.list(barn?.id ?? ''),
    queryFn: async () => {
      return fetchApi<{ data: Alert[] }>(`/api/barns/${barn!.id}/alerts`);
    },
    enabled: !!barn,
    staleTime: staleTimes.alerts,
  });

  return {
    alerts: data?.data ?? [],
    isLoading,
  };
}

// ============================================================================
// useActivityLog - Fetch recent activity for current barn
// ============================================================================

export function useActivityLog(limit: number = 20): {
  activities: ActivityLog[];
  isLoading: boolean;
  error: string | null;
} {
  const { barn } = useCurrentBarn();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.activity.list(barn?.id ?? '', limit),
    queryFn: async () => {
      return fetchApi<{ data: ActivityLog[] }>(`/api/barns/${barn!.id}/activity?limit=${limit}`);
    },
    enabled: !!barn,
    staleTime: staleTimes.activity,
  });

  return {
    activities: data?.data ?? [],
    isLoading,
    error: error ? (error as Error).message : null,
  };
}

// ============================================================================
// useDashboard - Single consolidated fetch for the dashboard page
// ============================================================================

export function useDashboard() {
  const { barn } = useCurrentBarn();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.dashboard.stats(barn?.id || ''),
    queryFn: () => fetchApi<{ data: any }>(`/api/barns/${barn!.id}/dashboard`),
    enabled: !!barn?.id,
    staleTime: staleTimes.dashboard,
  });

  const d = data?.data;

  return {
    horses: d?.horses ?? [],
    events: d?.events ?? [],
    tasks: d?.tasks ?? [],
    alerts: d?.alerts ?? [],
    stalls: d?.stalls ?? [],
    paddocks: d?.paddocks ?? [],
    stats: d?.stats ?? null,
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
