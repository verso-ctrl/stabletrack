'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Filter,
  Loader2,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { useEvents } from '@/hooks/useData';
import type { Event, EventType } from '@/types';

interface CalendarViewProps {
  onAddEvent?: () => void;
  onEventClick?: (event: Event) => void;
}

const EVENT_TYPE_COLORS: Record<EventType, { bg: string; text: string; dot: string }> = {
  FARRIER: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
  DEWORMING: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
  VACCINATION: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  VET_APPOINTMENT: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  DENTAL: { bg: 'bg-cyan-100', text: 'text-cyan-800', dot: 'bg-cyan-500' },
  TRAINING: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  SHOW: { bg: 'bg-pink-100', text: 'text-pink-800', dot: 'bg-pink-500' },
  TRANSPORT: { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500' },
  BREEDING: { bg: 'bg-rose-100', text: 'text-rose-800', dot: 'bg-rose-500' },
  OTHER: { bg: 'bg-muted', text: 'text-foreground', dot: 'bg-muted-foreground' },
};

export function CalendarView({ onAddEvent, onEventClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterType, setFilterType] = useState<EventType | 'ALL'>('ALL');
  const [view, setView] = useState<'month' | 'week'>('month');

  // Calculate date range for fetching events
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const { events, isLoading, error } = useEvents({
    startDate: startOfWeek(monthStart),
    endDate: endOfWeek(monthEnd),
  });

  // Filter events
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (filterType === 'ALL') return events;
    return events.filter((e) => e.type === filterType);
  }, [events, filterType]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, Event[]> = {};
    filteredEvents.forEach((event) => {
      const dateKey = format(new Date(event.scheduledDate), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [filteredEvents]);

  // Get days for calendar grid
  const calendarDays = useMemo(() => {
    const start = startOfWeek(monthStart);
    const end = endOfWeek(monthEnd);
    return eachDayOfInterval({ start, end });
  }, [monthStart, monthEnd]);

  // Get events for selected date
  const selectedDateEvents = selectedDate
    ? eventsByDate[format(selectedDate, 'yyyy-MM-dd')] || []
    : [];

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Calendar Grid */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-foreground">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={goToPreviousMonth}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              <button
                onClick={goToToday}
                className="ml-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent rounded-lg transition-colors"
              >
                Today
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as EventType | 'ALL')}
              className="px-3 py-2 rounded-lg border border-border text-sm"
            >
              <option value="ALL">All Events</option>
              {Object.keys(EVENT_TYPE_COLORS).map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>

            {/* Add Event */}
            {onAddEvent && (
              <button onClick={onAddEvent} className="btn-primary">
                <Plus className="w-4 h-4" />
                Add Event
              </button>
            )}
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="py-3 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayEvents = eventsByDate[dateKey] || [];
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isDayToday = isToday(day);

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    min-h-[100px] p-2 border-b border-r border-border text-left
                    transition-colors hover:bg-accent
                    ${!isCurrentMonth ? 'bg-background/50' : ''}
                    ${isSelected ? 'bg-stable-50 ring-2 ring-inset ring-stable-500' : ''}
                  `}
                >
                  <span
                    className={`
                      inline-flex items-center justify-center w-7 h-7 rounded-full text-sm
                      ${isDayToday ? 'bg-primary text-primary-foreground font-medium' : ''}
                      ${!isCurrentMonth ? 'text-muted-foreground' : 'text-foreground'}
                    `}
                  >
                    {format(day, 'd')}
                  </span>

                  {/* Event dots */}
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 3).map((event) => {
                      const colors = EVENT_TYPE_COLORS[event.type] || EVENT_TYPE_COLORS.OTHER;
                      return (
                        <div
                          key={event.id}
                          className={`
                            text-xs px-1.5 py-0.5 rounded truncate
                            ${colors.bg} ${colors.text}
                          `}
                        >
                          {event.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground px-1.5">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Date Events Panel */}
      <div className="w-full lg:w-80">
        <div className="bg-card rounded-2xl border border-border p-4 sticky top-6">
          <h3 className="font-semibold text-foreground mb-4">
            {selectedDate
              ? format(selectedDate, 'EEEE, MMMM d')
              : 'Select a date'}
          </h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : selectedDateEvents.length > 0 ? (
            <div className="space-y-3">
              {selectedDateEvents.map((event) => {
                const colors = EVENT_TYPE_COLORS[event.type] || EVENT_TYPE_COLORS.OTHER;
                return (
                  <button
                    key={event.id}
                    onClick={() => onEventClick?.(event)}
                    className="w-full text-left p-3 rounded-xl hover:bg-accent transition-colors border border-border"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${colors.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {event.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {event.type.replace(/_/g, ' ')}
                        </p>
                        {event.horse && (
                          <p className="text-sm text-muted-foreground mt-1">
                            🐴 {event.horse.barnName}
                          </p>
                        )}
                        {event.providerName && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Provider: {event.providerName}
                          </p>
                        )}
                      </div>
                      <span
                        className={`
                          text-xs px-2 py-0.5 rounded-full
                          ${event.status === 'SCHEDULED'
                            ? 'bg-blue-100 text-blue-800'
                            : event.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-muted text-muted-foreground'
                          }
                        `}
                      >
                        {event.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                {selectedDate ? 'No events scheduled' : 'Click a date to view events'}
              </p>
            </div>
          )}

          {selectedDate && onAddEvent && (
            <button
              onClick={onAddEvent}
              className="w-full mt-4 py-2 px-4 text-sm font-medium text-stable-600 hover:bg-stable-50 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Event on {format(selectedDate, 'MMM d')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact event list for dashboard
export function UpcomingEventsList({ limit = 5 }: { limit?: number }) {
  const { events, isLoading } = useEvents({
    status: 'SCHEDULED',
  });

  const upcomingEvents = useMemo(() => {
    if (!events) return [];
    return events
      .filter((e) => new Date(e.scheduledDate) >= new Date())
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
      .slice(0, limit);
  }, [events, limit]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse flex gap-3">
            <div className="w-12 h-12 bg-muted rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (upcomingEvents.length === 0) {
    return (
      <div className="text-center py-6">
        <CalendarIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {upcomingEvents.map((event) => {
        const eventDate = new Date(event.scheduledDate);
        const colors = EVENT_TYPE_COLORS[event.type] || EVENT_TYPE_COLORS.OTHER;
        
        return (
          <div
            key={event.id}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-accent transition-colors"
          >
            <div className="w-12 h-12 rounded-lg bg-muted flex flex-col items-center justify-center text-center">
              <span className="text-xs text-muted-foreground uppercase">
                {format(eventDate, 'MMM')}
              </span>
              <span className="text-lg font-bold text-foreground -mt-1">
                {format(eventDate, 'd')}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {event.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {event.horse?.barnName || event.type.replace(/_/g, ' ')}
              </p>
            </div>
            
            <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
          </div>
        );
      })}
    </div>
  );
}

export default CalendarView;
