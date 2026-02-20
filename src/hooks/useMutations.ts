'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentBarn } from '@/contexts/BarnContext';
import { queryKeys } from '@/lib/queryKeys';
import { toast, showError } from '@/lib/toast';
import type { Horse, Event, Task } from '@/types';

// ============================================================================
// Shared mutation helper with CSRF protection
// ============================================================================
import { csrfFetch } from '@/lib/fetch';

interface MutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

async function fetchMutation<T>(
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
// Horse Mutations
// ============================================================================

interface CreateHorseInput {
  barnName: string;
  registeredName?: string;
  breed?: string;
  color?: string;
  dateOfBirth?: string;
  sex?: string;
  status?: string;
  [key: string]: unknown;
}

interface UpdateHorseInput extends Partial<CreateHorseInput> {
  id: string;
}

export function useCreateHorse() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateHorseInput) => {
      return fetchMutation<{ data: Horse }>(
        `/api/barns/${barn!.id}/horses`,
        'POST',
        input
      );
    },
    onSuccess: () => {
      toast.success('Horse added', 'Successfully added to your barn');
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.horses.all(barn.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.activity.all(barn.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats(barn.id) });
      }
    },
    onError: (error) => showError(error, 'Failed to add horse'),
  });
}

export function useUpdateHorse() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateHorseInput) => {
      const { id, ...data } = input;
      return fetchMutation<{ data: Horse }>(
        `/api/barns/${barn!.id}/horses/${id}`,
        'PUT',
        data
      );
    },
    onSuccess: (_, variables) => {
      toast.success('Horse updated');
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.horses.all(barn.id) });
        queryClient.invalidateQueries({
          queryKey: queryKeys.horses.detail(barn.id, variables.id),
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.activity.all(barn.id) });
      }
    },
    onError: (error) => showError(error, 'Failed to update horse'),
  });
}

export function useDeleteHorse() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (horseId: string) => {
      return fetchMutation<{ success: boolean }>(
        `/api/barns/${barn!.id}/horses/${horseId}`,
        'DELETE'
      );
    },
    onSuccess: () => {
      toast.success('Horse removed');
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.horses.all(barn.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.activity.all(barn.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats(barn.id) });
      }
    },
    onError: (error) => showError(error, 'Failed to remove horse'),
  });
}

// ============================================================================
// Event Mutations
// ============================================================================

interface CreateEventInput {
  type: string;
  title: string;
  description?: string;
  scheduledDate: string;
  horseId?: string;
  [key: string]: unknown;
}

interface UpdateEventInput extends Partial<CreateEventInput> {
  id: string;
}

export function useCreateEvent() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEventInput) => {
      return fetchMutation<{ data: Event }>(
        `/api/barns/${barn!.id}/events`,
        'POST',
        input
      );
    },
    onSuccess: () => {
      toast.success('Event created');
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.events.all(barn.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.alerts.all(barn.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.activity.all(barn.id) });
      }
    },
    onError: (error) => showError(error, 'Failed to create event'),
  });
}

export function useUpdateEvent() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateEventInput) => {
      const { id, ...data } = input;
      return fetchMutation<{ data: Event }>(
        `/api/barns/${barn!.id}/events/${id}`,
        'PUT',
        data
      );
    },
    onSuccess: (_, variables) => {
      toast.success('Event updated');
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.events.all(barn.id) });
        queryClient.invalidateQueries({
          queryKey: queryKeys.events.detail(barn.id, variables.id),
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.alerts.all(barn.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.activity.all(barn.id) });
      }
    },
    onError: (error) => showError(error, 'Failed to update event'),
  });
}

export function useDeleteEvent() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      return fetchMutation<{ success: boolean }>(
        `/api/barns/${barn!.id}/events/${eventId}`,
        'DELETE'
      );
    },
    onSuccess: () => {
      toast.success('Event deleted');
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.events.all(barn.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.alerts.all(barn.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.activity.all(barn.id) });
      }
    },
    onError: (error) => showError(error, 'Failed to delete event'),
  });
}

