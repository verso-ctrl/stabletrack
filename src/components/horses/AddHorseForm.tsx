'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { useCurrentBarn } from '@/contexts/BarnContext';
import type { HorseSex, HorseStatus } from '@/types';

const horseSchema = z.object({
  barnName: z.string().min(1, 'Name is required').max(100),
  registeredName: z.string().max(200).optional(),
  breed: z.string().max(100).optional(),
  color: z.string().max(50).optional(),
  dateOfBirth: z.string().optional(),
  sex: z.enum(['MARE', 'GELDING', 'STALLION', 'COLT', 'FILLY']).optional(),
  heightHands: z.number().min(8).max(20).optional(),
  microchipNumber: z.string().max(50).optional(),
  status: z.enum(['ACTIVE', 'LAYUP', 'RETIRED', 'SOLD', 'DECEASED', 'LEASED_OUT']).optional(),
  ownerName: z.string().max(200).optional(),
  ownerEmail: z.string().email().max(200).optional().or(z.literal('')),
  ownerPhone: z.string().max(30).optional(),
});

type HorseFormData = z.infer<typeof horseSchema>;

interface AddHorseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (horse: any) => void;
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
  { value: 'LAYUP', label: 'On Layup' },
  { value: 'RETIRED', label: 'Retired' },
  { value: 'LEASED_OUT', label: 'Leased Out' },
];

const BREED_OPTIONS = [
  'American Paint Horse',
  'American Quarter Horse',
  'Appaloosa',
  'Arabian',
  'Belgian',
  'Clydesdale',
  'Dutch Warmblood',
  'Friesian',
  'Hanoverian',
  'Holsteiner',
  'Irish Sport Horse',
  'Morgan',
  'Mustang',
  'Oldenburg',
  'Percheron',
  'Saddlebred',
  'Standardbred',
  'Tennessee Walker',
  'Thoroughbred',
  'Trakehner',
  'Warmblood',
  'Welsh Pony',
  'Other',
];

export function AddHorseForm({ open, onOpenChange, onSuccess }: AddHorseFormProps) {
  const { barn } = useCurrentBarn();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<HorseFormData>({
    resolver: zodResolver(horseSchema),
    defaultValues: {
      status: 'ACTIVE',
    },
  });

  const onSubmit = async (data: HorseFormData) => {
    if (!barn) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/barns/${barn.id}/horses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create horse');
      }

      reset();
      onOpenChange(false);
      onSuccess?.(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Horse</DialogTitle>
          <DialogDescription>
            Add a horse to your barn. You can add more details later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Basic Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nickname *"
                placeholder="Thunder"
                error={errors.barnName?.message}
                {...register('barnName')}
              />

              <Input
                label="Registered Name"
                placeholder="Thunder's Lightning Strike"
                error={errors.registeredName?.message}
                {...register('registeredName')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  Breed
                </label>
                <Select
                  value={watch('breed')}
                  onValueChange={(value) => setValue('breed', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select breed" />
                  </SelectTrigger>
                  <SelectContent>
                    {BREED_OPTIONS.map((breed) => (
                      <SelectItem key={breed} value={breed}>
                        {breed}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Input
                label="Color"
                placeholder="Bay, Chestnut, Grey..."
                error={errors.color?.message}
                {...register('color')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  Sex
                </label>
                <Select
                  value={watch('sex')}
                  onValueChange={(value) => setValue('sex', value as HorseSex)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEX_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Input
                type="date"
                label="Date of Birth"
                error={errors.dateOfBirth?.message}
                {...register('dateOfBirth')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="number"
                step="0.1"
                min="8"
                max="20"
                label="Height (hands)"
                placeholder="16.2"
                error={errors.heightHands?.message}
                {...register('heightHands', { valueAsNumber: true })}
              />

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  Status
                </label>
                <Select
                  value={watch('status') || 'ACTIVE'}
                  onValueChange={(value) => setValue('status', value as HorseStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Owner Info */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Owner Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Owner Name"
                placeholder="John Smith"
                error={errors.ownerName?.message}
                {...register('ownerName')}
              />

              <Input
                label="Owner Email"
                type="email"
                placeholder="john@example.com"
                error={errors.ownerEmail?.message}
                {...register('ownerEmail')}
              />

              <Input
                label="Owner Phone"
                type="tel"
                placeholder="(555) 123-4567"
                error={errors.ownerPhone?.message}
                {...register('ownerPhone')}
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Additional Information</h3>

            <Input
              label="Microchip Number"
              placeholder="985141001234567"
              error={errors.microchipNumber?.message}
              {...register('microchipNumber')}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Add Horse
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
