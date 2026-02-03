'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  scheduledDate: string;
  type: string;
}

interface EventsTabProps {
  horse: {
    id: string;
    upcomingEvents?: Event[];
  };
  canEdit?: boolean;
}

export function EventsTab({ horse, canEdit = true }: EventsTabProps) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-stone-900">Event History</h3>
        {canEdit && (
          <Link href={`/calendar?horseId=${horse.id}&addEvent=true`} className="btn-primary btn-sm">
            <Plus className="w-4 h-4" />
            Add Event
          </Link>
        )}
      </div>
      {horse.upcomingEvents && horse.upcomingEvents.length > 0 ? (
        <div className="space-y-2">
          {horse.upcomingEvents.map((event) => (
            <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50">
              <div className="flex-1">
                <p className="font-medium text-stone-900">{event.title}</p>
                <p className="text-sm text-stone-500">
                  {new Date(event.scheduledDate).toLocaleDateString()}
                </p>
              </div>
              <span className="badge-info">{event.type}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-stone-500 text-sm">No events scheduled</p>
      )}
    </div>
  );
}
