'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  Loader2,
  AlertCircle,
  Calendar,
  Heart,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Syringe,
  FileCheck,
  Activity,
  Scale,
  Download,
  Utensils,
  Droplets,
  Stethoscope,
  Pill,
  Sun,
  RefreshCw,
  X,
} from 'lucide-react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

const HorseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12c0-4-3-8-8-8-3 0-5.5 1.5-7 3.5L3 10l1 3-2 4 3 1 2-1 2 3h4l1-2 2 1 4-3c1-1 2-2.5 2-4z"/>
    <circle cx="18" cy="9" r="1"/>
  </svg>
);

// Types
interface TodayStatus {
  fed: boolean;
  feedingCount: number;
  feedings: Array<{
    time: string;
    feedType: string;
    amount: string;
    notes: string | null;
  }>;
  waterChecked: boolean;
  waterChecks: Array<{
    time: string;
    status: string;
    notes: string | null;
  }>;
  healthChecked: boolean;
  healthCheck: {
    time: string;
    appetite: string | null;
    attitude: string | null;
    manure: string | null;
    overallCondition: string | null;
    notes: string | null;
    temperature: number | null;
    heartRate: number | null;
    respiratoryRate: number | null;
  } | null;
}

interface Horse {
  id: string;
  barnName: string;
  registeredName: string | null;
  breed: string | null;
  color: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  profilePhotoUrl: string | null;
  status: string;
  stall: { name: string } | null;
  todayStatus: TodayStatus;
  weeklyHistory: {
    feedLogs: Array<{ date: string; feedType: string; amount: string }>;
    waterLogs: Array<{ date: string; status: string }>;
    healthChecks: Array<{ date: string; overallCondition: string; notes: string | null }>;
    turnouts: Array<{ date: string; location: string; duration: number }>;
  };
  vaccinations: Array<{
    id: string;
    vaccineName: string;
    dateGiven: string;
    expiryDate: string | null;
    nextDueDate: string | null;
  }>;
  medications: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate: string | null;
  }>;
  currentCoggins: {
    testDate: string;
    expiryDate: string;
    result: string;
  } | null;
  cogginsExpired: boolean;
  healthRecords: Array<{
    id: string;
    type: string;
    date: string;
    title: string;
    notes: string | null;
    provider: string | null;
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    type: string;
    scheduledDate: string;
  }>;
  recentCompletedEvents: Array<{
    id: string;
    title: string;
    type: string;
    completedDate: string;
  }>;
  weightRecords: Array<{
    id: string;
    weight: number;
    date: string;
  }>;
  feedProgram: {
    items: Array<{
      id: string;
      feedType: { name: string } | null;
      supplement: { name: string } | null;
      amount: string;
      unit: string;
      feedingTime: string;
    }>;
  } | null;
  trainingLogs: Array<{
    id: string;
    date: string;
    type: string;
    duration: number;
    notes: string | null;
  }>;
}

interface PortalData {
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  barn: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    logoUrl: string | null;
  };
  horses: Horse[];
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    status: string;
    issueDate: string;
    dueDate: string;
    total: number;
    amountPaid: number;
    balance: number;
    items: Array<{
      id: string;
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    payments: Array<{
      id: string;
      amount: number;
      paymentDate: string;
      method: string;
    }>;
  }>;
  lessons: Array<{
    id: string;
    date: string;
    duration: number;
    type: string;
    notes: string | null;
    horse: { barnName: string } | null;
  }>;
  stats: {
    totalHorses: number;
    horsesCheckedToday: number;
    horsesFedToday: number;
    upcomingEvents: number;
    pendingInvoices: number;
    totalBalance: number;
  };
  lastUpdated: string;
}

