'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useBarn } from '@/contexts/BarnContext';
import { useUser } from '@clerk/nextjs';
import {
  User,
  Building2,
  ChevronRight,
  Loader2,
  Crown,
  Users,
  CreditCard,
} from 'lucide-react';

const settingsGroups = [
  {
    title: 'Personal',
    items: [
      {
        href: '/settings/profile',
        icon: User,
        label: 'Profile',
        description: 'Manage your personal information',
      },
    ],
  },
  {
    title: 'Barn Management',
    items: [
      {
        href: '/settings/barn',
        icon: Building2,
        label: 'Barn Settings',
        description: 'Update barn info and location',
      },
    ],
  },
  {
    title: 'Billing',
    items: [
      {
        href: '/settings/billing',
        icon: CreditCard,
        label: 'Subscription & Billing',
        description: 'Manage your plan and payment details',
      },
    ],
  },
];

const roleIcons: Record<string, any> = {
  OWNER: Crown,
  MANAGER: Users,
  CARETAKER: User,
  CLIENT: User,
};

const roleColors: Record<string, string> = {
  OWNER: 'bg-amber-100 text-amber-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  CARETAKER: 'bg-green-100 text-green-700',
  CLIENT: 'bg-stone-100 text-stone-700',
};

export default function SettingsPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { currentBarn } = useBarn();
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!currentBarn?.id) return;

      try {
        const response = await fetch(`/api/barns/${currentBarn.id}/subscription`);
        const data = await response.json();
        setSubscription(data);
      } catch {
        // Subscription fetch failed silently
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, [currentBarn?.id]);

  if (!isUserLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  const RoleIcon = currentBarn?.role ? roleIcons[currentBarn.role] : User;
  const roleColor = currentBarn?.role ? roleColors[currentBarn.role] : 'bg-stone-100 text-stone-700';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Settings</h1>
        <p className="text-stone-600 mt-2">Manage your account, barn, and preferences</p>
      </div>

      {/* User Info Card */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName || 'User'}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-stone-100"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center ring-4 ring-stone-100">
                <span className="text-white text-2xl font-semibold">
                  {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                </span>
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-stone-900 truncate">
                  {user?.fullName || user?.username || 'User'}
                </h2>
                <p className="text-stone-600 text-sm mt-1 truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {currentBarn && (
                    <>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${roleColor}`}>
                        <RoleIcon className="w-3.5 h-3.5" />
                        {currentBarn.role}
                      </span>
                      {!isLoadingSubscription && subscription && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border border-amber-200">
                          {subscription.displayName} Plan
                        </span>
                      )}
                    </>
                  )}
                </div>

                {currentBarn && (
                  <div className="mt-3 p-3 rounded-lg bg-stone-50 border border-stone-200">
                    <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">Current Barn</p>
                    <p className="text-sm font-semibold text-stone-900">{currentBarn.name}</p>
                  </div>
                )}
              </div>

              {/* Edit Button */}
              <Link
                href="/settings/profile"
                className="btn-secondary btn-sm flex-shrink-0"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Groups */}
      {settingsGroups.map((group) => (
        <div key={group.title}>
          <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3 px-1">
            {group.title}
          </h3>
          <div className="card divide-y divide-stone-100">
            {group.items.map((item) => {
              const ItemIcon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 p-5 hover:bg-stone-50 transition-all group"
                >
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 group-hover:from-amber-100 group-hover:to-amber-50 transition-all">
                    <ItemIcon className="w-5 h-5 text-stone-600 group-hover:text-amber-600 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-900 group-hover:text-amber-600 transition-colors">
                      {item.label}
                    </p>
                    <p className="text-sm text-stone-500 mt-0.5 line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {/* App Info */}
      <div className="card p-5 bg-gradient-to-br from-stone-50 to-white border-stone-200">
        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="text-stone-500">StableTrack Version</p>
            <p className="font-semibold text-stone-900 mt-0.5">1.0.0</p>
          </div>
          <div className="text-right">
            <p className="text-stone-500">Last Updated</p>
            <p className="font-semibold text-stone-900 mt-0.5">January 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
