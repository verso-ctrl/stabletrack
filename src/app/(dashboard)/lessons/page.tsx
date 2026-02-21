'use client';

import React, { useState, useEffect } from 'react';
import { useBarn } from '@/contexts/BarnContext';
import { toast } from '@/lib/toast';
import { csrfFetch } from '@/lib/fetch';
import {
  Calendar,
  Plus,
  Clock,
  User,
  X,
  Loader2,
  CheckCircle,
  XCircle,
  Filter,
} from 'lucide-react';

const HorseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12c0-4-3-8-8-8-3 0-5.5 1.5-7 3.5L3 10l1 3-2 4 3 1 2-1 2 3h4l1-2 2 1 4-3c1-1 2-2.5 2-4z"/>
  </svg>
);

const lessonTypes = ['PRIVATE', 'GROUP', 'SEMI_PRIVATE', 'TRAINING', 'EVALUATION'];
const disciplines = ['HUNTER', 'JUMPER', 'DRESSAGE', 'EVENTING', 'WESTERN', 'TRAIL', 'GENERAL'];
const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'COMPETITIVE'];

const statusColors: Record<string, string> = {
  SCHEDULED: 'badge-info',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger',
  NO_SHOW: 'badge-warning',
};

export default function LessonsPage() {
  const { currentBarn, isMember } = useBarn();
  const canEdit = isMember && currentBarn?.role !== 'CLIENT';
  const [lessons, setLessons] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [horses, setHorses] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState('upcoming');

  const [form, setForm] = useState({
    clientId: '',
    horseId: '',
    instructorId: '',
    type: 'PRIVATE',
    scheduledDate: '',
    scheduledTime: '09:00',
    duration: 60,
    discipline: '',
    level: '',
    price: '',
    location: '',
    notes: '',
  });

  useEffect(() => {
    if (currentBarn?.id) {
      fetchData();
    }
  }, [currentBarn?.id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [lessonsRes, clientsRes, horsesRes, teamRes] = await Promise.all([
        fetch(`/api/barns/${currentBarn?.id}/lessons`),
        fetch(`/api/barns/${currentBarn?.id}/clients`),
        fetch(`/api/barns/${currentBarn?.id}/horses`),
        fetch(`/api/barns/${currentBarn?.id}/team`),
      ]);

      if (lessonsRes.ok) {
        const data = await lessonsRes.json();
        setLessons(data.data || []);
      }
      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClients(data.data || []);
      }
      if (horsesRes.ok) {
        const data = await horsesRes.json();
        setHorses(data.data || []);
      }
      if (teamRes.ok) {
        const data = await teamRes.json();
        setInstructors(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLesson = async () => {
    if (!form.scheduledDate) {
      toast.warning('Missing date', 'Please select a date');
      return;
    }

    setIsSubmitting(true);
    try {
      const scheduledDate = new Date(`${form.scheduledDate}T${form.scheduledTime}`);
      
      const response = await csrfFetch(`/api/barns/${currentBarn?.id}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: form.clientId || null,
          horseId: form.horseId || null,
          instructorId: form.instructorId || null,
          type: form.type,
          scheduledDate: scheduledDate.toISOString(),
          duration: form.duration,
          discipline: form.discipline || null,
          level: form.level || null,
          price: form.price ? parseFloat(form.price) : null,
          location: form.location || null,
          notes: form.notes || null,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create lesson');
      }

      setShowModal(false);
      setForm({
        clientId: '', horseId: '', instructorId: '', type: 'PRIVATE',
        scheduledDate: '', scheduledTime: '09:00', duration: 60,
        discipline: '', level: '', price: '', location: '', notes: '',
      });
      fetchData();
      toast.success('Lesson created', 'Lesson has been scheduled');
    } catch (err) {
      toast.error('Failed to create lesson', err instanceof Error ? err.message : 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (lessonId: string, status: string) => {
    try {
      const response = await csrfFetch(`/api/barns/${currentBarn?.id}/lessons`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, status }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating lesson:', error);
    }
  };

  const filteredLessons = lessons.filter(lesson => {
    const lessonDate = new Date(lesson.scheduledDate);
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return lessonDate >= now && lesson.status === 'SCHEDULED';
      case 'today':
        return lessonDate.toDateString() === now.toDateString();
      case 'past':
        return lessonDate < now || lesson.status !== 'SCHEDULED';
      default:
        return true;
    }
  }).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lessons</h1>
          <p className="text-muted-foreground">{canEdit ? 'Schedule and manage riding lessons' : 'View your riding lessons'}</p>
        </div>
        {canEdit && (
          <button onClick={() => setShowModal(true)} className="btn-primary btn-md">
            <Plus className="w-4 h-4" />
            Schedule Lesson
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['upcoming', 'today', 'past', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f
                ? 'bg-amber-100 text-amber-700'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Lessons List */}
      <div className="card divide-y divide-border">
        {filteredLessons.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{canEdit ? 'No lessons scheduled' : 'No lessons found'}</p>
            {canEdit && (
              <button onClick={() => setShowModal(true)} className="btn-primary btn-sm mt-4">
                Schedule First Lesson
              </button>
            )}
          </div>
        ) : (
          filteredLessons.map(lesson => (
            <div key={lesson.id} className="p-4 flex items-center gap-4 hover:bg-accent">
              <div className="w-16 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {new Date(lesson.scheduledDate).getDate()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(lesson.scheduledDate).toLocaleDateString('en-US', { month: 'short' })}
                </p>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">
                    {lesson.type.replace(/_/g, ' ')} Lesson
                  </p>
                  <span className={statusColors[lesson.status]}>{lesson.status}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(lesson.scheduledDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    ({lesson.duration} min)
                  </span>
                  {lesson.client && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {lesson.client.firstName} {lesson.client.lastName}
                    </span>
                  )}
                  {lesson.horse && (
                    <span className="flex items-center gap-1">
                      <HorseIcon className="w-3.5 h-3.5" />
                      {lesson.horse.barnName}
                    </span>
                  )}
                  {lesson.instructor && (
                    <span className="flex items-center gap-1 text-amber-600">
                      <User className="w-3.5 h-3.5" />
                      Trainer: {lesson.instructor.firstName} {lesson.instructor.lastName}
                    </span>
                  )}
                </div>
              </div>
              {lesson.price && (
                <p className="font-semibold text-muted-foreground">${lesson.price}</p>
              )}
              {lesson.status === 'SCHEDULED' && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleUpdateStatus(lesson.id, 'COMPLETED')}
                    className="p-2 rounded-lg hover:bg-green-50 text-green-600"
                    title="Mark Complete"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(lesson.id, 'CANCELLED')}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                    title="Cancel"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Schedule Lesson</h3>
                <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-accent">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Date *</label>
                  <input
                    type="date"
                    value={form.scheduledDate}
                    onChange={(e) => setForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Time *</label>
                  <input
                    type="time"
                    value={form.scheduledTime}
                    onChange={(e) => setForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                    className="input w-full"
                  >
                    {lessonTypes.map(t => (
                      <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Duration (min)</label>
                  <select
                    value={form.duration}
                    onChange={(e) => setForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="input w-full"
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Client</label>
                <select
                  value={form.clientId}
                  onChange={(e) => setForm(prev => ({ ...prev, clientId: e.target.value }))}
                  className="input w-full"
                >
                  <option value="">Select client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Horse</label>
                <select
                  value={form.horseId}
                  onChange={(e) => setForm(prev => ({ ...prev, horseId: e.target.value }))}
                  className="input w-full"
                >
                  <option value="">Select horse...</option>
                  {horses.map(h => (
                    <option key={h.id} value={h.id}>{h.barnName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Instructor/Trainer</label>
                <select
                  value={form.instructorId}
                  onChange={(e) => setForm(prev => ({ ...prev, instructorId: e.target.value }))}
                  className="input w-full"
                >
                  <option value="">Select instructor...</option>
                  {instructors.map(i => (
                    <option key={i.userId} value={i.userId}>
                      {i.user.firstName} {i.user.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Discipline</label>
                  <select
                    value={form.discipline}
                    onChange={(e) => setForm(prev => ({ ...prev, discipline: e.target.value }))}
                    className="input w-full"
                  >
                    <option value="">Select...</option>
                    {disciplines.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Level</label>
                  <select
                    value={form.level}
                    onChange={(e) => setForm(prev => ({ ...prev, level: e.target.value }))}
                    className="input w-full"
                  >
                    <option value="">Select...</option>
                    {levels.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Price</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                    className="input w-full"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                    className="input w-full"
                    placeholder="Indoor arena"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="input w-full"
                  rows={2}
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1" disabled={isSubmitting}>
                Cancel
              </button>
              <button onClick={handleCreateLesson} className="btn-primary flex-1" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Schedule Lesson'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
