'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useBarn } from '@/contexts/BarnContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import {
  LayoutDashboard,
  Calendar,
  Settings,
  ChevronDown,
  Plus,
  Building2,
  Menu,
  X,
  Loader2,
  Activity,
  User,
} from 'lucide-react';

// Dynamically import Clerk components (only loads when Clerk is configured)
const ClerkUserButton = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.UserButton).catch(() => () => null),
  { ssr: false, loading: () => <div className="w-8 h-8 rounded-full bg-stone-200 animate-pulse" /> }
);

import { hasPermission, BarnRole } from '@/types';

const HorseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12c0-4-3-8-8-8-3 0-5.5 1.5-7 3.5L3 10l1 3-2 4 3 1 2-1 2 3h4l1-2 2 1 4-3c1-1 2-2.5 2-4z"/>
    <circle cx="18" cy="9" r="1"/>
  </svg>
);

// Nav items with required permissions
// v1 SIMPLIFIED: Core features only
// Hidden for v1: Team, Documents, Billing (code exists, just not in nav)
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: null },
  { href: '/horses', label: 'Horses', icon: HorseIcon, permission: 'horses:read' },
  { href: '/calendar', label: 'Schedule', icon: Calendar, permission: 'events:read' },
  { href: '/daily-care', label: 'Daily Care', icon: Activity, permission: 'tasks:read' },
  { href: '/clients', label: 'Clients', icon: User, permission: 'clients:read' },
];

const bottomNavItems = [
  { href: '/settings', label: 'Settings', icon: Settings },
  // Help hidden for v1 - links are placeholder
];

function UserProfile() {
  const [isClerkReady, setIsClerkReady] = useState(false);

  useEffect(() => {
    // Only check Clerk config on client side
    const configured = 
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('your_key');
    setIsClerkReady(!!configured);
  }, []);

  if (isClerkReady) {
    return (
      <div className="flex items-center gap-3 p-2">
        <ClerkUserButton 
          afterSignOutUrl="/sign-in"
          appearance={{
            elements: {
              avatarBox: 'w-8 h-8',
            },
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-900">Account</p>
          <p className="text-xs text-stone-500">Manage profile</p>
        </div>
      </div>
    );
  }

  // Demo mode user
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-100 transition-colors">
      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-semibold text-amber-700">
        D
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-900">Demo User</p>
        <p className="text-xs text-stone-500">demo@stabletrack.com</p>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { barns, currentBarn, setCurrentBarn, isLoading: barnsLoading, isClient } = useBarn();
  const { tier } = useSubscription();
  const [barnSwitcherOpen, setBarnSwitcherOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get current role
  const currentRole = (currentBarn?.role || 'CARETAKER') as BarnRole;

  // Filter nav items based on role permissions
  const visibleNavItems = navItems.filter(item => {
    if (!item.permission) return true; // Always show items without permission requirement
    return hasPermission(currentRole, item.permission);
  });

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: any }) => {
    const isActive = pathname === href || pathname?.startsWith(href + '/');
    
    return (
      <Link
        href={href}
        onClick={() => setMobileMenuOpen(false)}
        className={`
          flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
          ${isActive 
            ? isClient ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700' 
            : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }
        `}
      >
        <Icon className="w-[18px] h-[18px]" />
        {label}
      </Link>
    );
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-stone-200">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <HorseIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-stone-900">StableTrack</span>
        </Link>
        
        {/* Barn Switcher */}
        <div className="relative mt-4">
          <button
            onClick={() => setBarnSwitcherOpen(!barnSwitcherOpen)}
            className="w-full flex items-center justify-between p-2.5 rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="w-4 h-4 text-stone-500 flex-shrink-0" />
              {barnsLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
              ) : (
                <span className="text-sm font-medium text-stone-900 truncate">
                  {currentBarn?.name || 'Select Barn'}
                </span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${barnSwitcherOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {barnSwitcherOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-stone-200 overflow-hidden z-50">
              {/* Member barns section */}
              {barns.filter(b => b.accessType === 'member').length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-xs font-medium text-stone-400 uppercase tracking-wider bg-stone-50">
                    Your Barns
                  </div>
                  {barns.filter(b => b.accessType === 'member').map((barn) => (
                    <button
                      key={barn.id}
                      onClick={() => {
                        setCurrentBarn(barn);
                        setBarnSwitcherOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-stone-50
                        ${currentBarn?.id === barn.id ? 'bg-amber-50 text-amber-700' : 'text-stone-700'}
                      `}
                    >
                      <Building2 className="w-4 h-4" />
                      <span className="truncate flex-1 text-left">{barn.name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-stone-100 text-stone-500">
                        {barn.role === 'OWNER' ? 'Owner' : barn.role === 'MANAGER' ? 'Manager' : barn.role === 'TRAINER' ? 'Trainer' : 'Staff'}
                      </span>
                    </button>
                  ))}
                </>
              )}
              
              {/* Client barns section */}
              {barns.filter(b => b.accessType === 'client').length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-xs font-medium text-stone-400 uppercase tracking-wider bg-stone-50 border-t border-stone-100">
                    Client Access
                  </div>
                  {barns.filter(b => b.accessType === 'client').map((barn) => (
                    <button
                      key={barn.id}
                      onClick={() => {
                        setCurrentBarn(barn);
                        setBarnSwitcherOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-stone-50
                        ${currentBarn?.id === barn.id ? 'bg-blue-50 text-blue-700' : 'text-stone-700'}
                      `}
                    >
                      <User className="w-4 h-4" />
                      <span className="truncate flex-1 text-left">{barn.name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-600">
                        Client
                      </span>
                    </button>
                  ))}
                </>
              )}
              
              <div className="border-t border-stone-100">
                <Link
                  href="/barns/new"
                  onClick={() => setBarnSwitcherOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50"
                >
                  <Plus className="w-4 h-4" />
                  Add New Barn
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Tier Badge or Client Mode */}
        {isClient ? (
          <div className="mt-3 px-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              Client View
            </span>
          </div>
        ) : tier && (
          <div className="mt-3 px-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
              {tier} Plan
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-stone-200 space-y-1">
        {bottomNavItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}

        {/* User */}
        <UserProfile />
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-stone-200 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-stone-200 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <HorseIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-stone-900">StableTrack</span>
          </Link>
          
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg text-stone-600 hover:bg-stone-100"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute top-0 left-0 bottom-0 w-72 bg-white flex flex-col safe-top">
            <div className="flex items-center justify-between p-4 border-b border-stone-200">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                  <HorseIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-stone-900">StableTrack</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-stone-600 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </nav>
            <div className="p-4 border-t border-stone-200 space-y-1">
              {bottomNavItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
              <UserProfile />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

// Mobile bottom navigation
export function MobileBottomNav() {
  const pathname = usePathname();

  const mobileNavItems = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/horses', label: 'Horses', icon: HorseIcon },
    { href: '/daily-care', label: 'Daily Care', icon: Activity },
    { href: '/calendar', label: 'Schedule', icon: Calendar },
    { href: '/settings', label: 'More', icon: Settings },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 safe-bottom z-30">
      <div className="flex justify-around items-center h-16">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-0.5 w-16 h-full
                ${isActive ? 'text-amber-600' : 'text-stone-500'}
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
