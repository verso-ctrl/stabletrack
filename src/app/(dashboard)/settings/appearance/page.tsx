'use client';

import React, { useState } from 'react';
import { toast } from '@/lib/toast';
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Check,
  Save,
  Loader2,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

const themeColors = [
  { id: 'amber', name: 'Amber', color: 'bg-amber-500' },
  { id: 'blue', name: 'Blue', color: 'bg-blue-500' },
  { id: 'green', name: 'Green', color: 'bg-green-500' },
  { id: 'purple', name: 'Purple', color: 'bg-purple-500' },
  { id: 'rose', name: 'Rose', color: 'bg-rose-500' },
  { id: 'stone', name: 'Stone', color: 'bg-stone-500' },
];

const fontOptions = [
  { id: 'default', name: 'Default', sample: 'The quick brown fox' },
  { id: 'modern', name: 'Modern', sample: 'The quick brown fox' },
  { id: 'classic', name: 'Classic', sample: 'The quick brown fox' },
];

export default function AppearanceSettingsPage() {
  const [theme, setTheme] = useState('system');
  const [accentColor, setAccentColor] = useState('amber');
  const [fontSize, setFontSize] = useState('medium');
  const [compactMode, setCompactMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      toast.info('Demo Mode', 'Appearance settings are not saved in demo mode');
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings', href: '/settings' },
          { label: 'Appearance' },
        ]}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Appearance</h1>
        <p className="text-muted-foreground mt-1">Customize how BarnKeep looks for you</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Theme */}
        <div className="card p-6">
          <h3 className="font-medium text-foreground mb-4">Theme</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'light', name: 'Light', icon: Sun },
              { id: 'dark', name: 'Dark', icon: Moon },
              { id: 'system', name: 'System', icon: Monitor },
            ].map((option) => {
              const Icon = option.icon;
              const isSelected = theme === option.id;
              
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTheme(option.id)}
                  className={`
                    p-4 rounded-xl border-2 transition-all text-center
                    ${isSelected 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-border hover:border-border'
                    }
                  `}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-amber-600' : 'text-muted-foreground'}`} />
                  <p className={`font-medium ${isSelected ? 'text-amber-700' : 'text-muted-foreground'}`}>
                    {option.name}
                  </p>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            You can also toggle dark mode from the sidebar.
          </p>
        </div>

        {/* Accent Color */}
        <div className="card p-6">
          <h3 className="font-medium text-foreground mb-4">Accent Color</h3>
          <div className="flex flex-wrap gap-3">
            {themeColors.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => setAccentColor(color.id)}
                className={`
                  relative w-12 h-12 rounded-xl ${color.color} transition-all
                  ${accentColor === color.id ? 'ring-2 ring-offset-2 ring-foreground' : ''}
                `}
                title={color.name}
              >
                {accentColor === color.id && (
                  <Check className="w-5 h-5 text-white absolute inset-0 m-auto" />
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Color customization coming soon. Currently using Amber theme.
          </p>
        </div>

        {/* Font Size */}
        <div className="card p-6">
          <h3 className="font-medium text-foreground mb-4">Font Size</h3>
          <div className="space-y-2">
            {[
              { id: 'small', name: 'Small', description: 'Compact text size' },
              { id: 'medium', name: 'Medium', description: 'Default text size' },
              { id: 'large', name: 'Large', description: 'Larger text for easier reading' },
            ].map((option) => (
              <label
                key={option.id}
                className={`
                  flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all
                  ${fontSize === option.id ? 'bg-amber-50 border-2 border-amber-500' : 'bg-background border-2 border-transparent hover:bg-accent'}
                `}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="fontSize"
                    value={option.id}
                    checked={fontSize === option.id}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <p className="font-medium text-foreground">{option.name}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Display Options */}
        <div className="card p-6">
          <h3 className="font-medium text-foreground mb-4">Display Options</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-xl bg-background cursor-pointer">
              <div>
                <p className="font-medium text-foreground">Compact Mode</p>
                <p className="text-sm text-muted-foreground">Show more content with smaller spacing</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={compactMode}
                  onChange={(e) => setCompactMode(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-all ${compactMode ? 'bg-amber-500' : 'bg-border'}`}>
                  <div className={`w-5 h-5 rounded-full bg-card shadow transform transition-all ${compactMode ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} />
                </div>
              </div>
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-background cursor-pointer">
              <div>
                <p className="font-medium text-foreground">Reduce Motion</p>
                <p className="text-sm text-muted-foreground">Minimize animations throughout the app</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                />
                <div className="w-11 h-6 rounded-full bg-border">
                  <div className="w-5 h-5 rounded-full bg-card shadow transform translate-x-0.5 mt-0.5" />
                </div>
              </div>
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-background cursor-pointer">
              <div>
                <p className="font-medium text-foreground">Show Horse Photos in Lists</p>
                <p className="text-sm text-muted-foreground">Display profile photos in horse lists</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  defaultChecked
                  className="sr-only"
                />
                <div className="w-11 h-6 rounded-full bg-amber-500">
                  <div className="w-5 h-5 rounded-full bg-card shadow transform translate-x-5 mt-0.5" />
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Preview */}
        <div className="card p-6 bg-background">
          <h3 className="font-medium text-foreground mb-4">Preview</h3>
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100" />
              <div>
                <p className="font-semibold text-foreground">Thunder</p>
                <p className="text-sm text-muted-foreground">16.2h Thoroughbred Gelding</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              This is how text and components will appear with your selected settings.
            </p>
          </div>
        </div>

        {/* Submit */}
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
