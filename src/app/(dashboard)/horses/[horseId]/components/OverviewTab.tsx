'use client';

import Link from 'next/link';
import { Calendar, Pill, Stethoscope } from 'lucide-react';

interface OverviewTabProps {
  horse: {
    id: string;
    activeMedications?: Array<{
      id: string;
      name: string;
      dosage: string;
      frequency: string;
    }>;
    upcomingEvents?: Array<{
      id: string;
      title: string;
      scheduledDate: string;
      type: string;
    }>;
    recentHealthRecords?: Array<{
      id: string;
      type: string;
      date: string;
    }>;
  };
  onNavigateToHealth: () => void;
}

export function OverviewTab({ horse, onNavigateToHealth }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Active Medications */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Pill className="w-4 h-4 text-purple-500" />
            Active Medications
          </h3>
          <Link href={`/horses/${horse.id}/medications/new`} className="text-sm text-amber-600 hover:text-amber-700">
            + Add
          </Link>
        </div>
        {horse.activeMedications && horse.activeMedications.length > 0 ? (
          <ul className="space-y-2">
            {horse.activeMedications.map((med) => (
              <li key={med.id} className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                <p className="font-medium text-foreground">{med.name}</p>
                <p className="text-sm text-muted-foreground">{med.dosage} • {med.frequency}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm py-4">No active medications</p>
        )}
      </div>

      {/* Upcoming Events */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            Upcoming Events
          </h3>
          <Link href="/calendar" className="text-sm text-amber-600 hover:text-amber-700">
            View All →
          </Link>
        </div>
        {horse.upcomingEvents && horse.upcomingEvents.length > 0 ? (
          <ul className="space-y-2">
            {horse.upcomingEvents.slice(0, 3).map((event) => (
              <li key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-background">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.scheduledDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="badge-info">{event.type}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm py-4">No upcoming events</p>
        )}
      </div>

      {/* Recent Health Records */}
      <div className="card p-5 lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-green-500" />
            Recent Health
          </h3>
          <Link href={`/horses/${horse.id}/health/new`} className="text-sm text-amber-600 hover:text-amber-700">
            + Add
          </Link>
        </div>
        {horse.recentHealthRecords && horse.recentHealthRecords.length > 0 ? (
          <div className="space-y-2">
            {horse.recentHealthRecords.slice(0, 3).map((record) => (
              <button
                key={record.id}
                onClick={onNavigateToHealth}
                className="w-full p-3 rounded-xl bg-background hover:bg-accent transition-colors text-left"
              >
                <p className="font-medium text-foreground">{record.type.replace(/_/g, ' ')}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(record.date).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm py-4">No health records</p>
        )}
        {horse.recentHealthRecords && horse.recentHealthRecords.length > 3 && (
          <button
            onClick={onNavigateToHealth}
            className="w-full mt-3 text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            View All Health Records →
          </button>
        )}
      </div>
    </div>
  );
}