export default function ClientPortalPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') ?? null;
  
  const [data, setData] = useState<PortalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'horses' | 'invoices' | 'events'>('overview');
  const [selectedHorse, setSelectedHorse] = useState<Horse | null>(null);

  useEffect(() => {
    if (token) {
      fetchPortalData();
    } else {
      setIsLoading(false);
      setError('Portal token is required');
    }
  }, [token]);

  const fetchPortalData = async (refresh = false) => {
    try {
      if (refresh) setIsRefreshing(true);
      const response = await fetch(`/api/portal?token=${token}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to load portal');
      }
      
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portal');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (date: string) =>
    format(parseISO(date), 'MMM d, yyyy');

  const formatTime = (date: string) =>
    format(parseISO(date), 'h:mm a');

  const formatDateTime = (date: string) =>
    format(parseISO(date), 'MMM d, yyyy h:mm a');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <div className="bg-card rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Access Error</h1>
          <p className="text-muted-foreground mb-6">{error || 'Unable to load portal'}</p>
          <p className="text-sm text-muted-foreground">
            Please contact the barn for a new portal link.
          </p>
        </div>
      </div>
    );
  }

  // Horse Detail Modal
  const HorseDetailModal = ({ horse, onClose }: { horse: Horse; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full my-8">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            {horse.profilePhotoUrl ? (
              <div className="relative w-16 h-16 rounded-full overflow-hidden">
                <Image src={horse.profilePhotoUrl} alt={horse.barnName} fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                <HorseIcon className="w-8 h-8 text-amber-600" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-foreground">{horse.barnName}</h2>
              {horse.registeredName && (
                <p className="text-muted-foreground">{horse.registeredName}</p>
              )}
              <div className="flex gap-2 mt-1">
                {horse.breed && <span className="text-xs bg-muted px-2 py-0.5 rounded">{horse.breed}</span>}
                {horse.stall && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Stall: {horse.stall.name}</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Today's Care Status */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              Today&apos;s Care Status
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className={`p-4 rounded-lg ${horse.todayStatus.fed ? 'bg-green-50 border border-green-200' : 'bg-background border border-border'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Utensils className={`w-4 h-4 ${horse.todayStatus.fed ? 'text-green-600' : 'text-muted-foreground'}`} />
                  <span className="font-medium text-sm">Fed</span>
                </div>
                {horse.todayStatus.fed ? (
                  <p className="text-xs text-green-700">{horse.todayStatus.feedingCount}x today</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Not yet</p>
                )}
              </div>
              <div className={`p-4 rounded-lg ${horse.todayStatus.waterChecked ? 'bg-blue-50 border border-blue-200' : 'bg-background border border-border'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className={`w-4 h-4 ${horse.todayStatus.waterChecked ? 'text-blue-600' : 'text-muted-foreground'}`} />
                  <span className="font-medium text-sm">Water</span>
                </div>
                {horse.todayStatus.waterChecked ? (
                  <p className="text-xs text-blue-700">Checked ✓</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Not checked</p>
                )}
              </div>
              <div className={`p-4 rounded-lg ${horse.todayStatus.healthChecked ? 'bg-purple-50 border border-purple-200' : 'bg-background border border-border'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Stethoscope className={`w-4 h-4 ${horse.todayStatus.healthChecked ? 'text-purple-600' : 'text-muted-foreground'}`} />
                  <span className="font-medium text-sm">Health</span>
                </div>
                {horse.todayStatus.healthChecked ? (
                  <p className="text-xs text-purple-700">Checked ✓</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Not checked</p>
                )}
              </div>
            </div>

            {/* Detailed feeding log */}
            {horse.todayStatus.feedings.length > 0 && (
              <div className="mt-3 bg-green-50 rounded-lg p-3">
                <p className="text-xs font-medium text-green-800 mb-2">Feeding Log</p>
                {horse.todayStatus.feedings.map((feeding, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm py-1">
                    <span className="text-green-700">{feeding.feedType}</span>
                    <span className="text-green-600">{formatTime(feeding.time)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Detailed health check */}
            {horse.todayStatus.healthCheck && (
              <div className="mt-3 bg-purple-50 rounded-lg p-3">
                <p className="text-xs font-medium text-purple-800 mb-2">Health Check Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {horse.todayStatus.healthCheck.appetite && (
                    <div><span className="text-purple-600">Appetite:</span> <span className="text-purple-800">{horse.todayStatus.healthCheck.appetite}</span></div>
                  )}
                  {horse.todayStatus.healthCheck.attitude && (
                    <div><span className="text-purple-600">Attitude:</span> <span className="text-purple-800">{horse.todayStatus.healthCheck.attitude}</span></div>
                  )}
                  {horse.todayStatus.healthCheck.overallCondition && (
                    <div><span className="text-purple-600">Condition:</span> <span className="text-purple-800">{horse.todayStatus.healthCheck.overallCondition}</span></div>
                  )}
                  {horse.todayStatus.healthCheck.temperature && (
                    <div><span className="text-purple-600">Temp:</span> <span className="text-purple-800">{horse.todayStatus.healthCheck.temperature}°F</span></div>
                  )}
                  {horse.todayStatus.healthCheck.heartRate && (
                    <div><span className="text-purple-600">Heart Rate:</span> <span className="text-purple-800">{horse.todayStatus.healthCheck.heartRate} bpm</span></div>
                  )}
                  {horse.todayStatus.healthCheck.respiratoryRate && (
                    <div><span className="text-purple-600">Resp Rate:</span> <span className="text-purple-800">{horse.todayStatus.healthCheck.respiratoryRate}/min</span></div>
                  )}
                  {horse.todayStatus.healthCheck.manure && (
                    <div><span className="text-purple-600">Manure:</span> <span className="text-purple-800">{horse.todayStatus.healthCheck.manure}</span></div>
                  )}
                </div>
                {horse.todayStatus.healthCheck.notes && (
                  <div className="mt-2 p-2 bg-purple-100 rounded text-sm text-purple-800">
                    <strong>Notes:</strong> {horse.todayStatus.healthCheck.notes}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Feed Program */}
          {horse.feedProgram && horse.feedProgram.items.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-green-500" />
                Feed Program
              </h3>
              <div className="bg-background rounded-lg divide-y divide-border">
                {horse.feedProgram.items.map((item) => (
                  <div key={item.id} className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-foreground">
                        {item.feedType?.name || item.supplement?.name || 'Feed'}
                      </p>
                      <p className="text-sm text-muted-foreground">{item.feedingTime}</p>
                    </div>
                    <span className="text-muted-foreground">{item.amount} {item.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Medications */}
          {horse.medications.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-500" />
                Current Medications
              </h3>
              <div className="space-y-2">
                {horse.medications.map((med) => (
                  <div key={med.id} className="bg-blue-50 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-blue-900">{med.name}</p>
                        <p className="text-sm text-blue-700">{med.dosage} - {med.frequency}</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Since {formatDate(med.startDate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vaccinations */}
          {horse.vaccinations.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Syringe className="w-5 h-5 text-amber-500" />
                Vaccinations
              </h3>
              <div className="space-y-2">
                {horse.vaccinations.slice(0, 5).map((vax) => (
                  <div key={vax.id} className="flex justify-between items-center p-3 bg-background rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{vax.vaccineName}</p>
                      <p className="text-sm text-muted-foreground">Given: {formatDate(vax.dateGiven)}</p>
                    </div>
                    {vax.nextDueDate && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        new Date(vax.nextDueDate) < new Date() 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        Due: {formatDate(vax.nextDueDate)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coggins Status */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-green-500" />
              Coggins Status
            </h3>
            {horse.currentCoggins ? (
              <div className={`p-4 rounded-lg ${horse.cogginsExpired ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className={`font-medium ${horse.cogginsExpired ? 'text-red-900' : 'text-green-900'}`}>
                      {horse.cogginsExpired ? 'Expired' : 'Current'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Test: {formatDate(horse.currentCoggins.testDate)} • Expires: {formatDate(horse.currentCoggins.expiryDate)}
                    </p>
                  </div>
                  {horse.cogginsExpired ? (
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">No Coggins on file</p>
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          {horse.upcomingEvents.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Upcoming Events
              </h3>
              <div className="space-y-2">
                {horse.upcomingEvents.map((event) => (
                  <div key={event.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-900">{event.title}</p>
                      <p className="text-sm text-blue-600">{event.type}</p>
                    </div>
                    <span className="text-sm text-blue-700">{formatDate(event.scheduledDate)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Health Records */}
          {horse.healthRecords.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-500" />
                Recent Health Records
              </h3>
              <div className="space-y-2">
                {horse.healthRecords.slice(0, 5).map((record) => (
                  <div key={record.id} className="p-3 bg-background rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-foreground">{record.title}</p>
                        <p className="text-sm text-muted-foreground">{record.type} {record.provider && `• ${record.provider}`}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{formatDate(record.date)}</span>
                    </div>
                    {record.notes && (
                      <p className="mt-2 text-sm text-muted-foreground bg-card p-2 rounded">{record.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weight History */}
          {horse.weightRecords.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Scale className="w-5 h-5 text-muted-foreground" />
                Weight History
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {horse.weightRecords.slice(0, 6).map((record) => (
                  <div key={record.id} className="flex-shrink-0 text-center p-3 bg-background rounded-lg">
                    <p className="text-lg font-bold text-foreground">{record.weight}</p>
                    <p className="text-xs text-muted-foreground">lbs</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(record.date)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Horse Card Component
  const HorseCard = ({ horse }: { horse: Horse }) => (
    <div 
      className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => setSelectedHorse(horse)}
    >
      <div className="p-4">
        <div className="flex items-center gap-4">
          {horse.profilePhotoUrl ? (
            <div className="relative w-14 h-14 rounded-full overflow-hidden">
              <Image src={horse.profilePhotoUrl} alt={horse.barnName} fill className="object-cover" unoptimized />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
              <HorseIcon className="w-7 h-7 text-amber-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{horse.barnName}</h3>
            {horse.breed && <p className="text-sm text-muted-foreground">{horse.breed}</p>}
            {horse.stall && (
              <span className="inline-flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded mt-1">
                Stall: {horse.stall.name}
              </span>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Today's Status Bar */}
        <div className="mt-4 flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
            horse.todayStatus.fed ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
          }`}>
            <Utensils className="w-3 h-3" />
            {horse.todayStatus.fed ? `Fed (${horse.todayStatus.feedingCount}x)` : 'Not fed'}
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
            horse.todayStatus.waterChecked ? 'bg-blue-100 text-blue-700' : 'bg-muted text-muted-foreground'
          }`}>
            <Droplets className="w-3 h-3" />
            {horse.todayStatus.waterChecked ? 'Water ✓' : 'Water'}
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
            horse.todayStatus.healthChecked ? 'bg-purple-100 text-purple-700' : 'bg-muted text-muted-foreground'
          }`}>
            <Stethoscope className="w-3 h-3" />
            {horse.todayStatus.healthChecked ? 'Checked ✓' : 'Health'}
          </div>
        </div>

        {/* Alerts */}
        <div className="mt-3 space-y-1">
          {horse.cogginsExpired && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              <AlertTriangle className="w-3 h-3" />
              Coggins expired
            </div>
          )}
          {horse.upcomingEvents.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              <Calendar className="w-3 h-3" />
              {horse.upcomingEvents.length} upcoming event{horse.upcomingEvents.length > 1 ? 's' : ''}
            </div>
          )}
          {horse.medications.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              <Pill className="w-3 h-3" />
              {horse.medications.length} active medication{horse.medications.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-card shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {data.barn.logoUrl ? (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                  <Image src={data.barn.logoUrl} alt={data.barn.name} fill className="object-cover" unoptimized />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-amber-500 flex items-center justify-center">
                  <HorseIcon className="w-7 h-7 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-foreground">{data.barn.name}</h1>
                <p className="text-sm text-muted-foreground">Welcome, {data.client.firstName}!</p>
              </div>
            </div>
            <button
              onClick={() => fetchPortalData(true)}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent rounded-lg"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 border-b border-border -mb-px">
            {['overview', 'horses', 'invoices', 'events'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-muted-foreground hover:text-muted-foreground'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <HorseIcon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{data.stats.totalHorses}</p>
                    <p className="text-xs text-muted-foreground">Your Horses</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{data.stats.horsesFedToday}</p>
                    <p className="text-xs text-muted-foreground">Fed Today</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{data.stats.horsesCheckedToday}</p>
                    <p className="text-xs text-muted-foreground">Health Checked</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{data.stats.upcomingEvents}</p>
                    <p className="text-xs text-muted-foreground">Upcoming Events</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Balance Alert */}
            {data.stats.totalBalance > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-amber-600" />
                  <div>
                    <p className="font-medium text-amber-900">Outstanding Balance</p>
                    <p className="text-sm text-amber-700">{data.stats.pendingInvoices} invoice(s) pending payment</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-amber-900">{formatCurrency(data.stats.totalBalance)}</p>
              </div>
            )}

            {/* Horses Quick View */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Your Horses</h2>
                <button
                  onClick={() => setActiveTab('horses')}
                  className="text-sm text-amber-600 hover:text-amber-700"
                >
                  View All →
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {data.horses.slice(0, 4).map((horse) => (
                  <HorseCard key={horse.id} horse={horse} />
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">Contact {data.barn.name}</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {data.barn.phone && (
                  <a href={`tel:${data.barn.phone}`} className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-accent">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground">{data.barn.phone}</span>
                  </a>
                )}
                {data.barn.email && (
                  <a href={`mailto:${data.barn.email}`} className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-accent">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">{data.barn.email}</span>
                  </a>
                )}
                {data.barn.address && (
                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground">{data.barn.city}, {data.barn.state}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Horses Tab */}
        {activeTab === 'horses' && (
          <div className="grid md:grid-cols-2 gap-4">
            {data.horses.map((horse) => (
              <HorseCard key={horse.id} horse={horse} />
            ))}
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            {data.invoices.length === 0 ? (
              <div className="bg-card rounded-xl p-8 text-center">
                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No invoices yet</p>
              </div>
            ) : (
              data.invoices.map((invoice) => (
                <div key={invoice.id} className="bg-card rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">#{invoice.invoiceNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          invoice.status === 'PAID' ? 'bg-green-100 text-green-700' :
                          invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Issued: {formatDate(invoice.issueDate)} • Due: {formatDate(invoice.dueDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{formatCurrency(invoice.total)}</p>
                      {invoice.balance > 0 && (
                        <p className="text-sm text-red-600">Balance: {formatCurrency(invoice.balance)}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Invoice Items */}
                  <div className="border-t border-border px-4 py-3 bg-background">
                    {invoice.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex justify-between text-sm py-1">
                        <span className="text-muted-foreground">{item.description}</span>
                        <span className="text-foreground">{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                    {invoice.items.length > 3 && (
                      <p className="text-xs text-muted-foreground mt-1">+{invoice.items.length - 3} more items</p>
                    )}
                  </div>

                  {/* Download PDF Button */}
                  <div className="border-t border-border px-4 py-3 flex justify-end">
                    <a
                      href={`/api/barns/${data.barn.id}/invoices/${invoice.id}/pdf`}
                      target="_blank"
                      className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            {/* Upcoming Events */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Upcoming Events</h2>
              {data.horses.flatMap(h => h.upcomingEvents.map(e => ({ ...e, horseName: h.barnName }))).length === 0 ? (
                <div className="bg-card rounded-xl p-8 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No upcoming events</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.horses.flatMap(h => 
                    h.upcomingEvents.map(e => ({ ...e, horseName: h.barnName }))
                  ).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                  .map((event) => (
                    <div key={event.id} className="bg-card rounded-xl p-4 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{event.title}</p>
                        <p className="text-sm text-muted-foreground">{event.horseName} • {event.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">{formatDate(event.scheduledDate)}</p>
                        <p className="text-sm text-muted-foreground">{formatDistanceToNow(parseISO(event.scheduledDate), { addSuffix: true })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Completed Events */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Recently Completed</h2>
              {data.horses.flatMap(h => h.recentCompletedEvents.map(e => ({ ...e, horseName: h.barnName }))).length === 0 ? (
                <div className="bg-card rounded-xl p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent completed events</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.horses.flatMap(h => 
                    h.recentCompletedEvents.map(e => ({ ...e, horseName: h.barnName }))
                  ).sort((a, b) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime())
                  .slice(0, 10)
                  .map((event) => (
                    <div key={event.id} className="bg-card rounded-xl p-4 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{event.title}</p>
                        <p className="text-sm text-muted-foreground">{event.horseName} • {event.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">{formatDate(event.completedDate)}</p>
                        <p className="text-sm text-green-600">Completed</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>Last updated: {formatDateTime(data.lastUpdated)}</p>
            <p>Powered by BarnKeep</p>
          </div>
        </div>
      </footer>

      {/* Horse Detail Modal */}
      {selectedHorse && (
        <HorseDetailModal horse={selectedHorse} onClose={() => setSelectedHorse(null)} />
      )}
    </div>
  );
}
