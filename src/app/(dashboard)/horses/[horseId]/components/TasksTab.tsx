'use client';

import { useState } from 'react';
import { useBarn } from '@/contexts/BarnContext';
import { useTasks } from '@/hooks/useData';
import { toast } from '@/lib/toast';
import {
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Loader2,
  ListTodo,
  Repeat,
} from 'lucide-react';

const priorityColors: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-700 border-red-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  MEDIUM: 'bg-blue-100 text-blue-700 border-blue-200',
  LOW: 'bg-muted text-muted-foreground border-border',
};

interface TasksTabProps {
  horse: {
    id: string;
    barnName: string;
  };
  canEdit?: boolean;
}

export function TasksTab({ horse, canEdit = true }: TasksTabProps) {
  const { currentBarn } = useBarn();
  const { tasks, isLoading, refetch } = useTasks({ horseId: horse.id });
  const [showAddForm, setShowAddForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    priority: '',
  });

  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

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
    setIsCreating(true);
    try {
      const response = await fetch(`/api/barns/${currentBarn?.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description || null,
          dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
          dueTime: newTask.dueTime || null,
          priority: newTask.priority || null,
          horseId: horse.id,
        }),
      });
      if (!response.ok) throw new Error('Failed to create task');
      setShowAddForm(false);
      setNewTask({ title: '', description: '', dueDate: '', dueTime: '', priority: '' });
      refetch();
      toast.success('Task created', `Task added for ${horse.barnName}`);
    } catch {
      toast.error('Failed to create task', 'Please try again');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="card p-12 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Tasks</h3>
          {canEdit && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-primary btn-sm"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          )}
        </div>

        {/* Quick-add form */}
        {showAddForm && (
          <div className="mb-4 p-4 rounded-xl bg-background border border-border space-y-3">
            <input
              type="text"
              className="input w-full"
              placeholder="What needs to be done?"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter' && newTask.title.trim()) handleCreateTask(); }}
              autoFocus
            />
            <textarea
              className="input w-full h-16 resize-none"
              placeholder="Add details (optional)..."
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                type="date"
                className="input w-full"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
              <input
                type="time"
                className="input w-full"
                value={newTask.dueTime}
                onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value })}
              />
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
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewTask({ title: '', description: '', dueDate: '', dueTime: '', priority: '' });
                }}
                className="btn-secondary btn-sm"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="btn-primary btn-sm"
                disabled={isCreating}
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* Pending tasks */}
        {pendingTasks.length > 0 ? (
          <div className="divide-y divide-border">
            {pendingTasks.map((task) => (
              <div key={task.id} className="py-3 flex items-start gap-3">
                <button
                  onClick={() => toggleTaskStatus(task.id, task.status)}
                  className="flex-shrink-0 mt-0.5"
                >
                  <Circle className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground text-sm">{task.title}</span>
                    {task.isRecurring && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-700">
                        <Repeat className="w-2.5 h-2.5" />
                        Repeats
                      </span>
                    )}
                    {task.priority && task.priority !== 'MEDIUM' && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {task.dueTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.dueTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !showAddForm ? (
          <div className="text-center py-6">
            <ListTodo className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No pending tasks for this horse</p>
            {canEdit && (
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-secondary btn-sm mt-3"
              >
                <Plus className="w-4 h-4" />
                Create a task
              </button>
            )}
          </div>
        ) : null}
      </div>

      {/* Completed tasks */}
      {completedTasks.length > 0 && (
        <div className="card p-5">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Completed ({completedTasks.length})
          </h4>
          <div className="divide-y divide-border">
            {completedTasks.slice(0, 10).map((task) => (
              <div key={task.id} className="py-2 flex items-center gap-3">
                <button
                  onClick={() => toggleTaskStatus(task.id, task.status)}
                  className="flex-shrink-0"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </button>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-muted-foreground line-through truncate block">
                    {task.title}
                  </span>
                  {task.completedAt && (
                    <span className="text-xs text-muted-foreground">
                      Completed {new Date(task.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {completedTasks.length > 10 && (
              <p className="text-xs text-muted-foreground pt-2">
                +{completedTasks.length - 10} more completed tasks
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
