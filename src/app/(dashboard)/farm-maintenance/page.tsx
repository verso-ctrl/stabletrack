'use client';

import React, { useState } from 'react';
import { useBarn } from '@/contexts/BarnContext';
import { useTasks } from '@/hooks/useData';
import { toast } from '@/lib/toast';
import {
  Plus,
  CheckCircle2,
  Circle,
  User,
  Loader2,
  Wrench,
  Repeat,
  X,
} from 'lucide-react';

const priorityColors: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-700 border-red-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  MEDIUM: 'bg-blue-100 text-blue-700 border-blue-200',
  LOW: 'bg-muted text-muted-foreground border-border',
};

const DAYS_OF_WEEK = [
  { key: 'SUN', label: 'S', full: 'Sunday' },
  { key: 'MON', label: 'M', full: 'Monday' },
  { key: 'TUE', label: 'T', full: 'Tuesday' },
  { key: 'WED', label: 'W', full: 'Wednesday' },
  { key: 'THU', label: 'T', full: 'Thursday' },
  { key: 'FRI', label: 'F', full: 'Friday' },
  { key: 'SAT', label: 'S', full: 'Saturday' },
];

interface RecurringRule {
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  interval: number;
  daysOfWeek?: string[];
  dayOfMonth?: number;
  endType: 'NEVER' | 'ON_DATE' | 'AFTER_COUNT';
  endDate?: string;
  endCount?: number;
}

// Suggested farm maintenance tasks
const SUGGESTED_TASKS = [
  'Clean water troughs',
  'Check & repair fences',
  'Mow pastures',
  'Spread manure',
  'Clean barn aisles',
  'Check barn lights',
  'Repair stall doors',
  'Clean tack room',
  'Inspect fire extinguishers',
  'Clean gutters',
];

