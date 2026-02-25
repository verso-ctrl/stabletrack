'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useBarn } from '@/contexts/BarnContext';
import { useHorse } from '@/hooks/useData';
import { AutocompleteInput } from '@/components/ui/AutocompleteInput';
import { toast } from '@/lib/toast';
import { csrfFetch } from '@/lib/fetch';
import {
  ChevronLeft,
  Save,
  Loader2,
  Camera,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface Suggestions {
  breeds: string[];
  colors: string[];
  owners: string[];
  markings: string[];
}

const sexOptions = ['GELDING', 'MARE', 'STALLION', 'COLT', 'FILLY'];
const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'LAYUP', label: 'Layup / Injured' },
  { value: 'RETIRED', label: 'Retired' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'DECEASED', label: 'Deceased' },
];

export default function EditHorsePage({ params }: { params: Promise<{ horseId: string }> }) {
  const { horseId } = use(params);
  const router = useRouter();
  const { currentBarn } = useBarn();
  const { horse, isLoading, error, refetch } = useHorse(horseId);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<Suggestions>({
    breeds: [],
    colors: [],
    owners: [],
    markings: [],
  });
  const [formData, setFormData] = useState({
    barnName: '',
    registeredName: '',
    breed: '',
    color: '',
    markings: '',
    dateOfBirth: '',
    sex: '',
    heightHands: '',
    microchipNumber: '',
    status: 'ACTIVE',
    ownerName: '',
    bio: '',
  });

  // Fetch suggestions when barn is available
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!currentBarn?.id) return;

      try {
        const response = await fetch(`/api/barns/${currentBarn.id}/horses/suggestions`);
        const data = await response.json();
        if (data.data) {
          setSuggestions(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      }
    };

    fetchSuggestions();
  }, [currentBarn?.id]);

  useEffect(() => {
    if (horse) {
      setFormData({
        barnName: horse.barnName || '',
        registeredName: horse.registeredName || '',
        breed: horse.breed || '',
        color: horse.color || '',
        markings: horse.markings || '',
        dateOfBirth: horse.dateOfBirth ? new Date(horse.dateOfBirth).toISOString().split('T')[0] : '',
        sex: horse.sex || '',
        heightHands: horse.heightHands?.toString() || '',
        microchipNumber: horse.microchipNumber || '',
        status: horse.status || 'ACTIVE',
        ownerName: horse.ownerName || '',
        bio: horse.bio || '',
      });
    }
  }, [horse]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      const response = await csrfFetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await refetch();
        toast.success('Photo uploaded', 'Profile photo updated successfully');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload photo');
      }
    } catch (err) {
      console.error('Failed to upload photo:', err);
      toast.error('Upload failed', err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.barnName.trim()) {
      toast.warning('Missing name', 'Barn name is required');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const response = await csrfFetch(`/api/barns/${currentBarn?.id}/horses/${horseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          heightHands: formData.heightHands ? parseFloat(formData.heightHands) : null,
          dateOfBirth: formData.dateOfBirth || null,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update horse');
      }
      
      router.push(`/horses/${horseId}`);
    } catch (err) {
      console.error('Error updating horse:', err);
      toast.error('Update failed', err instanceof Error ? err.message : 'Failed to update horse');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await csrfFetch(`/api/barns/${currentBarn?.id}/horses/${horseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete horse');
      }

      router.push('/horses');
    } catch (err) {
      console.error('Error deleting horse:', err);
      toast.error('Delete failed', err instanceof Error ? err.message : 'Failed to delete horse');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  if (!currentBarn) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a barn first</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error || !horse) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error || 'Horse not found'}</p>
        <Link href="/horses" className="btn-primary">Back to Horses</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/horses/${horseId}`}
          className="p-2 rounded-lg text-muted-foreground hover:bg-accent transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit {horse.barnName}</h1>
          <p className="text-muted-foreground mt-1">Update horse information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Photo */}
        <div className="card p-6">
          <h3 className="font-medium text-foreground mb-4">Profile Photo</h3>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="relative w-24 h-24 rounded-2xl bg-muted flex items-center justify-center overflow-hidden">
                {horse.profilePhotoUrl ? (
                  <Image src={horse.profilePhotoUrl} alt="" fill className="object-cover" unoptimized />
                ) : (
                  <span className="text-3xl text-muted-foreground">{formData.barnName[0] || '?'}</span>
                )}
              </div>
              <button
                type="button"
                className="absolute -bottom-2 -right-2 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Upload a new profile photo</p>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="btn-secondary btn-sm mt-2 flex items-center gap-2"
              >
                {isUploadingPhoto ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Change Photo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="card p-6">
          <h3 className="font-medium text-foreground mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Barn Name *
                </label>
                <input
                  type="text"
                  value={formData.barnName}
                  onChange={(e) => setFormData({ ...formData, barnName: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Registered Name
                </label>
                <input
                  type="text"
                  value={formData.registeredName}
                  onChange={(e) => setFormData({ ...formData, registeredName: e.target.value })}
                  className="input w-full"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Breed
                </label>
                <AutocompleteInput
                  value={formData.breed}
                  onChange={(value) => setFormData({ ...formData, breed: value })}
                  suggestions={suggestions.breeds}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Color
                </label>
                <AutocompleteInput
                  value={formData.color}
                  onChange={(value) => setFormData({ ...formData, color: value })}
                  suggestions={suggestions.colors}
                  className="input w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Markings
              </label>
              <AutocompleteInput
                value={formData.markings}
                onChange={(value) => setFormData({ ...formData, markings: value })}
                suggestions={suggestions.markings}
                className="input w-full"
                placeholder="e.g., Star, snip, two white socks"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Sex
                </label>
                <select
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                  className="input w-full"
                >
                  <option value="">Select</option>
                  {sexOptions.map((sex) => (
                    <option key={sex} value={sex}>{sex.charAt(0) + sex.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Height (hands)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.heightHands}
                  onChange={(e) => setFormData({ ...formData, heightHands: e.target.value })}
                  className="input w-full"
                  placeholder="16.2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status & Ownership */}
        <div className="card p-6">
          <h3 className="font-medium text-foreground mb-4">Status & Ownership</h3>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input w-full"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Stall / Pasture
                </label>
                <p className="text-sm text-muted-foreground py-2">
                  Manage stall &amp; pasture assignments from the{' '}
                  <Link href="/pastures" className="text-amber-600 hover:text-amber-700 underline">
                    Pastures &amp; Stalls
                  </Link>{' '}
                  page.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Owner Name
              </label>
              <AutocompleteInput
                value={formData.ownerName}
                onChange={(value) => setFormData({ ...formData, ownerName: value })}
                suggestions={suggestions.owners}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Microchip Number
              </label>
              <input
                type="text"
                value={formData.microchipNumber}
                onChange={(e) => setFormData({ ...formData, microchipNumber: e.target.value })}
                className="input w-full"
              />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="card p-6">
          <h3 className="font-medium text-foreground mb-4">Bio</h3>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="input w-full h-32 resize-none"
            placeholder="Add notes about this horse's personality, history, special needs..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href={`/horses/${horseId}`} className="btn-secondary flex-1">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* Danger Zone */}
        <div className="card p-6 border-red-200">
          <h3 className="font-medium text-red-600 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h3>
          <div className="flex items-center justify-between p-4 rounded-xl bg-red-50">
            <div>
              <p className="font-medium text-foreground">Delete Horse</p>
              <p className="text-sm text-muted-foreground">Permanently remove this horse and all records</p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="btn bg-red-100 text-red-700 hover:bg-red-200 btn-sm flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Delete Horse?</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete <strong>{horse.barnName}</strong>? All health records, 
              events, and data associated with this horse will be permanently removed.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn bg-red-600 text-white hover:bg-red-700 flex-1"
              >
                Delete Horse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
