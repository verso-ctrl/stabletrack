'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCurrentBarn } from '@/contexts/BarnContext';
import { ArrowLeft, Loader2, Upload, X, Camera } from 'lucide-react';
import { AutocompleteInput } from '@/components/ui/AutocompleteInput';
import type { HorseSex, HorseStatus } from '@/types';

interface Suggestions {
  breeds: string[];
  colors: string[];
  owners: string[];
  markings: string[];
}

export default function NewHorsePage() {
  const router = useRouter();
  const { barn } = useCurrentBarn();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<Suggestions>({
    breeds: [],
    colors: [],
    owners: [],
    markings: [],
  });
  const [stalls, setStalls] = useState<Array<{ id: string; name: string; section: string | null }>>([]);

  const [formData, setFormData] = useState({
    barnName: '',
    registeredName: '',
    breed: '',
    color: '',
    markings: '',
    sex: '' as HorseSex | '',
    dateOfBirth: '',
    heightHands: '',
    microchipNumber: '',
    status: 'ACTIVE' as HorseStatus,
    ownerName: '',
    stallId: '',
  });

  // Fetch suggestions and stalls when barn is available
  useEffect(() => {
    if (barn?.id) {
      // Fetch suggestions
      fetch(`/api/barns/${barn.id}/horses/suggestions`)
        .then((res) => res.json())
        .then((data) => {
          if (data.data) {
            setSuggestions(data.data);
          }
        })
        .catch(console.error);

      // Fetch available stalls
      fetch(`/api/barns/${barn.id}/stalls?available=true`)
        .then((res) => res.json())
        .then((data) => {
          if (data.data) {
            setStalls(data.data);
          }
        })
        .catch(console.error);
    }
  }, [barn?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!barn) {
      setError('No barn selected');
      return;
    }

    if (!formData.barnName.trim()) {
      setError('Horse name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/barns/${barn.id}/horses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          heightHands: formData.heightHands ? parseFloat(formData.heightHands) : undefined,
          sex: formData.sex || undefined,
          stallId: formData.stallId || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create horse');
      }

      const horseId = result.data.id;

      // Upload photo if one was selected
      if (photoFile) {
        const photoFormData = new FormData();
        photoFormData.append('file', photoFile);
        photoFormData.append('barnId', barn.id);
        photoFormData.append('horseId', horseId);
        photoFormData.append('type', 'photo');
        photoFormData.append('isPrimary', 'true');

        const photoResponse = await fetch('/api/storage/upload', {
          method: 'POST',
          body: photoFormData,
        });

        if (!photoResponse.ok) {
          console.error('Failed to upload photo, but horse was created');
        }
      }

      router.push(`/horses/${horseId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFieldChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/horses"
          className="p-2 rounded-xl hover:bg-stone-100 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Add New Horse</h1>
          <p className="text-stone-500">Enter your horse's information</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Photo Upload */}
        <div className="flex justify-center">
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setPhotoFile(file);
                const reader = new FileReader();
                reader.onload = (e) => {
                  setPhotoPreview(e.target?.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
            className="hidden"
          />
          {photoPreview ? (
            <div className="relative w-32 h-32">
              <img 
                src={photoPreview} 
                alt="Preview" 
                className="w-full h-full object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={() => {
                  setPhotoPreview(null);
                  setPhotoFile(null);
                  if (photoInputRef.current) {
                    photoInputRef.current.value = '';
                  }
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="absolute bottom-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white"
              >
                <Camera className="w-4 h-4 text-stone-600" />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => photoInputRef.current?.click()}
              className="w-32 h-32 rounded-xl bg-stone-100 border-2 border-dashed border-stone-300 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-stone-50 hover:border-emerald-400 transition-all"
            >
              <Upload className="w-8 h-8 text-stone-400" />
              <span className="text-xs text-stone-500">Add Photo</span>
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Barn Name *</label>
            <input
              type="text"
              name="barnName"
              value={formData.barnName}
              onChange={handleChange}
              placeholder="e.g., Thunder"
              className="input"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">Registered Name</label>
            <input
              type="text"
              name="registeredName"
              value={formData.registeredName}
              onChange={handleChange}
              placeholder="e.g., Thunder's Lightning Strike"
              className="input"
            />
          </div>

          <div>
            <label className="label">Breed</label>
            <AutocompleteInput
              value={formData.breed}
              onChange={handleFieldChange('breed')}
              suggestions={suggestions.breeds}
              placeholder="e.g., Thoroughbred"
              className="input"
            />
          </div>

          <div>
            <label className="label">Color</label>
            <AutocompleteInput
              value={formData.color}
              onChange={handleFieldChange('color')}
              suggestions={suggestions.colors}
              placeholder="e.g., Bay"
              className="input"
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">Markings</label>
            <AutocompleteInput
              value={formData.markings}
              onChange={handleFieldChange('markings')}
              suggestions={suggestions.markings}
              placeholder="e.g., Star, Four White Socks"
              className="input"
            />
          </div>

          <div>
            <label className="label">Sex</label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              className="input"
            >
              <option value="">Select...</option>
              <option value="MARE">Mare</option>
              <option value="GELDING">Gelding</option>
              <option value="STALLION">Stallion</option>
              <option value="COLT">Colt</option>
              <option value="FILLY">Filly</option>
            </select>
          </div>

          <div>
            <label className="label">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="label">Height (hands)</label>
            <input
              type="number"
              name="heightHands"
              value={formData.heightHands}
              onChange={handleChange}
              placeholder="e.g., 16.2"
              step="0.1"
              min="10"
              max="20"
              className="input"
            />
          </div>

          <div>
            <label className="label">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input"
            >
              <option value="ACTIVE">Active</option>
              <option value="LAYUP">Layup</option>
              <option value="RETIRED">Retired</option>
            </select>
          </div>

          <div>
            <label className="label">Stall Assignment</label>
            <select
              name="stallId"
              value={formData.stallId}
              onChange={handleChange}
              className="input"
            >
              <option value="">No stall assigned</option>
              {stalls.map((stall) => (
                <option key={stall.id} value={stall.id}>
                  {stall.section ? `${stall.section} - ${stall.name}` : stall.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Additional Info */}
        <div className="border-t border-stone-200 pt-6">
          <h3 className="font-semibold text-stone-900 mb-4">Additional Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Microchip Number</label>
              <input
                type="text"
                name="microchipNumber"
                value={formData.microchipNumber}
                onChange={handleChange}
                placeholder="Enter microchip number"
                className="input"
              />
            </div>

            <div>
              <label className="label">Owner Name</label>
              <AutocompleteInput
                value={formData.ownerName}
                onChange={handleFieldChange('ownerName')}
                suggestions={suggestions.owners}
                placeholder="Enter owner name"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
          <Link href="/horses" className="btn-secondary btn-md">
            Cancel
          </Link>
          <button 
            type="submit" 
            className="btn-primary btn-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Add Horse'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
