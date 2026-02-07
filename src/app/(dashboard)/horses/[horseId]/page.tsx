'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useHorse } from '@/hooks/useData';
import { useBarn } from '@/contexts/BarnContext';
import { toast } from '@/lib/toast';
import { HorsePhotoGallery } from '@/components/storage/HorsePhotoGallery';
import {
  ArrowLeft,
  Edit,
  MoreVertical,
  Ruler,
  MapPin,
  Trees,
  User,
  Loader2,
  X,
  Syringe,
  Utensils,
  Weight,
  Camera,
} from 'lucide-react';

// Import extracted components
import {
  HorseIcon,
  TabId,
  tabs,
  statusColors,
  vaccinationTypes,
  InfoItem,
} from './components';
import { OverviewTab } from './components/OverviewTab';
import { HealthTab } from './components/HealthTab';
import { CareTab } from './components/CareTab';
import { EventsTab } from './components/EventsTab';
import { TasksTab } from './components/TasksTab';
import { DocumentsTab } from './components/DocumentsTab';
import { ActivityTab } from './components/ActivityTab';

export default function HorseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const horseId = params?.horseId as string;
  const { currentBarn, isMember } = useBarn();
  const { horse, isLoading, error, refetch } = useHorse(horseId);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const profilePhotoInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Permission check - clients can view but not edit
  const canEdit = isMember && currentBarn?.role !== 'CLIENT';

  // Modal states
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showVaccinationModal, setShowVaccinationModal] = useState(false);
  const [showFeedModal, setShowFeedModal] = useState(false);
  const [showCogginsModal, setShowCogginsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle profile photo upload
  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentBarn) return;

    try {
      setIsUploadingPhoto(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('barnId', currentBarn.id);
      formData.append('horseId', horseId);
      formData.append('type', 'photo');
      formData.append('isPrimary', 'true');

      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        refetch();
      }
    } catch (err) {
      console.error('Failed to upload photo:', err);
    } finally {
      setIsUploadingPhoto(false);
      if (profilePhotoInputRef.current) {
        profilePhotoInputRef.current.value = '';
      }
    }
  };

  // Form states
  const [weightForm, setWeightForm] = useState({
    weight: '',
    bodyScore: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [vaccinationForm, setVaccinationForm] = useState({
    type: 'RABIES',
    dateGiven: new Date().toISOString().split('T')[0],
    nextDueDate: '',
    lotNumber: '',
    manufacturer: '',
    administeredBy: '',
    notes: '',
  });

  const [feedForm, setFeedForm] = useState({
    name: '',
    instructions: '',
    items: [{ feedName: '', amount: '', unit: 'lbs', feedingTime: 'AM' }],
  });

  const [cogginsForm, setCogginsForm] = useState({
    testDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    result: 'NEGATIVE',
    veterinarian: '',
    labName: '',
    accessionNumber: '',
    notes: '',
  });

  // Initialize feed form when horse data loads
  useEffect(() => {
    const feedProgram = (horse as any)?.feedProgram;
    if (feedProgram) {
      setFeedForm({
        name: feedProgram.name || '',
        instructions: feedProgram.instructions || '',
        items: feedProgram.items?.map((item: any) => ({
          feedName: item.feedType?.name || item.supplement?.name || '',
          amount: item.amount?.toString() || '',
          unit: item.unit || 'lbs',
          feedingTime: item.feedingTime || 'AM',
        })) || [{ feedName: '', amount: '', unit: 'lbs', feedingTime: 'AM' }],
      });
    }
  }, [(horse as any)?.feedProgram]);

  const handleLogWeight = async () => {
    if (!weightForm.weight) {
      toast.warning('Missing weight', 'Please enter a weight');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/barns/${currentBarn?.id}/horses/${horseId}/weights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: parseFloat(weightForm.weight),
          bodyScore: weightForm.bodyScore ? parseFloat(weightForm.bodyScore) : null,
          date: new Date(weightForm.date).toISOString(),
          notes: weightForm.notes || null,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to log weight');
      }

      setShowWeightModal(false);
      setWeightForm({ weight: '', bodyScore: '', date: new Date().toISOString().split('T')[0], notes: '' });
      refetch();
    } catch (err) {
      toast.error('Failed to log weight', err instanceof Error ? err.message : 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogVaccination = async () => {
    if (!vaccinationForm.type || !vaccinationForm.dateGiven) {
      toast.warning('Missing fields', 'Please fill in required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/barns/${currentBarn?.id}/horses/${horseId}/vaccinations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: vaccinationForm.type,
          dateGiven: new Date(vaccinationForm.dateGiven).toISOString(),
          nextDueDate: vaccinationForm.nextDueDate ? new Date(vaccinationForm.nextDueDate).toISOString() : null,
          lotNumber: vaccinationForm.lotNumber || null,
          manufacturer: vaccinationForm.manufacturer || null,
          administeredBy: vaccinationForm.administeredBy || null,
          notes: vaccinationForm.notes || null,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to log vaccination');
      }

      setShowVaccinationModal(false);
      setVaccinationForm({
        type: 'RABIES',
        dateGiven: new Date().toISOString().split('T')[0],
        nextDueDate: '',
        lotNumber: '',
        manufacturer: '',
        administeredBy: '',
        notes: '',
      });
      refetch();
    } catch (err) {
      toast.error('Failed to log vaccination', err instanceof Error ? err.message : 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveFeedProgram = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/barns/${currentBarn?.id}/horses/${horseId}/feed-program`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: feedForm.name || null,
          instructions: feedForm.instructions || null,
          items: feedForm.items.filter(item => item.feedName && item.amount).map(item => ({
            feedName: item.feedName,
            amount: parseFloat(item.amount),
            unit: item.unit,
            feedingTime: item.feedingTime,
          })),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save feed program');
      }

      setShowFeedModal(false);
      refetch();
    } catch (err) {
      toast.error('Failed to save feed program', err instanceof Error ? err.message : 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogCoggins = async () => {
    if (!cogginsForm.testDate || !cogginsForm.expiryDate) {
      toast.warning('Missing fields', 'Please fill in required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/barns/${currentBarn?.id}/horses/${horseId}/coggins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testDate: new Date(cogginsForm.testDate).toISOString(),
          expiryDate: new Date(cogginsForm.expiryDate).toISOString(),
          result: cogginsForm.result,
          veterinarian: cogginsForm.veterinarian || null,
          labName: cogginsForm.labName || null,
          accessionNumber: cogginsForm.accessionNumber || null,
          notes: cogginsForm.notes || null,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to log Coggins');
      }

      setShowCogginsModal(false);
      setCogginsForm({
        testDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        result: 'NEGATIVE',
        veterinarian: '',
        labName: '',
        accessionNumber: '',
        notes: '',
      });
      refetch();
    } catch (err) {
      toast.error('Failed to log Coggins', err instanceof Error ? err.message : 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFeedItem = () => {
    setFeedForm(prev => ({
      ...prev,
      items: [...prev.items, { feedName: '', amount: '', unit: 'lbs', feedingTime: 'AM' }],
    }));
  };

  const removeFeedItem = (index: number) => {
    setFeedForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateFeedItem = (index: number, field: string, value: string) => {
    setFeedForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, [field]: value } : item),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !horse) {
    return (
      <div className="text-center py-16">
        <HorseIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Horse not found</h2>
        <p className="text-muted-foreground mb-6">{error || "This horse doesn't exist or you don't have access."}</p>
        <Link href="/horses" className="btn-primary btn-md">
          <ArrowLeft className="w-4 h-4" />
          Back to Horses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Link
          href="/horses"
          className="p-2 rounded-xl hover:bg-accent transition-all self-start"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
              {horse.barnName}
            </h1>
            <span className={`${statusColors[horse.status] || 'badge-neutral'} text-xs sm:text-sm flex-shrink-0`}>
              {horse.status}
            </span>
          </div>
          {horse.registeredName && (
            <p className="text-sm sm:text-base text-muted-foreground truncate">{horse.registeredName}</p>
          )}
        </div>
        {canEdit && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link href={`/horses/${horse.id}/edit`} className="btn-secondary btn-md flex-1 sm:flex-initial justify-center">
              <Edit className="w-4 h-4" />
              <span className="sm:inline">Edit</span>
            </Link>
            <button className="p-2 sm:p-2.5 rounded-xl hover:bg-accent transition-all flex-shrink-0">
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="card p-3 sm:p-6">
        <div className="flex flex-row gap-3 sm:gap-6">
          {/* Photo - smaller on mobile */}
          <input
            ref={profilePhotoInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfilePhotoUpload}
            className="hidden"
          />
          <div
            className="relative w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 rounded-xl bg-muted overflow-hidden flex-shrink-0 group cursor-pointer"
            onClick={() => {
              if (horse.profilePhotoUrl) {
                setActiveTab('photos');
              } else {
                profilePhotoInputRef.current?.click();
              }
            }}
          >
            {isUploadingPhoto ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-500 animate-spin" />
              </div>
            ) : horse.profilePhotoUrl ? (
              <>
                <img
                  src={horse.profilePhotoUrl}
                  alt={horse.barnName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-white text-center">
                    <Camera className="w-6 h-6 sm:w-8 sm:h-8 mx-auto" />
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center hover:bg-accent transition-colors">
                <Camera className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info Grid - fewer columns on mobile */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 content-start">
            <InfoItem label="Breed" value={horse.breed} />
            <InfoItem label="Color" value={horse.color} />
            <InfoItem label="Sex" value={horse.sex} />
            <InfoItem
              label="Age"
              value={horse.age ? `${horse.age} years` : null}
              subValue={horse.dateOfBirth ? new Date(horse.dateOfBirth).toLocaleDateString() : undefined}
            />
            <InfoItem
              label="Height"
              value={horse.heightHands ? `${horse.heightHands} hands` : null}
              icon={Ruler}
            />
            <InfoItem
              label="Weight"
              value={horse.currentWeight ? `${horse.currentWeight} lbs` : null}
              icon={Weight}
            />
            <InfoItem
              label="Stall"
              value={horse.stallName}
              icon={MapPin}
            />
            <InfoItem
              label="Pasture"
              value={horse.paddockName}
              icon={Trees}
            />
            <InfoItem
              label="Owner"
              value={horse.ownerName}
              icon={User}
            />
            <InfoItem
              label="Microchip"
              value={horse.microchipNumber}
            />
          </div>
        </div>

        {/* Status Note */}
        {horse.statusNote && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> {horse.statusNote}
            </p>
          </div>
        )}
      </div>

      {/* Tabs - Grid on mobile, horizontal scroll on larger screens */}
      <div className="border-b border-border -mx-3 sm:-mx-4 sm:mx-0">
        {/* Mobile: Grid layout */}
        <nav className="grid grid-cols-4 gap-1 px-2 pb-2 sm:hidden">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all no-tap-highlight
                ${activeTab === id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground active:bg-accent'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-medium leading-tight text-center">{label.split(' ')[0]}</span>
            </button>
          ))}
        </nav>

        {/* Desktop: Horizontal tabs */}
        <nav className="hidden sm:flex gap-0.5 overflow-x-auto scrollbar-hide px-4 sm:px-0">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all flex-shrink-0
                ${activeTab === id
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-muted-foreground'
                }
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && <OverviewTab horse={horse} onNavigateToHealth={() => setActiveTab('health')} />}
        {activeTab === 'photos' && currentBarn && (
          <div className="card p-6">
            <HorsePhotoGallery
              barnId={currentBarn.id}
              horseId={horse.id}
              primaryPhotoUrl={horse.profilePhotoUrl}
              onPrimaryPhotoChange={() => {
                // Refresh horse data when primary photo changes
                refetch();
              }}
              editable={canEdit}
            />
          </div>
        )}
        {activeTab === 'activity' && <ActivityTab horse={horse} barnId={currentBarn?.id || ''} />}
        {activeTab === 'health' && (
          <HealthTab
            horse={horse}
            barnId={currentBarn?.id || ''}
            onLogWeight={() => setShowWeightModal(true)}
            onLogVaccination={() => setShowVaccinationModal(true)}
            onLogCoggins={() => setShowCogginsModal(true)}
            canEdit={canEdit}
          />
        )}
        {activeTab === 'care' && (
          <CareTab
            horse={horse}
            onEditFeed={() => setShowFeedModal(true)}
            canEdit={canEdit}
          />
        )}
        {activeTab === 'tasks' && <TasksTab horse={horse} canEdit={canEdit} />}
        {activeTab === 'events' && <EventsTab horse={horse} canEdit={canEdit} />}
        {activeTab === 'documents' && <DocumentsTab horse={horse} canEdit={canEdit} />}
      </div>

      {/* Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Weight className="w-5 h-5 text-amber-500" />
                  Log Weight
                </h3>
                <button onClick={() => setShowWeightModal(false)} className="p-1 rounded hover:bg-accent">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Weight (lbs) *</label>
                <input
                  type="number"
                  value={weightForm.weight}
                  onChange={(e) => setWeightForm(prev => ({ ...prev, weight: e.target.value }))}
                  className="input w-full"
                  placeholder="1000"
                  step="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Body Condition Score (1-9)</label>
                <input
                  type="number"
                  value={weightForm.bodyScore}
                  onChange={(e) => setWeightForm(prev => ({ ...prev, bodyScore: e.target.value }))}
                  className="input w-full"
                  placeholder="5"
                  min="1"
                  max="9"
                  step="0.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Date</label>
                <input
                  type="date"
                  value={weightForm.date}
                  onChange={(e) => setWeightForm(prev => ({ ...prev, date: e.target.value }))}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
                <textarea
                  value={weightForm.notes}
                  onChange={(e) => setWeightForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="input w-full"
                  rows={2}
                  placeholder="Any observations..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3">
              <button onClick={() => setShowWeightModal(false)} className="btn-secondary flex-1" disabled={isSubmitting}>
                Cancel
              </button>
              <button onClick={handleLogWeight} className="btn-primary flex-1" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Weight'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vaccination Modal */}
      {showVaccinationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Syringe className="w-5 h-5 text-green-500" />
                  Log Vaccination
                </h3>
                <button onClick={() => setShowVaccinationModal(false)} className="p-1 rounded hover:bg-accent">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Vaccine Type *</label>
                <select
                  value={vaccinationForm.type}
                  onChange={(e) => setVaccinationForm(prev => ({ ...prev, type: e.target.value }))}
                  className="input w-full"
                >
                  {vaccinationTypes.map(type => (
                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Date Given *</label>
                  <input
                    type="date"
                    value={vaccinationForm.dateGiven}
                    onChange={(e) => setVaccinationForm(prev => ({ ...prev, dateGiven: e.target.value }))}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Next Due Date</label>
                  <input
                    type="date"
                    value={vaccinationForm.nextDueDate}
                    onChange={(e) => setVaccinationForm(prev => ({ ...prev, nextDueDate: e.target.value }))}
                    className="input w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={vaccinationForm.manufacturer}
                    onChange={(e) => setVaccinationForm(prev => ({ ...prev, manufacturer: e.target.value }))}
                    className="input w-full"
                    placeholder="e.g., Zoetis"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Lot Number</label>
                  <input
                    type="text"
                    value={vaccinationForm.lotNumber}
                    onChange={(e) => setVaccinationForm(prev => ({ ...prev, lotNumber: e.target.value }))}
                    className="input w-full"
                    placeholder="LOT12345"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Administered By</label>
                <input
                  type="text"
                  value={vaccinationForm.administeredBy}
                  onChange={(e) => setVaccinationForm(prev => ({ ...prev, administeredBy: e.target.value }))}
                  className="input w-full"
                  placeholder="Dr. Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
                <textarea
                  value={vaccinationForm.notes}
                  onChange={(e) => setVaccinationForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="input w-full"
                  rows={2}
                  placeholder="Any reactions or observations..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3">
              <button onClick={() => setShowVaccinationModal(false)} className="btn-secondary flex-1" disabled={isSubmitting}>
                Cancel
              </button>
              <button onClick={handleLogVaccination} className="btn-primary flex-1" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Vaccination'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feed Program Modal */}
      {showFeedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-amber-500" />
                  Edit Feed Program
                </h3>
                <button onClick={() => setShowFeedModal(false)} className="p-1 rounded hover:bg-accent">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Program Name</label>
                <input
                  type="text"
                  value={feedForm.name}
                  onChange={(e) => setFeedForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input w-full"
                  placeholder="e.g., Senior Diet, Performance Feed"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-muted-foreground">Feed Items</label>
                  <button
                    type="button"
                    onClick={addFeedItem}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {feedForm.items.map((item, index) => (
                    <div key={index} className="p-3 rounded-xl bg-background space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={item.feedName}
                          onChange={(e) => updateFeedItem(index, 'feedName', e.target.value)}
                          className="input flex-1"
                          placeholder="Feed name (e.g., Timothy Hay)"
                        />
                        {feedForm.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFeedItem(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => updateFeedItem(index, 'amount', e.target.value)}
                          className="input"
                          placeholder="Amount"
                          step="0.1"
                        />
                        <select
                          value={item.unit}
                          onChange={(e) => updateFeedItem(index, 'unit', e.target.value)}
                          className="input"
                        >
                          <option value="lbs">lbs</option>
                          <option value="oz">oz</option>
                          <option value="cups">cups</option>
                          <option value="flakes">flakes</option>
                          <option value="scoops">scoops</option>
                        </select>
                        <select
                          value={item.feedingTime}
                          onChange={(e) => updateFeedItem(index, 'feedingTime', e.target.value)}
                          className="input"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                          <option value="MIDDAY">Midday</option>
                          <option value="BOTH">AM & PM</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Special Instructions</label>
                <textarea
                  value={feedForm.instructions}
                  onChange={(e) => setFeedForm(prev => ({ ...prev, instructions: e.target.value }))}
                  className="input w-full"
                  rows={3}
                  placeholder="Any special feeding instructions, allergies, or notes..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3">
              <button onClick={() => setShowFeedModal(false)} className="btn-secondary flex-1" disabled={isSubmitting}>
                Cancel
              </button>
              <button onClick={handleSaveFeedProgram} className="btn-primary flex-1" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Feed Program'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coggins Modal */}
      {showCogginsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Add Coggins Record</h3>
                <button onClick={() => setShowCogginsModal(false)} className="p-1 rounded hover:bg-accent">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Test Date *</label>
                  <input
                    type="date"
                    value={cogginsForm.testDate}
                    onChange={(e) => setCogginsForm(prev => ({ ...prev, testDate: e.target.value }))}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    value={cogginsForm.expiryDate}
                    onChange={(e) => setCogginsForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Result</label>
                <select
                  value={cogginsForm.result}
                  onChange={(e) => setCogginsForm(prev => ({ ...prev, result: e.target.value }))}
                  className="input w-full"
                >
                  <option value="NEGATIVE">Negative</option>
                  <option value="POSITIVE">Positive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Veterinarian</label>
                <input
                  type="text"
                  value={cogginsForm.veterinarian}
                  onChange={(e) => setCogginsForm(prev => ({ ...prev, veterinarian: e.target.value }))}
                  className="input w-full"
                  placeholder="Dr. Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Lab Name</label>
                <input
                  type="text"
                  value={cogginsForm.labName}
                  onChange={(e) => setCogginsForm(prev => ({ ...prev, labName: e.target.value }))}
                  className="input w-full"
                  placeholder="State Diagnostic Lab"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Accession Number</label>
                <input
                  type="text"
                  value={cogginsForm.accessionNumber}
                  onChange={(e) => setCogginsForm(prev => ({ ...prev, accessionNumber: e.target.value }))}
                  className="input w-full"
                  placeholder="2025-12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
                <textarea
                  value={cogginsForm.notes}
                  onChange={(e) => setCogginsForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="input w-full"
                  rows={2}
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3">
              <button onClick={() => setShowCogginsModal(false)} className="btn-secondary flex-1" disabled={isSubmitting}>
                Cancel
              </button>
              <button onClick={handleLogCoggins} className="btn-primary flex-1" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Coggins Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
