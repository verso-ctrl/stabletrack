'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBarn } from '@/contexts/BarnContext';
import { useHorse } from '@/hooks/useData';
import { AutocompleteInput } from '@/components/ui/AutocompleteInput';
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

const sexOptions = ['Gelding', 'Mare', 'Stallion', 'Colt', 'Filly'];
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
  const { horse, isLoading, error } = useHorse(horseId);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
    stall: '',
  });

  // Fetch suggestions when barn is available
  useEffect(() => {
    if (currentBarn?.id) {
      fetch(`/api/barns/${currentBarn.id}/horses/suggestions`)
        .then((res) => res.json())
        .then((data) => {
          if (data.data) {
            setSuggestions(data.data);
          }
        })
        .catch(console.error);
    }
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
        stall: (horse as any).stall || (horse as any).stallName || '',
      });
    }
  }, [horse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.barnName.trim()) {
      alert('Barn name is required');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/barns/${currentBarn?.id}/horses/${horseId}`, {
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
      alert(err instanceof Error ? err.message : 'Failed to update horse');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/barns/${currentBarn?.id}/horses/${horseId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete horse');
      }
      
      router.push('/horses');
    } catch (err) {
      console.error('Error deleting horse:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete horse');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  if (!currentBarn) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-stone-500">Please select a barn first</p>
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
          className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Edit {horse.barnName}</h1>
          <p className="text-stone-500 mt-1">Update horse information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Photo */}
        <div className="card p-6">
          <h3 className="font-medium text-stone-900 mb-4">Profile Photo</h3>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-stone-200 flex items-center justify-center overflow-hidden">
                {horse.profilePhotoUrl ? (
                  <img src={horse.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl text-stone-400">{formData.barnName[0] || '?'}</span>
                )}
              </div>
              <button
                type="button"
                className="absolute -bottom-2 -right-2 p-2 rounded-full bg-stone-900 text-white hover:bg-stone-800 transition-all"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-sm text-stone-600">Upload a new profile photo</p>
              <button
                type="button"
                onClick={() => alert('Demo mode: Photo upload disabled')}
                className="btn-secondary btn-sm mt-2"
              >
                Change Photo
              </button>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="card p-6">
          <h3 className="font-medium text-stone-900 mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
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
                <label className="block text-sm font-medium text-stone-700 mb-1">
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
                <label className="block text-sm font-medium text-stone-700 mb-1">
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
                <label className="block text-sm font-medium text-stone-700 mb-1">
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
              <label className="block text-sm font-medium text-stone-700 mb-1">
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
                <label className="block text-sm font-medium text-stone-700 mb-1">
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
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Sex
                </label>
                <select
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                  className="input w-full"
                >
                  <option value="">Select</option>
                  {sexOptions.map((sex) => (
                    <option key={sex} value={sex}>{sex}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
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
          <h3 className="font-medium text-stone-900 mb-4">Status & Ownership</h3>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
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
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Stall
                </label>
                <input
                  type="text"
                  value={formData.stall}
                  onChange={(e) => setFormData({ ...formData, stall: e.target.value })}
                  className="input w-full"
                  placeholder="e.g., A12 or Barn 1 - Stall 5"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
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
              <label className="block text-sm font-medium text-stone-700 mb-1">
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
          <h3 className="font-medium text-stone-900 mb-4">Bio</h3>
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
              <p className="font-medium text-stone-900">Delete Horse</p>
              <p className="text-sm text-stone-600">Permanently remove this horse and all records</p>
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
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-stone-900">Delete Horse?</h3>
                <p className="text-sm text-stone-500">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-stone-600 mb-6">
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
