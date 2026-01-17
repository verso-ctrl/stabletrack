'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useHorse } from '@/hooks/useData';
import { useBarn } from '@/contexts/BarnContext';
import { HorsePhotoGallery } from '@/components/storage/HorsePhotoGallery';
import {
  ArrowLeft,
  Edit,
  MoreVertical,
  Calendar,
  Pill,
  FileText,
  Activity,
  Stethoscope,
  Weight,
  Ruler,
  MapPin,
  User,
  ChevronRight,
  Plus,
  Loader2,
  X,
  Syringe,
  Utensils,
  Trophy,
  Medal,
  Clock,
  Camera,
} from 'lucide-react';

// Horse icon
const HorseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12c0-4-3-8-8-8-3 0-5.5 1.5-7 3.5L3 10l1 3-2 4 3 1 2-1 2 3h4l1-2 2 1 4-3c1-1 2-2.5 2-4z"/>
    <circle cx="18" cy="9" r="1"/>
  </svg>
);

type TabId = 'overview' | 'photos' | 'activity' | 'health' | 'care' | 'competitions' | 'events' | 'documents';

const tabs: { id: TabId; label: string; icon: any }[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'photos', label: 'Photos', icon: Camera },
  { id: 'activity', label: 'Activity Log', icon: Clock },
  { id: 'health', label: 'Health', icon: Stethoscope },
  { id: 'care', label: 'Care', icon: HorseIcon },
  { id: 'competitions', label: 'Competitions', icon: Trophy },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'documents', label: 'Documents', icon: FileText },
];

const statusColors: Record<string, string> = {
  ACTIVE: 'badge-success',
  LAYUP: 'badge-warning',
  RETIRED: 'badge-neutral',
};