export function useCompleteEvent() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      return fetchMutation<{ data: Event }>(
        `/api/barns/${barn!.id}/events/${eventId}`,
        'PATCH',
        { status: 'COMPLETED', completedDate: new Date().toISOString() }
      );
    },
    onSuccess: () => {
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.events.all(barn.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.alerts.all(barn.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.activity.all(barn.id) });
      }
    },
    onError: (error) => showError(error, 'Failed to complete event'),
  });
}

// ============================================================================
// Task Mutations
// ============================================================================

interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  assigneeId?: string;
  [key: string]: unknown;
}

interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string;
}

export function useCreateTask() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      return fetchMutation<{ data: Task }>(
        `/api/barns/${barn!.id}/tasks`,
        'POST',
        input
      );
    },
    onSuccess: () => {
      toast.success('Task created');
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(barn.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.activity.all(barn.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats(barn.id) });
      }
    },
    onError: (error) => showError(error, 'Failed to create task'),
  });
}

export function useUpdateTask() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTaskInput) => {
      const { id, ...data } = input;
      return fetchMutation<{ data: Task }>(
        `/api/barns/${barn!.id}/tasks/${id}`,
        'PUT',
        data
      );
    },
    onSuccess: (_, variables) => {
      toast.success('Task updated');
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(barn.id) });
        queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.detail(barn.id, variables.id),
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.activity.all(barn.id) });
      }
    },
    onError: (error) => showError(error, 'Failed to update task'),
  });
}

export function useDeleteTask() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      return fetchMutation<{ success: boolean }>(
        `/api/barns/${barn!.id}/tasks/${taskId}`,
        'DELETE'
      );
    },
    onSuccess: () => {
      toast.success('Task deleted');
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(barn.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.activity.all(barn.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats(barn.id) });
      }
    },
    onError: (error) => showError(error, 'Failed to delete task'),
  });
}

export function useCompleteTask() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      return fetchMutation<{ data: Task }>(
        `/api/barns/${barn!.id}/tasks/${taskId}`,
        'PATCH',
        { status: 'COMPLETED', completedAt: new Date().toISOString() }
      );
    },
    onSuccess: () => {
      toast.success('Task completed');
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(barn.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.activity.all(barn.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats(barn.id) });
      }
    },
    onError: (error) => showError(error, 'Failed to complete task'),
  });
}

// ============================================================================
// Client Mutations
// ============================================================================

interface CreateClientInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  [key: string]: unknown;
}

interface UpdateClientInput extends Partial<CreateClientInput> {
  id: string;
}

export function useCreateClient() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateClientInput) => {
      return fetchMutation<{ data: unknown }>(
        `/api/barns/${barn!.id}/clients`,
        'POST',
        input
      );
    },
    onSuccess: () => {
      toast.success('Client added');
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.clients.all(barn.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.activity.all(barn.id) });
      }
    },
    onError: (error) => showError(error, 'Failed to add client'),
  });
}

export function useUpdateClient() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateClientInput) => {
      const { id, ...data } = input;
      return fetchMutation<{ data: unknown }>(
        `/api/barns/${barn!.id}/clients/${id}`,
        'PUT',
        data
      );
    },
    onSuccess: (_, variables) => {
      toast.success('Client updated');
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.clients.all(barn.id) });
        queryClient.invalidateQueries({
          queryKey: queryKeys.clients.detail(barn.id, variables.id),
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.activity.all(barn.id) });
      }
    },
    onError: (error) => showError(error, 'Failed to update client'),
  });
}

export function useDeleteClient() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      return fetchMutation<{ success: boolean }>(
        `/api/barns/${barn!.id}/clients/${clientId}`,
        'DELETE'
      );
    },
    onSuccess: () => {
      toast.success('Client removed');
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.clients.all(barn.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.activity.all(barn.id) });
      }
    },
    onError: (error) => showError(error, 'Failed to remove client'),
  });
}

