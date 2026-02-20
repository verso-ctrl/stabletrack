'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentBarn } from '@/contexts/BarnContext';
import { queryKeys, staleTimes } from '@/lib/queryKeys';
import { csrfFetch } from '@/lib/fetch';

// ============================================================================
// Types
// ============================================================================

export interface FacilityHorse {
  id: string;
  barnName: string;
  profilePhotoUrl: string | null;
  status: string;
}

export interface Paddock {
  id: string;
  barnId: string;
  name: string;
  acreage: number | null;
  maxHorses: number | null;
  horses: FacilityHorse[];
  horseCount: number;
}

export interface Stall {
  id: string;
  barnId: string;
  name: string;
  section: string;
  horse: FacilityHorse | null;
}

// ============================================================================
// Fetch helper
// ============================================================================

async function fetchApi<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Request failed');
  }

  return result;
}

async function mutateApi<T>(
  url: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown
): Promise<T> {
  const response = await csrfFetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Request failed');
  }

  return result;
}

// ============================================================================
// Paddocks (Pastures) Hooks
// ============================================================================

export function usePaddocks() {
  const { barn } = useCurrentBarn();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.paddocks.list(barn?.id ?? ''),
    queryFn: () => fetchApi<{ data: Paddock[] }>(`/api/barns/${barn!.id}/paddocks`),
    enabled: !!barn,
    staleTime: staleTimes.paddocks,
  });

  return {
    paddocks: data?.data ?? [],
    isLoading,
    error: error ? (error as Error).message : null,
  };
}

export function useCreatePaddock() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { name: string; acreage?: number; maxHorses?: number }) =>
      mutateApi<{ data: Paddock }>(`/api/barns/${barn!.id}/paddocks`, 'POST', input),
    onSuccess: () => {
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.paddocks.all(barn.id) });
      }
    },
  });
}

export function useUpdatePaddock() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; name?: string; acreage?: number; maxHorses?: number }) =>
      mutateApi<{ data: Paddock }>(`/api/barns/${barn!.id}/paddocks`, 'PUT', input),
    onSuccess: () => {
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.paddocks.all(barn.id) });
      }
    },
  });
}

export function useDeletePaddock() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paddockId: string) =>
      mutateApi<{ success: boolean }>(`/api/barns/${barn!.id}/paddocks?id=${paddockId}`, 'DELETE'),
    onSuccess: () => {
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.paddocks.all(barn.id) });
      }
    },
  });
}

export function useAssignHorseToPaddock() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { paddockId?: string; horseId: string; action?: 'remove' }) =>
      mutateApi<{ success: boolean }>(`/api/barns/${barn!.id}/paddocks`, 'PATCH', input),
    onSuccess: () => {
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.paddocks.all(barn.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.horses.all(barn.id) });
      }
    },
  });
}

// ============================================================================
// Stalls Hooks
// ============================================================================

export function useStalls() {
  const { barn } = useCurrentBarn();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.stalls.list(barn?.id ?? ''),
    queryFn: () => fetchApi<{ data: Stall[] }>(`/api/barns/${barn!.id}/stalls`),
    enabled: !!barn,
    staleTime: staleTimes.stalls,
  });

  return {
    stalls: data?.data ?? [],
    isLoading,
    error: error ? (error as Error).message : null,
  };
}

export function useCreateStall() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { name: string; section?: string }) =>
      mutateApi<{ data: Stall }>(`/api/barns/${barn!.id}/stalls`, 'POST', input),
    onSuccess: () => {
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.stalls.all(barn.id) });
      }
    },
  });
}

export function useUpdateStall() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; name?: string; section?: string }) =>
      mutateApi<{ data: Stall }>(`/api/barns/${barn!.id}/stalls`, 'PUT', input),
    onSuccess: () => {
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.stalls.all(barn.id) });
      }
    },
  });
}

export function useDeleteStall() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stallId: string) =>
      mutateApi<{ success: boolean }>(`/api/barns/${barn!.id}/stalls?id=${stallId}`, 'DELETE'),
    onSuccess: () => {
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.stalls.all(barn.id) });
      }
    },
  });
}

export function useAssignHorseToStall() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { stallId?: string; horseId: string; action?: 'remove' }) =>
      mutateApi<{ success: boolean }>(`/api/barns/${barn!.id}/stalls`, 'PATCH', input),
    onSuccess: () => {
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.stalls.all(barn.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.horses.all(barn.id) });
      }
    },
  });
}
