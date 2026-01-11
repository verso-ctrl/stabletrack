import { useState, useEffect, useCallback } from 'react';
import { useCurrentBarn } from '@/contexts/BarnContext';
import type { Horse, Event, Task, ActivityLog, Alert } from '@/types';

// ============================================================================
// useHorses - Fetch horses for current barn
// ============================================================================

interface UseHorsesOptions {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
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
  const [horses, setHorses] = useState<Horse[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHorses = useCallback(async () => {
    if (!barn) return;

    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.status) params.set('status', options.status);
      if (options.search) params.set('search', options.search);
      if (options.page) params.set('page', options.page.toString());
      if (options.pageSize) params.set('pageSize', options.pageSize.toString());

      const response = await fetch(
        `/api/barns/${barn.id}/horses?${params.toString()}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch horses');
      }

      setHorses(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [barn, options.status, options.search, options.page, options.pageSize]);

  useEffect(() => {
    fetchHorses();
  }, [fetchHorses]);

  return { horses, total, totalPages, isLoading, error, refetch: fetchHorses };
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
  const [horse, setHorse] = useState<Horse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHorse = useCallback(async () => {
    if (!barn || !horseId) {
      setHorse(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/barns/${barn.id}/horses/${horseId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch horse');
      }

      setHorse(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [barn, horseId]);

  useEffect(() => {
    fetchHorse();
  }, [fetchHorse]);

  return { horse, isLoading, error, refetch: fetchHorse };
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
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!barnId || options.enabled === false) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.horseId) params.set('horseId', options.horseId);
      if (options.status) params.set('status', options.status);
      if (options.type) params.set('type', options.type);
      if (options.startDate) params.set('startDate', options.startDate.toISOString());
      if (options.endDate) params.set('endDate', options.endDate.toISOString());

      const response = await fetch(
        `/api/barns/${barnId}/events?${params.toString()}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch events');
      }

      setEvents(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [barnId, options.horseId, options.status, options.type, options.startDate, options.endDate, options.enabled]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { 
    data: events.length > 0 ? { data: events } : null,
    events, 
    isLoading, 
    error, 
    refetch: fetchEvents 
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
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = useCallback(async () => {
    if (!barnId || options.enabled === false) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.clientId) params.set('clientId', options.clientId);
      if (options.instructorId) params.set('instructorId', options.instructorId);
      if (options.status) params.set('status', options.status);
      if (options.unbilled) params.set('unbilled', 'true');

      const response = await fetch(
        `/api/barns/${barnId}/lessons?${params.toString()}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch lessons');
      }

      setLessons(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [barnId, options.clientId, options.instructorId, options.status, options.unbilled, options.enabled]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return {
    data: lessons.length > 0 ? { data: lessons } : null,
    lessons,
    isLoading,
    error,
    refetch: fetchLessons
  };
}

// ============================================================================
// useTasks - Fetch tasks for current barn
// ============================================================================

interface UseTasksOptions {
  status?: string;
  assigneeId?: string;
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!barn) return;

    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.status) params.set('status', options.status);
      if (options.assigneeId) params.set('assigneeId', options.assigneeId);
      if (options.dueDate) params.set('dueDate', options.dueDate.toISOString());

      const response = await fetch(
        `/api/barns/${barn.id}/tasks?${params.toString()}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch tasks');
      }

      setTasks(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [barn, options.status, options.assigneeId, options.dueDate]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, isLoading, error, refetch: fetchTasks };
}

// ============================================================================
// useAlerts - Generate alerts for current barn
// ============================================================================

export function useAlerts(): { alerts: Alert[]; isLoading: boolean } {
  const { barn } = useCurrentBarn();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!barn) {
      setAlerts([]);
      setIsLoading(false);
      return;
    }

    // Fetch alerts from the API
    const fetchAlerts = async () => {
      try {
        const response = await fetch(`/api/barns/${barn.id}/alerts`);
        const result = await response.json();

        if (response.ok) {
          setAlerts(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, [barn]);

  return { alerts, isLoading };
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
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!barn) {
      setActivities([]);
      setIsLoading(false);
      return;
    }

    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/barns/${barn.id}/activity?limit=${limit}`
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch activity');
        }

        setActivities(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [barn, limit]);

  return { activities, isLoading, error };
}
