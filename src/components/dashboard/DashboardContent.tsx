'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Droplets,
  FileText,
  Heart,
  Pill,
  Scissors,
  Stethoscope,
  TrendingUp,
  Utensils,
  X,
} from 'lucide-react';
import { cn, formatDate, formatRelativeDate, getEventTypeEmoji } from '@/lib/utils';
import { useBarn } from '@/contexts/BarnContext';
import { useHorses, useAlerts, useTasks, useEvents } from '@/hooks/useData';

export function DashboardContent() {
  const { currentBarn } = useBarn();
  const { horses, isLoading: horsesLoading } = useHorses();
  const { alerts, isLoading: alertsLoading } = useAlerts();
  const { tasks, isLoading: tasksLoading, refetch: refetchTasks } = useTasks({
    status: 'PENDING',
  });
  const { events, isLoading: eventsLoading } = useEvents({
    status: 'SCHEDULED',
  });

  // Client-side only state for time-based content
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [todayString, setTodayString] = useState('');

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    setTimeOfDay(hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening');
    setTodayString(now.toDateString());
  }, []);

  if (!currentBarn) {
    return <NoBarnState />;
  }

  const activeHorses = horses.filter((h) => h.status === 'ACTIVE').length;
  const onMedication = horses.filter((h) => (h as any).activeMedicationCount > 0).length;
  const urgentAlerts = alerts.filter((a) => a.type === 'urgent').length;
  const todayTasks = tasks.filter((t) => {
    if (!t.dueDate) return true;
    if (!todayString) return true; // Include all if not yet mounted
    const due = new Date(t.dueDate);
    return due.toDateString() === todayString;
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">
          Good {timeOfDay}, {currentBarn.name}
        </h1>
        <p className="text-stone-500 mt-1">
          Here's what's happening at your barn today.
        </p>
      </div>

      {/* Urgent alerts banner */}
      {urgentAlerts > 0 && (
        <AlertsBanner alerts={alerts.filter((a) => a.type === 'urgent')} />
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Horses"
          value={activeHorses}
          icon={Heart}
          trend={null}
          color="emerald"
          href="/horses"
        />
        <StatCard
          label="On Medication"
          value={onMedication}
          icon={Pill}
          trend={null}
          color="blue"
          href="/horses?filter=medication"
        />
        <StatCard
          label="Upcoming Events"
          value={events.length}
          icon={Calendar}
          trend={null}
          color="purple"
          href="/calendar"
        />
        <StatCard
          label="Alerts"
          value={alerts.length}
          icon={AlertTriangle}
          trend={null}
          color={alerts.length > 0 ? 'amber' : 'stone'}
          href="#alerts"
        />
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-2">
          <TasksWidget tasks={todayTasks} onTaskComplete={refetchTasks} />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActionsWidget />
        </div>
      </div>

      {/* Secondary content grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <UpcomingEventsWidget events={events.slice(0, 5)} />

        {/* Horse Roster */}
        <HorseRosterWidget horses={horses.slice(0, 5)} />
      </div>
    </div>
  );
}

function NoBarnState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-stone-400" />
      </div>
      <h2 className="text-xl font-semibold text-stone-900 mb-2">
        No barn selected
      </h2>
      <p className="text-stone-500 mb-6 max-w-sm">
        Create a new barn or join an existing one to get started with StableTrack.
      </p>
      <div className="flex gap-3">
        <Link
          href="/barns/new"
          className="px-4 py-2 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors"
        >
          Create Barn
        </Link>
        <Link
          href="/barns/join"
          className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors"
        >
          Join Barn
        </Link>
      </div>
    </div>
  );
}

