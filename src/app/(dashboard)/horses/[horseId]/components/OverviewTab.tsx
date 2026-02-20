'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, ClipboardCheck, Loader2, Pill, Stethoscope, Printer, Pencil, Trash2 } from 'lucide-react';
import { useTasks } from '@/hooks/useData';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { toast } from '@/lib/toast';

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

interface MedicationData {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route?: string | null;
  instructions?: string | null;
  status?: string;
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
    activeMedications?: MedicationData[];
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
  barnId?: string;
  onNavigateToHealth: () => void;
  onRefresh?: () => void;
}

interface EditFormData {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  instructions: string;
  status: string;
}

export function OverviewTab({ horse, barnId, onNavigateToHealth, onRefresh }: OverviewTabProps) {
  const router = useRouter();
  const { tasks } = useTasks({ horseId: horse.id });
  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED');

  const [editingMed, setEditingMed] = useState<MedicationData | null>(null);
  const [deleteMedId, setDeleteMedId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({
    name: '',
    dosage: '',
    frequency: '',
    route: '',
    instructions: '',
    status: 'ACTIVE',
  });
  const [saving, setSaving] = useState(false);
  const [loggingMed, setLoggingMed] = useState<MedicationData | null>(null);
  const [logForm, setLogForm] = useState({ skipped: false, notes: '' });

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

  const openEdit = (med: MedicationData) => {
    setEditForm({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      route: med.route || '',
      instructions: med.instructions || '',
      status: med.status || 'ACTIVE',
    });
    setEditingMed(med);
  };

  const handleEditSave = async () => {
    if (!editingMed || !barnId) return;
    if (!editForm.name.trim() || !editForm.dosage.trim()) {
      toast.error('Validation Error', 'Name and dosage are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        `/api/barns/${barnId}/horses/${horse.id}/medications/${editingMed.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editForm.name.trim(),
            dosage: editForm.dosage.trim(),
            frequency: editForm.frequency.trim(),
            route: editForm.route.trim() || null,
            instructions: editForm.instructions.trim() || null,
            status: editForm.status,
          }),
        }
      );
      if (!res.ok) throw new Error('Failed to update medication');
      toast.success('Medication Updated', `${editForm.name} has been updated.`);
      setEditingMed(null);
      onRefresh?.();
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Failed to update medication');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteMedId || !barnId) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/barns/${barnId}/horses/${horse.id}/medications/${deleteMedId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to delete medication');
      toast.success('Medication Removed', 'The medication has been removed.');
      setDeleteMedId(null);
      onRefresh?.();
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Failed to delete medication');
    } finally {
      setSaving(false);
    }
  };

  const handleLogDose = async () => {
    if (!loggingMed || !barnId) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/barns/${barnId}/horses/${horse.id}/medications/${loggingMed.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'log',
            skipped: logForm.skipped,
            skipReason: logForm.skipped ? logForm.notes || undefined : undefined,
            notes: !logForm.skipped ? logForm.notes || undefined : undefined,
          }),
        }
      );
      if (!res.ok) throw new Error('Failed to log dose');
      toast.success(
        logForm.skipped ? 'Dose Skipped' : 'Dose Logged',
        `${loggingMed.name} ${logForm.skipped ? 'marked as skipped' : 'logged as given'}`
      );
      setLoggingMed(null);
      setLogForm({ skipped: false, notes: '' });
      onRefresh?.();
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Failed to log dose');
    } finally {
      setSaving(false);
    }
  };

  const deleteMedName = horse.activeMedications?.find(m => m.id === deleteMedId)?.name;

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
                <li key={med.id} className="group relative p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50">
                  <p className="font-medium text-foreground pr-14">{med.name}</p>
                  <p className="text-sm text-muted-foreground">{med.dosage} • {med.frequency}</p>
                  {barnId && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 max-sm:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setLoggingMed(med); setLogForm({ skipped: false, notes: '' }); }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/50 transition-colors"
                        aria-label={`Log dose for ${med.name}`}
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEdit(med)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                        aria-label={`Edit ${med.name}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteMedId(med.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                        aria-label={`Delete ${med.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
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
                <li
                  key={event.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-background hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => router.push(`/calendar?date=${new Date(event.scheduledDate).toISOString().split('T')[0]}`)}
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="badge-info">{event.type.replace(/_/g, ' ')}</span>
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

      {/* Edit Medication Modal */}
      <Dialog open={!!editingMed} onOpenChange={(open) => { if (!open) setEditingMed(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Medication</DialogTitle>
            <DialogDescription>Update the medication details below.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => { e.preventDefault(); handleEditSave(); }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="med-name" className="block text-sm font-medium text-foreground mb-1">Name *</label>
              <input
                id="med-name"
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                className="input w-full"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="med-dosage" className="block text-sm font-medium text-foreground mb-1">Dosage *</label>
                <input
                  id="med-dosage"
                  type="text"
                  value={editForm.dosage}
                  onChange={(e) => setEditForm(f => ({ ...f, dosage: e.target.value }))}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label htmlFor="med-frequency" className="block text-sm font-medium text-foreground mb-1">Frequency</label>
                <input
                  id="med-frequency"
                  type="text"
                  value={editForm.frequency}
                  onChange={(e) => setEditForm(f => ({ ...f, frequency: e.target.value }))}
                  className="input w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="med-route" className="block text-sm font-medium text-foreground mb-1">Route</label>
                <input
                  id="med-route"
                  type="text"
                  value={editForm.route}
                  onChange={(e) => setEditForm(f => ({ ...f, route: e.target.value }))}
                  className="input w-full"
                  placeholder="e.g. Oral, IV, IM"
                />
              </div>
              <div>
                <label htmlFor="med-status" className="block text-sm font-medium text-foreground mb-1">Status</label>
                <select
                  id="med-status"
                  value={editForm.status}
                  onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value }))}
                  className="input w-full"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="DISCONTINUED">Discontinued</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="med-instructions" className="block text-sm font-medium text-foreground mb-1">Instructions</label>
              <textarea
                id="med-instructions"
                value={editForm.instructions}
                onChange={(e) => setEditForm(f => ({ ...f, instructions: e.target.value }))}
                className="input w-full"
                rows={2}
                placeholder="Special instructions..."
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setEditingMed(null)}
                className="btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary btn-sm"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteMedId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteMedId(null)}
        title="Remove Medication"
        description={`Are you sure you want to remove "${deleteMedName || 'this medication'}"? This action cannot be undone.`}
        confirmLabel="Remove"
        variant="danger"
      />

      {/* Log Dose Modal */}
      <Dialog open={!!loggingMed} onOpenChange={(open) => { if (!open) { setLoggingMed(null); setLogForm({ skipped: false, notes: '' }); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Dose</DialogTitle>
            <DialogDescription>
              Record that {loggingMed?.name} was given or skipped.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                onClick={() => setLogForm(f => ({ ...f, skipped: false }))}
                className={`flex-1 p-3 rounded-xl text-sm font-medium transition-all border ${
                  !logForm.skipped
                    ? 'bg-green-50 dark:bg-green-950/30 border-green-300 text-green-700'
                    : 'bg-background border-border text-muted-foreground hover:border-green-200'
                }`}
              >
                Given
              </button>
              <button
                onClick={() => setLogForm(f => ({ ...f, skipped: true }))}
                className={`flex-1 p-3 rounded-xl text-sm font-medium transition-all border ${
                  logForm.skipped
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 text-amber-700'
                    : 'bg-background border-border text-muted-foreground hover:border-amber-200'
                }`}
              >
                Skipped
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {logForm.skipped ? 'Reason for skipping' : 'Notes (optional)'}
              </label>
              <textarea
                value={logForm.notes}
                onChange={(e) => setLogForm(f => ({ ...f, notes: e.target.value }))}
                className="input w-full"
                rows={2}
                placeholder={logForm.skipped ? 'Why was this dose skipped?' : 'Any notes about this dose...'}
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => { setLoggingMed(null); setLogForm({ skipped: false, notes: '' }); }}
                className="btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleLogDose}
                disabled={saving}
                className="btn-primary btn-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : logForm.skipped ? 'Log as Skipped' : 'Log as Given'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
            Printed from BarnKeep — {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </>
  );
}
