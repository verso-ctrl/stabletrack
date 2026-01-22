'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useBarn } from '@/contexts/BarnContext';
import { useHorses } from '@/hooks/useData';
import { toast } from '@/lib/toast';
import {
  CheckSquare,
  Stethoscope,
  Utensils,
  Pill,
  Plus,
  Check,
  Clock,
  AlertTriangle,
  ChevronRight,
  Loader2,
  X,
  Sun,
  Moon,
  CloudSun,
} from 'lucide-react';

type TabId = 'overview' | 'tasks' | 'health-checks' | 'feeding' | 'medications';

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'COMPLETED';
  assignee?: { firstName: string; lastName: string };
}

interface DailyStats {
  tasks: { pending: number; completed: number; urgent: number };
  healthChecks: { completed: number; total: number };
  feeding: { am: number; pm: number; total: number };
  medications: { given: number; due: number; overdue: number };
}

const priorityColors = {
  URGENT: 'bg-red-100 text-red-700 border-red-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  MEDIUM: 'bg-blue-100 text-blue-700 border-blue-200',
  LOW: 'bg-stone-100 text-stone-600 border-stone-200',
};

export default function DailyCarePage() {
  const { currentBarn } = useBarn();
  const { horses } = useHorses();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DailyStats>({
    tasks: { pending: 0, completed: 0, urgent: 0 },
    healthChecks: { completed: 0, total: 0 },
    feeding: { am: 0, pm: 0, total: 0 },
    medications: { given: 0, due: 0, overdue: 0 },
  });

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      if (!currentBarn?.id) return;

      try {
        const response = await fetch(`/api/barns/${currentBarn.id}/tasks`);
        const data = await response.json();
        if (data.data) {
          setTasks(data.data);
          // Calculate task stats
          const pending = data.data.filter((t: Task) => t.status === 'PENDING').length;
          const completed = data.data.filter((t: Task) => t.status === 'COMPLETED').length;
          const urgent = data.data.filter((t: Task) => t.status === 'PENDING' && t.priority === 'URGENT').length;
          setStats(prev => ({
            ...prev,
            tasks: { pending, completed, urgent },
            healthChecks: { completed: 0, total: horses?.length || 0 },
            feeding: { am: 0, pm: 0, total: horses?.length || 0 },
            medications: { given: 0, due: 0, overdue: 0 },
          }));
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [currentBarn?.id, horses?.length]);

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    try {
      const response = await fetch(`/api/barns/${currentBarn?.id}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, status: newStatus as 'PENDING' | 'COMPLETED' } : t
        ));
        toast.success(newStatus === 'COMPLETED' ? 'Task completed' : 'Task reopened');
      }
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const tabs = [
    { id: 'overview' as TabId, label: 'Overview', icon: CheckSquare },
    { id: 'tasks' as TabId, label: 'Tasks', icon: CheckSquare, count: stats.tasks.pending },
    { id: 'health-checks' as TabId, label: 'Health Checks', icon: Stethoscope },
    { id: 'feeding' as TabId, label: 'Feeding', icon: Utensils },
    { id: 'medications' as TabId, label: 'Medications', icon: Pill, count: stats.medications.overdue > 0 ? stats.medications.overdue : undefined },
  ];

  const pendingTasks = tasks.filter(t => t.status === 'PENDING');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Daily Care</h1>
          <p className="text-stone-500 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/tasks" className="btn-primary btn-md">
            <Plus className="w-4 h-4" />
            Add Task
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-200 -mx-4 sm:mx-0">
        <nav className="flex gap-0.5 overflow-x-auto scrollbar-hide px-4 sm:px-0">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-all flex-shrink-0
                ${activeTab === id
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {count !== undefined && count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === id ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveTab('tasks')}
              className="card p-4 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <CheckSquare className="w-5 h-5 text-amber-500" />
                {stats.tasks.urgent > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                    {stats.tasks.urgent} urgent
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-stone-900">{stats.tasks.pending}</p>
              <p className="text-sm text-stone-500">Tasks pending</p>
            </button>

            <button
              onClick={() => setActiveTab('health-checks')}
              className="card p-4 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <Stethoscope className="w-5 h-5 text-green-500" />
                <span className="text-xs text-stone-500">
                  {stats.healthChecks.completed}/{stats.healthChecks.total}
                </span>
              </div>
              <p className="text-2xl font-bold text-stone-900">
                {stats.healthChecks.total > 0
                  ? Math.round((stats.healthChecks.completed / stats.healthChecks.total) * 100)
                  : 0}%
              </p>
              <p className="text-sm text-stone-500">Health checks done</p>
            </button>

            <button
              onClick={() => setActiveTab('feeding')}
              className="card p-4 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <Utensils className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-stone-900">
                {stats.feeding.am + stats.feeding.pm}/{stats.feeding.total * 2}
              </p>
              <p className="text-sm text-stone-500">Feedings logged</p>
            </button>

            <button
              onClick={() => setActiveTab('medications')}
              className="card p-4 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <Pill className="w-5 h-5 text-purple-500" />
                {stats.medications.overdue > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                    {stats.medications.overdue} overdue
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-stone-900">{stats.medications.given}</p>
              <p className="text-sm text-stone-500">Medications given</p>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="card p-5">
            <h2 className="font-semibold text-stone-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                href="/log/daily-check"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors text-center"
              >
                <Stethoscope className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium text-green-700">Log Health Check</span>
              </Link>
              <Link
                href="/log/feed"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors text-center"
              >
                <Utensils className="w-6 h-6 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">Log Feeding</span>
              </Link>
              <Link
                href="/log/medication"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors text-center"
              >
                <Pill className="w-6 h-6 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Log Medication</span>
              </Link>
              <Link
                href="/tasks"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors text-center"
              >
                <Plus className="w-6 h-6 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">Add Task</span>
              </Link>
            </div>
          </div>

          {/* Urgent Tasks */}
          {pendingTasks.filter(t => t.priority === 'URGENT').length > 0 && (
            <div className="card p-5 border-red-200 bg-red-50/50">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h2 className="font-semibold text-red-900">Urgent Tasks</h2>
              </div>
              <div className="space-y-2">
                {pendingTasks.filter(t => t.priority === 'URGENT').map(task => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-200"
                  >
                    <button
                      onClick={() => toggleTaskStatus(task.id, task.status)}
                      className="w-5 h-5 rounded border-2 border-red-300 flex items-center justify-center hover:bg-red-100 transition-colors"
                    >
                      {task.status === 'COMPLETED' && <Check className="w-3 h-3 text-red-600" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-900">{task.title}</p>
                      {task.dueTime && (
                        <p className="text-sm text-stone-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.dueTime}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Today's Tasks Preview */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-stone-900">Today's Tasks</h2>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
              >
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            {pendingTasks.length === 0 ? (
              <p className="text-stone-500 text-sm py-4 text-center">No pending tasks</p>
            ) : (
              <div className="space-y-2">
                {pendingTasks.slice(0, 5).map(task => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors"
                  >
                    <button
                      onClick={() => toggleTaskStatus(task.id, task.status)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        task.status === 'COMPLETED'
                          ? 'bg-green-500 border-green-500'
                          : 'border-stone-300 hover:border-green-500'
                      }`}
                    >
                      {task.status === 'COMPLETED' && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${task.status === 'COMPLETED' ? 'text-stone-400 line-through' : 'text-stone-900'}`}>
                        {task.title}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Pending Tasks */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-stone-900">Pending ({pendingTasks.length})</h2>
            </div>
            {pendingTasks.length === 0 ? (
              <p className="text-stone-500 text-sm py-8 text-center">All tasks completed!</p>
            ) : (
              <div className="space-y-2">
                {pendingTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors"
                  >
                    <button
                      onClick={() => toggleTaskStatus(task.id, task.status)}
                      className="w-5 h-5 rounded border-2 border-stone-300 hover:border-green-500 flex items-center justify-center transition-colors"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-900">{task.title}</p>
                      {task.description && (
                        <p className="text-sm text-stone-500 truncate">{task.description}</p>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-stone-900 mb-4">Completed ({completedTasks.length})</h2>
              <div className="space-y-2">
                {completedTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg opacity-60"
                  >
                    <button
                      onClick={() => toggleTaskStatus(task.id, task.status)}
                      className="w-5 h-5 rounded border-2 bg-green-500 border-green-500 flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-500 line-through">{task.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'health-checks' && (
        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-stone-900">Today's Health Checks</h2>
              <Link href="/log/daily-check" className="btn-primary btn-sm">
                <Stethoscope className="w-4 h-4" />
                Start Checks
              </Link>
            </div>
            <p className="text-stone-500 text-sm">
              {stats.healthChecks.completed} of {stats.healthChecks.total} horses checked today
            </p>
            {/* Progress bar */}
            <div className="mt-4 h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{
                  width: `${stats.healthChecks.total > 0
                    ? (stats.healthChecks.completed / stats.healthChecks.total) * 100
                    : 0}%`
                }}
              />
            </div>
            {/* Horse list */}
            <div className="mt-6 space-y-2">
              {horses?.map(horse => (
                <div key={horse.id} className="flex items-center gap-3 p-3 rounded-lg bg-stone-50">
                  <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden">
                    {horse.profilePhotoUrl ? (
                      <img src={horse.profilePhotoUrl} alt={horse.barnName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 text-sm font-medium">
                        {horse.barnName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-stone-900">{horse.barnName}</p>
                  </div>
                  <span className="text-xs text-stone-500">Not checked</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'feeding' && (
        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-stone-900">Today's Feedings</h2>
              <Link href="/log/feed" className="btn-primary btn-sm">
                <Utensils className="w-4 h-4" />
                Log Feeding
              </Link>
            </div>

            {/* Feeding times */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <span className="font-medium text-amber-900">Morning</span>
                </div>
                <p className="text-2xl font-bold text-amber-900">{stats.feeding.am}/{stats.feeding.total}</p>
                <p className="text-sm text-amber-700">horses fed</p>
              </div>
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="w-5 h-5 text-indigo-500" />
                  <span className="font-medium text-indigo-900">Evening</span>
                </div>
                <p className="text-2xl font-bold text-indigo-900">{stats.feeding.pm}/{stats.feeding.total}</p>
                <p className="text-sm text-indigo-700">horses fed</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'medications' && (
        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-stone-900">Today's Medications</h2>
              <Link href="/log/medication" className="btn-primary btn-sm">
                <Pill className="w-4 h-4" />
                Log Medication
              </Link>
            </div>

            {stats.medications.overdue > 0 && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="font-medium text-red-900">{stats.medications.overdue} overdue medications</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-stone-50">
                <p className="text-2xl font-bold text-stone-900">{stats.medications.given}</p>
                <p className="text-sm text-stone-500">Given</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-stone-50">
                <p className="text-2xl font-bold text-stone-900">{stats.medications.due}</p>
                <p className="text-sm text-stone-500">Due today</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-red-50">
                <p className="text-2xl font-bold text-red-600">{stats.medications.overdue}</p>
                <p className="text-sm text-red-500">Overdue</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
