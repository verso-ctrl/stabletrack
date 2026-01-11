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
      return 'bg-stone-100 text-stone-600';
    case 'SOLD':
      return 'bg-blue-100 text-blue-800';
    case 'DECEASED':
      return 'bg-stone-200 text-stone-500';
    default:
      return 'bg-stone-100 text-stone-600';
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
        <div className="h-8 w-48 bg-stone-200 rounded-lg" />
        <div className="h-64 bg-stone-100 rounded-2xl" />
        <div className="h-96 bg-stone-100 rounded-2xl" />
      </div>
    );
  }

  if (error || !horse) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-stone-900 mb-2">
          Horse Not Found
        </h2>
        <p className="text-stone-500 mb-6">
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
            className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-600" />
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
                <h1 className="text-2xl font-bold text-stone-900">
                  {horse.barnName}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(horse.status)}`}>
                  {horse.status}
                </span>
              </div>
              
              {horse.registeredName && (
                <p className="text-stone-500 text-sm mt-0.5">
                  {horse.registeredName}
                </p>
              )}
              
              <div className="flex items-center gap-4 mt-2 text-sm text-stone-600">
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
          
          <button className="p-2 rounded-lg hover:bg-stone-100 transition-colors">
            <MoreVertical className="w-5 h-5 text-stone-600" />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex items-center gap-2 text-stone-500 text-sm mb-1">
            <Scale className="w-4 h-4" />
            Weight
          </div>
          <p className="text-xl font-semibold text-stone-900">
            {(horse as any).currentWeight ? `${(horse as any).currentWeight} lbs` : '—'}
          </p>
        </div>
        
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex items-center gap-2 text-stone-500 text-sm mb-1">
            <Activity className="w-4 h-4" />
            Height
          </div>
          <p className="text-xl font-semibold text-stone-900">
            {horse.heightHands ? `${horse.heightHands} hands` : '—'}
          </p>
        </div>
        
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex items-center gap-2 text-stone-500 text-sm mb-1">
            <Pill className="w-4 h-4" />
            Medications
          </div>
          <p className="text-xl font-semibold text-stone-900">
            {horseDetail.currentMedications?.length || 0} active
          </p>
        </div>
        
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex items-center gap-2 text-stone-500 text-sm mb-1">
            <Calendar className="w-4 h-4" />
            Next Event
          </div>
          <p className="text-xl font-semibold text-stone-900">
            {horseDetail.upcomingEvents?.[0]
              ? new Date(horseDetail.upcomingEvents[0].scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : '—'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-200">
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
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
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
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
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
          <h4 className="font-medium text-stone-900 mb-3">Upcoming Events</h4>
          <div className="space-y-2">
            {horse.upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 rounded-lg bg-stone-50"
              >
                <div>
                  <p className="font-medium text-stone-900">{event.title}</p>
                  <p className="text-sm text-stone-500">{event.type}</p>
                </div>
                <span className="text-sm text-stone-600">
                  {new Date(event.scheduledDate).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Basic Info */}
      <div>
        <h4 className="font-medium text-stone-900 mb-3">Details</h4>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-stone-500">Date of Birth</dt>
            <dd className="font-medium text-stone-900">
              {horse.dateOfBirth
                ? new Date(horse.dateOfBirth).toLocaleDateString()
                : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-stone-500">Microchip</dt>
            <dd className="font-medium text-stone-900">
              {horse.microchipNumber || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-stone-500">Owner</dt>
            <dd className="font-medium text-stone-900">
              {horse.ownerName || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-stone-500">Stall</dt>
            <dd className="font-medium text-stone-900">
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
        <h4 className="font-medium text-stone-900 mb-3 flex items-center gap-2">
          <Syringe className="w-4 h-4" />
          Vaccinations
        </h4>
        {horse.vaccinations && horse.vaccinations.length > 0 ? (
          <div className="space-y-2">
            {horse.vaccinations.map((vax) => (
              <div
                key={vax.id}
                className="flex items-center justify-between p-3 rounded-lg bg-stone-50"
              >
                <div>
                  <p className="font-medium text-stone-900">
                    {vax.type.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm text-stone-500">
                    Given: {new Date(vax.dateGiven).toLocaleDateString()}
                  </p>
                </div>
                {vax.nextDueDate && (
                  <span className="text-sm text-stone-600">
                    Due: {new Date(vax.nextDueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-stone-500 text-sm">No vaccination records</p>
        )}
      </div>

      {/* Recent Health Records */}
      <div>
        <h4 className="font-medium text-stone-900 mb-3 flex items-center gap-2">
          <Stethoscope className="w-4 h-4" />
          Recent Health Records
        </h4>
        {horse.recentHealthRecords && horse.recentHealthRecords.length > 0 ? (
          <div className="space-y-2">
            {horse.recentHealthRecords.map((record) => (
              <div
                key={record.id}
                className="p-3 rounded-lg bg-stone-50"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-stone-900">
                    {record.type.replace(/_/g, ' ')}
                  </p>
                  <span className="text-sm text-stone-500">
                    {new Date(record.date).toLocaleDateString()}
                  </span>
                </div>
                {record.diagnosis && (
                  <p className="text-sm text-stone-600">{record.diagnosis}</p>
                )}
                {record.provider && (
                  <p className="text-xs text-stone-400 mt-1">
                    Provider: {record.provider}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-stone-500 text-sm">No health records</p>
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
        <h4 className="font-medium text-stone-900 mb-3">Feed Program</h4>
        {horse.feedProgram ? (
          <div className="p-4 rounded-lg bg-stone-50">
            {horse.feedProgram.name && (
              <p className="font-medium text-stone-900 mb-2">
                {horse.feedProgram.name}
              </p>
            )}
            {horse.feedProgram.items && horse.feedProgram.items.length > 0 ? (
              <div className="space-y-2">
                {horse.feedProgram.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-stone-600">
                      {item.feedType?.name || item.supplement?.name}
                    </span>
                    <span className="text-stone-900 font-medium">
                      {item.amount} {item.unit} ({item.feedingTime})
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-stone-500 text-sm">No feed items configured</p>
            )}
            {horse.feedProgram.instructions && (
              <p className="text-sm text-stone-500 mt-3 pt-3 border-t border-stone-200">
                {horse.feedProgram.instructions}
              </p>
            )}
          </div>
        ) : (
          <p className="text-stone-500 text-sm">No feed program configured</p>
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
              className="flex items-center justify-between p-4 rounded-lg bg-stone-50"
            >
              <div>
                <p className="font-medium text-stone-900">{event.title}</p>
                <p className="text-sm text-stone-500">
                  {event.type} {event.providerName && `• ${event.providerName}`}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-stone-900">
                  {new Date(event.scheduledDate).toLocaleDateString()}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  event.status === 'SCHEDULED'
                    ? 'bg-blue-100 text-blue-800'
                    : event.status === 'COMPLETED'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-stone-100 text-stone-600'
                }`}>
                  {event.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-stone-500 text-sm text-center py-8">
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
              className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 hover:bg-stone-100 transition-colors"
            >
              <FileText className="w-8 h-8 text-stone-400" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-900 truncate">
                  {doc.title}
                </p>
                <p className="text-xs text-stone-500">
                  {doc.type} • {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-stone-500 text-sm text-center py-8">
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
              className="aspect-square rounded-lg overflow-hidden bg-stone-100"
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
        <p className="text-stone-500 text-sm text-center py-8">
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
                (note as any).isPinned ? 'bg-amber-50 border border-amber-200' : 'bg-stone-50'
              }`}
            >
              <p className="text-stone-900">{note.content}</p>
              <p className="text-xs text-stone-500 mt-2">
                {new Date(note.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-stone-500 text-sm text-center py-8">
          No notes added
        </p>
      )}
    </div>
  );
}

export default HorseDetailView;