export default function FarmMaintenancePage() {
  const { currentBarn } = useBarn();
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    isRecurring: false,
    recurringRule: null as RecurringRule | null,
  });

  const { tasks: pendingTasks, isLoading: pendingLoading, refetch: refetchPending } = useTasks({ status: 'PENDING', farmOnly: true });
  const { tasks: completedTasks, isLoading: completedLoading, refetch: refetchCompleted } = useTasks({ status: 'COMPLETED', farmOnly: true });

  const isLoading = pendingLoading || completedLoading;
  const refetch = () => { refetchPending(); refetchCompleted(); };

  const displayTasks = statusFilter === 'COMPLETED' ? completedTasks : pendingTasks;

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const response = await fetch(`/api/barns/${currentBarn?.id}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update task');
      refetch();
    } catch {
      toast.error('Failed to update task', 'Please try again');
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      toast.warning('Missing title', 'Please enter a task title');
      return;
    }
    if (newTask.isRecurring && newTask.recurringRule) {
      if (newTask.recurringRule.type === 'WEEKLY' && (!newTask.recurringRule.daysOfWeek || newTask.recurringRule.daysOfWeek.length === 0)) {
        toast.warning('Select days', 'Please select at least one day for weekly repeat');
        return;
      }
    }
    setIsCreating(true);
    try {
      const response = await fetch(`/api/barns/${currentBarn?.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description || null,
          dueDate: null,
          dueTime: null,
          priority: newTask.priority,
          horseId: null, // Farm tasks have no horse
          isRecurring: newTask.isRecurring,
          recurringRule: newTask.isRecurring && newTask.recurringRule
            ? JSON.stringify(newTask.recurringRule)
            : null,
        }),
      });
      if (!response.ok) throw new Error('Failed to create task');
      setShowAddModal(false);
      setNewTask({ title: '', description: '', priority: 'MEDIUM', isRecurring: false, recurringRule: null });
      refetch();
      toast.success('Farm task created', newTask.isRecurring ? 'Recurring task set up' : 'Task added');
    } catch {
      toast.error('Failed to create task', 'Please try again');
    } finally {
      setIsCreating(false);
    }
  };

  if (!currentBarn) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a barn first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Farm Tasks</h1>
          <p className="text-muted-foreground mt-1">Ongoing property upkeep and barn chores</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Farm Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Wrench className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingTasks.length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedTasks.length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Repeat className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {pendingTasks.filter(t => t.isRecurring).length}
              </p>
              <p className="text-sm text-muted-foreground">Recurring</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex rounded-xl bg-muted p-1 w-fit">
        {['PENDING', 'COMPLETED'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === status ? 'bg-card shadow text-foreground' : 'text-muted-foreground'
            }`}
          >
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : displayTasks.length > 0 ? (
        <div className="card divide-y divide-border">
          {displayTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 hover:bg-accent transition-all flex items-center gap-4"
            >
              <button
                onClick={() => toggleTaskStatus(task.id, task.status)}
                className="flex-shrink-0"
              >
                {task.status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <Circle className="w-6 h-6 text-muted-foreground hover:text-foreground transition-colors" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`font-medium ${
                    task.status === 'COMPLETED' ? 'text-muted-foreground line-through' : 'text-foreground'
                  }`}>
                    {task.title}
                  </p>
                  {task.isRecurring && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                      <Repeat className="w-3 h-3" />
                      Repeats
                    </span>
                  )}
                  {task.priority && task.priority !== 'MEDIUM' && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1 truncate">{task.description}</p>
                )}
                {task.assignee && (
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {task.assignee.firstName} {task.assignee.lastName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground mb-1">
            {statusFilter === 'COMPLETED' ? 'No completed farm tasks' : 'No pending farm tasks'}
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            Farm tasks cover property maintenance like fences, troughs, and barn upkeep.
          </p>
          {statusFilter === 'PENDING' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Create your first farm task
            </button>
          )}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
          <div className="bg-card w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-500" />
                  Add Farm Task
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-accent">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Task Title *</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="What needs to be done?"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  autoFocus
                />
                {/* Quick suggestions */}
                {!newTask.title && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {SUGGESTED_TASKS.slice(0, 6).map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setNewTask({ ...newTask, title: suggestion })}
                        className="px-2.5 py-1 text-xs rounded-full bg-muted text-muted-foreground hover:bg-accent transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                <textarea
                  className="input w-full h-20 resize-none"
                  placeholder="Add details..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Priority</label>
                <select
                  className="input w-full"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              {/* Recurring toggle */}
              <div className="border-t border-border pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTask.isRecurring}
                    onChange={(e) => {
                      const isRecurring = e.target.checked;
                      setNewTask({
                        ...newTask,
                        isRecurring,
                        recurringRule: isRecurring ? {
                          type: 'WEEKLY',
                          interval: 1,
                          daysOfWeek: ['MON'],
                          endType: 'NEVER',
                        } : null,
                      });
                    }}
                    className="w-5 h-5 rounded border-border text-amber-600 focus:ring-amber-500"
                  />
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-muted-foreground">Repeat this task</span>
                  </div>
                </label>
              </div>

              {/* Recurring options */}
              {newTask.isRecurring && newTask.recurringRule && (
                <div className="bg-amber-500/5 rounded-xl p-4 space-y-4 border border-amber-500/20">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Repeat</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { value: 'DAILY', label: 'Daily' },
                        { value: 'WEEKLY', label: 'Weekly' },
                        { value: 'MONTHLY', label: 'Monthly' },
                        { value: 'CUSTOM', label: 'Custom' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setNewTask({
                            ...newTask,
                            recurringRule: {
                              ...newTask.recurringRule!,
                              type: option.value as RecurringRule['type'],
                              interval: 1,
                              daysOfWeek: option.value === 'WEEKLY' ? ['MON'] : [],
                            },
                          })}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            newTask.recurringRule?.type === option.value
                              ? 'bg-amber-500 text-white'
                              : 'bg-card text-muted-foreground border border-border hover:border-amber-300'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {newTask.recurringRule?.type === 'CUSTOM' && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Every</span>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={newTask.recurringRule?.interval}
                        onChange={(e) => setNewTask({
                          ...newTask,
                          recurringRule: { ...newTask.recurringRule!, interval: parseInt(e.target.value) || 1 },
                        })}
                        className="input w-20 text-center"
                      />
                      <span className="text-sm text-muted-foreground">day(s)</span>
                    </div>
                  )}

                  {newTask.recurringRule?.type === 'WEEKLY' && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Repeat on</label>
                      <div className="flex gap-2">
                        {DAYS_OF_WEEK.map((day) => {
                          const isSelected = newTask.recurringRule?.daysOfWeek?.includes(day.key);
                          return (
                            <button
                              key={day.key}
                              type="button"
                              onClick={() => {
                                const currentDays = newTask.recurringRule?.daysOfWeek || [];
                                const newDays = isSelected
                                  ? currentDays.filter((d) => d !== day.key)
                                  : [...currentDays, day.key];
                                if (newDays.length > 0) {
                                  setNewTask({
                                    ...newTask,
                                    recurringRule: { ...newTask.recurringRule!, daysOfWeek: newDays },
                                  });
                                }
                              }}
                              title={day.full}
                              className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                                isSelected
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-card text-muted-foreground border border-border hover:border-amber-300'
                              }`}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {newTask.recurringRule?.type === 'MONTHLY' && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">On day</span>
                      <select
                        value={newTask.recurringRule?.dayOfMonth || 1}
                        onChange={(e) => setNewTask({
                          ...newTask,
                          recurringRule: { ...newTask.recurringRule!, dayOfMonth: parseInt(e.target.value) },
                        })}
                        className="input w-24"
                      >
                        {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                      <span className="text-sm text-muted-foreground">of each month</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary flex-1"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Add Task'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
