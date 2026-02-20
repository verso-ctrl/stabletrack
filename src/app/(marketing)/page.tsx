import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimateOnScroll } from '@/components/marketing/AnimateOnScroll';

export const metadata: Metadata = {
  title: 'BarnKeep - Simple Barn Management for Small Farms',
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

// Top features get full-width image + text rows
const heroFeatures = [
  {
    icon: Heart,
    title: 'Health & Vet Records',
    description: 'Vaccinations, coggins, medications, daily health checks — all in one place so nothing falls through the cracks.',
    image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=700&q=80&auto=format',
    alt: 'Person caring for a horse in a barn aisle',
  },
  {
    icon: Wheat,
    title: 'Feed Tracking',
    description: 'Set up feed programs, track daily feedings, and keep notes on supplements and dietary changes.',
    image: 'https://images.unsplash.com/photo-1508475039033-c0112d0a87e0?w=700&q=80&auto=format',
    alt: 'Close-up of a horse eating hay',
  },
  {
    icon: Home,
    title: 'Stall & Pasture Assignments',
    description: 'See who\'s where at a glance. Assign stalls, rotate pastures, and track turnout schedules.',
    image: 'https://images.unsplash.com/photo-1504208434411-354bd06c9b68?w=700&q=80&auto=format',
    alt: 'Horses grazing in a green pasture',
  },
];

// Bottom features stay as icon cards
const cardFeatures = [
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

// Unsplash images
const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&q=80&auto=format',
  parallax1: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1920&q=80&auto=format',
  parallax2: 'https://images.unsplash.com/photo-1591557710378-7a4d52c8a7a8?w=1920&q=80&auto=format',
  howItWorks: 'https://images.unsplash.com/photo-1460134583885-95eb98e2ef85?w=800&q=80&auto=format',
  security: 'https://images.unsplash.com/photo-1605722243979-fe0be8158232?w=800&q=80&auto=format',
  cta: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=1920&q=80&auto=format',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ================================================================
          NAVIGATION
          ================================================================ */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
                <HorseIcon className="w-4 h-4" />
              </div>
              <span className="font-display font-semibold text-lg text-foreground tracking-tight">BarnKeep</span>
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

      {/* ================================================================
          HERO — Split layout with image
          ================================================================ */}
      <section className="pt-28 pb-16 lg:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-[1.1] tracking-tight">
              Barn management that doesn&apos;t break the bank.
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

          {/* Hero Image */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-muted">
            <Image
              src={IMAGES.hero}
              alt="Horses grazing in a sunlit pasture"
              fill
              className="object-cover"
              unoptimized
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
          </div>
        </div>
      </section>

      {/* ================================================================
          PRICING CALLOUT STRIP
          ================================================================ */}
      <AnimateOnScroll>
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
      </AnimateOnScroll>

      {/* ================================================================
          PARALLAX DIVIDER 1 — Barn exterior
          ================================================================ */}
      <div
        className="parallax-section h-48 sm:h-64 lg:h-80 relative"
        style={{ backgroundImage: `url('${IMAGES.parallax1}')` }}
      >
        <div className="absolute inset-0 bg-black/30 parallax-overlay" />
      </div>

      {/* ================================================================
          FEATURES — Alternating image + text rows
          ================================================================ */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll>
            <div className="max-w-2xl mb-20">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
                Everything your small farm needs
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                No complicated setup. No features you&apos;ll never use. Just the tools that actually matter for day-to-day barn life.
              </p>
            </div>
          </AnimateOnScroll>

          {/* Top 3: alternating image + text */}
          <div className="space-y-20 lg:space-y-28">
            {heroFeatures.map((feature, index) => {
              const imageFirst = index % 2 === 0;
              return (
                <AnimateOnScroll
                  key={feature.title}
                  animation={imageFirst ? 'fade-left' : 'fade-right'}
                >
                  <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                    {/* Image */}
                    <div className={`relative aspect-[4/3] rounded-2xl overflow-hidden shadow-card bg-muted ${!imageFirst ? 'lg:order-2' : ''}`}>
                      <Image
                        src={feature.image}
                        alt={feature.alt}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    {/* Text */}
                    <div className={!imageFirst ? 'lg:order-1' : ''}>
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-display text-2xl font-semibold text-foreground">{feature.title}</h3>
                      <p className="mt-3 text-muted-foreground text-lg leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </AnimateOnScroll>
              );
            })}
          </div>

          {/* Bottom 3: icon cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-20 lg:mt-28">
            {cardFeatures.map((feature, index) => (
              <AnimateOnScroll key={feature.title} animation="fade-up" delay={index * 100}>
                <div className="group p-6 rounded-xl border border-border/60 bg-card hover:border-border hover:shadow-card transition-all">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-medium text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          PARALLAX DIVIDER 2 — Barn interior
          ================================================================ */}
      <div
        className="parallax-section h-48 sm:h-64 lg:h-72 relative"
        style={{ backgroundImage: `url('${IMAGES.parallax2}')` }}
      >
        <div className="absolute inset-0 bg-black/30 parallax-overlay" />
      </div>

      {/* ================================================================
          HOW IT WORKS — Two-column with sticky side image
          ================================================================ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll>
            <div className="max-w-2xl mb-16">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
                Up and running in minutes
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                No training required. If you can use your phone, you can use BarnKeep.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Steps */}
            <div className="space-y-12">
              {[
                { step: '01', title: 'Create your barn', description: 'Sign up and set up your barn profile. Takes about 2 minutes.' },
                { step: '02', title: 'Add your horses', description: 'Add each horse with their details, feed info, and health records.' },
                { step: '03', title: 'Start managing', description: 'Assign stalls, log feedings, track medications, and stay organized.' },
              ].map((item, index) => (
                <AnimateOnScroll key={item.step} animation="fade-up" delay={index * 150}>
                  <div className="flex gap-6">
                    <span className="font-display text-5xl font-bold text-primary/15 leading-none select-none">{item.step}</span>
                    <div>
                      <h3 className="font-display text-xl font-medium text-foreground">{item.title}</h3>
                      <p className="mt-2 text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>

            {/* Side image */}
            <AnimateOnScroll animation="fade-right">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-card bg-muted lg:sticky lg:top-24">
                <Image
                  src={IMAGES.howItWorks}
                  alt="Person walking alongside a horse"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ================================================================
          ADD-ONS PREVIEW
          ================================================================ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll>
            <div className="max-w-2xl mb-16">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
                Need more? Add it on.
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Your plan covers daily barn life. When you&apos;re ready for more, add only what you need.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {addOns.map((addon, index) => (
              <AnimateOnScroll key={addon.name} animation="fade-up" delay={index * 100}>
                <div
                  className={`p-5 rounded-xl border bg-card h-full ${addon.available ? 'border-primary/30' : 'border-border/60 opacity-70'}`}
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
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          SECURITY — Image with Shield overlay
          ================================================================ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <AnimateOnScroll animation="fade-left">
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
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-right">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-card bg-muted">
                <Image
                  src={IMAGES.security}
                  alt="Peaceful barn at dusk"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/10 flex items-center justify-center">
                  <Shield className="w-20 h-20 text-white/30" />
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ================================================================
          CTA — Full-width background image
          ================================================================ */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <Image
          src={IMAGES.cta}
          alt=""
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/50 dark:bg-black/65" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <AnimateOnScroll animation="fade-up">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white tracking-tight">
              Your barn deserves better than a spreadsheet.
            </h2>
            <p className="mt-4 text-white/80 text-lg">
              Try BarnKeep free for 14 days. Plans start at $25/month.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-white text-brand-800 font-medium rounded-lg hover:bg-white/90 transition-opacity"
            >
              Start your free trial
              <ChevronRight className="w-4 h-4" />
            </Link>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ================================================================
          FOOTER
          ================================================================ */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/40 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 md:gap-12">
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
                  <HorseIcon className="w-4 h-4" />
                </div>
                <span className="font-display font-semibold text-foreground">BarnKeep</span>
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
            &copy; {new Date().getFullYear()} BarnKeep. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
