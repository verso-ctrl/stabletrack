'use client';

import React, { useState } from 'react';
import { toast } from '@/lib/toast';
import {
  Shield,
  Key,
  Smartphone,
  History,
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  Laptop,
  Globe,
} from 'lucide-react';

// Demo session data
const demoSessions = [
  {
    id: '1',
    device: 'MacBook Pro',
    browser: 'Chrome',
    location: 'Lexington, KY',
    lastActive: '2024-01-04T15:30:00Z',
    current: true,
  },
  {
    id: '2',
    device: 'iPhone 14',
    browser: 'Safari',
    location: 'Lexington, KY',
    lastActive: '2024-01-04T10:15:00Z',
    current: false,
  },
  {
    id: '3',
    device: 'Windows PC',
    browser: 'Firefox',
    location: 'Louisville, KY',
    lastActive: '2024-01-02T08:45:00Z',
    current: false,
  },
];

export default function SecuritySettingsPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Demo Mode', 'Password change is disabled in demo mode');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleLogoutAllSessions = () => {
    toast.info('Demo Mode', 'Session management is disabled in demo mode');
  };

  const handleLogoutSession = (_sessionId: string) => {
    toast.info('Demo Mode', 'Session management is disabled in demo mode');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Security Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account security</p>
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-muted">
            <Key className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Change Password</h3>
            <p className="text-sm text-muted-foreground">Update your account password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="input w-full pr-10"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="input w-full pr-10"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Must be at least 8 characters with a mix of letters, numbers, and symbols
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="input w-full"
              placeholder="Confirm new password"
            />
          </div>

          <button type="submit" className="btn-primary">
            Update Password
          </button>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Smartphone className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {twoFactorEnabled ? (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <Check className="w-4 h-4" />
                Enabled
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">Disabled</span>
            )}
            <button
              onClick={() => {
                toast.info('Demo Mode', twoFactorEnabled ? '2FA management is disabled in demo mode' : '2FA setup is disabled in demo mode');
              }}
              className={twoFactorEnabled ? 'btn-secondary btn-sm' : 'btn-primary btn-sm'}
            >
              {twoFactorEnabled ? 'Manage' : 'Enable'}
            </button>
          </div>
        </div>
        
        {!twoFactorEnabled && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Recommended</p>
                <p className="text-sm text-amber-700 mt-1">
                  Two-factor authentication adds an extra layer of security to your account by requiring 
                  a code from your phone in addition to your password.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <History className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Active Sessions</h3>
              <p className="text-sm text-muted-foreground">Manage your logged-in devices</p>
            </div>
          </div>
          <button
            onClick={handleLogoutAllSessions}
            className="btn-secondary btn-sm text-red-600 hover:bg-red-50"
          >
            Log out all
          </button>
        </div>

        <div className="space-y-3">
          {demoSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 rounded-xl bg-background"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-card border border-border">
                  <Laptop className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">
                      {session.device} • {session.browser}
                    </p>
                    {session.current && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="w-3.5 h-3.5" />
                    {session.location}
                    <span className="text-muted-foreground">•</span>
                    {new Date(session.lastActive).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
              {!session.current && (
                <button
                  onClick={() => handleLogoutSession(session.id)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Log out
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Security Checklist */}
      <div className="card p-6">
        <h3 className="font-medium text-foreground mb-4">Security Checklist</h3>
        <div className="space-y-3">
          {[
            { label: 'Strong password set', done: true },
            { label: 'Two-factor authentication', done: false },
            { label: 'Email verified', done: true },
            { label: 'Recovery email added', done: false },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`p-1 rounded-full ${item.done ? 'bg-green-100' : 'bg-muted'}`}>
                {item.done ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-border" />
                )}
              </div>
              <span className={item.done ? 'text-muted-foreground' : 'text-muted-foreground'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