function AlertsBanner({ alerts }: { alerts: any[] }) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const visibleAlerts = alerts.filter((a) => !dismissed.includes(a.id));

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">
              {visibleAlerts.length} urgent alert{visibleAlerts.length > 1 ? 's' : ''} require your attention
            </p>
            <ul className="mt-1 text-sm text-white/90">
              {visibleAlerts.slice(0, 3).map((alert) => (
                <li key={alert.id}>
                  {alert.horseName && <strong>{alert.horseName}:</strong>} {alert.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <button
          onClick={() => setDismissed(alerts.map((a) => a.id))}
          className="p-1 rounded-lg hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  trend: number | null;
  color: 'emerald' | 'blue' | 'purple' | 'amber' | 'stone';
  href: string;
}

function StatCard({ label, value, icon: Icon, trend, color, href }: StatCardProps) {
  const colorClasses = {
    emerald: 'from-emerald-500 to-teal-500',
    blue: 'from-blue-500 to-indigo-500',
    purple: 'from-purple-500 to-pink-500',
    amber: 'from-amber-500 to-orange-500',
    stone: 'from-stone-500 to-stone-600',
  };

  return (
    <Link
      href={href}
      className="group p-4 rounded-2xl bg-white border border-stone-200 hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center',
            colorClasses[color]
          )}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-400 transition-colors" />
      </div>
      <p className="mt-4 text-2xl font-bold text-stone-900">{value}</p>
      <p className="text-sm text-stone-500">{label}</p>
      {trend !== null && (
        <div className="flex items-center gap-1 mt-1">
          <TrendingUp className="w-3 h-3 text-emerald-500" />
          <span className="text-xs text-emerald-600">+{trend}%</span>
        </div>
      )}
    </Link>
  );
}

interface TasksWidgetProps {
  tasks: any[];
  onTaskComplete: () => void;
}

function TasksWidget({ tasks, onTaskComplete }: TasksWidgetProps) {
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const handleToggle = async (taskId: string) => {
    if (completedIds.includes(taskId)) {
      setCompletedIds(completedIds.filter((id) => id !== taskId));
    } else {
      setCompletedIds([...completedIds, taskId]);
      // In real app, call API to mark task complete
    }
  };

  const completedCount = completedIds.length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="p-6 rounded-2xl bg-white border border-stone-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-stone-900">Today's Tasks</h3>
          <p className="text-sm text-stone-500">
            {completedCount} of {totalCount} completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-medium text-stone-600">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="py-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
          <p className="text-stone-600">All caught up!</p>
          <p className="text-sm text-stone-400">No pending tasks for today.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => {
            const isCompleted = completedIds.includes(task.id);
            return (
              <li
                key={task.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl transition-all',
                  isCompleted ? 'bg-stone-50' : 'bg-amber-50/50 hover:bg-amber-50'
                )}
              >
                <button
                  onClick={() => handleToggle(task.id)}
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-stone-300 hover:border-emerald-500'
                  )}
                >
                  {isCompleted && (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isCompleted ? 'text-stone-400 line-through' : 'text-stone-900'
                    )}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-stone-500 truncate">
                      {task.description}
                    </p>
                  )}
                </div>
                {task.dueTime && (
                  <span className="text-xs text-stone-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {task.dueTime}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href="/tasks"
        className="mt-4 flex items-center justify-center gap-2 py-2 text-sm text-stone-600 hover:text-stone-900 transition-colors"
      >
        View all tasks
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function QuickActionsWidget() {
  const actions = [
    { label: 'Daily Check', icon: Heart, href: '/log/daily-check', color: 'from-red-400 to-pink-500' },
    { label: 'Log Feed', icon: Utensils, href: '/log/feed', color: 'from-amber-400 to-orange-500' },
    { label: 'Give Meds', icon: Pill, href: '/log/medication', color: 'from-purple-400 to-pink-500' },
    { label: 'Add Event', icon: Calendar, href: '/calendar', color: 'from-emerald-400 to-teal-500' },
    { label: 'Farrier Log', icon: Scissors, href: '/log/farrier', color: 'from-stone-500 to-stone-700' },
    { label: 'Vet Record', icon: Stethoscope, href: '/log/vet', color: 'from-red-400 to-rose-500' },
  ];

  return (
    <div className="p-6 rounded-2xl bg-white border border-stone-200">
      <h3 className="font-semibold text-stone-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors group"
          >
            <div
              className={cn(
                'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center group-hover:scale-110 transition-transform',
                action.color
              )}
            >
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-stone-600">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function UpcomingEventsWidget({ events }: { events: any[] }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-stone-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-stone-900">Upcoming Events</h3>
        <Link
          href="/calendar"
          className="text-sm text-amber-600 hover:text-amber-700 font-medium"
        >
          View Calendar
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="py-8 text-center">
          <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-2" />
          <p className="text-stone-500">No upcoming events</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-stone-50"
            >
              <div className="text-2xl">{getEventTypeEmoji(event.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-900 truncate">
                  {event.title}
                </p>
                <p className="text-xs text-stone-500">
                  {event.horse?.barnName && `${event.horse.barnName} • `}
                  {formatRelativeDate(event.scheduledDate)}
                </p>
              </div>
              <span className="text-xs text-stone-400">
                {formatDate(event.scheduledDate, 'MMM d')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function HorseRosterWidget({ horses }: { horses: any[] }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-stone-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-stone-900">Horse Roster</h3>
        <Link
          href="/horses"
          className="text-sm text-amber-600 hover:text-amber-700 font-medium"
        >
          View All
        </Link>
      </div>

      {horses.length === 0 ? (
        <div className="py-8 text-center">
          <Heart className="w-12 h-12 text-stone-300 mx-auto mb-2" />
          <p className="text-stone-500">No horses yet</p>
          <Link
            href="/horses/new"
            className="inline-block mt-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            Add your first horse
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {horses.map((horse) => (
            <li key={horse.id}>
              <Link
                href={`/horses/${horse.id}`}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center overflow-hidden">
                  {horse.profilePhotoUrl ? (
                    <img
                      src={horse.profilePhotoUrl}
                      alt={horse.barnName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-stone-600">
                      {horse.barnName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate">
                    {horse.barnName}
                  </p>
                  <p className="text-xs text-stone-500">
                    {horse.breed} • {horse.age ? `${horse.age} yo` : 'Age unknown'}
                  </p>
                </div>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    horse.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-700'
                      : horse.status === 'LAYUP'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-stone-100 text-stone-600'
                  )}
                >
                  {horse.status.toLowerCase()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
