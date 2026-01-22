'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Settings,
  Bell,
  Search,
  Plus,
  Menu,
  X,
  ChevronDown,
  Building2,
  Users,
  BarChart3,
  CreditCard,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBarn } from '@/contexts/BarnContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from '@/lib/toast';

// Demo user (no Clerk in demo mode)
const demoUser = {
  firstName: 'Demo',
  lastName: 'User',
  imageUrl: null,
};

// Horse icon
const HorseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12c0-4-3-8-8-8-3 0-5.5 1.5-7 3.5L3 10l1 3-2 4 3 1 2-1 2 3h4l1-2 2 1 4-3c1-1 2-2.5 2-4z"/>
    <circle cx="18" cy="9" r="1"/>
  </svg>
);

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Horses', href: '/horses', icon: HorseIcon },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Team', href: '/team', icon: Users },
];

const settingsNav = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Billing', href: '/settings/billing', icon: CreditCard },
];

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const user = demoUser; // Demo mode
  const { barns, currentBarn, setCurrentBarn, isLoading: barnsLoading } = useBarn();
  const { tier } = useSubscription();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [barnSwitcherOpen, setBarnSwitcherOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-stone-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-stone-200">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">ST</span>
              </div>
              <span className="text-xl font-semibold text-stone-900">
                StableTrack
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barn Switcher */}
          <div className="p-4 border-b border-stone-200">
            <div className="relative">
              <button
                onClick={() => setBarnSwitcherOpen(!barnSwitcherOpen)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-stone-900 text-sm">
                      {currentBarn?.name || 'Select Barn'}
                    </p>
                    <p className="text-xs text-stone-500">
                      {currentBarn?.inviteCode || '—'}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-stone-400 transition-transform',
                    barnSwitcherOpen && 'rotate-180'
                  )}
                />
              </button>

              {/* Barn dropdown */}
              {barnSwitcherOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-stone-200 shadow-lg z-10 py-2">
                  {barns.map((barn) => (
                    <button
                      key={barn.id}
                      onClick={() => {
                        setCurrentBarn(barn);
                        setBarnSwitcherOpen(false);
                      }}
                      className={cn(
                        'w-full px-4 py-2 text-left hover:bg-stone-50 flex items-center justify-between',
                        barn.id === currentBarn?.id && 'bg-amber-50'
                      )}
                    >
                      <span className="text-sm font-medium text-stone-700">
                        {barn.name}
                      </span>
                      <span className="text-xs text-stone-400">
                        {barn.horseCount} horses
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-stone-100 mt-2 pt-2 px-4">
                    <Link
                      href="/barns/new"
                      className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 py-1"
                    >
                      <Plus className="w-4 h-4" />
                      Create new barn
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-stone-200">
              {settingsNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Subscription badge */}
          <div className="p-4 border-t border-stone-200">
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-amber-800">
                  {tier} Plan
                </span>
                {tier === 'FREE' && (
                  <Link
                    href="/settings/billing"
                    className="text-xs font-medium text-amber-600 hover:text-amber-700"
                  >
                    Upgrade
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* User */}
          <div className="p-4 border-t border-stone-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
                <span className="text-stone-600 font-medium">
                  {user?.firstName?.[0] || 'D'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-stone-500 truncate">
                  {currentBarn?.role || 'Owner'}
                </p>
              </div>
              <button
                onClick={() => toast.info('Demo Mode', 'Sign out is disabled in demo mode')}
                className="p-2 rounded-lg hover:bg-stone-100 text-stone-400"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-stone-200">
          <div className="flex items-center justify-between h-full px-4 lg:px-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-stone-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className="flex-1 max-w-xl mx-4 lg:mx-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search horses, events..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-100 border-0 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="relative p-2 rounded-xl hover:bg-stone-100 transition-colors">
                <Bell className="w-5 h-5 text-stone-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <Link
                href="/horses/new"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Quick Add
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