// ============================================================================
// Invoice Mutations
// ============================================================================

interface CreateInvoiceInput {
  clientId: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    serviceId?: string;
  }>;
  dueDate: string;
  notes?: string;
  [key: string]: unknown;
}

interface UpdateInvoiceInput extends Partial<CreateInvoiceInput> {
  id: string;
}

export function useCreateInvoice() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateInvoiceInput) => {
      return fetchMutation<{ data: unknown }>(
        `/api/barns/${barn!.id}/invoices`,
        'POST',
        input
      );
    },
    onSuccess: (_, variables) => {
      toast.success('Invoice created');
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all(barn.id) });
        queryClient.invalidateQueries({
          queryKey: queryKeys.clients.invoices(barn.id, variables.clientId),
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.activity.all(barn.id) });
      }
    },
    onError: (error) => showError(error, 'Failed to create invoice'),
  });
}

export function useUpdateInvoice() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateInvoiceInput) => {
      const { id, ...data } = input;
      return fetchMutation<{ data: unknown }>(
        `/api/barns/${barn!.id}/invoices/${id}`,
        'PUT',
        data
      );
    },
    onSuccess: (_, variables) => {
      toast.success('Invoice updated');
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all(barn.id) });
        queryClient.invalidateQueries({
          queryKey: queryKeys.invoices.detail(barn.id, variables.id),
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.activity.all(barn.id) });
      }
    },
    onError: (error) => showError(error, 'Failed to update invoice'),
  });
}

export function useDeleteInvoice() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      return fetchMutation<{ success: boolean }>(
        `/api/barns/${barn!.id}/invoices/${invoiceId}`,
        'DELETE'
      );
    },
    onSuccess: () => {
      toast.success('Invoice deleted');
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all(barn.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.activity.all(barn.id) });
      }
    },
    onError: (error) => showError(error, 'Failed to delete invoice'),
  });
}

// ============================================================================
// Lesson Mutations
// ============================================================================

interface CreateLessonInput {
  clientId: string;
  instructorId: string;
  date: string;
  startTime: string;
  duration: number;
  type: string;
  price: number;
  horseId?: string;
  [key: string]: unknown;
}

interface UpdateLessonInput extends Partial<CreateLessonInput> {
  id: string;
}

export function useCreateLesson() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateLessonInput) => {
      return fetchMutation<{ data: unknown }>(
        `/api/barns/${barn!.id}/lessons`,
        'POST',
        input
      );
    },
    onSuccess: () => {
      toast.success('Lesson scheduled');
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all(barn.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.events.all(barn.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.activity.all(barn.id) });
      }
    },
    onError: (error) => showError(error, 'Failed to schedule lesson'),
  });
}

export function useUpdateLesson() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateLessonInput) => {
      const { id, ...data } = input;
      return fetchMutation<{ data: unknown }>(
        `/api/barns/${barn!.id}/lessons/${id}`,
        'PUT',
        data
      );
    },
    onSuccess: (_, variables) => {
      toast.success('Lesson updated');
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all(barn.id) });
        queryClient.invalidateQueries({
          queryKey: queryKeys.lessons.detail(barn.id, variables.id),
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.activity.all(barn.id) });
      }
    },
    onError: (error) => showError(error, 'Failed to update lesson'),
  });
}

export function useDeleteLesson() {
  const { barn } = useCurrentBarn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lessonId: string) => {
      return fetchMutation<{ success: boolean }>(
        `/api/barns/${barn!.id}/lessons/${lessonId}`,
        'DELETE'
      );
    },
    onSuccess: () => {
      toast.success('Lesson removed');
      if (barn) {
        queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all(barn.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.activity.all(barn.id) });
      }
    },
    onError: (error) => showError(error, 'Failed to remove lesson'),
  });
}
