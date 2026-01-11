'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  X, 
  Upload, 
  Calendar,
  Loader2 
} from 'lucide-react';
import { useBarn } from '@/contexts/BarnContext';
import type { Horse, HorseSex, HorseStatus, CreateHorseInput } from '@/types';

interface HorseFormProps {
  horse?: Horse;
  onSuccess?: (horse: Horse) => void;
  onCancel?: () => void;
}

const SEX_OPTIONS: { value: HorseSex; label: string }[] = [
  { value: 'MARE', label: 'Mare' },
  { value: 'GELDING', label: 'Gelding' },
  { value: 'STALLION', label: 'Stallion' },
  { value: 'COLT', label: 'Colt' },
  { value: 'FILLY', label: 'Filly' },
];

const STATUS_OPTIONS: { value: HorseStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'LAYUP', label: 'Layup' },
  { value: 'RETIRED', label: 'Retired' },
  { value: 'LEASED_OUT', label: 'Leased Out' },
];

const BREED_SUGGESTIONS = [
  'Thoroughbred',
  'Quarter Horse',
  'Arabian',
  'Warmblood',
  'Hanoverian',
  'Dutch Warmblood',
  'Oldenburg',
  'Holsteiner',
  'Trakehner',
  'Paint Horse',
  'Appaloosa',
  'Morgan',
  'Tennessee Walker',
  'Friesian',
  'Andalusian',
  'Lusitano',
  'Mustang',
  'Percheron',
  'Clydesdale',
  'Shetland Pony',
];

const COLOR_SUGGESTIONS = [
  'Bay',
  'Chestnut',
  'Black',
  'Grey',
  'Palomino',
  'Buckskin',
  'Dun',
  'Roan',
  'Pinto',
  'Appaloosa',
  'Cremello',
  'Perlino',
  'Grulla',
  'Sorrel',
];

export function HorseForm({ horse, onSuccess, onCancel }: HorseFormProps) {
  const router = useRouter();
  const { currentBarn } = useBarn();
  const isEditing = !!horse;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateHorseInput>({
    barnName: horse?.barnName || '',
    registeredName: horse?.registeredName || '',
    breed: horse?.breed || '',
    color: horse?.color || '',
    dateOfBirth: horse?.dateOfBirth || undefined,
    sex: horse?.sex || undefined,
    heightHands: horse?.heightHands || undefined,
    microchipNumber: horse?.microchipNumber || '',
    status: horse?.status || 'ACTIVE',
    ownerName: horse?.ownerName || '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : undefined) : value,
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      dateOfBirth: value ? new Date(value) : undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentBarn) {
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

      const url = isEditing
        ? `/api/barns/${currentBarn.id}/horses/${horse.id}`
        : `/api/barns/${currentBarn.id}/horses`;

      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save horse');
      }

      if (onSuccess) {
        onSuccess(result.data);
      } else {
        router.push(`/horses/${result.data.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <section>
        <h3 className="text-lg font-semibold text-stone-900 mb-4">
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Barn Name */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Barn Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="barnName"
              value={formData.barnName}
              onChange={handleChange}
              placeholder="e.g., Thunder"
              className="input-base"
              required
            />
            <p className="text-xs text-stone-500 mt-1">
              The name used daily around the barn
            </p>
          </div>

          {/* Registered Name */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Registered Name
            </label>
            <input
              type="text"
              name="registeredName"
              value={formData.registeredName}
              onChange={handleChange}
              placeholder="e.g., Thunder's Lightning Strike"
              className="input-base"
            />
            <p className="text-xs text-stone-500 mt-1">
              Official registered name (if any)
            </p>
          </div>

          {/* Breed */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Breed
            </label>
            <input
              type="text"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              list="breed-suggestions"
              placeholder="Select or type breed"
              className="input-base"
            />
            <datalist id="breed-suggestions">
              {BREED_SUGGESTIONS.map((breed) => (
                <option key={breed} value={breed} />
              ))}
            </datalist>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Color
            </label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              list="color-suggestions"
              placeholder="Select or type color"
              className="input-base"
            />
            <datalist id="color-suggestions">
              {COLOR_SUGGESTIONS.map((color) => (
                <option key={color} value={color} />
              ))}
            </datalist>
          </div>

          {/* Sex */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Sex
            </label>
            <select
              name="sex"
              value={formData.sex || ''}
              onChange={handleChange}
              className="input-base"
            >
              <option value="">Select sex</option>
              {SEX_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Date of Birth
            </label>
            <div className="relative">
              <input
                type="date"
                name="dateOfBirth"
                value={
                  formData.dateOfBirth
                    ? new Date(formData.dateOfBirth).toISOString().split('T')[0]
                    : ''
                }
                onChange={handleDateChange}
                className="input-base"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
            </div>
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Height (hands)
            </label>
            <input
              type="number"
              name="heightHands"
              value={formData.heightHands || ''}
              onChange={handleChange}
              placeholder="e.g., 16.2"
              step="0.1"
              min="8"
              max="20"
              className="input-base"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-base"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Identification */}
      <section>
        <h3 className="text-lg font-semibold text-stone-900 mb-4">
          Identification
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Microchip */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Microchip Number
            </label>
            <input
              type="text"
              name="microchipNumber"
              value={formData.microchipNumber}
              onChange={handleChange}
              placeholder="Enter microchip number"
              className="input-base"
            />
          </div>

          {/* Owner */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Owner Name
            </label>
            <input
              type="text"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              placeholder="Horse owner's name"
              className="input-base"
            />
          </div>
        </div>
      </section>

      {/* Photo Upload Placeholder */}
      <section>
        <h3 className="text-lg font-semibold text-stone-900 mb-4">
          Profile Photo
        </h3>
        
        <div className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center">
          <Upload className="w-10 h-10 text-stone-400 mx-auto mb-3" />
          <p className="text-sm text-stone-600 mb-2">
            Drag and drop a photo, or click to browse
          </p>
          <p className="text-xs text-stone-400">
            PNG, JPG up to 10MB
          </p>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className="mt-4 inline-block px-4 py-2 bg-stone-100 rounded-lg text-sm font-medium text-stone-700 cursor-pointer hover:bg-stone-200 transition-colors"
          >
            Choose File
          </label>
        </div>
      </section>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        )}
        
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {isEditing ? 'Update Horse' : 'Add Horse'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default HorseForm;
