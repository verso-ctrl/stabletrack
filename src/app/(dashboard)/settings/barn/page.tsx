'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Camera,
  Copy,
  RefreshCw,
  Save,
  Loader2,
  Check,
  AlertTriangle,
  Trash2,
  Users,
} from 'lucide-react';
import { useBarn } from '@/contexts/BarnContext';

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
];

export default function BarnSettingsPage() {
  const { currentBarn, refetch } = useBarn();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: '',
    email: '',
    timezone: 'America/New_York',
    logoUrl: null as string | null,
    inviteCode: '',
  });

  useEffect(() => {
    const fetchBarn = async () => {
      if (!currentBarn) return;
      
      try {
        const response = await fetch(`/api/barns/${currentBarn.id}`);
        if (response.ok) {
          const result = await response.json();
          if (result.data) {
            setFormData({
              name: result.data.name || '',
              address: result.data.address || '',
              city: result.data.city || '',
              state: result.data.state || '',
              zipCode: result.data.zipCode || '',
              country: result.data.country || 'US',
              phone: result.data.phone || '',
              email: result.data.email || '',
              timezone: result.data.timezone || 'America/New_York',
              logoUrl: result.data.logoUrl || null,
              inviteCode: result.data.inviteCode || '',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching barn:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBarn();
  }, [currentBarn]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentBarn) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      
      setIsSaving(true);
      try {
        const response = await fetch(`/api/barns/${currentBarn.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            logoBase64: base64,
            logoFilename: file.name,
          }),
        });

        if (!response.ok) throw new Error('Failed to upload logo');

        const result = await response.json();
        setFormData(prev => ({ ...prev, logoUrl: result.data.logoUrl }));
        refetch();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (error) {
        console.error('Error uploading logo:', error);
        alert('Failed to upload logo');
      } finally {
        setIsSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(formData.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateCode = async () => {
    if (!currentBarn) return;
    
    if (!confirm('Are you sure? This will invalidate the current invite code.')) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/barns/${currentBarn.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regenerateInviteCode: true }),
      });

      if (!response.ok) throw new Error('Failed to regenerate code');

      const result = await response.json();
      setFormData(prev => ({ ...prev, inviteCode: result.data.inviteCode }));
    } catch (error) {
      console.error('Error regenerating code:', error);
      alert('Failed to regenerate invite code');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBarn) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/barns/${currentBarn.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          phone: formData.phone,
          email: formData.email,
          timezone: formData.timezone,
        }),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      refetch();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBarn = async () => {
    if (!currentBarn) return;
    
    try {
      const response = await fetch(`/api/barns/${currentBarn.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete barn');

      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error deleting barn:', error);
      alert('Failed to delete barn');
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Barn Settings</h1>
        <p className="text-stone-500 mt-1">Manage your barn information and preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo */}
        <div className="card p-6">
          <h3 className="font-medium text-stone-900 mb-4">Barn Logo</h3>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-stone-100 flex items-center justify-center overflow-hidden">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-10 h-10 text-stone-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-2 rounded-full bg-stone-900 text-white hover:bg-stone-800 transition-all"
                disabled={isSaving}
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-sm text-stone-600">Upload a barn logo</p>
              <p className="text-xs text-stone-400 mt-1">Recommended: 200x200px</p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card p-6">
          <h3 className="font-medium text-stone-900 mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Barn Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input pl-10 w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input pl-10 w-full"
                  placeholder="123 Barn Lane"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">ZIP</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="input w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card p-6">
          <h3 className="font-medium text-stone-900 mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input pl-10 w-full"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input pl-10 w-full"
                  placeholder="barn@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Timezone</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
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
        </div>

        {/* Invite Code */}
        <div className="card p-6">
          <h3 className="font-medium text-stone-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Invite Code
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 p-4 bg-stone-100 rounded-xl font-mono text-lg tracking-wider">
              {formData.inviteCode}
            </div>
            <button
              type="button"
              onClick={handleCopyInviteCode}
              className="btn-secondary btn-sm flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={handleRegenerateCode}
              className="btn-secondary btn-sm flex items-center gap-2"
              disabled={isSaving}
            >
              <RefreshCw className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-xs text-stone-500 mt-2">
            Share this code with team members to let them join your barn
          </p>
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

        {/* Danger Zone */}
        <div className="card p-6 border-red-200">
          <h3 className="font-medium text-red-600 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h3>
          <div className="p-4 rounded-xl bg-red-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-stone-900">Delete Barn</p>
                <p className="text-sm text-stone-600">Permanently delete this barn and all its data</p>
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
                <h3 className="text-lg font-semibold text-stone-900">Delete Barn?</h3>
                <p className="text-sm text-stone-500">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-stone-600 mb-6">
              Are you sure you want to delete <strong>{formData.name}</strong>? All horses, 
              records, events, and team members will be permanently removed.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBarn}
                className="btn bg-red-600 text-white hover:bg-red-700 flex-1"
              >
                Delete Barn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
