'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useBarn } from '@/contexts/BarnContext';
import { useEvents, useHorses, useLessons } from '@/hooks/useData';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  Loader2,
  Stethoscope,
  Scissors,
  Syringe,
  FileText,
  X,
  Download,
  Settings,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Trophy,
  GraduationCap,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO,
} from 'date-fns';

const eventTypeIcons: Record<string, any> = {
  VET: Stethoscope,
  VET_APPOINTMENT: Stethoscope,
  FARRIER: Scissors,
  VACCINATION: Syringe,
  DENTAL: FileText,
  DEWORMING: FileText,
  COMPETITION: Trophy,
  SHOW: Trophy,
  TRAINING: GraduationCap,
  TRANSPORT: CalendarIcon,
  BREEDING: CalendarIcon,
  OTHER: CalendarIcon,
  LESSON: GraduationCap,
};

const eventTypeColors: Record<string, string> = {
  VET: 'bg-blue-100 text-blue-700 border-blue-200',
  VET_APPOINTMENT: 'bg-blue-100 text-blue-700 border-blue-200',
  FARRIER: 'bg-orange-100 text-orange-700 border-orange-200',
  VACCINATION: 'bg-green-100 text-green-700 border-green-200',
  DENTAL: 'bg-purple-100 text-purple-700 border-purple-200',
  DEWORMING: 'bg-amber-100 text-amber-700 border-amber-200',
  COMPETITION: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  SHOW: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  TRAINING: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  TRANSPORT: 'bg-slate-100 text-slate-700 border-slate-200',
  BREEDING: 'bg-pink-100 text-pink-700 border-pink-200',
  OTHER: 'bg-stone-100 text-stone-700 border-stone-200',
  LESSON: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

const eventTypes = [
  { id: 'VET', name: 'Veterinary', icon: Stethoscope },
  { id: 'FARRIER', name: 'Farrier', icon: Scissors },
  { id: 'VACCINATION', name: 'Vaccination', icon: Syringe },
  { id: 'DENTAL', name: 'Dental', icon: FileText },
  { id: 'DEWORMING', name: 'Deworming', icon: FileText },
  { id: 'COMPETITION', name: 'Competition', icon: Trophy },
  { id: 'OTHER', name: 'Other', icon: CalendarIcon },
];

export default function CalendarPage() {
  const { currentBarn } = useBarn();
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'list'>('month');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalStep, setModalStep] = useState(1); // 1 = Event Details, 2 = Select Horses
  const [showCalendarSettings, setShowCalendarSettings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [iCalCopied, setICalCopied] = useState(false);
  const [googleStatus, setGoogleStatus] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  
  // Initialize date on client side only
  useEffect(() => {
    if (!currentMonth) {
      setCurrentMonth(new Date());
    }
  }, [currentMonth]);

  // Event form state
  const [eventForm, setEventForm] = useState({
    type: 'VET',
    title: '',
    description: '',
    horseIds: [] as string[],
    scheduledDate: '',
    scheduledTime: '09:00',
    providerName: '',
    providerPhone: '',
    assignedToId: '',
  });

  // Lesson form state
  const [lessonForm, setLessonForm] = useState({
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

  const { data: eventsData, isLoading: eventsLoading, refetch: refetchEvents } = useEvents({
    barnId: currentBarn?.id,
    enabled: !!currentBarn?.id,
  });
  const { data: lessonsData, isLoading: lessonsLoading, refetch: refetchLessons } = useLessons({
    barnId: currentBarn?.id,
    enabled: !!currentBarn?.id,
  });
  const { horses } = useHorses();

  const isLoading = eventsLoading || lessonsLoading;

  // Merge events and lessons into a single calendar items array
  const calendarItems = useMemo(() => {
    const events = (eventsData?.data || []).map((event: any) => ({
      ...event,
      itemType: 'event' as const,
    }));

    const lessons = (lessonsData?.data || []).map((lesson: any) => ({
      ...lesson,
      itemType: 'lesson' as const,
      type: 'LESSON',
      title: `Lesson - ${lesson.client?.firstName || ''} ${lesson.client?.lastName || ''}`.trim(),
      horse: lesson.horse,
    }));

    return [...events, ...lessons];
  }, [eventsData, lessonsData]);

  const events = calendarItems;

  // Fetch Google Calendar status, clients, and instructors
  useEffect(() => {
    if (currentBarn?.id) {
      fetchGoogleStatus();
      fetchClientsAndInstructors();
    }
  }, [currentBarn?.id]);

  const fetchClientsAndInstructors = async () => {
    try {
      const [clientsRes, teamRes] = await Promise.all([
        fetch(`/api/barns/${currentBarn?.id}/clients`),
        fetch(`/api/barns/${currentBarn?.id}/team`),
      ]);

      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClients(data.data || []);
      }

      if (teamRes.ok) {
        const data = await teamRes.json();
        setInstructors(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching clients/instructors:', error);
    }
  };

  const fetchGoogleStatus = async () => {
    try {
      const response = await fetch(`/api/barns/${currentBarn?.id}/calendar/google`);
      if (response.ok) {
        const data = await response.json();
        setGoogleStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching Google status:', error);
    }
  };

  const getICalUrl = () => {
    if (!currentBarn) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/api/barns/${currentBarn.id}/calendar/ical?token=${currentBarn.inviteCode}`;
  };

  const copyICalUrl = async () => {
    const url = getICalUrl();
    await navigator.clipboard.writeText(url);
    setICalCopied(true);
    setTimeout(() => setICalCopied(false), 2000);
  };

  const downloadICal = () => {
    const url = getICalUrl();
    window.open(url, '_blank');
  };

  const handleGoogleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(`/api/barns/${currentBarn?.id}/calendar/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' }),
      });
      if (response.ok) {
        const data = await response.json();
        alert(data.data.message);
        fetchGoogleStatus();
      }
    } catch (error) {
      console.error('Error syncing:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGoogleConnect = async () => {
    try {
      const response = await fetch(`/api/barns/${currentBarn?.id}/calendar/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect' }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.data.authUrl) {
          window.location.href = data.data.authUrl;
        } else {
          alert(data.data.message);
        }
      }
    } catch (error) {
      console.error('Error connecting:', error);
    }
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    if (!currentMonth) return [];
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, typeof events> = {};
    events.forEach((event: any) => {
      const dateKey = format(parseISO(event.scheduledDate), 'yyyy-MM-dd');
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);

  const getEventsForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return eventsByDate[dateKey] || [];
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Upcoming events for list view
  const upcomingEvents = useMemo(() => {
    return events
      .filter((e: any) => new Date(e.scheduledDate) >= new Date())
      .sort((a: any, b: any) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
      .slice(0, 20);
  }, [events]);

  // Open modal with selected date pre-filled
  const openAddModal = (date?: Date) => {
    const targetDate = date || selectedDate || new Date();
    setEventForm(prev => ({
      ...prev,
      scheduledDate: format(targetDate, 'yyyy-MM-dd'),
      title: '',
      description: '',
      horseIds: [],
      providerName: '',
      providerPhone: '',
    }));
    setModalStep(1); // Reset to step 1
    setShowAddModal(true);
  };

  // Open lesson modal with selected date pre-filled
  const openLessonModal = (date?: Date) => {
    const targetDate = date || selectedDate || new Date();
    setLessonForm(prev => ({
      ...prev,
      scheduledDate: format(targetDate, 'yyyy-MM-dd'),
      clientId: '',
      horseId: '',
      instructorId: '',
      discipline: '',
      notes: '',
    }));
    setShowLessonModal(true);
  };

  // Handle event type change - auto-fill title
  const handleTypeChange = (type: string) => {
    const typeNames: Record<string, string> = {
      VET: 'Vet Visit',
      FARRIER: 'Farrier Appointment',
      VACCINATION: 'Vaccination',
      DENTAL: 'Dental Exam',
      DEWORMING: 'Deworming',
      COMPETITION: 'Competition',
      OTHER: '',
    };
    setEventForm(prev => ({
      ...prev,
      type,
      title: prev.title || typeNames[type] || '',
    }));
  };

  // Handle step navigation
  const handleNext = () => {
    if (!eventForm.title || !eventForm.scheduledDate) {
      alert('Please fill in required fields (Title and Date)');
      return;
    }
    setModalStep(2);
  };

  const handleBack = () => {
    setModalStep(1);
  };

  // Submit event
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const scheduledDateTime = `${eventForm.scheduledDate}T${eventForm.scheduledTime}:00`;

      const response = await fetch(`/api/barns/${currentBarn?.id}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: eventForm.type,
          title: eventForm.title,
          description: eventForm.description || null,
          horseIds: eventForm.horseIds.length > 0 ? eventForm.horseIds : null,
          scheduledDate: new Date(scheduledDateTime).toISOString(),
          providerName: eventForm.providerName || null,
          providerPhone: eventForm.providerPhone || null,
          assignedToId: eventForm.assignedToId || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create event');
      }

      setShowAddModal(false);
      setModalStep(1); // Reset step
      refetchEvents();

      // Reset form
      setEventForm({
        type: 'VET',
        title: '',
        description: '',
        horseIds: [],
        scheduledDate: '',
        scheduledTime: '09:00',
        providerName: '',
        providerPhone: '',
        assignedToId: '',
      });
    } catch (error) {
      console.error('Error creating event:', error);
      alert(error instanceof Error ? error.message : 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit lesson
  const handleLessonSubmit = async () => {
    if (!lessonForm.clientId || !lessonForm.scheduledDate) {
      alert('Please select a client and date');
      return;
    }

    setIsSubmitting(true);
    try {
      const scheduledDateTime = new Date(`${lessonForm.scheduledDate}T${lessonForm.scheduledTime}:00`);

      const response = await fetch(`/api/barns/${currentBarn?.id}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: lessonForm.clientId,
          horseId: lessonForm.horseId || null,
          instructorId: lessonForm.instructorId || null,
          type: lessonForm.type,
          scheduledDate: scheduledDateTime.toISOString(),
          duration: lessonForm.duration,
          discipline: lessonForm.discipline || null,
          level: lessonForm.level || null,
          price: lessonForm.price ? parseFloat(lessonForm.price) : null,
          location: lessonForm.location || null,
          notes: lessonForm.notes || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create lesson');
      }

      setShowLessonModal(false);
      refetchLessons();

      // Reset form
      setLessonForm({
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
    } catch (error) {
      console.error('Error creating lesson:', error);
      alert(error instanceof Error ? error.message : 'Failed to create lesson');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentBarn) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-stone-500">Please select a barn first</p>
      </div>
    );
  }

  // Wait for client-side date initialization
  if (!currentMonth) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Schedule</h1>
          <p className="text-stone-500 mt-1">Events, appointments & lessons</p>
          <div className="flex items-center gap-2 mt-2">
            <Link href="/lessons" className="text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors">
              Manage Lessons →
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCalendarSettings(true)}
            className="btn-secondary btn-sm flex items-center gap-2"
            title="Calendar Settings"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Sync</span>
          </button>
          <div className="flex rounded-xl bg-stone-100 p-1">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                view === 'month' ? 'bg-white shadow text-stone-900' : 'text-stone-600'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                view === 'list' ? 'bg-white shadow text-stone-900' : 'text-stone-600'
              }`}
            >
              List
            </button>
          </div>
          <button
            onClick={() => openLessonModal()}
            className="btn-secondary flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4" />
            <span className="hidden sm:inline">Schedule Lesson</span>
          </button>
          <button
            onClick={() => openAddModal()}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : view === 'month' ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 card p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-stone-900">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-3 py-1.5 text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 rounded-lg hover:bg-stone-100 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 rounded-lg hover:bg-stone-100 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-stone-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const dayEvents = getEventsForDate(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const dayIsToday = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    onDoubleClick={() => openAddModal(day)}
                    className={`
                      aspect-square p-1 rounded-xl text-left transition-all relative
                      ${!isCurrentMonth ? 'text-stone-300' : 'text-stone-900'}
                      ${isSelected ? 'bg-stone-900 text-white' : 'hover:bg-stone-100'}
                      ${dayIsToday && !isSelected ? 'ring-2 ring-amber-500 ring-inset' : ''}
                    `}
                    title="Double-click to add event"
                  >
                    <span className={`text-sm font-medium ${dayIsToday && !isSelected ? 'text-amber-600' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 left-1 right-1 flex gap-0.5 justify-center">
                        {dayEvents.slice(0, 3).map((event: any, i: number) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? 'bg-white' : 'bg-amber-500'
                            }`}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <span className={`text-[10px] ${isSelected ? 'text-white' : 'text-stone-500'}`}>
                            +{dayEvents.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Events */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-900">
                {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
              </h3>
              {selectedDate && (
                <button
                  onClick={() => openAddModal(selectedDate)}
                  className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-700 transition-all"
                  title="Add event on this date"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
            {selectedDate ? (
              selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map((event: any) => {
                    const Icon = eventTypeIcons[event.type] || CalendarIcon;
                    const colorClass = eventTypeColors[event.type] || eventTypeColors.OTHER;
                    return (
                      <div
                        key={event.id}
                        className={`p-4 rounded-xl border ${colorClass}`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="w-5 h-5 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{event.title}</p>
                            {event.horses && event.horses.length > 0 ? (
                              <p className="text-sm opacity-75">
                                {event.horses.length === 1
                                  ? event.horses[0].horse.barnName
                                  : `${event.horses.length} horses`
                                }
                              </p>
                            ) : event.horse ? (
                              <p className="text-sm opacity-75">{event.horse.barnName}</p>
                            ) : (
                              <p className="text-sm opacity-75">All horses / Barn-wide</p>
                            )}
                            <div className="flex items-center gap-2 mt-2 text-sm opacity-75">
                              <Clock className="w-3.5 h-3.5" />
                              {format(parseISO(event.scheduledDate), 'h:mm a')}
                            </div>
                            {event.providerName && (
                              <div className="flex items-center gap-2 mt-1 text-sm opacity-75">
                                <User className="w-3.5 h-3.5" />
                                {event.providerName}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-stone-500 mb-3">No events scheduled</p>
                  <button
                    onClick={() => openAddModal(selectedDate)}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    + Add an event
                  </button>
                </div>
              )
            ) : (
              <p className="text-stone-500 text-center py-8">Click a date to view events</p>
            )}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="card divide-y divide-stone-100">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event: any) => {
              const Icon = eventTypeIcons[event.type] || CalendarIcon;
              const colorClass = eventTypeColors[event.type] || eventTypeColors.OTHER;
              return (
                <div key={event.id} className="p-4 hover:bg-stone-50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-900">{event.title}</p>
                      {event.horses && event.horses.length > 0 ? (
                        <p className="text-sm text-stone-500">
                          {event.horses.length === 1
                            ? event.horses[0].horse.barnName
                            : `${event.horses.length} horses: ${event.horses.slice(0, 3).map((eh: any) => eh.horse.barnName).join(', ')}${event.horses.length > 3 ? '...' : ''}`
                          }
                        </p>
                      ) : event.horse ? (
                        <p className="text-sm text-stone-500">{event.horse.barnName}</p>
                      ) : (
                        <p className="text-sm text-stone-500">All horses / Barn-wide</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-stone-900">
                        {format(parseISO(event.scheduledDate), 'MMM d')}
                      </p>
                      <p className="text-sm text-stone-500">
                        {format(parseISO(event.scheduledDate), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <CalendarIcon className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500 mb-3">No upcoming events</p>
              <button
                onClick={() => openAddModal()}
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                + Schedule your first event
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {modalStep === 1 ? 'Event Details' : 'Select Horses'}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Step {modalStep} of 2
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setModalStep(1);
                  }}
                  className="p-1 rounded hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {modalStep === 1 ? (
                // Step 1: Event Details
                <>
              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Event Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {eventTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = eventForm.type === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleTypeChange(type.id)}
                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-amber-600' : 'text-stone-500'}`} />
                        <span className={`text-xs font-medium ${isSelected ? 'text-amber-600' : 'text-stone-600'}`}>
                          {type.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  className="input w-full"
                  placeholder="Event title"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={eventForm.scheduledDate}
                    onChange={(e) => setEventForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={eventForm.scheduledTime}
                    onChange={(e) => setEventForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    className="input w-full"
                  />
                </div>
              </div>

              {/* Provider - Only show for certain event types */}
              {['VET', 'FARRIER', 'VACCINATION', 'DENTAL', 'DEWORMING'].includes(eventForm.type) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Provider Name</label>
                    <input
                      type="text"
                      value={eventForm.providerName}
                      onChange={(e) => setEventForm(prev => ({ ...prev, providerName: e.target.value }))}
                      className="input w-full"
                      placeholder="Dr. Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Provider Phone</label>
                    <input
                      type="tel"
                      value={eventForm.providerPhone}
                      onChange={(e) => setEventForm(prev => ({ ...prev, providerPhone: e.target.value }))}
                      className="input w-full"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              )}

              {/* Location - Show for Competition */}
              {eventForm.type === 'COMPETITION' && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={eventForm.providerName}
                    onChange={(e) => setEventForm(prev => ({ ...prev, providerName: e.target.value }))}
                    className="input w-full"
                    placeholder="Competition venue"
                  />
                </div>
              )}

              {/* Assign To */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Assign To (optional)</label>
                <select
                  value={eventForm.assignedToId}
                  onChange={(e) => setEventForm(prev => ({ ...prev, assignedToId: e.target.value }))}
                  className="input w-full"
                >
                  <option value="">Unassigned (visible to all)</option>
                  {instructors.map((member: any) => (
                    <option key={member.userId} value={member.userId}>
                      {member.user.firstName} {member.user.lastName} ({member.role === 'OWNER' ? 'Owner' : member.role === 'MANAGER' ? 'Manager' : member.role === 'TRAINER' ? 'Trainer' : 'Staff'})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-stone-500 mt-1">
                  Assign this event to a specific team member. If unassigned, everyone can see it.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Notes</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input w-full"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
                </>
              ) : (
                // Step 2: Select Horses
                <>
                  {/* Summary of Event Details */}
                  <div className="bg-stone-50 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-stone-700 mb-2">Event Summary</h4>
                    <div className="space-y-1 text-sm text-stone-600">
                      <p><span className="font-medium">Title:</span> {eventForm.title}</p>
                      <p><span className="font-medium">Date:</span> {eventForm.scheduledDate} at {eventForm.scheduledTime}</p>
                      {eventForm.providerName && (
                        <p><span className="font-medium">Provider:</span> {eventForm.providerName}</p>
                      )}
                    </div>
                  </div>

                  {/* Horses Selection */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Select Horses
                    </label>
                    <div className="border border-stone-200 rounded-lg p-3 max-h-64 overflow-y-auto space-y-2">
                      <label className="flex items-center gap-2 p-2 hover:bg-stone-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={eventForm.horseIds.length === 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEventForm(prev => ({ ...prev, horseIds: [] }));
                            }
                          }}
                          className="w-4 h-4 text-amber-600 rounded"
                        />
                        <span className="text-sm font-medium text-stone-600">All horses / Barn-wide</span>
                      </label>
                      {horses.map((horse: any) => (
                        <label key={horse.id} className="flex items-center gap-2 p-2 hover:bg-stone-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={eventForm.horseIds.includes(horse.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEventForm(prev => ({
                                  ...prev,
                                  horseIds: [...prev.horseIds, horse.id]
                                }));
                              } else {
                                setEventForm(prev => ({
                                  ...prev,
                                  horseIds: prev.horseIds.filter(id => id !== horse.id)
                                }));
                              }
                            }}
                            className="w-4 h-4 text-amber-600 rounded"
                          />
                          <span className="text-sm text-stone-700">{horse.barnName}</span>
                        </label>
                      ))}
                    </div>
                    {eventForm.horseIds.length > 0 && (
                      <p className="text-xs text-stone-500 mt-2">
                        {eventForm.horseIds.length} horse{eventForm.horseIds.length > 1 ? 's' : ''} selected
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-stone-100 flex gap-3">
              {modalStep === 1 ? (
                <>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setModalStep(1);
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleNext}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleBack}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create Event
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-semibold">Schedule Lesson</h3>
                </div>
                <button
                  onClick={() => setShowLessonModal(false)}
                  className="p-1 rounded hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Client */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Client *</label>
                <select
                  value={lessonForm.clientId}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, clientId: e.target.value }))}
                  className="input w-full"
                >
                  <option value="">Select client...</option>
                  {clients.map((client: any) => (
                    <option key={client.id} value={client.id}>
                      {client.user.firstName} {client.user.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Horse */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Horse (optional)</label>
                <select
                  value={lessonForm.horseId}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, horseId: e.target.value }))}
                  className="input w-full"
                >
                  <option value="">Select horse...</option>
                  {horses.map((horse: any) => (
                    <option key={horse.id} value={horse.id}>
                      {horse.barnName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Instructor */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Instructor/Trainer</label>
                <select
                  value={lessonForm.instructorId}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, instructorId: e.target.value }))}
                  className="input w-full"
                >
                  <option value="">Select instructor...</option>
                  {instructors.map((i: any) => (
                    <option key={i.userId} value={i.userId}>
                      {i.user.firstName} {i.user.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lesson Type */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Lesson Type</label>
                <select
                  value={lessonForm.type}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, type: e.target.value }))}
                  className="input w-full"
                >
                  <option value="PRIVATE">Private</option>
                  <option value="SEMI_PRIVATE">Semi-Private</option>
                  <option value="GROUP">Group</option>
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={lessonForm.scheduledDate}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={lessonForm.scheduledTime}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    className="input w-full"
                  />
                </div>
              </div>

              {/* Duration & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={lessonForm.price}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, price: e.target.value }))}
                    className="input w-full"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Discipline & Level */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Discipline</label>
                  <input
                    type="text"
                    value={lessonForm.discipline}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, discipline: e.target.value }))}
                    className="input w-full"
                    placeholder="e.g. Dressage, Jumping"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Level</label>
                  <input
                    type="text"
                    value={lessonForm.level}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, level: e.target.value }))}
                    className="input w-full"
                    placeholder="e.g. Beginner, Advanced"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Location</label>
                <input
                  type="text"
                  value={lessonForm.location}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, location: e.target.value }))}
                  className="input w-full"
                  placeholder="e.g. Arena 1, Main Ring"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Notes</label>
                <textarea
                  value={lessonForm.notes}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="input w-full"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-stone-100 flex gap-3">
              <button
                onClick={() => setShowLessonModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleLessonSubmit}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-4 h-4" />
                    Schedule Lesson
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Settings Modal */}
      {showCalendarSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Calendar Sync</h3>
              <button
                onClick={() => setShowCalendarSettings(false)}
                className="p-1 rounded hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* iCal Export */}
              <div className="space-y-3">
                <h4 className="font-medium text-stone-900 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-amber-500" />
                  Subscribe to Calendar (iCal)
                </h4>
                <p className="text-sm text-stone-500">
                  Add this URL to Apple Calendar, Google Calendar, Outlook, or any calendar app that supports iCal feeds.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getICalUrl()}
                    className="input flex-1 text-sm bg-stone-50"
                  />
                  <button
                    onClick={copyICalUrl}
                    className="btn-secondary btn-sm flex items-center gap-1"
                  >
                    {iCalCopied ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <button
                  onClick={downloadICal}
                  className="btn-secondary btn-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download .ics File
                </button>
              </div>

              {/* Google Calendar Sync */}
              <div className="space-y-3 pt-4 border-t border-stone-200">
                <h4 className="font-medium text-stone-900 flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M22 12C22 6.48 17.52 2 12 2S2 6.48 2 12s4.48 10 10 10c1.85 0 3.58-.5 5.07-1.38" stroke="#4285F4" strokeWidth="2"/>
                    <path d="M12 6v6l4 2" stroke="#EA4335" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Google Calendar
                </h4>
                
                {googleStatus ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${googleStatus.connected ? 'bg-green-500' : 'bg-stone-300'}`} />
                      <span className="text-sm text-stone-600">
                        {googleStatus.connected ? 'Connected' : 'Not connected'}
                      </span>
                    </div>
                    
                    {googleStatus.lastSync && (
                      <p className="text-xs text-stone-500">
                        Last synced: {new Date(googleStatus.lastSync).toLocaleString()}
                      </p>
                    )}
                    
                    {!googleStatus.configured && (
                      <div className="p-3 bg-amber-50 rounded-lg text-sm text-amber-700">
                        Google Calendar integration requires configuration. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {googleStatus.connected ? (
                        <button
                          onClick={handleGoogleSync}
                          disabled={isSyncing}
                          className="btn-primary btn-sm flex items-center gap-2"
                        >
                          {isSyncing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                          Sync Now
                        </button>
                      ) : (
                        <button
                          onClick={handleGoogleConnect}
                          className="btn-primary btn-sm flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Connect Google Calendar
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-stone-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </div>
                )}
              </div>

              {/* Sync Options */}
              {googleStatus?.connected && (
                <div className="space-y-3 pt-4 border-t border-stone-200">
                  <h4 className="font-medium text-stone-900">Sync Options</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={googleStatus.syncSettings?.events ?? true}
                        onChange={() => {}}
                        className="rounded border-stone-300"
                      />
                      <span className="text-sm text-stone-700">Sync Events (vet, farrier, etc.)</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={googleStatus.syncSettings?.lessons ?? true}
                        onChange={() => {}}
                        className="rounded border-stone-300"
                      />
                      <span className="text-sm text-stone-700">Sync Lessons</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={googleStatus.syncSettings?.tasks ?? false}
                        onChange={() => {}}
                        className="rounded border-stone-300"
                      />
                      <span className="text-sm text-stone-700">Sync Tasks (as all-day events)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-stone-100">
              <button
                onClick={() => setShowCalendarSettings(false)}
                className="btn-secondary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
