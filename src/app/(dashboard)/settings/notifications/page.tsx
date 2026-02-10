'use client';

import React, { useState, useEffect } from 'react';
import { toast } from '@/lib/toast';
import {
  Bell,
  Mail,
  Smartphone,
  Calendar,
  AlertCircle,
  Save,
  Loader2,
  Check,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export default function NotificationSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    dailyDigest: true,
    eventReminders: true,
    taskReminders: true,
    healthAlerts: true,
    medicationReminders: true,
    cogginsExpiry: true,
    teamUpdates: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const result = await response.json();
          if (result.data) {
            setSettings(prev => ({
              ...prev,
              emailNotifications: result.data.emailNotifications ?? true,
              smsNotifications: result.data.smsNotifications ?? false,
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailNotifications: settings.emailNotifications,
          smsNotifications: settings.smsNotifications,
        }),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      setSaved(true);
      toast.success('Settings saved', 'Notification preferences updated');
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Save failed', 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
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
          { label: 'Notifications' },
        ]}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Notification Settings</h1>
        <p className="text-muted-foreground mt-1">Configure how you receive alerts and reminders</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Notification Channels */}
        <div className="card p-6">
          <h3 className="font-medium text-foreground mb-4">Notification Channels</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-xl bg-background hover:bg-accent transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => toggleSetting('emailNotifications')}
                className="w-5 h-5 rounded border-border text-amber-600 focus:ring-amber-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-background hover:bg-accent transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Smartphone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Get text alerts for urgent items</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={() => toggleSetting('smsNotifications')}
                className="w-5 h-5 rounded border-border text-amber-600 focus:ring-amber-500"
              />
            </label>
          </div>
        </div>

        {/* Alert Types */}
        <div className="card p-6">
          <h3 className="font-medium text-foreground mb-4">Alert Types</h3>
          <div className="space-y-3">
            {[
              { key: 'dailyDigest', label: 'Daily Digest', desc: 'Summary of daily activities', icon: Bell },
              { key: 'eventReminders', label: 'Event Reminders', desc: 'Upcoming vet visits, farrier, etc.', icon: Calendar },
              { key: 'taskReminders', label: 'Task Reminders', desc: 'Due and overdue tasks', icon: AlertCircle },
              { key: 'healthAlerts', label: 'Health Alerts', desc: 'Abnormal health observations', icon: AlertCircle },
              { key: 'medicationReminders', label: 'Medication Reminders', desc: 'Time to give medications', icon: Bell },
              { key: 'cogginsExpiry', label: 'Coggins Expiry', desc: 'Expiring Coggins tests', icon: AlertCircle },
              { key: 'teamUpdates', label: 'Team Updates', desc: 'New members, role changes', icon: Bell },
            ].map(({ key, label, desc, icon: Icon }) => (
              <label
                key={key}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-accent transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings[key as keyof typeof settings]}
                  onChange={() => toggleSetting(key as keyof typeof settings)}
                  className="w-5 h-5 rounded border-border text-amber-600 focus:ring-amber-500"
                />
              </label>
            ))}
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
