'use client';

import { useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  parseISO,
} from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  scheduledDate: string;
  type: string;
  status?: string;
  providerName?: string;
  notes?: string;
  horse?: { barnName: string } | null;
  horses?: { horse: { barnName: string } }[];
}

interface PrintableCalendarProps {
  month: Date;
  events: CalendarEvent[];
  barnName?: string;
}

const typeLabels: Record<string, string> = {
  VET_APPOINTMENT: 'Vet',
  FARRIER: 'Farrier',
  VACCINATION: 'Vaccination',
  DENTAL: 'Dental',
  DEWORMING: 'Deworming',
  SHOW: 'Show',
  TRAINING: 'Training',
  TRANSPORT: 'Transport',
  BREEDING: 'Breeding',
  OTHER: 'Other',
};

export function PrintableCalendar({ month, events, barnName }: PrintableCalendarProps) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);

  // Filter to only events in this month, sorted by date
  const monthEvents = useMemo(() => {
    return events
      .filter((event) => {
        const d = new Date(event.scheduledDate);
        return d >= monthStart && d <= monthEnd;
      })
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }, [events, monthStart, monthEnd]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: { date: Date; events: CalendarEvent[] }[] = [];
    let currentKey = '';
    let currentGroup: CalendarEvent[] = [];

    monthEvents.forEach((event) => {
      const dateKey = format(new Date(event.scheduledDate), 'yyyy-MM-dd');
      if (dateKey !== currentKey) {
        if (currentGroup.length > 0) {
          groups.push({ date: new Date(currentKey), events: currentGroup });
        }
        currentKey = dateKey;
        currentGroup = [event];
      } else {
        currentGroup.push(event);
      }
    });
    if (currentGroup.length > 0 && currentKey) {
      groups.push({ date: new Date(currentKey), events: currentGroup });
    }
    return groups;
  }, [monthEvents]);

  const getHorseNames = (event: CalendarEvent): string => {
    if (event.horses && event.horses.length > 0) {
      return event.horses.map((h) => h.horse.barnName).join(', ');
    }
    if (event.horse) return event.horse.barnName;
    return '';
  };

  const getTime = (event: CalendarEvent): string => {
    try {
      const d = new Date(event.scheduledDate);
      const hours = d.getHours();
      const mins = d.getMinutes();
      if (hours === 0 && mins === 0) return ''; // No time set (midnight = all day)
      return format(d, 'h:mm a');
    } catch {
      return '';
    }
  };

  return (
    <div className="printable-calendar">
      {/* Header */}
      <div className="print-header">
        <h1 className="print-title">{format(month, 'MMMM yyyy')} Schedule</h1>
        {barnName && <p className="print-barn-name">{barnName}</p>}
        <p className="print-barn-name">{monthEvents.length} event{monthEvents.length !== 1 ? 's' : ''} this month</p>
      </div>

      {monthEvents.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px 0', color: '#999', fontSize: '12pt' }}>
          No events scheduled for {format(month, 'MMMM yyyy')}
        </p>
      ) : (
        <table className="print-table" style={{ marginTop: '12px' }}>
          <thead>
            <tr>
              <th className="print-list-header" style={{ width: '18%' }}>Date</th>
              <th className="print-list-header" style={{ width: '10%' }}>Time</th>
              <th className="print-list-header" style={{ width: '10%' }}>Type</th>
              <th className="print-list-header" style={{ width: '30%' }}>Event</th>
              <th className="print-list-header" style={{ width: '17%' }}>Horse(s)</th>
              <th className="print-list-header" style={{ width: '15%' }}>Provider</th>
            </tr>
          </thead>
          <tbody>
            {groupedByDate.map((group) =>
              group.events.map((event, idx) => {
                const time = getTime(event);
                const horses = getHorseNames(event);
                const isFirstInGroup = idx === 0;

                return (
                  <tr key={event.id} className={isFirstInGroup && idx > 0 ? 'print-row-divider' : ''}>
                    <td className="print-list-cell print-list-date">
                      {isFirstInGroup ? (
                        <>
                          <strong>{format(group.date, 'EEE, MMM d')}</strong>
                        </>
                      ) : null}
                    </td>
                    <td className="print-list-cell">{time || '—'}</td>
                    <td className="print-list-cell">
                      <span className="print-type-badge">
                        {typeLabels[event.type] || event.type}
                      </span>
                    </td>
                    <td className="print-list-cell print-list-title">
                      {event.title}
                      {event.notes && (
                        <span className="print-list-notes"> — {event.notes}</span>
                      )}
                    </td>
                    <td className="print-list-cell">{horses || '—'}</td>
                    <td className="print-list-cell">{event.providerName || '—'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}

      {/* Footer */}
      <div className="print-footer">
        <p>Printed from BarnKeep on {format(new Date(), 'MMM d, yyyy')}</p>
      </div>
    </div>
  );
}
