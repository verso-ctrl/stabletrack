'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCurrentBarn, useBarn } from '@/contexts/BarnContext';
import { useDashboard } from '@/hooks/useData';
import { WelcomeChecklist } from '@/components/dashboard/WelcomeChecklist';
import { TrialBanner } from '@/components/billing/TrialBanner';
import { hasPermission, BarnRole } from '@/types';
import { toast } from '@/lib/toast';
import { csrfFetch } from '@/lib/fetch';
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  ArrowUpRight,
  Activity,
  Syringe,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

const HorseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12c0-4-3-8-8-8-3 0-5.5 1.5-7 3.5L3 10l1 3-2 4 3 1 2-1 2 3h4l1-2 2 1 4-3c1-1 2-2.5 2-4z"/>
    <circle cx="18" cy="9" r="1"/>
  </svg>
);

export default function DashboardPage() {
  const { barn, isLoading: barnLoading } = useCurrentBarn();
  const { isClient, currentBarn } = useBarn();
  const { horses, events, tasks, alerts, stalls, paddocks, isLoading: dashboardLoading, refetch } = useDashboard();
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState('Welcome');
  const [dateString, setDateString] = useState('');
  const [today, setToday] = useState<Date | null>(null);
  // Task completion: 'checking' = strikethrough shown, 'fading' = fading out, 'done' = hidden
  const [taskStates, setTaskStates] = useState<Record<string, 'checking' | 'fading' | 'done'>>({});
  const fadeTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const completeTask = useCallback(async (taskId: string, taskTitle: string) => {
    // Step 1: Optimistic strikethrough
    setTaskStates(prev => ({ ...prev, [taskId]: 'checking' }));

    // Step 2: After 1.5s start fading out
    fadeTimers.current[taskId] = setTimeout(() => {
      setTaskStates(prev => ({ ...prev, [taskId]: 'fading' }));
      // After fade animation (300ms), mark as done
      fadeTimers.current[`${taskId}-done`] = setTimeout(() => {
        setTaskStates(prev => ({ ...prev, [taskId]: 'done' }));
      }, 300);
    }, 1500);

    // Step 3: Fire API call
    try {
      const response = await csrfFetch(`/api/barns/${currentBarn?.id}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      if (!response.ok) throw new Error('Failed to update task');

      // Step 4: Toast with undo
      toast.success('Task completed', taskTitle, {
        label: 'Undo',
        onClick: () => undoComplete(taskId),
      });

      refetch();
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Update failed', 'Could not complete task');
      // Roll back
      clearTimeout(fadeTimers.current[taskId]);
      clearTimeout(fadeTimers.current[`${taskId}-done`]);
      setTaskStates(prev => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
    }
  }, [currentBarn?.id, refetch]);

  const undoComplete = useCallback(async (taskId: string) => {
    // Immediately restore the task in the UI
    clearTimeout(fadeTimers.current[taskId]);
    clearTimeout(fadeTimers.current[`${taskId}-done`]);
    setTaskStates(prev => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });

    try {
      const response = await csrfFetch(`/api/barns/${currentBarn?.id}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PENDING' }),
      });
      if (!response.ok) throw new Error('Failed to undo');
      refetch();
    } catch (error) {
      console.error('Error undoing task:', error);
      toast.error('Undo failed', 'Could not restore task');
    }
  }, [currentBarn?.id, refetch]);

  // Client-specific state
  const [clientData, setClientData] = useState<any>(null);
  const [clientLoading, setClientLoading] = useState(false);

  // Handle client-only date/time to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    const now = new Date();
    const hour = now.getHours();
    setGreeting(hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening');
    setDateString(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
    setToday(now);
  }, []);

  // Client portal: fetch client-specific dashboard data separately
  useEffect(() => {
    if (!barn?.id || !isClient || !currentBarn?.clientId) return;

    const fetchClientDashboard = async () => {
      setClientLoading(true);
      try {
        const response = await fetch(`/api/barns/${currentBarn.id}/clients/${currentBarn.clientId}/dashboard`);
        const result = await response.json();
        if (result.data) setClientData(result.data);
      } catch (error) {
        console.error('Client dashboard fetch error:', error);
      } finally {
        setClientLoading(false);
      }
    };

    fetchClientDashboard();
  }, [barn?.id, isClient, currentBarn?.id, currentBarn?.clientId]);

  if (barnLoading || dashboardLoading || (isClient && clientLoading)) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 skeleton" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 skeleton rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!barn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto mb-4">
            <HorseIcon className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Welcome to BarnKeep</h2>
          <p className="text-muted-foreground mb-6">Get started by creating your first barn.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/onboarding/create-barn" className="btn-primary">Create Barn</Link>
            <Link href="/onboarding/join-barn" className="btn-secondary">Join Existing</Link>
          </div>
        </div>
      </div>
    );
  }

  // CLIENT VIEW DASHBOARD
  if (isClient) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">{greeting}</h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-0.5">
              {dateString || 'Loading...'} · {barn.name}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/15 text-blue-700 dark:text-blue-300 rounded-full text-xs sm:text-sm font-medium self-start sm:self-auto">
            <span>Client Portal</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Your Horses</p>
                <p className="text-2xl sm:text-3xl font-semibold text-foreground mt-0.5 sm:mt-1">{clientData?.horses?.length || 0}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <HorseIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Events</p>
                <p className="text-2xl sm:text-3xl font-semibold text-foreground mt-0.5 sm:mt-1">{clientData?.stats?.upcomingEvents || 0}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              </div>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Your Horses */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Your Horses</h2>
              <Link href="/horses" className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            {!clientData?.horses || clientData.horses.length === 0 ? (
              <div className="p-8 text-center">
                <HorseIcon className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-muted-foreground">No horses assigned to you</p>
                <p className="text-sm text-muted-foreground mt-1">Contact the barn to add your horses</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {clientData.horses.slice(0, 5).map((horse: any) => (
                  <Link 
                    key={horse.id} 
                    href={`/horses/${horse.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-accent transition-colors"
                  >
                    <div className="relative w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {horse.profilePhotoUrl ? (
                        <Image src={horse.profilePhotoUrl} alt={horse.barnName} fill className="object-cover" unoptimized />
                      ) : (
                        <HorseIcon className="w-6 h-6 text-amber-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{horse.barnName}</p>
                      <p className="text-sm text-muted-foreground">
                        {horse.breed || 'Unknown breed'}
                        {horse.stallName && ` · Stall ${horse.stallName}`}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <div className="card">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Upcoming</h2>
                <Link href="/calendar" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                  Calendar
                </Link>
              </div>
              {!clientData?.upcomingEvents || clientData.upcomingEvents.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">No upcoming events</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {clientData.upcomingEvents.slice(0, 4).map((event: any) => {
                    const date = new Date(event.scheduledDate);
                    const isToday = today ? date.toDateString() === today.toDateString() : false;
                    
                    return (
                      <div key={event.id} className="p-4">
                        <p className="text-sm font-medium text-foreground">{event.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {event.horseName && `${event.horseName} · `}
                          {isToday ? (
                            <span className="text-amber-600 font-medium">Today</span>
                          ) : (
                            date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Contact Barn */}
            <div className="card p-4">
              <h2 className="font-semibold text-foreground mb-3">Contact {barn.name}</h2>
              <div className="space-y-2">
                {barn.phone && (
                  <a href={`tel:${barn.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <Phone className="w-4 h-4" />
                    {barn.phone}
                  </a>
                )}
                {barn.email && (
                  <a href={`mailto:${barn.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <Mail className="w-4 h-4" />
                    {barn.email}
                  </a>
                )}
                {barn.city && barn.state && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {barn.city}, {barn.state}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // REGULAR MEMBER DASHBOARD
  const activeHorses = horses.filter((h: any) => h.status === 'ACTIVE').length;
  const layupCount = horses.filter((h: any) => h.status === 'LAYUP').length;
  const pendingTasks = tasks.filter((t: any) => t.status !== 'COMPLETED').length;
  const completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED').length;
  // Filter events scheduled for today only
  const todayEvents = events.filter((e: any) => {
    const eventDate = new Date(e.scheduledDate);
    const now = new Date();
    return eventDate.getFullYear() === now.getFullYear()
      && eventDate.getMonth() === now.getMonth()
      && eventDate.getDate() === now.getDate();
  });

  // Check if user has permission to add horses
  const userRole = (currentBarn?.role || 'CARETAKER') as BarnRole;
  const canAddHorse = hasPermission(userRole, 'horses:write');

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">{greeting}</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-0.5">
            {dateString || 'Loading...'} · {barn.name}
          </p>
        </div>
        {canAddHorse && (
          <Link href="/horses/new" className="btn-primary w-full sm:w-auto justify-center">
            <Plus className="w-4 h-4" />
            Add Horse
          </Link>
        )}
      </div>

      {/* Today's Events Alert */}
      {todayEvents.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-800 dark:text-amber-200">Today's Schedule</p>
              <ul className="mt-1 space-y-1">
                {todayEvents.slice(0, 3).map((event: any) => (
                  <li key={event.id} className="text-sm text-amber-700 dark:text-amber-300">
                    {event.title}
                    {event.horse?.barnName ? ` — ${event.horse.barnName}` : ''}
                    {event.startTime ? ` at ${event.startTime}` : ''}
                  </li>
                ))}
                {todayEvents.length > 3 && (
                  <li className="text-sm text-amber-600 dark:text-amber-400">
                    +{todayEvents.length - 3} more
                  </li>
                )}
              </ul>
            </div>
            <Link href="/calendar" className="text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300">
              View all →
            </Link>
          </div>
        </div>
      )}

      {/* Trial Banner */}
      <TrialBanner />

      {/* Welcome Checklist (new barns) */}
      <WelcomeChecklist
        barnName={barn.name}
        horsesCount={horses.length}
        stallsCount={stalls.length}
        paddocksCount={paddocks.length}
        eventsCount={events.length}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Active Horses</p>
              <p className="text-2xl sm:text-3xl font-semibold text-foreground mt-0.5 sm:mt-1">{activeHorses}</p>
              {layupCount > 0 && (
                <p className="text-[10px] sm:text-xs text-amber-600 mt-0.5 sm:mt-1 truncate">{layupCount} on layup</p>
              )}
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <HorseIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <Link href="/calendar" className="stat-card hover:border-border transition-colors active:scale-[0.98]">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Events</p>
              <p className="text-2xl sm:text-3xl font-semibold text-foreground mt-0.5 sm:mt-1">{events.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">This week</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Link>

        <Link href="/daily-care" className="stat-card hover:border-border transition-colors active:scale-[0.98]">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Tasks</p>
              <p className="text-2xl sm:text-3xl font-semibold text-foreground mt-0.5 sm:mt-1">{pendingTasks}</p>
              {completedTasks > 0 && (
                <p className="text-[10px] sm:text-xs text-emerald-600 mt-0.5 sm:mt-1 truncate">{completedTasks} done</p>
              )}
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Link>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Today</p>
              <p className="text-2xl sm:text-3xl font-semibold text-foreground mt-0.5 sm:mt-1">{todayEvents.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">
                {todayEvents.length === 1 ? 'event' : 'events'} scheduled
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Barn Overview — events + tasks */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Barn Overview</h2>
          </div>

          {/* Upcoming Events */}
          {events.length > 0 && (
            <>
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Upcoming Events</span>
                <Link href="/calendar" className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-0.5">
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-border">
                {events.slice(0, 3).map((event: any) => {
                  const date = new Date(event.scheduledDate);
                  const isEvtToday = today ? date.toDateString() === today.toDateString() : false;
                  const isEvtTomorrow = today ? date.toDateString() === new Date(today.getTime() + 86400000).toDateString() : false;
                  const calendarDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                  return (
                    <Link key={event.id} href={`/calendar?date=${calendarDate}`} className="flex items-center gap-3 p-4 hover:bg-accent transition-colors">
                      <div className="flex-shrink-0 w-5 h-5 rounded bg-blue-500/10 flex items-center justify-center">
                        <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.horse?.barnName && <>{event.horse.barnName} · </>}
                          {isEvtToday ? (
                            <span className="text-amber-600 font-medium">Today</span>
                          ) : isEvtTomorrow ? (
                            <span className="text-blue-600">Tomorrow</span>
                          ) : (
                            date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          )}
                        </p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          {/* Tasks */}
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tasks</span>
            <Link href="/daily-care" className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-0.5">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {tasks.filter((t: any) => t.status !== 'COMPLETED').length === 0 ? (
            <div className="px-4 pb-6 pt-2 text-center">
              <CheckCircle2 className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">All caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {[...tasks]
                .filter((t: any) => t.status !== 'COMPLETED')
                .sort((a: any, b: any) => {
                  const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
                  const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
                  return dateA - dateB;
                })
                .slice(0, 4)
                .map((task: any) => {
                  const state = taskStates[task.id];
                  const isChecked = !!state;
                  if (state === 'done') return null;
                  const taskDate = task.dueDate ? new Date(task.dueDate) : null;
                  const isTaskToday = taskDate && today ? taskDate.toDateString() === today.toDateString() : false;
                  const isTaskTomorrow = taskDate && today ? taskDate.toDateString() === new Date(today.getTime() + 86400000).toDateString() : false;
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-4 hover:bg-accent transition-all duration-300 ${
                        state === 'fading' ? 'opacity-0 max-h-0 py-0 overflow-hidden' : 'opacity-100 max-h-24'
                      }`}
                    >
                      <button
                        onClick={() => !state && completeTask(task.id, task.title)}
                        className="flex-shrink-0"
                        disabled={!!state}
                      >
                        {isChecked ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground hover:text-emerald-400 transition-colors" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm transition-all duration-300 ${isChecked ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {task.horse?.barnName && <>{task.horse.barnName} · </>}
                          {taskDate ? (
                            isTaskToday ? (
                              <span className="text-amber-600 font-medium">Today</span>
                            ) : isTaskTomorrow ? (
                              <span className="text-blue-600">Tomorrow</span>
                            ) : (
                              taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            )
                          ) : (
                            'No due date'
                          )}
                        </p>
                      </div>
                      {task.dueTime && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {task.dueTime}
                        </span>
                      )}
                      {task.priority === 'URGENT' && (
                        <span className="badge-danger">Urgent</span>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card p-4">
            <h2 className="font-semibold text-foreground mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/log/daily-check" className="flex items-center gap-2 p-3 rounded-lg bg-background hover:bg-accent transition-colors">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-muted-foreground">Health Check</span>
              </Link>
              <Link href="/calendar" className="flex items-center gap-2 p-3 rounded-lg bg-background hover:bg-accent transition-colors">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-muted-foreground">Add Event</span>
              </Link>
              <Link href="/log/medication" className="flex items-center gap-2 p-3 rounded-lg bg-background hover:bg-accent transition-colors">
                <Syringe className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-muted-foreground">Log Meds</span>
              </Link>
              <Link href="/daily-care" className="flex items-center gap-2 p-3 rounded-lg bg-background hover:bg-accent transition-colors">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-muted-foreground">Tasks</span>
              </Link>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="card">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Upcoming</h2>
              <Link href="/calendar" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                Calendar
              </Link>
            </div>
            {events.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {events.slice(0, 4).map((event: any) => {
                  const date = new Date(event.scheduledDate);
                  const isToday = today ? date.toDateString() === today.toDateString() : false;
                  const isTomorrow = today ? date.toDateString() === new Date(today.getTime() + 86400000).toDateString() : false;
                  const calendarDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

                  return (
                    <Link key={event.id} href={`/calendar?date=${calendarDate}`} className="block p-4 hover:bg-accent transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{event.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {event.horse?.barnName && `${event.horse.barnName} · `}
                            {isToday ? (
                              <span className="text-amber-600 font-medium">Today</span>
                            ) : isTomorrow ? (
                              <span className="text-blue-600">Tomorrow</span>
                            ) : (
                              date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            )}
                          </p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Horses Preview */}
          <div className="card">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Horses</h2>
              <Link href="/horses" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                View all
              </Link>
            </div>
            {horses.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">No horses yet</p>
                <Link href="/horses/new" className="btn-secondary btn-sm">Add Horse</Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {horses.slice(0, 4).map((horse: any) => (
                  <Link key={horse.id} href={`/horses/${horse.id}`} className="flex items-center gap-3 p-4 hover:bg-accent transition-colors">
                    <div className="relative w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center overflow-hidden">
                      {horse.profilePhotoUrl ? (
                        <Image src={horse.profilePhotoUrl} alt={horse.barnName} fill className="object-cover" unoptimized />
                      ) : (
                        <span className="text-amber-700 font-medium text-sm">
                          {horse.barnName?.charAt(0) || '?'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{horse.barnName}</p>
                      <p className="text-xs text-muted-foreground">{horse.breed || 'Unknown breed'}</p>
                    </div>
                    {horse.status === 'LAYUP' && (
                      <span className="badge-warning">Layup</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
