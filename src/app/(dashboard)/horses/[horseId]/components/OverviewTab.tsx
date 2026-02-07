'use client';

import Link from 'next/link';
import { Calendar, Pill, Stethoscope, Printer } from 'lucide-react';
import { useTasks } from '@/hooks/useData';

interface FeedItem {
  id: string;
  feedType?: { name: string };
  supplement?: { name: string };
  customName?: string;
  feedingTime: string;
  amount: number;
  unit: string;
}

interface FeedProgram {
  name?: string;
  items?: FeedItem[];
  instructions?: string;
}

interface OverviewTabProps {
  horse: {
    id: string;
    barnName: string;
    registeredName?: string | null;
    breed?: string | null;
    color?: string | null;
    sex?: string | null;
    age?: number | null;
    stallName?: string | null;
    paddockName?: string | null;
    ownerName?: string | null;
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
    feedProgram?: FeedProgram | null;
  };
  onNavigateToHealth: () => void;
}

export function OverviewTab({ horse, onNavigateToHealth }: OverviewTabProps) {
  const { tasks } = useTasks({ horseId: horse.id });
  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED');

  // Filter events to current month only
  const now = new Date();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const monthEvents = (horse.upcomingEvents || []).filter(e => {
    const d = new Date(e.scheduledDate);
    return d <= monthEnd;
  });

  const handlePrint = () => {
    window.print();
  };

  const feedItems = horse.feedProgram?.items || [];
  const feedName = horse.feedProgram?.name;
  const feedInstructions = horse.feedProgram?.instructions;

  return (
    <>
      {/* Print Care Sheet Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handlePrint}
          className="btn-secondary btn-sm"
        >
          <Printer className="w-4 h-4" />
          Print Care Sheet
        </button>
      </div>

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

      {/* ============================================================ */}
      {/* Printable Care Sheet — hidden on screen, visible on print    */}
      {/* ============================================================ */}
      <div className="printable-horse-sheet-wrapper">
        <div className="printable-horse-sheet">
          {/* Header */}
          <div className="horse-sheet-header">
            <h1 className="horse-sheet-name">{horse.barnName}</h1>
            {horse.registeredName && (
              <p className="horse-sheet-reg">{horse.registeredName}</p>
            )}
            <p className="horse-sheet-meta">
              {[horse.breed, horse.color, horse.sex, horse.age ? `${horse.age}y` : null, horse.stallName ? `Stall: ${horse.stallName}` : null, horse.paddockName ? `Pasture: ${horse.paddockName}` : null]
                .filter(Boolean)
                .join('  •  ')}
            </p>
            <p className="horse-sheet-date">
              Care Sheet — {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="horse-sheet-grid">
            {/* Feeding Plan */}
            <div className="horse-sheet-section">
              <h2 className="horse-sheet-section-title">Feeding Plan</h2>
              {feedItems.length > 0 ? (
                <table className="horse-sheet-table">
                  <thead>
                    <tr>
                      <th className="horse-sheet-th">Feed</th>
                      <th className="horse-sheet-th">Amount</th>
                      <th className="horse-sheet-th">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedItems.map((item) => (
                      <tr key={item.id}>
                        <td className="horse-sheet-td horse-sheet-td-name">
                          {item.feedType?.name || item.supplement?.name || item.customName || '—'}
                        </td>
                        <td className="horse-sheet-td">{item.amount} {item.unit}</td>
                        <td className="horse-sheet-td">{item.feedingTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="horse-sheet-empty">No feed program set up</p>
              )}
              {feedName && <p className="horse-sheet-note">Program: {feedName}</p>}
              {feedInstructions && <p className="horse-sheet-note">Notes: {feedInstructions}</p>}
            </div>

            {/* Medications */}
            <div className="horse-sheet-section">
              <h2 className="horse-sheet-section-title">Active Medications</h2>
              {horse.activeMedications && horse.activeMedications.length > 0 ? (
                <table className="horse-sheet-table">
                  <thead>
                    <tr>
                      <th className="horse-sheet-th">Medication</th>
                      <th className="horse-sheet-th">Dosage</th>
                      <th className="horse-sheet-th">Frequency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horse.activeMedications.map((med) => (
                      <tr key={med.id}>
                        <td className="horse-sheet-td horse-sheet-td-name">{med.name}</td>
                        <td className="horse-sheet-td">{med.dosage}</td>
                        <td className="horse-sheet-td">{med.frequency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="horse-sheet-empty">No active medications</p>
              )}
            </div>
          </div>

          {/* Tasks & Events in a second grid row */}
          <div className="horse-sheet-grid">
            {/* Upcoming Tasks */}
            <div className="horse-sheet-section">
              <h2 className="horse-sheet-section-title">Upcoming Tasks</h2>
              {pendingTasks.length > 0 ? (
                <table className="horse-sheet-table">
                  <thead>
                    <tr>
                      <th className="horse-sheet-th">Task</th>
                      <th className="horse-sheet-th">Priority</th>
                      <th className="horse-sheet-th">Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTasks.slice(0, 8).map((task) => (
                      <tr key={task.id}>
                        <td className="horse-sheet-td horse-sheet-td-name">{task.title}</td>
                        <td className="horse-sheet-td">{task.priority || '—'}</td>
                        <td className="horse-sheet-td">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="horse-sheet-empty">No pending tasks</p>
              )}
            </div>

            {/* Events This Month */}
            <div className="horse-sheet-section">
              <h2 className="horse-sheet-section-title">Events This Month</h2>
              {monthEvents.length > 0 ? (
                <table className="horse-sheet-table">
                  <thead>
                    <tr>
                      <th className="horse-sheet-th">Event</th>
                      <th className="horse-sheet-th">Type</th>
                      <th className="horse-sheet-th">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthEvents.slice(0, 8).map((event) => (
                      <tr key={event.id}>
                        <td className="horse-sheet-td horse-sheet-td-name">{event.title}</td>
                        <td className="horse-sheet-td">{event.type.replace(/_/g, ' ')}</td>
                        <td className="horse-sheet-td">
                          {new Date(event.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="horse-sheet-empty">No events this month</p>
              )}
            </div>
          </div>

          {horse.ownerName && (
            <p className="horse-sheet-owner">Owner: {horse.ownerName}</p>
          )}

          <div className="horse-sheet-footer">
            Printed from StableTrack — {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </>
  );
}
