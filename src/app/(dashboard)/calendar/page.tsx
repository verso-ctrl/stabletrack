'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useBarn } from '@/contexts/BarnContext';
import { toast } from '@/lib/toast';
import { csrfFetch } from '@/lib/fetch';
import { useEvents, useHorses } from '@/hooks/useData';
import { PrintableCalendar } from '@/components/events/PrintableCalendar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
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
  Printer,
  Pencil,
  Trash2,
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
  OTHER: 'bg-muted text-muted-foreground border-border',
};

const eventTypes = [
  { id: 'VET_APPOINTMENT', name: 'Veterinary', icon: Stethoscope },
  { id: 'FARRIER', name: 'Farrier', icon: Scissors },
  { id: 'VACCINATION', name: 'Vaccination', icon: Syringe },
  { id: 'DENTAL', name: 'Dental', icon: FileText },
  { id: 'DEWORMING', name: 'Deworming', icon: FileText },
  { id: 'SHOW', name: 'Show/Competition', icon: Trophy },
  { id: 'TRAINING', name: 'Training', icon: GraduationCap },
  { id: 'TRANSPORT', name: 'Transport', icon: CalendarIcon },
  { id: 'BREEDING', name: 'Breeding', icon: CalendarIcon },
  { id: 'OTHER', name: 'Other', icon: CalendarIcon },
];

