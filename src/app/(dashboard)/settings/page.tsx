'use client';

import React from 'react';
import Link from 'next/link';
import { useBarn } from '@/contexts/BarnContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import {
  User,
  Building2,
  CreditCard,
  Bell,
  Shield,
  Palette,
  HelpCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

// Demo user (no Clerk in demo mode)
const demoUser = {
  firstName: 'Demo',
  lastName: 'User',
  imageUrl: null,
  email: 'demo@stabletrack.com',
};

const settingsGroups = [
  {
    title: 'Account',
    items: [
      {
        href: '/settings/profile',
        icon: User,
        label: 'Profile',
        description: 'Manage your personal information',
      },
      {
        href: '/settings/notifications',
        icon: Bell,
        label: 'Notifications',
        description: 'Configure email and push notifications',
      },
      {
        href: '/settings/security',
        icon: Shield,
        label: 'Security',
        description: 'Password and authentication settings',
      },
    ],
  },
  {
    title: 'Barn',
    items: [
      {
        href: '/settings/barn',
        icon: Building2,
        label: 'Barn Settings',
        description: 'Update barn info and preferences',
      },
      {
        href: '/settings/billing',
        icon: CreditCard,
        label: 'Billing & Subscription',
        description: 'Manage your plan and payment methods',
      },
      {
        href: '/settings/appearance',
        icon: Palette,
        label: 'Appearance',
        description: 'Customize colors and branding',
      },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        href: '/help',
        icon: HelpCircle,
        label: 'Help Center',
        description: 'Guides, FAQs, and tutorials',
        external: true,
      },
    ],
  },
];

export default function SettingsPage() {
  const user = demoUser; // Demo mode
  const { currentBarn } = useBarn();
  const { tier } = useSubscription();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Settings</h1>
        <p className="text-stone-500 mt-1">Manage your account and barn preferences</p>
      </div>

      {/* Quick Info */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="avatar avatar-xl">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-stone-500 text-xl">
                {user?.firstName?.[0] || 'U'}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-stone-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-stone-500 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="badge-neutral">{currentBarn?.role || 'Member'}</span>
              <span className="badge bg-amber-100 text-amber-700">{tier} Plan</span>
            </div>
          </div>
          <Link href="/settings/profile" className="btn-secondary btn-sm">
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Settings Groups */}
      {settingsGroups.map((group) => (
        <div key={group.title}>
          <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-3">
            {group.title}
          </h3>
          <div className="card divide-y divide-stone-100">
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 p-4 hover:bg-stone-50 transition-all"
              >
                <div className="p-2 rounded-xl bg-stone-100">
                  <item.icon className="w-5 h-5 text-stone-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-stone-900">{item.label}</p>
                  <p className="text-sm text-stone-500">{item.description}</p>
                </div>
                {(item as any).external ? (
                  <ExternalLink className="w-4 h-4 text-stone-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Danger Zone */}
      <div>
        <h3 className="text-sm font-medium text-red-500 uppercase tracking-wide mb-3">
          Danger Zone
        </h3>
        <div className="card p-4 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-stone-900">Delete Account</p>
              <p className="text-sm text-stone-500">
                Permanently delete your account and all data
              </p>
            </div>
            <button className="btn bg-red-100 text-red-700 hover:bg-red-200 btn-sm">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
