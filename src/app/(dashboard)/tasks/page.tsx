'use client';

import React, { useState } from 'react';
import { useBarn } from '@/contexts/BarnContext';
import { useTasks } from '@/hooks/useData';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  User,
  MoreVertical,
  Loader2,
  ListTodo,
  AlertCircle,
} from 'lucide-react';

const priorityColors: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-700 border-red-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  MEDIUM: 'bg-blue-100 text-blue-700 border-blue-200',
  LOW: 'bg-stone-100 text-stone-700 border-stone-200',
};

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
    priority: 'MEDIUM',
  });

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
      const response = await fetch(`/api/barns/${currentBarn?.id}/tasks/${taskId}`, {
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
      alert('Failed to update task');
    }
  };

  if (!currentBarn) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-stone-500">Please select a barn first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Tasks</h1>
          <p className="text-stone-500 mt-1">Manage your daily tasks and reminders</p>
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
              <p className="text-2xl font-bold text-stone-900">{pendingTasks.length}</p>
              <p className="text-sm text-stone-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{completedTasks.length}</p>
              <p className="text-sm text-stone-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">
                {pendingTasks.filter(t => t.priority === 'URGENT').length}
              </p>
              <p className="text-sm text-stone-500">Urgent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-12 w-full"
          />
        </div>
        <div className="flex rounded-xl bg-stone-100 p-1">
          {['ALL', 'PENDING', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === status ? 'bg-white shadow text-stone-900' : 'text-stone-600'
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
        <div className="card divide-y divide-stone-100">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 hover:bg-stone-50 transition-all flex items-center gap-4"
            >
              <button
                onClick={() => toggleTaskStatus(task.id, task.status)}
                className="flex-shrink-0"
              >
                {task.status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <Circle className="w-6 h-6 text-stone-300 hover:text-stone-400" />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`font-medium ${
                    task.status === 'COMPLETED' ? 'text-stone-400 line-through' : 'text-stone-900'
                  }`}>
                    {task.title}
                  </p>
                  {task.priority && task.priority !== 'MEDIUM' && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="text-sm text-stone-500 mt-1 truncate">{task.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-stone-400">
                  {task.dueDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(task.dueDate).toLocaleDateString()}
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
              
              <button className="p-2 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-all">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <ListTodo className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">No tasks found</p>
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
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add Task</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
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
                <label className="block text-sm font-medium text-stone-700 mb-1">
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
                  <label className="block text-sm font-medium text-stone-700 mb-1">
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
                  <label className="block text-sm font-medium text-stone-700 mb-1">
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
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Priority
                </label>
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
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewTask({ title: '', description: '', dueDate: '', dueTime: '', priority: 'MEDIUM' });
                }}
                className="btn-secondary flex-1"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newTask.title.trim()) {
                    alert('Please enter a task title');
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
                        priority: newTask.priority,
                      }),
                    });
                    if (!response.ok) throw new Error('Failed to create task');
                    setShowAddModal(false);
                    setNewTask({ title: '', description: '', dueDate: '', dueTime: '', priority: 'MEDIUM' });
                    refetch();
                  } catch (error) {
                    console.error('Error creating task:', error);
                    alert('Failed to create task');
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
