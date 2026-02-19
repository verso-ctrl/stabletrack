import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'StableTrack - Simple Barn Management for Small Farms',
  description: 'Built for small farms and hobby barns. Track your horses, feedings, health records, and daily care — all for $25/month. No enterprise pricing, no feature walls.',
};
import {
  Check,
  ChevronRight,
  Calendar,
  FileText,
  Heart,
  Shield,
  Wheat,
  Home,
  Pill,
  ClipboardList,
} from 'lucide-react';

const HorseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12c0-4-3-8-8-8-3 0-5.5 1.5-7 3.5L3 10l1 3-2 4 3 1 2-1 2 3h4l1-2 2 1 4-3c1-1 2-2.5 2-4z"/>
    <circle cx="18" cy="9" r="1"/>
  </svg>
);

const features = [
  {
    icon: Heart,
    title: 'Health & Vet Records',
    description: 'Vaccinations, coggins, medications, daily health checks — all in one place so nothing falls through the cracks.',
  },
  {
    icon: Wheat,
    title: 'Feed Tracking',
    description: 'Set up feed programs, track daily feedings, and keep notes on supplements and dietary changes.',
  },
  {
    icon: Home,
    title: 'Stall & Pasture Assignments',
    description: 'See who\'s where at a glance. Assign stalls, rotate pastures, and track turnout schedules.',
  },
  {
    icon: Pill,
    title: 'Medication Schedules',
    description: 'Never miss a dose. Track medications, set reminders, and log when treatments are given.',
  },
  {
    icon: Calendar,
    title: 'Calendar & Tasks',
    description: 'Vet visits, farrier appointments, and daily to-dos. Keep your barn running smoothly.',
  },
  {
    icon: FileText,
    title: 'Documents & Records',
    description: 'Store registration papers, coggins, and photos. Access everything from your phone.',
  },
];

const addOns = [
  { name: 'Breeding Tracker', description: 'Heat cycles, breeding records, and foaling management.', available: true, price: '$10/mo' },
  { name: 'Training & Lessons', description: 'Training logs, lesson scheduling, and competition tracking.', available: false },
  { name: 'Client & Billing', description: 'Invoicing, payments, and recurring billing for boarders.', available: false },
  { name: 'Team Management', description: 'Multi-user access with role-based permissions.', available: false },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
                <HorseIcon className="w-4 h-4" />
              </div>
              <span className="font-display font-semibold text-lg text-foreground tracking-tight">StableTrack</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-[1.1] tracking-tight">
              Barn management that doesn't break the bank.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
              Built for small farms and hobby barns. Track your horses, feedings, health records, and daily care — starting at just $25/month.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Start your free trial
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center px-6 py-3 text-foreground font-medium rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                See plans &amp; pricing
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              14-day free trial. No contracts. Cancel anytime.
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 lg:mt-24">
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-card">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border-b border-border/40">
                <div className="w-2 h-2 rounded-full bg-red-400/80" />
                <div className="w-2 h-2 rounded-full bg-amber-400/80" />
                <div className="w-2 h-2 rounded-full bg-emerald-400/80" />
              </div>
              <div className="p-6 bg-muted/20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Your Horses', value: '6' },
                    { label: 'Upcoming Events', value: '3' },
                    { label: 'Tasks Today', value: '4' },
                    { label: 'Health Alerts', value: '1' },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg bg-card border border-border/40 p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                      <p className="text-2xl font-display font-semibold text-foreground mt-1">{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 rounded-lg bg-card border border-border/40 p-4 h-40" />
                  <div className="rounded-lg bg-card border border-border/40 p-4 h-40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Pricing Callout */}
      <section className="py-12 border-y border-border/40 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <p className="font-display text-3xl font-semibold text-foreground">From $25<span className="text-lg text-muted-foreground">/mo</span></p>
              <p className="text-sm text-muted-foreground mt-0.5">Plans for every farm size</p>
            </div>
            <div>
              <p className="font-display text-3xl font-semibold text-foreground">14 days free</p>
              <p className="text-sm text-muted-foreground mt-0.5">Try everything, risk-free</p>
            </div>
            <div>
              <p className="font-display text-3xl font-semibold text-foreground">Cancel anytime</p>
              <p className="text-sm text-muted-foreground mt-0.5">No contracts, no commitments</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
              Everything your small farm needs
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              No complicated setup. No features you'll never use. Just the tools that actually matter for day-to-day barn life.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-lg border border-border/60 bg-card hover:border-border transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-medium text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
              Up and running in minutes
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              No training required. If you can use your phone, you can use StableTrack.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              { step: '01', title: 'Create your barn', description: 'Sign up and set up your barn profile. Takes about 2 minutes.' },
              { step: '02', title: 'Add your horses', description: 'Add each horse with their details, feed info, and health records.' },
              { step: '03', title: 'Start managing', description: 'Assign stalls, log feedings, track medications, and stay organized.' },
            ].map((item) => (
              <div key={item.step}>
                <span className="text-sm font-medium text-primary">{item.step}</span>
                <h3 className="font-display font-medium text-foreground mt-2">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-Ons Preview */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
              Need more? Add it on.
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              The core plan covers daily barn life. When you're ready for more, add only what you need.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {addOns.map((addon) => (
              <div
                key={addon.name}
                className={`p-5 rounded-lg border bg-card ${addon.available ? 'border-primary/30' : 'border-border/60 opacity-70'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  <h3 className="font-display font-medium text-foreground text-sm">{addon.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{addon.description}</p>
                {addon.available ? (
                  <p className="mt-3 text-xs font-medium text-primary">Starting at {addon.price}</p>
                ) : (
                  <p className="mt-3 text-xs font-medium text-muted-foreground">Coming Soon</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
                Your data is safe with us
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                We take security seriously so you can focus on your horses.
              </p>
              <ul className="mt-8 space-y-3">
                {['256-bit SSL encryption', 'Daily automated backups', 'Your data is always yours', 'Cancel anytime and export everything'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-muted-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="w-48 h-48 rounded-2xl bg-primary/5 flex items-center justify-center">
                <Shield className="w-24 h-24 text-primary/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border/40">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
            Your barn deserves better than a spreadsheet.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Try StableTrack free for 14 days. Plans start at $25/month.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Start your free trial
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/40 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 md:gap-12">
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
                  <HorseIcon className="w-4 h-4" />
                </div>
                <span className="font-display font-semibold text-foreground">StableTrack</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                Simple barn management for small farms.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground text-sm">Product</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground text-sm">Company</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground text-sm">Legal</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} StableTrack. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
