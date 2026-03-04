'use client';

import React, { useState } from 'react';
import { useBarn } from '@/contexts/BarnContext';
import { useTasks, useHorses } from '@/hooks/useData';
import { toast } from '@/lib/toast';
import { csrfFetch } from '@/lib/fetch';
import { formatLocalDate } from '@/lib/utils';
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  User,
  MoreVertical,
  Loader2,
  ListTodo,
  AlertCircle,
  Repeat,
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
  interval: number; // Every X days/weeks/months
  daysOfWeek?: string[]; // For weekly: which days (MON, TUE, etc.)
  dayOfMonth?: number; // For monthly: which day (1-31)
  endType: 'NEVER' | 'ON_DATE' | 'AFTER_COUNT';
  endDate?: string;
  endCount?: number;
}

export default function TasksPage() {
  const { currentBarn } = useBarn();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    priority: '',
    horseId: '',
    isRecurring: false,
    recurringRule: null as RecurringRule | null,
  });

  const { horses } = useHorses();
  const { tasks: pendingTasks, isLoading: pendingLoading, refetch: refetchPending } = useTasks({ status: 'PENDING' });
  const { tasks: completedTasks, isLoading: completedLoading, refetch: refetchCompleted } = useTasks({ status: 'COMPLETED' });

  const isLoading = pendingLoading || completedLoading;
  const refetch = () => { refetchPending(); refetchCompleted(); };
  
  const allTasks = [...pendingTasks, ...completedTasks];
  
  const filteredTasks = allTasks.filter((task) => {
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const response = await csrfFetch(`/api/barns/${currentBarn?.id}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      
      // Refresh tasks
      refetch();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task', 'Please try again');
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
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage your daily tasks and reminders</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <ListTodo className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingTasks.length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
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
            <div className="p-2 rounded-lg bg-red-100">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {pendingTasks.filter(t => t.priority === 'URGENT').length}
              </p>
              <p className="text-sm text-muted-foreground">Urgent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-12 w-full"
          />
        </div>
        <div className="flex rounded-xl bg-muted p-1">
          {['ALL', 'PENDING', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === status ? 'bg-card shadow text-foreground' : 'text-muted-foreground'
              }`}
            >
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="card divide-y divide-border">
          {filteredTasks.map((task) => (
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
                  <Circle className="w-6 h-6 text-muted-foreground hover:text-muted-foreground" />
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
                  {task.horse && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                      {task.horse.barnName}
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1 truncate">{task.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  {task.dueDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatLocalDate(task.dueDate)}
                    </span>
                  )}
                  {task.dueTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {task.dueTime}
                    </span>
                  )}
                  {task.assignee && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {task.assignee.firstName} {task.assignee.lastName}
                    </span>
                  )}
                </div>
              </div>
              
              <button className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-muted-foreground transition-all">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <ListTodo className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No tasks found</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-secondary mt-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create your first task
          </button>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add Task</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Task Title *
                </label>
                <input 
                  type="text" 
                  className="input w-full" 
                  placeholder="What needs to be done?"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Description
                </label>
                <textarea 
                  className="input w-full h-24 resize-none" 
                  placeholder="Add details..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Due Date
                  </label>
                  <input 
                    type="date" 
                    className="input w-full"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Due Time
                  </label>
                  <input 
                    type="time" 
                    className="input w-full"
                    value={newTask.dueTime}
                    onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Priority
                  </label>
                  <select
                    className="input w-full"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="">No Priority</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Horse (optional)
                  </label>
                  <select
                    className="input w-full"
                    value={newTask.horseId}
                    onChange={(e) => setNewTask({ ...newTask, horseId: e.target.value })}
                  >
                    <option value="">No horse (barn task)</option>
                    {horses.map((horse) => (
                      <option key={horse.id} value={horse.id}>
                        {horse.barnName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Recurring Task Toggle */}
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
                          type: 'DAILY',
                          interval: 1,
                          daysOfWeek: [],
                          endType: 'NEVER',
                        } : null,
                      });
                    }}
                    className="w-5 h-5 rounded border-border text-amber-600 focus:ring-amber-500"
                  />
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-muted-foreground">Make this a repeating task</span>
                  </div>
                </label>
              </div>

              {/* Recurring Options */}
              {newTask.isRecurring && newTask.recurringRule && (
                <div className="bg-amber-50 rounded-xl p-4 space-y-4 border border-amber-200">
                  {/* Repeat Type */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Repeat
                    </label>
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

                  {/* Custom Interval */}
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
                          recurringRule: {
                            ...newTask.recurringRule!,
                            interval: parseInt(e.target.value) || 1,
                          },
                        })}
                        className="input w-20 text-center"
                      />
                      <span className="text-sm text-muted-foreground">day(s)</span>
                    </div>
                  )}

                  {/* Days of Week (for Weekly) */}
                  {newTask.recurringRule?.type === 'WEEKLY' && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Repeat on
                      </label>
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
                                // Ensure at least one day is selected
                                if (newDays.length > 0) {
                                  setNewTask({
                                    ...newTask,
                                    recurringRule: {
                                      ...newTask.recurringRule!,
                                      daysOfWeek: newDays,
                                    },
                                  });
                                }
                              }}
                              title={day.full}
                              className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
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
                      <p className="text-xs text-muted-foreground mt-2">
                        Selected: {newTask.recurringRule?.daysOfWeek?.map(d =>
                          DAYS_OF_WEEK.find(day => day.key === d)?.full
                        ).join(', ') || 'None'}
                      </p>
                    </div>
                  )}

                  {/* Day of Month (for Monthly) */}
                  {newTask.recurringRule?.type === 'MONTHLY' && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">On day</span>
                      <select
                        value={newTask.recurringRule?.dayOfMonth || 1}
                        onChange={(e) => setNewTask({
                          ...newTask,
                          recurringRule: {
                            ...newTask.recurringRule!,
                            dayOfMonth: parseInt(e.target.value),
                          },
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

                  {/* End Condition */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Ends
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="endType"
                          checked={newTask.recurringRule?.endType === 'NEVER'}
                          onChange={() => setNewTask({
                            ...newTask,
                            recurringRule: {
                              ...newTask.recurringRule!,
                              endType: 'NEVER',
                              endDate: undefined,
                              endCount: undefined,
                            },
                          })}
                          className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm text-muted-foreground">Never</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="endType"
                          checked={newTask.recurringRule?.endType === 'ON_DATE'}
                          onChange={() => setNewTask({
                            ...newTask,
                            recurringRule: {
                              ...newTask.recurringRule!,
                              endType: 'ON_DATE',
                              endCount: undefined,
                            },
                          })}
                          className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm text-muted-foreground">On</span>
                        {newTask.recurringRule?.endType === 'ON_DATE' && (
                          <input
                            type="date"
                            value={newTask.recurringRule?.endDate || ''}
                            onChange={(e) => setNewTask({
                              ...newTask,
                              recurringRule: {
                                ...newTask.recurringRule!,
                                endDate: e.target.value,
                              },
                            })}
                            className="input w-40"
                            min={newTask.dueDate || new Date().toISOString().split('T')[0]}
                          />
                        )}
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="endType"
                          checked={newTask.recurringRule?.endType === 'AFTER_COUNT'}
                          onChange={() => setNewTask({
                            ...newTask,
                            recurringRule: {
                              ...newTask.recurringRule!,
                              endType: 'AFTER_COUNT',
                              endCount: 10,
                              endDate: undefined,
                            },
                          })}
                          className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm text-muted-foreground">After</span>
                        {newTask.recurringRule?.endType === 'AFTER_COUNT' && (
                          <>
                            <input
                              type="number"
                              min="1"
                              max="365"
                              value={newTask.recurringRule?.endCount || 10}
                              onChange={(e) => setNewTask({
                                ...newTask,
                                recurringRule: {
                                  ...newTask.recurringRule!,
                                  endCount: parseInt(e.target.value) || 10,
                                },
                              })}
                              className="input w-20 text-center"
                            />
                            <span className="text-sm text-muted-foreground">occurrences</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-card rounded-lg p-3 border border-amber-200">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Summary: </span>
                      {newTask.recurringRule?.type === 'DAILY' && 'Repeats every day'}
                      {newTask.recurringRule?.type === 'WEEKLY' && `Repeats weekly on ${
                        newTask.recurringRule?.daysOfWeek?.map(d =>
                          DAYS_OF_WEEK.find(day => day.key === d)?.full
                        ).join(', ') || 'selected days'
                      }`}
                      {newTask.recurringRule?.type === 'MONTHLY' && `Repeats monthly on day ${newTask.recurringRule?.dayOfMonth || 1}`}
                      {newTask.recurringRule?.type === 'CUSTOM' && `Repeats every ${newTask.recurringRule?.interval} day(s)`}
                      {newTask.recurringRule?.endType === 'ON_DATE' && newTask.recurringRule?.endDate && ` until ${new Date(newTask.recurringRule?.endDate).toLocaleDateString()}`}
                      {newTask.recurringRule?.endType === 'AFTER_COUNT' && ` for ${newTask.recurringRule?.endCount} occurrences`}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewTask({ title: '', description: '', dueDate: '', dueTime: '', priority: '', horseId: '', isRecurring: false, recurringRule: null });
                }}
                className="btn-secondary flex-1"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newTask.title.trim()) {
                    toast.warning('Missing title', 'Please enter a task title');
                    return;
                  }
                  // Validate recurring settings
                  if (newTask.isRecurring && newTask.recurringRule) {
                    if (newTask.recurringRule?.type === 'WEEKLY' && (!newTask.recurringRule?.daysOfWeek || newTask.recurringRule?.daysOfWeek.length === 0)) {
                      toast.warning('Select days', 'Please select at least one day for weekly repeat');
                      return;
                    }
                    if (newTask.recurringRule?.endType === 'ON_DATE' && !newTask.recurringRule?.endDate) {
                      toast.warning('Select end date', 'Please select an end date for the recurring task');
                      return;
                    }
                  }
                  setIsCreating(true);
                  try {
                    const response = await csrfFetch(`/api/barns/${currentBarn?.id}/tasks`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        title: newTask.title,
                        description: newTask.description || null,
                        dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
                        dueTime: newTask.dueTime || null,
                        priority: newTask.priority || null,
                        horseId: newTask.horseId || null,
                        isRecurring: newTask.isRecurring,
                        recurringRule: newTask.isRecurring && newTask.recurringRule
                          ? JSON.stringify(newTask.recurringRule)
                          : null,
                      }),
                    });
                    if (!response.ok) throw new Error('Failed to create task');
                    setShowAddModal(false);
                    setNewTask({ title: '', description: '', dueDate: '', dueTime: '', priority: '', horseId: '', isRecurring: false, recurringRule: null });
                    refetch();
                    toast.success(
                      newTask.isRecurring ? 'Recurring task created' : 'Task created',
                      newTask.isRecurring ? 'Your repeating task has been set up' : 'Your task has been added'
                    );
                  } catch (error) {
                    console.error('Error creating task:', error);
                    toast.error('Failed to create task', 'Please try again');
                  } finally {
                    setIsCreating(false);
                  }
                }}
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
