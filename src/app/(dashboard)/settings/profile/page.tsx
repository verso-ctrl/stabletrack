'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { toast } from '@/lib/toast';
import { csrfFetch } from '@/lib/fetch';
import {
  User,
  Mail,
  Phone,
  Globe,
  Camera,
  Save,
  Loader2,
  Check,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
];

export default function ProfileSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    timezone: 'America/New_York',
    avatarUrl: null as string | null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch current user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const result = await response.json();
          if (result.data) {
            setFormData({
              firstName: result.data.firstName || '',
              lastName: result.data.lastName || '',
              email: result.data.email || '',
              phone: result.data.phone || '',
              timezone: result.data.timezone || 'America/New_York',
              avatarUrl: result.data.avatarUrl || null,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.warning('Invalid file', 'Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.warning('File too large', 'Image must be less than 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      
      setIsSaving(true);
      try {
        const response = await csrfFetch('/api/user', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            avatarBase64: base64,
            avatarFilename: file.name,
          }),
        });

        if (!response.ok) throw new Error('Failed to upload photo');

        const result = await response.json();
        setFormData(prev => ({ ...prev, avatarUrl: result.data.avatarUrl }));
        setSaved(true);
        toast.success('Photo updated', 'Profile photo saved');
        setTimeout(() => setSaved(false), 2000);
      } catch (error) {
        console.error('Error uploading photo:', error);
        toast.error('Upload failed', 'Failed to upload photo');
      } finally {
        setIsSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const response = await csrfFetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          timezone: formData.timezone,
        }),
      });

      if (!response.ok) throw new Error('Failed to save profile');

      setSaved(true);
      toast.success('Profile saved', 'Your profile has been updated');
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Save failed', 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings', href: '/settings' },
          { label: 'Profile' },
        ]}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="card p-6">
          <h3 className="font-medium text-foreground mb-4">Profile Photo</h3>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="avatar w-24 h-24 relative overflow-hidden">
                {formData.avatarUrl ? (
                  <Image src={formData.avatarUrl} alt="" fill className="object-cover" unoptimized />
                ) : (
                  <span className="text-muted-foreground text-2xl">
                    {formData.firstName?.[0] || 'U'}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                disabled={isSaving}
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Upload a new profile photo</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or GIF. Max 5MB.</p>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="card p-6">
          <h3 className="font-medium text-foreground mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="input pl-10 w-full"
                    placeholder="First name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="input pl-10 w-full"
                    placeholder="Last name"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.email}
                  className="input pl-10 w-full bg-background"
                  disabled
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input pl-10 w-full"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="card p-6">
          <h3 className="font-medium text-foreground mb-4">Preferences</h3>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Timezone</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="input pl-10 w-full appearance-none"
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