const vaccinationTypes = [
  'RABIES',
  'TETANUS',
  'EWT_EEE_WEE_TETANUS',
  'WEST_NILE',
  'INFLUENZA',
  'RHINOPNEUMONITIS',
  'STRANGLES',
  'POTOMAC_HORSE_FEVER',
  'BOTULISM',
  'OTHER',
];

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
  React.useEffect(() => {
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
      alert('Please enter a weight');
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
      alert(err instanceof Error ? err.message : 'Failed to log weight');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogVaccination = async () => {
    if (!vaccinationForm.type || !vaccinationForm.dateGiven) {
      alert('Please fill in required fields');
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
      alert(err instanceof Error ? err.message : 'Failed to log vaccination');
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
      alert(err instanceof Error ? err.message : 'Failed to save feed program');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogCoggins = async () => {
    if (!cogginsForm.testDate || !cogginsForm.expiryDate) {
      alert('Please fill in required fields');
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
      alert(err instanceof Error ? err.message : 'Failed to log Coggins');
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
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  if (error || !horse) {
    return (
      <div className="text-center py-16">
        <HorseIcon className="w-16 h-16 text-stone-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-stone-900 mb-2">Horse not found</h2>
        <p className="text-stone-500 mb-6">{error || "This horse doesn't exist or you don't have access."}</p>
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
          className="p-2 rounded-xl hover:bg-stone-100 transition-all self-start"
        >
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 truncate">
              {horse.barnName}
            </h1>
            <span className={`${statusColors[horse.status] || 'badge-neutral'} text-xs sm:text-sm flex-shrink-0`}>
              {horse.status}
            </span>
          </div>
          {horse.registeredName && (
            <p className="text-sm sm:text-base text-stone-500 truncate">{horse.registeredName}</p>
          )}
        </div>
        {canEdit && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link href={`/horses/${horse.id}/edit`} className="btn-secondary btn-md flex-1 sm:flex-initial justify-center">
              <Edit className="w-4 h-4" />
              <span className="sm:inline">Edit</span>
            </Link>
            <button className="p-2 sm:p-2.5 rounded-xl hover:bg-stone-100 transition-all flex-shrink-0">
              <MoreVertical className="w-5 h-5 text-stone-600" />
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="card p-4 sm:p-6">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
          {/* Photo */}
          <input
            ref={profilePhotoInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfilePhotoUpload}
            className="hidden"
          />
          <div
            className="relative w-full md:w-48 aspect-square rounded-xl bg-stone-100 overflow-hidden flex-shrink-0 group cursor-pointer"
            onClick={() => {
              if (horse.profilePhotoUrl) {
                // If there's a photo, go to photos tab
                setActiveTab('photos');
              } else {
                // If no photo, trigger file upload
                profilePhotoInputRef.current?.click();
              }
            }}
          >
            {isUploadingPhoto ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-2" />
                <span className="text-sm text-stone-500">Uploading...</span>
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
                    <Camera className="w-8 h-8 mx-auto mb-1" />
                    <span className="text-sm">Manage Photos</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center hover:bg-stone-50 transition-colors">
                <Camera className="w-12 h-12 text-stone-300 mb-2" />
                <span className="text-sm text-stone-400">Add Photo</span>
              </div>
            )}
          </div>

          {/* Info Grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
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

      {/* Tabs */}
      <div className="border-b border-stone-200 -mx-4 sm:mx-0">
        <nav className="flex gap-0.5 overflow-x-auto scrollbar-hide px-4 sm:px-0">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-all flex-shrink-0
                ${activeTab === id
                  ? 'border-stone-900 text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-700 active:bg-stone-50'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
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
              onPrimaryPhotoChange={(url) => {
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
        {activeTab === 'competitions' && <CompetitionsTab horse={horse} barnId={currentBarn?.id || ''} canEdit={canEdit} />}
        {activeTab === 'events' && <EventsTab horse={horse} canEdit={canEdit} />}
        {activeTab === 'documents' && <DocumentsTab horse={horse} canEdit={canEdit} />}
      </div>

      {/* Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-stone-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Weight className="w-5 h-5 text-amber-500" />
                  Log Weight
                </h3>
                <button onClick={() => setShowWeightModal(false)} className="p-1 rounded hover:bg-stone-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Weight (lbs) *</label>
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
                <label className="block text-sm font-medium text-stone-700 mb-1">Body Condition Score (1-9)</label>
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
                <label className="block text-sm font-medium text-stone-700 mb-1">Date</label>
                <input
                  type="date"
                  value={weightForm.date}
                  onChange={(e) => setWeightForm(prev => ({ ...prev, date: e.target.value }))}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Notes</label>
                <textarea
                  value={weightForm.notes}
                  onChange={(e) => setWeightForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="input w-full"
                  rows={2}
                  placeholder="Any observations..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-stone-100 flex gap-3">
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
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Syringe className="w-5 h-5 text-green-500" />
                  Log Vaccination
                </h3>
                <button onClick={() => setShowVaccinationModal(false)} className="p-1 rounded hover:bg-stone-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Vaccine Type *</label>
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
                  <label className="block text-sm font-medium text-stone-700 mb-1">Date Given *</label>
                  <input
                    type="date"
                    value={vaccinationForm.dateGiven}
                    onChange={(e) => setVaccinationForm(prev => ({ ...prev, dateGiven: e.target.value }))}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Next Due Date</label>
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
                  <label className="block text-sm font-medium text-stone-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={vaccinationForm.manufacturer}
                    onChange={(e) => setVaccinationForm(prev => ({ ...prev, manufacturer: e.target.value }))}
                    className="input w-full"
                    placeholder="e.g., Zoetis"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Lot Number</label>
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
                <label className="block text-sm font-medium text-stone-700 mb-1">Administered By</label>
                <input
                  type="text"
                  value={vaccinationForm.administeredBy}
                  onChange={(e) => setVaccinationForm(prev => ({ ...prev, administeredBy: e.target.value }))}
                  className="input w-full"
                  placeholder="Dr. Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Notes</label>
                <textarea
                  value={vaccinationForm.notes}
                  onChange={(e) => setVaccinationForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="input w-full"
                  rows={2}
                  placeholder="Any reactions or observations..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-stone-100 flex gap-3">
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
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-amber-500" />
                  Edit Feed Program
                </h3>
                <button onClick={() => setShowFeedModal(false)} className="p-1 rounded hover:bg-stone-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Program Name</label>
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
                  <label className="block text-sm font-medium text-stone-700">Feed Items</label>
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
                    <div key={index} className="p-3 rounded-xl bg-stone-50 space-y-2">
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
                <label className="block text-sm font-medium text-stone-700 mb-1">Special Instructions</label>
                <textarea
                  value={feedForm.instructions}
                  onChange={(e) => setFeedForm(prev => ({ ...prev, instructions: e.target.value }))}
                  className="input w-full"
                  rows={3}
                  placeholder="Any special feeding instructions, allergies, or notes..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-stone-100 flex gap-3">
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
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Add Coggins Record</h3>
                <button onClick={() => setShowCogginsModal(false)} className="p-1 rounded hover:bg-stone-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Test Date *</label>
                  <input
                    type="date"
                    value={cogginsForm.testDate}
                    onChange={(e) => setCogginsForm(prev => ({ ...prev, testDate: e.target.value }))}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    value={cogginsForm.expiryDate}
                    onChange={(e) => setCogginsForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Result</label>
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
                <label className="block text-sm font-medium text-stone-700 mb-1">Veterinarian</label>
                <input
                  type="text"
                  value={cogginsForm.veterinarian}
                  onChange={(e) => setCogginsForm(prev => ({ ...prev, veterinarian: e.target.value }))}
                  className="input w-full"
                  placeholder="Dr. Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Lab Name</label>
                <input
                  type="text"
                  value={cogginsForm.labName}
                  onChange={(e) => setCogginsForm(prev => ({ ...prev, labName: e.target.value }))}
                  className="input w-full"
                  placeholder="State Diagnostic Lab"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Accession Number</label>
                <input
                  type="text"
                  value={cogginsForm.accessionNumber}
                  onChange={(e) => setCogginsForm(prev => ({ ...prev, accessionNumber: e.target.value }))}
                  className="input w-full"
                  placeholder="2025-12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Notes</label>
                <textarea
                  value={cogginsForm.notes}
                  onChange={(e) => setCogginsForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="input w-full"
                  rows={2}
                />
              </div>
            </div>
            <div className="p-6 border-t border-stone-100 flex gap-3">
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

function InfoItem({
  label,
  value,
  subValue,
  icon: Icon
}: {
  label: string;
  value: string | number | null | undefined;
  subValue?: string;
  icon?: any;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-stone-500 uppercase tracking-wide mb-1 truncate">{label}</p>
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon className="w-4 h-4 text-stone-400 flex-shrink-0" />}
        <p className="text-sm font-medium text-stone-900 truncate">
          {value || '—'}
        </p>
      </div>
      {subValue && <p className="text-xs text-stone-500 mt-0.5 truncate">{subValue}</p>}
    </div>
  );
}

function OverviewTab({ horse, onNavigateToHealth }: { horse: any; onNavigateToHealth: () => void }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Active Medications */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-900 flex items-center gap-2">
            <Pill className="w-4 h-4 text-purple-500" />
            Active Medications
          </h3>
          <Link href={`/horses/${horse.id}/medications/new`} className="text-sm text-amber-600 hover:text-amber-700">
            + Add
          </Link>
        </div>
        {horse.activeMedications?.length > 0 ? (
          <ul className="space-y-2">
            {horse.activeMedications.map((med: any) => (
              <li key={med.id} className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                <p className="font-medium text-stone-900">{med.name}</p>
                <p className="text-sm text-stone-500">{med.dosage} • {med.frequency}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-stone-500 text-sm py-4">No active medications</p>
        )}
      </div>

      {/* Upcoming Events */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            Upcoming Events
          </h3>
          <Link href="/calendar" className="text-sm text-amber-600 hover:text-amber-700">
            View All →
          </Link>
        </div>
        {horse.upcomingEvents?.length > 0 ? (
          <ul className="space-y-2">
            {horse.upcomingEvents.slice(0, 3).map((event: any) => (
              <li key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50">
                <div className="flex-1">
                  <p className="font-medium text-stone-900">{event.title}</p>
                  <p className="text-sm text-stone-500">
                    {new Date(event.scheduledDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="badge-info">{event.type}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-stone-500 text-sm py-4">No upcoming events</p>
        )}
      </div>

      {/* Recent Health Records */}
      <div className="card p-5 lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-900 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-green-500" />
            Recent Health
          </h3>
          <Link href={`/horses/${horse.id}/health/new`} className="text-sm text-amber-600 hover:text-amber-700">
            + Add
          </Link>
        </div>
        {horse.recentHealthRecords?.length > 0 ? (
          <div className="space-y-2">
            {horse.recentHealthRecords.slice(0, 3).map((record: any) => (
              <button
                key={record.id}
                onClick={onNavigateToHealth}
                className="w-full p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors text-left"
              >
                <p className="font-medium text-stone-900">{record.type.replace(/_/g, ' ')}</p>
                <p className="text-sm text-stone-500">
                  {new Date(record.date).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-stone-500 text-sm py-4">No health records</p>
        )}
        {horse.recentHealthRecords?.length > 3 && (
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

function HealthTab({ horse, onLogWeight, onLogVaccination, onLogCoggins, barnId, canEdit = true }: { horse: any; onLogWeight: () => void; onLogVaccination: () => void; onLogCoggins: () => void; barnId: string; canEdit?: boolean }) {
  const [coggins, setCoggins] = React.useState<any>(null);
  const [cogginsLoading, setCogginsLoading] = React.useState(true);
  const [healthRecords, setHealthRecords] = React.useState<any[]>([]);
  const [healthRecordsLoading, setHealthRecordsLoading] = React.useState(true);
  const [selectedHealthRecord, setSelectedHealthRecord] = React.useState<any>(null);
  const [showHealthRecordModal, setShowHealthRecordModal] = React.useState(false);

  React.useEffect(() => {
    if (barnId && horse?.id) {
      fetch(`/api/barns/${barnId}/horses/${horse.id}/coggins`)
        .then(res => res.json())
        .then(data => {
          setCoggins(data);
          setCogginsLoading(false);
        })
        .catch(() => setCogginsLoading(false));

      // Fetch health records
      fetch(`/api/barns/${barnId}/horses/${horse.id}/health`)
        .then(res => res.json())
        .then(data => {
          setHealthRecords(data.data || []);
          setHealthRecordsLoading(false);
        })
        .catch(() => setHealthRecordsLoading(false));
    }
  }, [barnId, horse?.id]);

  return (
    <div className="space-y-6">
      {/* Coggins Status */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-900">Coggins Test</h3>
          {canEdit && (
            <button onClick={onLogCoggins} className="btn-secondary btn-sm">
              <Plus className="w-4 h-4" />
              Add Coggins
            </button>
          )}
        </div>
        {cogginsLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
          </div>
        ) : coggins?.current ? (
          <div className={`p-4 rounded-xl ${coggins.isExpired ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {coggins.isExpired ? (
                <>
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="font-medium text-red-700">Expired</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="font-medium text-green-700">Valid</span>
                  {coggins.expiresIn && coggins.expiresIn <= 30 && (
                    <span className="badge-warning ml-2">Expires in {coggins.expiresIn} days</span>
                  )}
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-stone-500">Test Date</p>
                <p className="font-medium">{new Date(coggins.current.testDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-stone-500">Expiry Date</p>
                <p className="font-medium">{new Date(coggins.current.expiryDate).toLocaleDateString()}</p>
              </div>
              {coggins.current.veterinarian && (
                <div>
                  <p className="text-stone-500">Veterinarian</p>
                  <p className="font-medium">{coggins.current.veterinarian}</p>
                </div>
              )}
              {coggins.current.accessionNumber && (
                <div>
                  <p className="text-stone-500">Accession #</p>
                  <p className="font-medium">{coggins.current.accessionNumber}</p>
                </div>
              )}
            </div>
            {coggins.current.documentUrl && (
              <a 
                href={coggins.current.documentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700"
              >
                <FileText className="w-4 h-4" />
                View Document
              </a>
            )}
          </div>
        ) : (
          <div className="text-center py-6 bg-stone-50 rounded-xl">
            <FileText className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-stone-500 text-sm mb-3">No Coggins on file</p>
            {canEdit && (
              <button onClick={onLogCoggins} className="btn-primary btn-sm">
                <Plus className="w-4 h-4" />
                Add Coggins Record
              </button>
            )}
          </div>
        )}
        
        {/* Coggins History */}
        {coggins?.data?.length > 1 && (
          <div className="mt-4 pt-4 border-t border-stone-200">
            <p className="text-sm font-medium text-stone-700 mb-2">History</p>
            <div className="space-y-2">
              {coggins.data.slice(1, 4).map((c: any) => (
                <div key={c.id} className="flex items-center justify-between text-sm p-2 rounded bg-stone-50">
                  <span className="text-stone-500">{new Date(c.testDate).toLocaleDateString()}</span>
                  <span className={new Date(c.expiryDate) > new Date() ? 'text-green-600' : 'text-stone-400'}>
                    Exp: {new Date(c.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Vaccinations */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-900">Vaccinations</h3>
          {canEdit && (
            <button onClick={onLogVaccination} className="btn-secondary btn-sm">
              <Plus className="w-4 h-4" />
              Log Vaccination
            </button>
          )}
        </div>
        {horse.vaccinations?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {horse.vaccinations.map((vax: any) => {
              const isExpiringSoon = vax.nextDueDate && 
                new Date(vax.nextDueDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
              
              return (
                <div key={vax.id} className="p-3 rounded-xl bg-stone-50">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-stone-900">
                      {vax.type.replace(/_/g, ' ')}
                    </p>
                    {isExpiringSoon && <span className="badge-warning">Due Soon</span>}
                  </div>
                  <p className="text-sm text-stone-500 mt-1">
                    Given: {new Date(vax.dateGiven).toLocaleDateString()}
                  </p>
                  {vax.nextDueDate && (
                    <p className="text-sm text-stone-500">
                      Next due: {new Date(vax.nextDueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-stone-500 text-sm">No vaccination records</p>
        )}
      </div>

      {/* Weight History */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-900">Weight History</h3>
          {canEdit && (
            <button onClick={onLogWeight} className="btn-secondary btn-sm">
              <Plus className="w-4 h-4" />
              Log Weight
            </button>
          )}
        </div>
        {horse.weights?.length > 0 ? (
          <div className="space-y-2">
            {horse.weights.slice(0, 5).map((w: any) => (
              <div key={w.id} className="flex items-center justify-between p-3 rounded-xl bg-stone-50">
                <span className="text-stone-500">{new Date(w.date).toLocaleDateString()}</span>
                <span className="font-medium text-stone-900">{w.weight} lbs</span>
                {w.bodyScore && (
                  <span className="text-sm text-stone-500">BCS: {w.bodyScore.toFixed(1)}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-stone-500 text-sm">No weight records</p>
        )}
      </div>

      {/* All Health Records */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-900">Health Records</h3>
          {canEdit && (
            <Link href={`/horses/${horse.id}/health/new`} className="btn-secondary btn-sm">
              <Plus className="w-4 h-4" />
              Add Record
            </Link>
          )}
        </div>
        {healthRecordsLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
          </div>
        ) : healthRecords.length > 0 ? (
          <div className="space-y-2">
            {healthRecords.map((record: any) => (
              <button
                key={record.id}
                onClick={() => {
                  setSelectedHealthRecord(record);
                  setShowHealthRecordModal(true);
                }}
                className="w-full p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-stone-900">{record.type.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-stone-500">{new Date(record.date).toLocaleDateString()}</p>
                    {record.provider && (
                      <p className="text-xs text-stone-400 mt-1">Provider: {record.provider}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <FileText className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-stone-500 text-sm mb-3">No health records</p>
            {canEdit && (
              <Link href={`/horses/${horse.id}/health/new`} className="btn-primary btn-sm inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add First Record
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Health Record Detail Modal */}
      {showHealthRecordModal && selectedHealthRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-stone-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-stone-900">
                {selectedHealthRecord.type.replace(/_/g, ' ')}
              </h2>
              <button
                onClick={() => {
                  setShowHealthRecordModal(false);
                  setSelectedHealthRecord(null);
                }}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-stone-700">Date</label>
                <p className="text-stone-900">{new Date(selectedHealthRecord.date).toLocaleDateString()}</p>
              </div>

              {selectedHealthRecord.provider && (
                <div>
                  <label className="text-sm font-medium text-stone-700">Provider</label>
                  <p className="text-stone-900">{selectedHealthRecord.provider}</p>
                </div>
              )}

              {selectedHealthRecord.diagnosis && (
                <div>
                  <label className="text-sm font-medium text-stone-700">Diagnosis</label>
                  <p className="text-stone-900 whitespace-pre-wrap">{selectedHealthRecord.diagnosis}</p>
                </div>
              )}

              {selectedHealthRecord.treatment && (
                <div>
                  <label className="text-sm font-medium text-stone-700">Treatment</label>
                  <p className="text-stone-900 whitespace-pre-wrap">{selectedHealthRecord.treatment}</p>
                </div>
              )}

              {selectedHealthRecord.findings && (
                <div>
                  <label className="text-sm font-medium text-stone-700">Findings</label>
                  <p className="text-stone-900 whitespace-pre-wrap">{selectedHealthRecord.findings}</p>
                </div>
              )}

              {selectedHealthRecord.followUpNotes && (
                <div>
                  <label className="text-sm font-medium text-stone-700">Notes</label>
                  <p className="text-stone-900 whitespace-pre-wrap">{selectedHealthRecord.followUpNotes}</p>
                </div>
              )}

              {selectedHealthRecord.followUpDate && (
                <div>
                  <label className="text-sm font-medium text-stone-700">Follow-up Date</label>
                  <p className="text-stone-900">{new Date(selectedHealthRecord.followUpDate).toLocaleDateString()}</p>
                </div>
              )}

              {selectedHealthRecord.cost && (
                <div>
                  <label className="text-sm font-medium text-stone-700">Cost</label>
                  <p className="text-stone-900">${selectedHealthRecord.cost.toFixed(2)}</p>
                </div>
              )}

              {selectedHealthRecord.attachments && selectedHealthRecord.attachments.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-stone-700 block mb-2">Attachments</label>
                  <div className="space-y-2">
                    {selectedHealthRecord.attachments.map((att: any) => (
                      <a
                        key={att.id}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded bg-stone-50 hover:bg-stone-100 text-amber-600 hover:text-amber-700"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{att.filename || 'View Document'}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CareTab({ horse, onEditFeed, canEdit = true }: { horse: any; onEditFeed: () => void; canEdit?: boolean }) {
  const feedProgram = horse.feedProgram;

  return (
    <div className="space-y-6">
      {/* Feed Program */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-900">Feed Program</h3>
          {canEdit && (
            <button onClick={onEditFeed} className="btn-secondary btn-sm">
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
        {feedProgram ? (
          <div>
            {feedProgram.name && (
              <p className="text-amber-600 font-medium mb-3">{feedProgram.name}</p>
            )}
            <div className="space-y-3">
              {feedProgram.items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-stone-50">
                  <div>
                    <p className="font-medium text-stone-900">
                      {item.feedType?.name || item.supplement?.name || item.customName}
                    </p>
                    <p className="text-sm text-stone-500">{item.feedingTime}</p>
                  </div>
                  <p className="font-medium text-stone-700">
                    {item.amount} {item.unit}
                  </p>
                </div>
              ))}
            </div>
            {feedProgram.instructions && (
              <p className="text-sm text-stone-600 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
                {feedProgram.instructions}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <Utensils className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-stone-500 text-sm mb-3">No feed program set up</p>
            {canEdit && (
              <button onClick={onEditFeed} className="btn-primary btn-sm">
                <Plus className="w-4 h-4" />
                Create Feed Program
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EventsTab({ horse, canEdit = true }: { horse: any; canEdit?: boolean }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-stone-900">Event History</h3>
        {canEdit && (
          <Link href={`/calendar`} className="btn-primary btn-sm">
            <Plus className="w-4 h-4" />
            Add Event
          </Link>
        )}
      </div>
      {horse.upcomingEvents?.length > 0 ? (
        <div className="space-y-2">
          {horse.upcomingEvents.map((event: any) => (
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

function DocumentsTab({ horse, canEdit = true }: { horse: any; canEdit?: boolean }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-stone-900">Documents</h3>
        {canEdit && (
          <button className="btn-primary btn-sm">
            <Plus className="w-4 h-4" />
            Upload
          </button>
        )}
      </div>
      {horse.documents?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {horse.documents.map((doc: any) => (
            <a 
              key={doc.id}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-all"
            >
              <FileText className="w-8 h-8 text-stone-400" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-900 truncate">{doc.title}</p>
                <p className="text-sm text-stone-500">{doc.type}</p>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-stone-500 text-sm">No documents uploaded</p>
      )}
    </div>
  );
}

function CompetitionsTab({ horse, barnId, canEdit = true }: { horse: any; barnId: string; canEdit?: boolean }) {
  const [competitions, setCompetitions] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState<any>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [showAddModal, setShowAddModal] = React.useState(false);

  const fetchCompetitions = () => {
    if (barnId && horse?.id) {
      fetch(`/api/barns/${barnId}/competitions?horseId=${horse.id}`)
        .then(res => res.json())
        .then(data => {
          setCompetitions(data.data || []);
          setStats(data.stats || {});
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  };

  React.useEffect(() => {
    fetchCompetitions();
  }, [barnId, horse?.id]);

  const getPlacingBadge = (placing: number | null, isChampion: boolean, isReserve: boolean) => {
    if (isChampion) return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '🏆 Champion' };
    if (isReserve) return { bg: 'bg-gray-100', text: 'text-gray-700', label: '🥈 Reserve' };
    if (placing === 1) return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '🥇 1st' };
    if (placing === 2) return { bg: 'bg-gray-100', text: 'text-gray-700', label: '🥈 2nd' };
    if (placing === 3) return { bg: 'bg-amber-100', text: 'text-amber-700', label: '🥉 3rd' };
    if (placing && placing <= 6) return { bg: 'bg-blue-50', text: 'text-blue-700', label: `${placing}th` };
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      {competitions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-blue-50 text-center">
            <p className="text-2xl font-semibold text-blue-700">{stats.totalShows || 0}</p>
            <p className="text-xs text-blue-600">Shows</p>
          </div>
          <div className="p-4 rounded-xl bg-yellow-50 text-center">
            <p className="text-2xl font-semibold text-yellow-700">{stats.totalWins || 0}</p>
            <p className="text-xs text-yellow-600">1st Place</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-50 text-center">
            <p className="text-2xl font-semibold text-purple-700">{stats.championships || 0}</p>
            <p className="text-xs text-purple-600">Championships</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 text-center">
            <p className="text-2xl font-semibold text-emerald-700">{stats.totalPoints?.toFixed(0) || 0}</p>
            <p className="text-xs text-emerald-600">Points</p>
          </div>
        </div>
      )}

      {/* Competition List */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-900">Competition History</h3>
          {canEdit && (
            <button onClick={() => setShowAddModal(true)} className="btn-primary btn-sm">
              <Plus className="w-4 h-4" />
              Add Result
            </button>
          )}
        </div>

        {competitions.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-stone-200 mx-auto mb-2" />
            <p className="text-stone-500 text-sm">No competition records yet</p>
            {canEdit && (
              <button onClick={() => setShowAddModal(true)} className="btn-secondary btn-sm mt-3">
                Add First Result
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {competitions.map((comp) => {
              const placingBadge = getPlacingBadge(comp.placing, comp.isChampion, comp.isReserve);
              
              return (
                <div key={comp.id} className="p-4 rounded-xl bg-stone-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-stone-900">{comp.eventName}</p>
                        {placingBadge && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${placingBadge.bg} ${placingBadge.text}`}>
                            {placingBadge.label}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-stone-500 mt-1">
                        {comp.className && `${comp.className} · `}
                        {new Date(comp.eventDate).toLocaleDateString()}
                        {comp.location && ` · ${comp.location}`}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm">
                        {comp.score && (
                          <span className="text-stone-600">Score: <span className="font-medium">{comp.score}</span></span>
                        )}
                        {comp.points && (
                          <span className="text-emerald-600">+{comp.points} pts</span>
                        )}
                        {comp.prizeMoney && (
                          <span className="text-green-600">${comp.prizeMoney}</span>
                        )}
                        {comp.isQualified && (
                          <span className="text-purple-600">✓ Qualified</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Competition Modal */}
      {showAddModal && (
        <AddCompetitionModal
          horse={horse}
          barnId={barnId}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchCompetitions();
          }}
        />
      )}
    </div>
  );
}

function AddCompetitionModal({ horse, barnId, onClose, onSuccess }: any) {
  const [formData, setFormData] = React.useState({
    eventName: '',
    eventDate: new Date().toISOString().split('T')[0],
    location: '',
    discipline: '',
    className: '',
    placing: '',
    totalEntries: '',
    score: '',
    points: '',
    prizeMoney: '',
    isChampion: false,
    isReserve: false,
    isQualified: false,
    qualifiedFor: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.eventName) {
      alert('Please enter an event name');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/barns/${barnId}/competitions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          horseId: horse.id,
          placing: formData.placing ? parseInt(formData.placing) : null,
          totalEntries: formData.totalEntries ? parseInt(formData.totalEntries) : null,
          score: formData.score ? parseFloat(formData.score) : null,
          points: formData.points ? parseFloat(formData.points) : null,
          prizeMoney: formData.prizeMoney ? parseFloat(formData.prizeMoney) : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to add competition result');
      onSuccess();
    } catch (error) {
      console.error('Error adding competition:', error);
      alert('Failed to add competition result');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h3 className="text-lg font-semibold">Add Competition Result</h3>
            <p className="text-sm text-stone-500 mt-0.5">for {horse.barnName}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-stone-100">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Event Name & Date */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Event/Show Name *</label>
              <input
                type="text"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                className="input"
                placeholder="Spring Classic Horse Show"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Event Date *</label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          {/* Location & Discipline */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input"
                placeholder="Kentucky Horse Park"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Discipline</label>
              <input
                type="text"
                value={formData.discipline}
                onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                className="input"
                placeholder="Hunter, Jumper, Dressage, etc."
              />
            </div>
          </div>

          {/* Class Name */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Class Name</label>
            <input
              type="text"
              value={formData.className}
              onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              className="input"
              placeholder="Open Jumper 1.20m"
            />
          </div>

          {/* Results */}
          <div className="border-t border-stone-200 pt-4">
            <h4 className="font-medium text-stone-900 mb-3">Results</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Placing</label>
                <input
                  type="number"
                  min="1"
                  value={formData.placing}
                  onChange={(e) => setFormData({ ...formData, placing: e.target.value })}
                  className="input"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Total Entries</label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalEntries}
                  onChange={(e) => setFormData({ ...formData, totalEntries: e.target.value })}
                  className="input"
                  placeholder="20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Score</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  className="input"
                  placeholder="85.5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Points</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                  className="input"
                  placeholder="10"
                />
              </div>
            </div>
          </div>

          {/* Prize Money */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Prize Money ($)</label>
            <input
              type="number"
              step="0.01"
              value={formData.prizeMoney}
              onChange={(e) => setFormData({ ...formData, prizeMoney: e.target.value })}
              className="input"
              placeholder="0.00"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isChampion}
                onChange={(e) => setFormData({ ...formData, isChampion: e.target.checked })}
                className="rounded border-stone-300"
              />
              <span className="text-sm text-stone-700">🏆 Champion</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isReserve}
                onChange={(e) => setFormData({ ...formData, isReserve: e.target.checked })}
                className="rounded border-stone-300"
              />
              <span className="text-sm text-stone-700">🥈 Reserve Champion</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isQualified}
                onChange={(e) => setFormData({ ...formData, isQualified: e.target.checked })}
                className="rounded border-stone-300"
              />
              <span className="text-sm text-stone-700">✓ Qualified</span>
            </label>
          </div>

          {formData.isQualified && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Qualified For</label>
              <input
                type="text"
                value={formData.qualifiedFor}
                onChange={(e) => setFormData({ ...formData, qualifiedFor: e.target.value })}
                className="input"
                placeholder="World Championship, Zone Finals, etc."
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input"
              rows={2}
              placeholder="Any additional details..."
            />
          </div>
        </form>

        <div className="flex gap-3 p-6 border-t border-stone-100 sticky bottom-0 bg-white">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.eventName}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Trophy className="w-4 h-4" />
                Save Result
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ActivityTab({ horse, barnId }: { horse: any; barnId: string }) {
  const [activities, setActivities] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<string>('all');

  React.useEffect(() => {
    if (barnId && horse?.id) {
      fetch(`/api/barns/${barnId}/horses/${horse.id}/activity`)
        .then(res => res.json())
        .then(data => {
          setActivities(data.data || []);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [barnId, horse?.id]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'feed': return <Utensils className="w-4 h-4 text-green-600" />;
      case 'medication': return <Pill className="w-4 h-4 text-purple-600" />;
      case 'health': return <Stethoscope className="w-4 h-4 text-red-500" />;
      case 'event': return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'training': return <Activity className="w-4 h-4 text-amber-600" />;
      case 'weight': return <Weight className="w-4 h-4 text-stone-600" />;
      default: return <Clock className="w-4 h-4 text-stone-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'feed': return 'bg-green-50 border-green-200';
      case 'medication': return 'bg-purple-50 border-purple-200';
      case 'health': return 'bg-red-50 border-red-200';
      case 'event': return 'bg-blue-50 border-blue-200';
      case 'training': return 'bg-amber-50 border-amber-200';
      case 'weight': return 'bg-stone-50 border-stone-200';
      default: return 'bg-stone-50 border-stone-200';
    }
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.category === filter);

  const filterOptions = [
    { value: 'all', label: 'All Activity' },
    { value: 'feed', label: 'Feeding' },
    { value: 'medication', label: 'Medications' },
    { value: 'health', label: 'Health' },
    { value: 'event', label: 'Events' },
    { value: 'training', label: 'Training' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  // Group activities by date
  const groupedActivities: Record<string, any[]> = {};
  filteredActivities.forEach(activity => {
    // Safely parse date - handle invalid dates
    const activityDate = activity.date ? new Date(activity.date) : null;
    const isValidDate = activityDate && !isNaN(activityDate.getTime());
    
    const dateKey = isValidDate 
      ? activityDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Unknown Date';
    if (!groupedActivities[dateKey]) {
      groupedActivities[dateKey] = [];
    }
    groupedActivities[dateKey].push(activity);
  });

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="card p-4">
        <div className="flex items-center gap-2 flex-wrap">
          {filterOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === opt.value
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      {filteredActivities.length === 0 ? (
        <div className="card p-8 text-center">
          <Clock className="w-12 h-12 text-stone-200 mx-auto mb-2" />
          <p className="text-stone-500">No activity recorded yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([date, dayActivities]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-stone-500 mb-3">{date}</h3>
              <div className="space-y-2">
                {dayActivities.map((activity) => {
                  const activityDate = activity.date ? new Date(activity.date) : null;
                  const isValidDate = activityDate && !isNaN(activityDate.getTime());
                  
                  return (
                  <div
                    key={activity.id}
                    className={`p-4 rounded-xl border ${getCategoryColor(activity.category)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getCategoryIcon(activity.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-stone-900">{activity.title}</p>
                          <span className="text-xs text-stone-400 whitespace-nowrap">
                            {isValidDate ? activityDate.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            }) : ''}
                          </span>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-stone-600 mt-0.5">{activity.description}</p>
                        )}
                        {/* Health check details */}
                        {activity.category === 'health' && activity.metadata && (
                          <div className="mt-2 text-sm text-stone-600 grid grid-cols-2 gap-x-4 gap-y-1">
                            {activity.metadata.temperature && (
                              <span>Temp: {activity.metadata.temperature}°F</span>
                            )}
                            {activity.metadata.heartRate && (
                              <span>HR: {activity.metadata.heartRate} bpm</span>
                            )}
                            {activity.metadata.respiratoryRate && (
                              <span>RR: {activity.metadata.respiratoryRate}</span>
                            )}
                            {activity.metadata.overallCondition && (
                              <span>Condition: {activity.metadata.overallCondition}</span>
                            )}
                            {activity.metadata.appetite && (
                              <span>Appetite: {activity.metadata.appetite}</span>
                            )}
                            {activity.metadata.attitude && (
                              <span>Attitude: {activity.metadata.attitude}</span>
                            )}
                          </div>
                        )}
                        {activity.metadata?.notes && (
                          <p className="text-xs text-stone-500 mt-1 italic">{activity.metadata.notes}</p>
                        )}
                        {activity.metadata?.givenBy && (
                          <p className="text-xs text-stone-400 mt-1">By {activity.metadata.givenBy}</p>
                        )}
                        {activity.metadata?.fedBy && (
                          <p className="text-xs text-stone-400 mt-1">By {activity.metadata.fedBy}</p>
                        )}
                        {activity.metadata?.checkedBy && (
                          <p className="text-xs text-stone-400 mt-1">Checked by {activity.metadata.checkedBy}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
