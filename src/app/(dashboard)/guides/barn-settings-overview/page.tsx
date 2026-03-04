'use client';

import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Camera, ChevronRight, Settings, User, Bell, Building2, Shield, CreditCard } from 'lucide-react';

function Screenshot({ label, aspectRatio = 'aspect-video' }: { label: string; aspectRatio?: string }) {
  return (
    <div className={`w-full ${aspectRatio} rounded-xl border-2 border-dashed border-border bg-muted/40 flex flex-col items-center justify-center gap-3 my-6 text-center px-4`}>
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <Camera className="w-6 h-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">Screenshot coming soon</p>
      </div>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-300 my-4">
      <span className="font-semibold">Tip: </span>{children}
    </div>
  );
}

function Section({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center flex-shrink-0">
          {number}
        </span>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      <div className="pl-10 space-y-3">{children}</div>
    </section>
  );
}

export default function BarnSettingsOverviewGuide() {
  return (
    <div className="max-w-3xl space-y-8 mt-4">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Guides', href: '/guides' },
        { label: 'Barn settings overview' },
      ]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Settings className="w-4 h-4" />
          <span>Settings & Billing</span>
          <ChevronRight className="w-3 h-3" />
          <span>Article · 2 min read</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Barn settings overview</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          The Settings page is where you manage your account, barn details, and preferences. Here's a quick tour of what's available.
        </p>
      </div>

      <hr className="border-border" />

      <Section number={1} title="Opening settings">
        <p className="text-foreground/80 leading-relaxed">
          Click <strong>Settings</strong> at the bottom of the sidebar (below Guides). The Settings page opens showing your profile card at the top with your name, email, role, current plan, and barn name. Below that are three groups of settings.
        </p>
        <Screenshot label="Settings page showing user profile card and the three settings groups" />
      </Section>

      <Section number={2} title="Personal settings">
        <p className="text-foreground/80 leading-relaxed">
          The <strong>Personal</strong> group contains settings that apply to your individual account:
        </p>
        <div className="space-y-3">
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <p className="font-semibold text-foreground text-sm">Profile</p>
            </div>
            <p className="text-sm text-muted-foreground">Update your first name, last name, profile photo, and contact information. This is the information shown on your team member card and in any reports that include your name.</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <p className="font-semibold text-foreground text-sm">Appearance</p>
            </div>
            <p className="text-sm text-muted-foreground">Theme, display, and layout preferences. Toggle between light mode and dark mode (you can also toggle dark mode from the sun/moon icon at the bottom of the sidebar).</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <p className="font-semibold text-foreground text-sm">Notifications</p>
            </div>
            <p className="text-sm text-muted-foreground">Email and push notification preferences. Control what BarnKeep sends you notifications for and how you receive them.</p>
          </div>
        </div>
      </Section>

      <Section number={3} title="Barn management settings">
        <p className="text-foreground/80 leading-relaxed">
          The <strong>Barn Management</strong> group covers your barn as a whole. Some of these settings are only available to Owners and Managers:
        </p>
        <div className="space-y-3">
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <p className="font-semibold text-foreground text-sm">Barn Settings</p>
            </div>
            <p className="text-sm text-muted-foreground">Update your barn's name, street address, city, state, ZIP, phone number, email, and timezone. These details appear on printed reports and documents.</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <p className="font-semibold text-foreground text-sm">Security</p>
            </div>
            <p className="text-sm text-muted-foreground">Password management, two-factor authentication settings (if configured), and active session management. Useful if you think your account may have been accessed from an unrecognized device.</p>
          </div>
        </div>
        <Tip>Keep your barn's address and timezone up to date — these affect how dates are displayed on reports and how events are scheduled on the calendar.</Tip>
      </Section>

      <Section number={4} title="Billing settings">
        <p className="text-foreground/80 leading-relaxed">
          The <strong>Billing</strong> group has one item:
        </p>
        <div className="rounded-lg border border-border p-4 space-y-1">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <p className="font-semibold text-foreground text-sm">Billing & Plans</p>
          </div>
          <p className="text-sm text-muted-foreground">Manage your subscription plan, add-ons, and payment method. View past invoices and upgrade or downgrade your plan. Only accessible to the barn Owner.</p>
        </div>
      </Section>

      <Section number={5} title="App version info">
        <p className="text-foreground/80 leading-relaxed">
          At the very bottom of the Settings page is a small card showing the current <strong>BarnKeep version</strong> and the date it was last updated. If you're ever troubleshooting an issue with support, this version number helps the team identify what release you're running.
        </p>
      </Section>

      <hr className="border-border" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What to read next</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/upgrading-your-plan', label: 'Upgrading your plan', desc: 'How to switch plans or add the Breeding Tracker.' },
            { href: '/guides/understanding-the-dashboard', label: 'Understanding the dashboard', desc: 'A quick tour of everything on your main dashboard.' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="card p-4 flex items-start gap-3 hover:shadow-md transition-shadow">
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">{link.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{link.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            </Link>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Try it now</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/settings" className="btn-secondary btn-md text-sm">Settings →</Link>
          </div>
        </div>
      </div>

      <div className="card p-5 bg-muted/30 text-center">
        <p className="text-sm text-muted-foreground">Something not making sense?</p>
        <a href="mailto:support@barnkeep.com" className="text-sm font-medium text-primary hover:underline mt-1 inline-block">
          Email support@barnkeep.com →
        </a>
      </div>
    </div>
  );
}
