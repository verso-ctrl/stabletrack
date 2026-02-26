'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useBarn } from '@/contexts/BarnContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { getTierDisplayName } from '@/lib/tiers';
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
  Trees,
  Wrench,
  Heart,
  BookUser,
  Users,
} from 'lucide-react';

// Dynamically import Clerk components (only loads when Clerk is configured)
const ClerkUserButton = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.UserButton).catch(() => () => null),
  { ssr: false, loading: () => <div className="w-8 h-8 rounded-full bg-muted animate-pulse" /> }
);

import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { hasPermission, BarnRole } from '@/types';

const HorseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12c0-4-3-8-8-8-3 0-5.5 1.5-7 3.5L3 10l1 3-2 4 3 1 2-1 2 3h4l1-2 2 1 4-3c1-1 2-2.5 2-4z"/>
    <circle cx="18" cy="9" r="1"/>
  </svg>
);

// Nav items with required permissions
// Hidden for v1: Documents, Billing (code exists, just not in nav)
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: null, addOn: null },
  { href: '/horses', label: 'Horses', icon: HorseIcon, permission: 'horses:read', addOn: null },
  { href: '/calendar', label: 'Schedule', icon: Calendar, permission: 'events:read', addOn: null },
  { href: '/daily-care', label: 'Daily Care', icon: Activity, permission: 'tasks:read', addOn: null },
  { href: '/farm-maintenance', label: 'Farm Tasks', icon: Wrench, permission: 'tasks:read', addOn: null },
  { href: '/breeding', label: 'Breeding', icon: Heart, permission: 'horses:read', addOn: 'breeding' },
  { href: '/pastures', label: 'Pastures & Stalls', icon: Trees, permission: 'horses:read', addOn: null },
  { href: '/contacts', label: 'Contacts', icon: BookUser, permission: 'clients:read', addOn: null },
  { href: '/team', label: 'Team', icon: Users, permission: 'team:read', addOn: null },
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
          <p className="text-sm font-medium text-foreground">Account</p>
          <p className="text-xs text-muted-foreground">Manage profile</p>
        </div>
      </div>
    );
  }

  // Demo mode user
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
        D
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">Demo User</p>
        <p className="text-xs text-muted-foreground">demo@barnkeep.com</p>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { barns, currentBarn, setCurrentBarn, isLoading: barnsLoading, isClient } = useBarn();
  const { tier, hasAddOn } = useSubscription();
  const [barnSwitcherOpen, setBarnSwitcherOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get current role
  const currentRole = (currentBarn?.role || 'CARETAKER') as BarnRole;

  // Filter nav items based on role permissions and add-on access
  const visibleNavItems = navItems.filter(item => {
    if (!item.permission) return true;
    if (!hasPermission(currentRole, item.permission)) return false;
    if (item.addOn && !hasAddOn(item.addOn)) return false;
    return true;
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
            ? isClient ? 'bg-sky-500/10 text-sky-700' : 'bg-primary/10 text-primary' 
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
      <div className="p-4 border-b border-border/40">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="BarnKeep" width={32} height={32} className="rounded-md" />
          <span className="font-display text-lg font-semibold text-foreground tracking-tight">BarnKeep</span>
        </Link>
        
        {/* Barn Switcher */}
        <div className="relative mt-4">
          <button
            onClick={() => setBarnSwitcherOpen(!barnSwitcherOpen)}
            className="w-full flex items-center justify-between p-2.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              {barnsLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : (
                <span className="text-sm font-medium text-foreground truncate">
                  {currentBarn?.name || 'Select Barn'}
                </span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${barnSwitcherOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {barnSwitcherOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-lg shadow-card border border-border/60 overflow-hidden z-50">
              {/* Member barns section */}
              {barns.filter(b => b.accessType === 'member').length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/50">
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
                        w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50
                        ${currentBarn?.id === barn.id ? 'bg-primary/10 text-primary' : 'text-foreground'}
                      `}
                    >
                      <Building2 className="w-4 h-4" />
                      <span className="truncate flex-1 text-left">{barn.name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {barn.role === 'OWNER' ? 'Owner' : barn.role === 'MANAGER' ? 'Manager' : barn.role === 'TRAINER' ? 'Trainer' : 'Staff'}
                      </span>
                    </button>
                  ))}
                </>
              )}
              
              {/* Client barns section */}
              {barns.filter(b => b.accessType === 'client').length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/50 border-t border-border/40">
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
                        w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50
                        ${currentBarn?.id === barn.id ? 'bg-sky-500/10 text-sky-700' : 'text-foreground'}
                      `}
                    >
                      <User className="w-4 h-4" />
                      <span className="truncate flex-1 text-left">{barn.name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-700">
                        Client
                      </span>
                    </button>
                  ))}
                </>
              )}
              
              <div className="border-t border-border/40">
                <Link
                  href="/barns/new"
                  onClick={() => setBarnSwitcherOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/5"
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
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-sky-500/10 text-sky-700">
              Client View
            </span>
          </div>
        ) : tier && (
          <div className="mt-3 px-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary">
              {getTierDisplayName(tier)} Plan
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
      <div className="p-4 border-t border-border/40 space-y-1">
        {bottomNavItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}

        {/* Theme & User */}
        <div className="flex items-center justify-between pt-1">
          <UserProfile />
          <ThemeToggle />
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-card border-r border-border/40 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border/40">
        <div className="safe-top">
          <div className="flex items-center justify-between px-4 h-14">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/logo.png" alt="BarnKeep" width={32} height={32} className="rounded-md" />
              <span className="font-display font-semibold text-foreground">BarnKeep</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2.5 rounded-lg text-muted-foreground hover:bg-muted active:bg-muted/80 touch-target no-tap-highlight"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute top-0 left-0 bottom-0 w-72 bg-card flex flex-col safe-top">
            <div className="flex items-center justify-between p-4 border-b border-border/40">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                  <HorseIcon className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-display font-semibold text-foreground">BarnKeep</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-muted-foreground hover:bg-muted"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {visibleNavItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </nav>
            <div className="p-4 border-t border-border/40 space-y-1">
              {bottomNavItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
              <div className="flex items-center justify-between pt-1">
                <UserProfile />
                <ThemeToggle />
              </div>
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
    { href: '/daily-care', label: 'Care', icon: Activity },
    { href: '/calendar', label: 'Schedule', icon: Calendar },
    { href: '/settings', label: 'More', icon: Settings },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border/40 z-30">
      <div className="safe-bottom">
        <div className="flex justify-around items-center h-16 px-2">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center gap-1 flex-1 h-full py-2 rounded-lg
                  transition-colors no-tap-highlight active:scale-95 transform
                  ${isActive
                    ? 'text-primary'
                    : 'text-muted-foreground active:text-foreground'
                  }
                `}
              >
                <div className={`
                  p-1.5 rounded-full transition-colors
                  ${isActive ? 'bg-primary/10' : ''}
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
