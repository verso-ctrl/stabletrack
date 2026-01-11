'use client';

import React, { useState } from 'react';
import {
  Save,
  X,
  Calendar,
  Loader2,
  User,
  Phone,
} from 'lucide-react';
import { useBarn } from '@/contexts/BarnContext';
import { useHorses } from '@/hooks/useData';
import type { Event, EventType, CreateEventInput } from '@/types';

interface EventFormProps {
  event?: Event;
  defaultDate?: Date;
  defaultHorseId?: string;
  onSuccess?: (event: Event) => void;
  onCancel?: () => void;
}

const EVENT_TYPES: { value: EventType; label: string; icon: string }[] = [
  { value: 'FARRIER', label: 'Farrier', icon: '🔨' },
  { value: 'VET_APPOINTMENT', label: 'Vet Appointment', icon: '🩺' },
  { value: 'VACCINATION', label: 'Vaccination', icon: '💉' },
  { value: 'DENTAL', label: 'Dental', icon: '🦷' },
  { value: 'DEWORMING', label: 'Deworming', icon: '💊' },
  { value: 'TRAINING', label: 'Training', icon: '🏇' },
  { value: 'SHOW', label: 'Show/Competition', icon: '🏆' },
  { value: 'TRANSPORT', label: 'Transport', icon: '🚛' },
  { value: 'BREEDING', label: 'Breeding', icon: '🐴' },
  { value: 'OTHER', label: 'Other', icon: '📋' },
];

const FARRIER_WORK_OPTIONS = [
  'Trim only',
  'Front shoes',
  'Full set',
  'Reset shoes',
  'Corrective shoeing',
  'Therapeutic shoeing',
];

const DEWORMER_OPTIONS = [
  'Ivermectin',
  'Moxidectin',
  'Fenbendazole',
  'Pyrantel',
  'Praziquantel',
];

export function EventForm({
  event,
  defaultDate,
  defaultHorseId,
  onSuccess,
  onCancel,
}: EventFormProps) {
  const { currentBarn } = useBarn();
  const { horses } = useHorses();
  const isEditing = !!event;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateEventInput>({
    horseId: event?.horseId || defaultHorseId || '',
    type: event?.type || 'VET_APPOINTMENT',
    customType: event?.customType || '',
    title: event?.title || '',
    description: event?.description || '',
    scheduledDate: event?.scheduledDate
      ? new Date(event.scheduledDate)
      : defaultDate || new Date(),
    providerName: event?.providerName || '',
    providerPhone: event?.providerPhone || '',
    farrierWork: event?.farrierWork || '',
    dewormProduct: event?.dewormProduct || '',
    cost: event?.cost || undefined,
    notes: event?.notes || '',
    isRecurring: event?.isRecurring || false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? parseFloat(value) : undefined,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      scheduledDate: value ? new Date(value) : new Date(),
    }));
  };

  // Auto-generate title based on type and horse
  const generateTitle = () => {
    const selectedType = EVENT_TYPES.find((t) => t.value === formData.type);
    const selectedHorse = horses?.find((h) => h.id === formData.horseId);
    
    if (selectedType) {
      let title = selectedType.label;
      if (selectedHorse) {
        title += ` - ${selectedHorse.barnName}`;
      }
      setFormData((prev) => ({ ...prev, title }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentBarn) {
      setError('No barn selected');
      return;
    }

    if (!formData.title.trim() || !formData.type) {
      setError('Title and type are required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const url = isEditing
        ? `/api/barns/${currentBarn.id}/events/${event.id}`
        : `/api/barns/${currentBarn.id}/events`;

      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          horseId: formData.horseId || null,
          cost: formData.cost ? Math.round(formData.cost * 100) : null, // Convert to cents
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save event');
      }

      onSuccess?.(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      {/* Event Type */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Event Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {EVENT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, type: type.value }));
                if (!formData.title) generateTitle();
              }}
              className={`
                p-3 rounded-xl border-2 text-center transition-all
                ${formData.type === type.value
                  ? 'border-stable-500 bg-stable-50'
                  : 'border-stone-200 hover:border-stone-300'
                }
              `}
            >
              <span className="text-2xl block mb-1">{type.icon}</span>
              <span className="text-xs font-medium text-stone-700">
                {type.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Horse Selection */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Horse (optional)
        </label>
        <select
          name="horseId"
          value={formData.horseId || ''}
          onChange={handleChange}
          className="input-base"
        >
          <option value="">All horses / Barn-wide event</option>
          {horses?.map((horse) => (
            <option key={horse.id} value={horse.id}>
              {horse.barnName}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Title <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Farrier visit - Thunder"
            className="input-base flex-1"
            required
          />
          <button
            type="button"
            onClick={generateTitle}
            className="px-3 py-2 text-sm bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors"
          >
            Auto
          </button>
        </div>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="datetime-local"
              name="scheduledDate"
              value={formData.scheduledDate.toISOString().slice(0, 16)}
              onChange={handleDateChange}
              className="input-base"
              required
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
          </div>
        </div>

        {/* Cost */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Cost ($)
          </label>
          <input
            type="number"
            name="cost"
            value={formData.cost || ''}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="input-base"
          />
        </div>
      </div>

      {/* Type-specific fields */}
      {formData.type === 'FARRIER' && (
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Farrier Work
          </label>
          <select
            name="farrierWork"
            value={formData.farrierWork || ''}
            onChange={handleChange}
            className="input-base"
          >
            <option value="">Select work type</option>
            {FARRIER_WORK_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}

      {formData.type === 'DEWORMING' && (
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Dewormer Product
          </label>
          <select
            name="dewormProduct"
            value={formData.dewormProduct || ''}
            onChange={handleChange}
            className="input-base"
          >
            <option value="">Select product</option>
            {DEWORMER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Provider Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            <User className="w-4 h-4 inline mr-1" />
            Provider Name
          </label>
          <input
            type="text"
            name="providerName"
            value={formData.providerName || ''}
            onChange={handleChange}
            placeholder="e.g., Dr. Martinez"
            className="input-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            <Phone className="w-4 h-4 inline mr-1" />
            Provider Phone
          </label>
          <input
            type="tel"
            name="providerPhone"
            value={formData.providerPhone || ''}
            onChange={handleChange}
            placeholder="555-123-4567"
            className="input-base"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Additional details about this event..."
          rows={3}
          className="input-base resize-none"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes || ''}
          onChange={handleChange}
          placeholder="Internal notes..."
          rows={2}
          className="input-base resize-none"
        />
      </div>

      {/* Recurring */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isRecurring"
          id="isRecurring"
          checked={formData.isRecurring}
          onChange={handleChange}
          className="w-4 h-4 rounded border-stone-300 text-stable-600 focus:ring-stable-500"
        />
        <label htmlFor="isRecurring" className="text-sm text-stone-700">
          This is a recurring event
        </label>
      </div>

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
              {isEditing ? 'Update Event' : 'Schedule Event'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default EventForm;
