'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Calendar,
  Activity,
  FileText,
  Camera,
  MessageSquare,
  MoreVertical,
  Pill,
  Syringe,
  Stethoscope,
  Scale,
  AlertTriangle,
} from 'lucide-react';
import { useHorse } from '@/hooks/useData';
import type { Horse, HorseDetail, HealthRecord, Medication, Event } from '@/types';

interface HorseDetailViewProps {
  horseId: string;
}

type TabId = 'overview' | 'health' | 'care' | 'events' | 'documents' | 'photos' | 'notes';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'health', label: 'Health', icon: Stethoscope },
  { id: 'care', label: 'Care', icon: Calendar },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'photos', label: 'Photos', icon: Camera },
  { id: 'notes', label: 'Notes', icon: MessageSquare },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-100 text-emerald-800';
    case 'LAYUP':
      return 'bg-amber-100 text-amber-800';
    case 'RETIRED':
      return 'bg-muted text-muted-foreground';
    case 'SOLD':
      return 'bg-blue-100 text-blue-800';
    case 'DECEASED':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function formatAge(dateOfBirth: Date | null | undefined): string {
  if (!dateOfBirth) return 'Unknown';
  
  const now = new Date();
  const birth = new Date(dateOfBirth);
  const years = Math.floor((now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  
  if (years === 0) {
    const months = Math.floor((now.getTime() - birth.getTime()) / (30.44 * 24 * 60 * 60 * 1000));
    return `${months} months`;
  }
  
  return `${years} years`;
}

export function HorseDetailView({ horseId }: HorseDetailViewProps) {
  const { horse, isLoading, error } = useHorse(horseId);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="h-64 bg-muted rounded-2xl" />
        <div className="h-96 bg-muted rounded-2xl" />
      </div>
    );
  }

  if (error || !horse) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Horse Not Found
        </h2>
        <p className="text-muted-foreground mb-6">
          {error || "We couldn't find the horse you're looking for."}
        </p>
        <Link href="/horses" className="btn-primary">
          Back to Horses
        </Link>
      </div>
    );
  }

  const horseDetail = horse as HorseDetail;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/horses"
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Profile Photo */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-stable-400 to-stable-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {horse.profilePhotoUrl ? (
                <img
                  src={horse.profilePhotoUrl}
                  alt={horse.barnName}
                  className="w-full h-full object-cover"
                />
              ) : (
                horse.barnName.charAt(0)
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">
                  {horse.barnName}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(horse.status)}`}>
                  {horse.status}
                </span>
              </div>
              
              {horse.registeredName && (
                <p className="text-muted-foreground text-sm mt-0.5">
                  {horse.registeredName}
                </p>
              )}
              
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {horse.breed && <span>{horse.breed}</span>}
                {horse.color && <span>• {horse.color}</span>}
                {horse.sex && <span>• {horse.sex}</span>}
                <span>• {formatAge(horse.dateOfBirth)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link
            href={`/horses/${horseId}/edit`}
            className="btn-secondary"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          
          <button className="p-2 rounded-lg hover:bg-accent transition-colors">
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Scale className="w-4 h-4" />
            Weight
          </div>
          <p className="text-xl font-semibold text-foreground">
            {(horse as any).currentWeight ? `${(horse as any).currentWeight} lbs` : '—'}
          </p>
        </div>
        
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Activity className="w-4 h-4" />
            Height
          </div>
          <p className="text-xl font-semibold text-foreground">
            {horse.heightHands ? `${horse.heightHands} hands` : '—'}
          </p>
        </div>
        
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Pill className="w-4 h-4" />
            Medications
          </div>
          <p className="text-xl font-semibold text-foreground">
            {horseDetail.currentMedications?.length || 0} active
          </p>
        </div>
        
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Calendar className="w-4 h-4" />
            Next Event
          </div>
          <p className="text-xl font-semibold text-foreground">
            {horseDetail.upcomingEvents?.[0]
              ? new Date(horseDetail.upcomingEvents[0].scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : '—'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-1 -mb-px overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-muted-foreground hover:border-border'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-card rounded-2xl border border-border p-6">
        {activeTab === 'overview' && (
          <OverviewTab horse={horseDetail} />
        )}
        {activeTab === 'health' && (
          <HealthTab horse={horseDetail} />
        )}
        {activeTab === 'care' && (
          <CareTab horse={horseDetail} />
        )}
        {activeTab === 'events' && (
          <EventsTab horse={horseDetail} />
        )}
        {activeTab === 'documents' && (
          <DocumentsTab horse={horseDetail} />
        )}
        {activeTab === 'photos' && (
          <PhotosTab horse={horseDetail} />
        )}
        {activeTab === 'notes' && (
          <NotesTab horse={horseDetail} />
        )}
      </div>
    </div>
  );
}

// Tab Components
function OverviewTab({ horse }: { horse: HorseDetail }) {
  return (
    <div className="space-y-6">
      {/* Active Medications Alert */}
      {horse.currentMedications && horse.currentMedications.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
          <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
            <Pill className="w-4 h-4" />
            Active Medications
          </h4>
          <ul className="space-y-2">
            {horse.currentMedications.map((med) => (
              <li key={med.id} className="text-sm text-amber-700">
                <span className="font-medium">{med.name}</span> — {med.dosage}, {med.frequency}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upcoming Events */}
      {horse.upcomingEvents && horse.upcomingEvents.length > 0 && (
        <div>
          <h4 className="font-medium text-foreground mb-3">Upcoming Events</h4>
          <div className="space-y-2">
            {horse.upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 rounded-lg bg-background"
              >
                <div>
                  <p className="font-medium text-foreground">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{event.type}</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(event.scheduledDate).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Basic Info */}
      <div>
        <h4 className="font-medium text-foreground mb-3">Details</h4>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-muted-foreground">Date of Birth</dt>
            <dd className="font-medium text-foreground">
              {horse.dateOfBirth
                ? new Date(horse.dateOfBirth).toLocaleDateString()
                : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Microchip</dt>
            <dd className="font-medium text-foreground">
              {horse.microchipNumber || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Owner</dt>
            <dd className="font-medium text-foreground">
              {horse.ownerName || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Stall</dt>
            <dd className="font-medium text-foreground">
              {(horse as any).stall?.name || '—'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function HealthTab({ horse }: { horse: HorseDetail }) {
  return (
    <div className="space-y-6">
      {/* Vaccinations */}
      <div>
        <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
          <Syringe className="w-4 h-4" />
          Vaccinations
        </h4>
        {horse.vaccinations && horse.vaccinations.length > 0 ? (
          <div className="space-y-2">
            {horse.vaccinations.map((vax) => (
              <div
                key={vax.id}
                className="flex items-center justify-between p-3 rounded-lg bg-background"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {vax.type.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Given: {new Date(vax.dateGiven).toLocaleDateString()}
                  </p>
                </div>
                {vax.nextDueDate && (
                  <span className="text-sm text-muted-foreground">
                    Due: {new Date(vax.nextDueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No vaccination records</p>
        )}
      </div>

      {/* Recent Health Records */}
      <div>
        <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
          <Stethoscope className="w-4 h-4" />
          Recent Health Records
        </h4>
        {horse.recentHealthRecords && horse.recentHealthRecords.length > 0 ? (
          <div className="space-y-2">
            {horse.recentHealthRecords.map((record) => (
              <div
                key={record.id}
                className="p-3 rounded-lg bg-background"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-foreground">
                    {record.type.replace(/_/g, ' ')}
                  </p>
                  <span className="text-sm text-muted-foreground">
                    {new Date(record.date).toLocaleDateString()}
                  </span>
                </div>
                {record.diagnosis && (
                  <p className="text-sm text-muted-foreground">{record.diagnosis}</p>
                )}
                {record.provider && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Provider: {record.provider}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No health records</p>
        )}
      </div>
    </div>
  );
}

function CareTab({ horse }: { horse: HorseDetail }) {
  return (
    <div className="space-y-6">
      {/* Feed Program */}
      <div>
        <h4 className="font-medium text-foreground mb-3">Feed Program</h4>
        {horse.feedProgram ? (
          <div className="p-4 rounded-lg bg-background">
            {horse.feedProgram.name && (
              <p className="font-medium text-foreground mb-2">
                {horse.feedProgram.name}
              </p>
            )}
            {horse.feedProgram.items && horse.feedProgram.items.length > 0 ? (
              <div className="space-y-2">
                {horse.feedProgram.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.feedType?.name || item.supplement?.name}
                    </span>
                    <span className="text-foreground font-medium">
                      {item.amount} {item.unit} ({item.feedingTime})
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No feed items configured</p>
            )}
            {horse.feedProgram.instructions && (
              <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border">
                {horse.feedProgram.instructions}
              </p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No feed program configured</p>
        )}
      </div>
    </div>
  );
}

function EventsTab({ horse }: { horse: HorseDetail }) {
  return (
    <div>
      {horse.upcomingEvents && horse.upcomingEvents.length > 0 ? (
        <div className="space-y-2">
          {horse.upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between p-4 rounded-lg bg-background"
            >
              <div>
                <p className="font-medium text-foreground">{event.title}</p>
                <p className="text-sm text-muted-foreground">
                  {event.type} {event.providerName && `• ${event.providerName}`}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">
                  {new Date(event.scheduledDate).toLocaleDateString()}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  event.status === 'SCHEDULED'
                    ? 'bg-blue-100 text-blue-800'
                    : event.status === 'COMPLETED'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {event.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm text-center py-8">
          No upcoming events scheduled
        </p>
      )}
    </div>
  );
}

function DocumentsTab({ horse }: { horse: HorseDetail }) {
  return (
    <div>
      {horse.documents && horse.documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {horse.documents.map((doc) => (
            <a
              key={doc.id}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-accent transition-colors"
            >
              <FileText className="w-8 h-8 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {doc.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {doc.type} • {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm text-center py-8">
          No documents uploaded
        </p>
      )}
    </div>
  );
}

function PhotosTab({ horse }: { horse: HorseDetail }) {
  return (
    <div>
      {horse.photos && horse.photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {horse.photos.map((photo) => (
            <div
              key={photo.id}
              className="aspect-square rounded-lg overflow-hidden bg-muted"
            >
              <img
                src={photo.url}
                alt={photo.caption || horse.barnName}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm text-center py-8">
          No photos uploaded
        </p>
      )}
    </div>
  );
}

function NotesTab({ horse }: { horse: HorseDetail }) {
  return (
    <div>
      {horse.notes && horse.notes.length > 0 ? (
        <div className="space-y-3">
          {horse.notes.map((note) => (
            <div
              key={note.id}
              className={`p-4 rounded-lg ${
                (note as any).isPinned ? 'bg-amber-50 border border-amber-200' : 'bg-background'
              }`}
            >
              <p className="text-foreground">{note.content}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(note.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm text-center py-8">
          No notes added
        </p>
      )}
    </div>
  );
}

export default HorseDetailView;