export default function CalendarPage() {
  const { currentBarn } = useBarn();
  const searchParams = useSearchParams();
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
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [preselectedHorseId, setPreselectedHorseId] = useState<string | null>(null);
  const [showPrintView, setShowPrintView] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    type: 'VET_APPOINTMENT',
    title: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '09:00',
    providerName: '',
  });

  // Initialize date on client side only
  useEffect(() => {
    if (!currentMonth) {
      setCurrentMonth(new Date());
    }
  }, [currentMonth]);

  // Event form state
  const [eventForm, setEventForm] = useState({
    type: 'VET_APPOINTMENT',
    title: '',
    description: '',
    horseIds: [] as string[],
    scheduledDate: '',
    scheduledTime: '09:00',
    providerName: '',
    providerPhone: '',
    assignedToId: '',
  });

  const { data: eventsData, isLoading, refetch: refetchEvents } = useEvents({
    barnId: currentBarn?.id,
    enabled: !!currentBarn?.id,
  });
  const { horses } = useHorses();

  // Handle URL params for pre-selecting horse, date, and auto-opening modal
  useEffect(() => {
    if (!searchParams) return;
    const horseId = searchParams.get('horseId');
    const addEvent = searchParams.get('addEvent');
    const dateParam = searchParams.get('date');

    if (dateParam) {
      try {
        const d = new Date(dateParam + 'T12:00:00');
        setCurrentMonth(startOfMonth(d));
        setSelectedDate(d);
      } catch { /* ignore invalid dates */ }
    }

    if (horseId) {
      setPreselectedHorseId(horseId);
      // Pre-select the horse in the form
      setEventForm(prev => ({
        ...prev,
        horseIds: [horseId],
        scheduledDate: format(new Date(), 'yyyy-MM-dd'),
      }));
    }

    if (addEvent === 'true') {
      setShowAddModal(true);
    }
  }, [searchParams]);

  const events = eventsData?.data || [];

  // Fetch Google Calendar status and team members
  useEffect(() => {
    if (currentBarn?.id) {
      fetchGoogleStatus();
      fetchTeamMembers();
    }
  }, [currentBarn?.id]);

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch(`/api/barns/${currentBarn?.id}/team`);
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
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
      const response = await csrfFetch(`/api/barns/${currentBarn?.id}/calendar/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' }),
      });
      if (response.ok) {
        const data = await response.json();
        toast.success('Sync complete', data.data.message);
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
      const response = await csrfFetch(`/api/barns/${currentBarn?.id}/calendar/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect' }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.data.authUrl) {
          window.location.href = data.data.authUrl;
        } else {
          toast.info('Google Calendar', data.data.message);
        }
      }
    } catch (error) {
      console.error('Error connecting:', error);
    }
  };

  const handlePrint = () => {
    setShowPrintView(true);
    // Wait for the print view to render, then trigger print
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
        setShowPrintView(false);
      });
    });
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

  // Handle event type change - auto-fill title
  const handleTypeChange = (type: string) => {
    const typeNames: Record<string, string> = {
      VET_APPOINTMENT: 'Vet Visit',
      FARRIER: 'Farrier Appointment',
      VACCINATION: 'Vaccination',
      DENTAL: 'Dental Exam',
      DEWORMING: 'Deworming',
      SHOW: 'Show/Competition',
      TRAINING: 'Training Session',
      TRANSPORT: 'Transport',
      BREEDING: 'Breeding',
      OTHER: '',
    };
    setEventForm(prev => ({
      ...prev,
      type,
      title: typeNames[type] || prev.title || '',
    }));
  };

  // Handle step navigation
  const handleNext = () => {
    if (!eventForm.title || !eventForm.scheduledDate) {
      toast.warning('Missing fields', 'Please fill in title and date');
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

      // Build request body, excluding null/undefined values for optional fields
      const requestBody: any = {
        type: eventForm.type,
        title: eventForm.title || `${eventForm.type.charAt(0) + eventForm.type.slice(1).toLowerCase().replace('_', ' ')} Appointment`,
        scheduledDate: new Date(scheduledDateTime).toISOString(),
      };

      // Only include optional fields if they have values
      if (eventForm.description) requestBody.description = eventForm.description;
      if (eventForm.horseIds.length > 0) requestBody.horseIds = eventForm.horseIds;
      if (eventForm.providerName) requestBody.providerName = eventForm.providerName;
      if (eventForm.providerPhone) requestBody.providerPhone = eventForm.providerPhone;

      const response = await csrfFetch(`/api/barns/${currentBarn?.id}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Event creation failed:', error);
        const errorMessage = error.details
          ? `${error.error}: ${Object.entries(error.details).map(([field, msg]) => `${field}: ${msg}`).join(', ')}`
          : error.error || 'Failed to create event';
        throw new Error(errorMessage);
      }

      setShowAddModal(false);
      setModalStep(1); // Reset step
      setPreselectedHorseId(null); // Clear preselected horse
      // Clear URL params
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', '/calendar');
      }
      refetchEvents();

      // Reset form
      setEventForm({
        type: 'VET_APPOINTMENT',
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
      toast.error('Failed to create event', error instanceof Error ? error.message : 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open event for editing
  const openEditEvent = (event: any) => {
    const eventDate = new Date(event.scheduledDate);
    setEditForm({
      type: event.type || 'OTHER',
      title: event.title || '',
      description: event.description || event.notes || '',
      scheduledDate: format(eventDate, 'yyyy-MM-dd'),
      scheduledTime: format(eventDate, 'HH:mm'),
      providerName: event.providerName || '',
    });
    setEditingEvent(event);
  };

  // Save edited event
  const handleEditSave = async () => {
    if (!editingEvent || !currentBarn) return;
    if (!editForm.title.trim()) {
      toast.warning('Missing title', 'Please enter an event title');
      return;
    }
    setIsEditSubmitting(true);
    try {
      const scheduledDateTime = `${editForm.scheduledDate}T${editForm.scheduledTime}:00`;
      const res = await csrfFetch(`/api/barns/${currentBarn.id}/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: editForm.type,
          title: editForm.title,
          description: editForm.description || null,
          scheduledDate: new Date(scheduledDateTime).toISOString(),
        }),
      });
      if (!res.ok) throw new Error('Failed to update event');
      toast.success('Event Updated', `"${editForm.title}" has been updated.`);
      setEditingEvent(null);
      refetchEvents();
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Failed to update event');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // Delete event
  const handleDeleteEvent = async () => {
    if (!deleteEventId || !currentBarn) return;
    try {
      const res = await csrfFetch(`/api/barns/${currentBarn.id}/events/${deleteEventId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete event');
      toast.success('Event Removed', 'The event has been removed.');
      setDeleteEventId(null);
      refetchEvents();
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Failed to delete event');
    }
  };

  const deleteEventName = events.find((e: any) => e.id === deleteEventId)?.title;

  if (!currentBarn) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a barn first</p>
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
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Schedule</h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-0.5">Events, appointments & lessons</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-secondary btn-sm flex items-center gap-2 touch-target"
              title="Print Calendar"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={() => setShowCalendarSettings(true)}
              className="btn-secondary btn-sm flex items-center gap-2 touch-target"
              title="Calendar Settings"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Sync</span>
            </button>
            <div className="flex rounded-xl bg-muted p-1">
              <button
                onClick={() => setView('month')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  view === 'month' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  view === 'list' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button
            onClick={() => openAddModal()}
            className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
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
        <>
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 card p-3 sm:p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 rounded-lg hover:bg-accent active:bg-accent transition-all touch-target"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 rounded-lg hover:bg-accent active:bg-accent transition-all touch-target"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 mb-1 sm:mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-1 sm:py-2">
                  <span className="sm:hidden">{day}</span>
                  <span className="hidden sm:inline">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}</span>
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
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
                      aspect-square p-0.5 sm:p-1 rounded-lg sm:rounded-xl text-left transition-all relative no-tap-highlight
                      ${!isCurrentMonth ? 'text-muted-foreground' : 'text-foreground'}
                      ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent active:bg-accent'}
                      ${dayIsToday && !isSelected ? 'ring-2 ring-amber-500 ring-inset' : ''}
                    `}
                  >
                    <span className={`text-xs sm:text-sm font-medium ${dayIsToday && !isSelected ? 'text-amber-600' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 sm:bottom-1.5 left-0.5 sm:left-1 right-0.5 sm:right-1 flex gap-0.5 justify-center">
                        {dayEvents.slice(0, 3).map((event: any, i: number) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                              isSelected ? 'bg-card' : 'bg-amber-500'
                            }`}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <span className={`text-[8px] sm:text-[10px] ${isSelected ? 'text-white' : 'text-muted-foreground'}`}>
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
              <h3 className="font-semibold text-foreground">
                {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
              </h3>
              {selectedDate && (
                <button
                  onClick={() => openAddModal(selectedDate)}
                  className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-muted-foreground transition-all"
                  title="Add event on this date"
                  aria-label="Add event on this date"
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
                        className={`group p-4 rounded-xl border ${colorClass} cursor-pointer hover:shadow-md transition-shadow`}
                        onClick={() => openEditEvent(event)}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="w-5 h-5 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium">{event.title}</p>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <button
                                  onClick={(e) => { e.stopPropagation(); openEditEvent(event); }}
                                  className="p-1 rounded hover:bg-black/10 transition-colors"
                                  aria-label={`Edit ${event.title}`}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setDeleteEventId(event.id); }}
                                  className="p-1 rounded hover:bg-black/10 text-red-600 transition-colors"
                                  aria-label={`Delete ${event.title}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
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
                  <CalendarIcon className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-muted-foreground mb-1">Nothing on the schedule</p>
                  <p className="text-sm text-muted-foreground mb-3">This day is wide open.</p>
                  <button
                    onClick={() => openAddModal(selectedDate)}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    + Add an event
                  </button>
                </div>
              )
            ) : (
              <p className="text-muted-foreground text-center py-8">Click a date to view events</p>
            )}
          </div>
        </div>

        {/* Itemized list of all events this month */}
        {(() => {
          const monthStart = startOfMonth(currentMonth);
          const monthEnd = endOfMonth(currentMonth);
          const monthEvents = events
            .filter((e: any) => {
              const d = new Date(e.scheduledDate);
              return d >= monthStart && d <= monthEnd;
            })
            .sort((a: any, b: any) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

          if (monthEvents.length === 0) return null;

          // Group by date
          const grouped: { date: string; events: any[] }[] = [];
          let lastKey = '';
          for (const evt of monthEvents) {
            const key = format(new Date((evt as any).scheduledDate), 'yyyy-MM-dd');
            if (key !== lastKey) {
              grouped.push({ date: key, events: [evt] });
              lastKey = key;
            } else {
              grouped[grouped.length - 1].events.push(evt);
            }
          }

          return (
            <div className="card">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold text-foreground">
                  {format(currentMonth, 'MMMM')} Schedule — {monthEvents.length} event{monthEvents.length !== 1 ? 's' : ''}
                </h2>
              </div>
              <div className="divide-y divide-border">
                {grouped.map((group) => (
                  <div key={group.date}>
                    <div className="px-4 py-2 bg-muted/50">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {format(new Date(group.date), 'EEEE, MMMM d')}
                      </p>
                    </div>
                    {group.events.map((event: any) => {
                      const Icon = eventTypeIcons[event.type] || CalendarIcon;
                      const colorClass = eventTypeColors[event.type] || eventTypeColors.OTHER;
                      const time = new Date(event.scheduledDate);
                      const hasTime = time.getHours() !== 0 || time.getMinutes() !== 0;
                      const horseNames = event.horses?.length > 0
                        ? event.horses.map((eh: any) => eh.horse.barnName).join(', ')
                        : event.horse?.barnName || null;

                      return (
                        <div
                          key={event.id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors cursor-pointer"
                          onClick={() => openEditEvent(event)}
                        >
                          <div className={`p-2 rounded-lg ${colorClass}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{event.title}</p>
                            {horseNames && (
                              <p className="text-xs text-muted-foreground">{horseNames}</p>
                            )}
                          </div>
                          {hasTime && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {format(time, 'h:mm a')}
                            </span>
                          )}
                          {event.providerName && (
                            <span className="text-xs text-muted-foreground hidden sm:block truncate max-w-[120px]">
                              {event.providerName}
                            </span>
                          )}
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
        </>
      ) : (
        /* List View */
        <div className="card divide-y divide-border">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event: any) => {
              const Icon = eventTypeIcons[event.type] || CalendarIcon;
              const colorClass = eventTypeColors[event.type] || eventTypeColors.OTHER;
              return (
                <div key={event.id} className="p-4 hover:bg-accent transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{event.title}</p>
                      {event.horses && event.horses.length > 0 ? (
                        <p className="text-sm text-muted-foreground">
                          {event.horses.length === 1
                            ? event.horses[0].horse.barnName
                            : `${event.horses.length} horses: ${event.horses.slice(0, 3).map((eh: any) => eh.horse.barnName).join(', ')}${event.horses.length > 3 ? '...' : ''}`
                          }
                        </p>
                      ) : event.horse ? (
                        <p className="text-sm text-muted-foreground">{event.horse.barnName}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">All horses / Barn-wide</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        {format(parseISO(event.scheduledDate), 'MMM d')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(event.scheduledDate), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-3">No upcoming events</p>
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="bg-card w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto sm:m-4">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {modalStep === 1 ? 'Event Details' : 'Select Horses'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Step {modalStep} of 2
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setModalStep(1);
                    setPreselectedHorseId(null);
                    if (typeof window !== 'undefined') {
                      window.history.replaceState({}, '', '/calendar');
                    }
                  }}
                  className="p-1 rounded hover:bg-accent"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Show preselected horse banner */}
              {preselectedHorseId && horses.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-700 font-semibold">
                      {horses.find((h: any) => h.id === preselectedHorseId)?.barnName?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-amber-900">
                      Adding event for {horses.find((h: any) => h.id === preselectedHorseId)?.barnName || 'Selected Horse'}
                    </p>
                    <p className="text-xs text-amber-700">Horse will be automatically selected</p>
                  </div>
                </div>
              )}

              {modalStep === 1 ? (
                // Step 1: Event Details
                <>
              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Event Type</label>
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
                            : 'border-border hover:border-border'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-amber-600' : 'text-muted-foreground'}`} />
                        <span className={`text-xs font-medium ${isSelected ? 'text-amber-600' : 'text-muted-foreground'}`}>
                          {type.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Title *</label>
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
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Date *</label>
                  <input
                    type="date"
                    value={eventForm.scheduledDate}
                    onChange={(e) => setEventForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Time</label>
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
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Provider Name</label>
                    <input
                      type="text"
                      value={eventForm.providerName}
                      onChange={(e) => setEventForm(prev => ({ ...prev, providerName: e.target.value }))}
                      className="input w-full"
                      placeholder="Dr. Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Provider Phone</label>
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
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Location</label>
                  <input
                    type="text"
                    value={eventForm.providerName}
                    onChange={(e) => setEventForm(prev => ({ ...prev, providerName: e.target.value }))}
                    className="input w-full"
                    placeholder="Competition venue"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
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
                  <div className="bg-background rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Event Summary</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><span className="font-medium">Title:</span> {eventForm.title}</p>
                      <p><span className="font-medium">Date:</span> {eventForm.scheduledDate} at {eventForm.scheduledTime}</p>
                      {eventForm.providerName && (
                        <p><span className="font-medium">Provider:</span> {eventForm.providerName}</p>
                      )}
                    </div>
                  </div>

                  {/* Horses Selection */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Select Horses
                    </label>
                    <div className="border border-border rounded-lg p-3 max-h-64 overflow-y-auto space-y-2">
                      <label className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer">
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
                        <span className="text-sm font-medium text-muted-foreground">All horses / Barn-wide</span>
                      </label>
                      {horses.map((horse: any) => (
                        <label key={horse.id} className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer">
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
                          <span className="text-sm text-muted-foreground">{horse.barnName}</span>
                        </label>
                      ))}
                    </div>
                    {eventForm.horseIds.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {eventForm.horseIds.length} horse{eventForm.horseIds.length > 1 ? 's' : ''} selected
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-border flex gap-3">
              {modalStep === 1 ? (
                <>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setModalStep(1);
                      setPreselectedHorseId(null);
                      if (typeof window !== 'undefined') {
                        window.history.replaceState({}, '', '/calendar');
                      }
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

      {/* Calendar Settings Modal */}
      {showCalendarSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-card w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-xl sm:m-4 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold">Calendar Sync</h3>
              <button
                onClick={() => setShowCalendarSettings(false)}
                className="p-1 rounded hover:bg-accent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* iCal Export */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-amber-500" />
                  Subscribe to Calendar (iCal)
                </h4>
                <p className="text-sm text-muted-foreground">
                  Add this URL to Apple Calendar, Google Calendar, Outlook, or any calendar app that supports iCal feeds.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getICalUrl()}
                    className="input flex-1 text-sm bg-background"
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
              <div className="space-y-3 pt-4 border-t border-border">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M22 12C22 6.48 17.52 2 12 2S2 6.48 2 12s4.48 10 10 10c1.85 0 3.58-.5 5.07-1.38" stroke="#4285F4" strokeWidth="2"/>
                    <path d="M12 6v6l4 2" stroke="#EA4335" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Google Calendar
                </h4>
                
                {googleStatus ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${googleStatus.connected ? 'bg-green-500' : 'bg-border'}`} />
                      <span className="text-sm text-muted-foreground">
                        {googleStatus.connected ? 'Connected' : 'Not connected'}
                      </span>
                    </div>
                    
                    {googleStatus.lastSync && (
                      <p className="text-xs text-muted-foreground">
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
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </div>
                )}
              </div>

              {/* Sync Options */}
              {googleStatus?.connected && (
                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="font-medium text-foreground">Sync Options</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={googleStatus.syncSettings?.events ?? true}
                        onChange={() => {}}
                        className="rounded border-border"
                      />
                      <span className="text-sm text-muted-foreground">Sync Events (vet, farrier, etc.)</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={googleStatus.syncSettings?.lessons ?? true}
                        onChange={() => {}}
                        className="rounded border-border"
                      />
                      <span className="text-sm text-muted-foreground">Sync Lessons</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={googleStatus.syncSettings?.tasks ?? false}
                        onChange={() => {}}
                        className="rounded border-border"
                      />
                      <span className="text-sm text-muted-foreground">Sync Tasks (as all-day events)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border">
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

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="bg-card w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto sm:m-4">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit Event</h3>
              <button
                onClick={() => setEditingEvent(null)}
                className="p-1 rounded hover:bg-accent"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Event Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {eventTypes.map((type) => {
                    const TypeIcon = type.icon;
                    const isSelected = editForm.type === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setEditForm(prev => ({ ...prev, type: type.id }))}
                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-border hover:border-border'
                        }`}
                      >
                        <TypeIcon className={`w-5 h-5 ${isSelected ? 'text-amber-600' : 'text-muted-foreground'}`} />
                        <span className={`text-xs font-medium ${isSelected ? 'text-amber-600' : 'text-muted-foreground'}`}>
                          {type.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Title *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="input w-full"
                  placeholder="Event title"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Date *</label>
                  <input
                    type="date"
                    value={editForm.scheduledDate}
                    onChange={(e) => setEditForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Time</label>
                  <input
                    type="time"
                    value={editForm.scheduledTime}
                    onChange={(e) => setEditForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    className="input w-full"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input w-full"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-border flex gap-3">
              <button
                onClick={() => {
                  setDeleteEventId(editingEvent.id);
                  setEditingEvent(null);
                }}
                className="btn-secondary flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <div className="flex-1" />
              <button
                onClick={() => setEditingEvent(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={isEditSubmitting}
                className="btn-primary flex items-center gap-2"
              >
                {isEditSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Event Confirmation */}
      <ConfirmDialog
        open={!!deleteEventId}
        onConfirm={handleDeleteEvent}
        onCancel={() => setDeleteEventId(null)}
        title="Remove Event"
        description={`Are you sure you want to remove "${deleteEventName || 'this event'}"? This action cannot be undone.`}
        confirmLabel="Remove"
        variant="danger"
      />

      {/* Printable Calendar (hidden on screen, visible only when printing) */}
      {showPrintView && currentMonth && (
        <div ref={printRef} className="printable-calendar-wrapper">
          <PrintableCalendar
            month={currentMonth}
            events={events as any}
            barnName={currentBarn?.name}
          />
        </div>
      )}
    </div>
  );
}
