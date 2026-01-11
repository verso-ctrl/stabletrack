'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCurrentBarn, useBarn } from '@/contexts/BarnContext';
import { useHorses, useEvents, useTasks, useAlerts } from '@/hooks/useData';
import { hasPermission, BarnRole } from '@/types';
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  ArrowUpRight,
  Activity,
  Syringe,
  FileText,
  Heart,
  DollarSign,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

const HorseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12c0-4-3-8-8-8-3 0-5.5 1.5-7 3.5L3 10l1 3-2 4 3 1 2-1 2 3h4l1-2 2 1 4-3c1-1 2-2.5 2-4z"/>
    <circle cx="18" cy="9" r="1"/>
  </svg>
);

export default function DashboardPage() {
  const { barn, isLoading: barnLoading } = useCurrentBarn();
  const { isClient, currentBarn } = useBarn();
  const { horses } = useHorses();
  const { events } = useEvents({ status: 'SCHEDULED' });
  const { tasks } = useTasks({ status: 'PENDING' });
  const { alerts } = useAlerts();
  const [healthAlerts, setHealthAlerts] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState('Welcome');
  const [dateString, setDateString] = useState('');
  const [today, setToday] = useState<Date | null>(null);
  
  // Client-specific state
  const [clientData, setClientData] = useState<any>(null);
  const [clientLoading, setClientLoading] = useState(false);

  // Handle client-only date/time to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    const now = new Date();
    const hour = now.getHours();
    setGreeting(hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening');
    setDateString(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
    setToday(now);
  }, []);

  // Fetch dashboard data in parallel for better performance
  useEffect(() => {
    if (!barn?.id) return;

    const fetchDashboardData = async () => {
      setClientLoading(true);

      try {
        const promises = [
          !isClient
            ? fetch(`/api/barns/${barn.id}/health-alerts`).then(r => r.json())
            : Promise.resolve(null),
          isClient && currentBarn?.clientId
            ? fetch(`/api/barns/${currentBarn.id}/clients/${currentBarn.clientId}/dashboard`).then(r => r.json())
            : Promise.resolve(null)
        ];

        const [healthData, clientData] = await Promise.all(promises);

        if (healthData) {
          setHealthAlerts(healthData.data || []);
        }
        if (clientData) {
          setClientData(clientData.data);
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        setHealthAlerts([]);
      } finally {
        setClientLoading(false);
      }
    };

    fetchDashboardData();
  }, [barn?.id, isClient, currentBarn?.id, currentBarn?.clientId]);

  if (barnLoading || (isClient && clientLoading)) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 skeleton" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 skeleton rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!barn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <HorseIcon className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">Welcome to StableTrack</h2>
          <p className="text-stone-500 mb-6">Get started by creating your first barn.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/onboarding/create-barn" className="btn-primary">Create Barn</Link>
            <Link href="/onboarding/join-barn" className="btn-secondary">Join Existing</Link>
          </div>
        </div>
      </div>
    );
  }

  // CLIENT VIEW DASHBOARD
  if (isClient) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">{greeting}</h1>
            <p className="text-stone-500 mt-0.5">
              {dateString || 'Loading...'} · {barn.name}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            <span>Client Portal</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">Your Horses</p>
                <p className="text-3xl font-semibold text-stone-900 mt-1">{clientData?.horses?.length || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <HorseIcon className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">Upcoming Events</p>
                <p className="text-3xl font-semibold text-stone-900 mt-1">{clientData?.stats?.upcomingEvents || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">Balance Due</p>
                <p className="text-3xl font-semibold text-stone-900 mt-1">
                  ${(clientData?.stats?.balanceDue || 0).toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Balance Alert */}
        {clientData?.stats?.balanceDue > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">Outstanding Balance</p>
                <p className="text-sm text-amber-700">{clientData?.stats?.pendingInvoices || 0} invoice(s) pending</p>
              </div>
            </div>
            <Link href="/billing" className="btn-primary btn-sm">
              View Invoices
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Your Horses */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between p-4 border-b border-stone-100">
              <h2 className="font-semibold text-stone-900">Your Horses</h2>
              <Link href="/horses" className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            {!clientData?.horses || clientData.horses.length === 0 ? (
              <div className="p-8 text-center">
                <HorseIcon className="w-10 h-10 text-stone-200 mx-auto mb-2" />
                <p className="text-stone-500">No horses assigned to you</p>
                <p className="text-sm text-stone-400 mt-1">Contact the barn to add your horses</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {clientData.horses.slice(0, 5).map((horse: any) => (
                  <Link 
                    key={horse.id} 
                    href={`/horses/${horse.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-stone-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {horse.profilePhotoUrl ? (
                        <img src={horse.profilePhotoUrl} alt={horse.barnName} className="w-full h-full object-cover" />
                      ) : (
                        <HorseIcon className="w-6 h-6 text-amber-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-900">{horse.barnName}</p>
                      <p className="text-sm text-stone-500">
                        {horse.breed || 'Unknown breed'}
                        {horse.stallName && ` · Stall ${horse.stallName}`}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-300" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <div className="card">
              <div className="flex items-center justify-between p-4 border-b border-stone-100">
                <h2 className="font-semibold text-stone-900">Upcoming</h2>
                <Link href="/calendar" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                  Calendar
                </Link>
              </div>
              {!clientData?.upcomingEvents || clientData.upcomingEvents.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-stone-400">No upcoming events</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {clientData.upcomingEvents.slice(0, 4).map((event: any) => {
                    const date = new Date(event.scheduledDate);
                    const isToday = today ? date.toDateString() === today.toDateString() : false;
                    
                    return (
                      <div key={event.id} className="p-4">
                        <p className="text-sm font-medium text-stone-900">{event.title}</p>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {event.horseName && `${event.horseName} · `}
                          {isToday ? (
                            <span className="text-amber-600 font-medium">Today</span>
                          ) : (
                            date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Invoices */}
            <div className="card">
              <div className="flex items-center justify-between p-4 border-b border-stone-100">
                <h2 className="font-semibold text-stone-900">Recent Invoices</h2>
                <Link href="/billing" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                  View all
                </Link>
              </div>
              {!clientData?.recentInvoices || clientData.recentInvoices.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-stone-400">No invoices yet</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {clientData.recentInvoices.slice(0, 3).map((invoice: any) => (
                    <div key={invoice.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-stone-900">#{invoice.invoiceNumber}</p>
                        <p className="text-xs text-stone-500">
                          {new Date(invoice.issueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-stone-900">${invoice.total.toFixed(2)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          invoice.status === 'PAID' ? 'bg-green-100 text-green-700' :
                          invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Barn */}
            <div className="card p-4">
              <h2 className="font-semibold text-stone-900 mb-3">Contact {barn.name}</h2>
              <div className="space-y-2">
                {barn.phone && (
                  <a href={`tel:${barn.phone}`} className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900">
                    <Phone className="w-4 h-4" />
                    {barn.phone}
                  </a>
                )}
                {barn.email && (
                  <a href={`mailto:${barn.email}`} className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900">
                    <Mail className="w-4 h-4" />
                    {barn.email}
                  </a>
                )}
                {barn.city && barn.state && (
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <MapPin className="w-4 h-4" />
                    {barn.city}, {barn.state}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // REGULAR MEMBER DASHBOARD
  const activeHorses = horses.filter(h => h.status === 'ACTIVE').length;
  const layupHorses = horses.filter(h => h.status === 'LAYUP').length;
  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED').length;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const urgentAlerts = alerts.filter(a => a.type === 'urgent');
  
  // Check if user has permission to add horses
  const userRole = (currentBarn?.role || 'CARETAKER') as BarnRole;
  const canAddHorse = hasPermission(userRole, 'horses:write');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">{greeting}</h1>
          <p className="text-stone-500 mt-0.5">
            {dateString || 'Loading...'} · {barn.name}
          </p>
        </div>
        {canAddHorse && (
          <Link href="/horses/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            Add Horse
          </Link>
        )}
      </div>

      {/* Alert Banner */}
      {urgentAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-red-800">Attention Required</p>
              <ul className="mt-1 space-y-1">
                {urgentAlerts.slice(0, 2).map((alert, i) => (
                  <li key={i} className="text-sm text-red-700">{alert.message}</li>
                ))}
              </ul>
            </div>
            <Link href="/alerts" className="text-sm font-medium text-red-600 hover:text-red-700">
              View all →
            </Link>
          </div>
        </div>
      )}

      {/* Health Alerts */}
      {healthAlerts.length > 0 && (
        <div className={`border rounded-lg p-4 ${healthAlerts.some(a => a.hasCritical) ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}`}>
          <div className="flex items-start gap-3">
            <Heart className={`w-5 h-5 flex-shrink-0 mt-0.5 ${healthAlerts.some(a => a.hasCritical) ? 'text-red-500' : 'text-orange-500'}`} />
            <div className="flex-1">
              <p className={`font-medium ${healthAlerts.some(a => a.hasCritical) ? 'text-red-800' : 'text-orange-800'}`}>
                {healthAlerts.some(a => a.hasCritical) ? 'Horse Health Alert' : 'Health Concerns'}
              </p>
              <div className="mt-2 space-y-2">
                {healthAlerts.slice(0, 3).map((alert, i) => (
                  <Link 
                    key={i} 
                    href={`/horses/${alert.horse.id}`}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      healthAlerts.some(a => a.hasCritical) ? 'bg-red-100/50 hover:bg-red-100' : 'bg-orange-100/50 hover:bg-orange-100'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                      {alert.horse.profilePhotoUrl ? (
                        <img src={alert.horse.profilePhotoUrl} alt={alert.horse.barnName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-medium text-stone-600">
                          {alert.horse.barnName?.charAt(0) || '?'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${healthAlerts.some(a => a.hasCritical) ? 'text-red-900' : 'text-orange-900'}`}>
                        {alert.horse.barnName}
                      </p>
                      <p className={`text-xs ${healthAlerts.some(a => a.hasCritical) ? 'text-red-700' : 'text-orange-700'}`}>
                        {alert.concerns.map((c: any) => c.message).join(' · ')}
                      </p>
                    </div>
                    {alert.hasCritical && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                        Critical
                      </span>
                    )}
                  </Link>
                ))}
              </div>
              {healthAlerts.length > 3 && (
                <p className={`text-xs mt-2 ${healthAlerts.some(a => a.hasCritical) ? 'text-red-600' : 'text-orange-600'}`}>
                  +{healthAlerts.length - 3} more horses with concerns
                </p>
              )}
            </div>
            <Link href="/log/daily-check" className={`text-sm font-medium ${healthAlerts.some(a => a.hasCritical) ? 'text-red-600 hover:text-red-700' : 'text-orange-600 hover:text-orange-700'}`}>
              Log check →
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500">Active Horses</p>
              <p className="text-3xl font-semibold text-stone-900 mt-1">{activeHorses}</p>
              {layupHorses > 0 && (
                <p className="text-xs text-amber-600 mt-1">{layupHorses} on layup</p>
              )}
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <HorseIcon className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>

        <Link href="/calendar" className="stat-card hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500">Upcoming Events</p>
              <p className="text-3xl font-semibold text-stone-900 mt-1">{events.length}</p>
              <p className="text-xs text-stone-400 mt-1">This week</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Link>

        <Link href="/tasks" className="stat-card hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500">Pending Tasks</p>
              <p className="text-3xl font-semibold text-stone-900 mt-1">{pendingTasks}</p>
              {completedTasks > 0 && (
                <p className="text-xs text-emerald-600 mt-1">{completedTasks} completed today</p>
              )}
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </Link>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500">Alerts</p>
              <p className="text-3xl font-semibold text-stone-900 mt-1">{alerts.length}</p>
              {urgentAlerts.length > 0 && (
                <p className="text-xs text-red-600 mt-1">{urgentAlerts.length} urgent</p>
              )}
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between p-4 border-b border-stone-100">
            <h2 className="font-semibold text-stone-900">Today's Tasks</h2>
            <Link href="/tasks" className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {tasks.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-stone-200 mx-auto mb-2" />
              <p className="text-stone-500">No tasks for today</p>
              <p className="text-sm text-stone-400 mt-1">All caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-4 hover:bg-stone-50 transition-colors">
                  {task.status === 'COMPLETED' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-stone-300 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${task.status === 'COMPLETED' ? 'text-stone-400 line-through' : 'text-stone-900'}`}>
                      {task.title}
                    </p>
                  </div>
                  {task.dueTime && (
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {task.dueTime}
                    </span>
                  )}
                  {task.priority === 'URGENT' && (
                    <span className="badge-danger">Urgent</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card p-4">
            <h2 className="font-semibold text-stone-900 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/log/daily-check" className="flex items-center gap-2 p-3 rounded-lg bg-stone-50 hover:bg-stone-100 transition-colors">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-stone-700">Health Check</span>
              </Link>
              <Link href="/calendar" className="flex items-center gap-2 p-3 rounded-lg bg-stone-50 hover:bg-stone-100 transition-colors">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-stone-700">Add Event</span>
              </Link>
              <Link href="/log/medication" className="flex items-center gap-2 p-3 rounded-lg bg-stone-50 hover:bg-stone-100 transition-colors">
                <Syringe className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-stone-700">Log Meds</span>
              </Link>
              <Link href="/documents" className="flex items-center gap-2 p-3 rounded-lg bg-stone-50 hover:bg-stone-100 transition-colors">
                <FileText className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-stone-700">Documents</span>
              </Link>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="card">
            <div className="flex items-center justify-between p-4 border-b border-stone-100">
              <h2 className="font-semibold text-stone-900">Upcoming</h2>
              <Link href="/calendar" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                Calendar
              </Link>
            </div>
            {events.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-stone-400">No upcoming events</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {events.slice(0, 4).map((event) => {
                  const date = new Date(event.scheduledDate);
                  const isToday = today ? date.toDateString() === today.toDateString() : false;
                  const isTomorrow = today ? date.toDateString() === new Date(today.getTime() + 86400000).toDateString() : false;
                  
                  return (
                    <div key={event.id} className="p-4 hover:bg-stone-50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-stone-900">{event.title}</p>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {event.horse?.barnName && `${event.horse.barnName} · `}
                            {isToday ? (
                              <span className="text-amber-600 font-medium">Today</span>
                            ) : isTomorrow ? (
                              <span className="text-blue-600">Tomorrow</span>
                            ) : (
                              date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            )}
                          </p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-stone-300 flex-shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Horses Preview */}
          <div className="card">
            <div className="flex items-center justify-between p-4 border-b border-stone-100">
              <h2 className="font-semibold text-stone-900">Horses</h2>
              <Link href="/horses" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                View all
              </Link>
            </div>
            {horses.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-stone-400 mb-3">No horses yet</p>
                <Link href="/horses/new" className="btn-secondary btn-sm">Add Horse</Link>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {horses.slice(0, 4).map((horse) => (
                  <Link key={horse.id} href={`/horses/${horse.id}`} className="flex items-center gap-3 p-4 hover:bg-stone-50 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden">
                      {horse.profilePhotoUrl ? (
                        <img src={horse.profilePhotoUrl} alt={horse.barnName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-amber-700 font-medium text-sm">
                          {horse.barnName?.charAt(0) || '?'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900">{horse.barnName}</p>
                      <p className="text-xs text-stone-500">{horse.breed || 'Unknown breed'}</p>
                    </div>
                    {horse.status === 'LAYUP' && (
                      <span className="badge-warning">Layup</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
