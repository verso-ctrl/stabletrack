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
  Wheat,
  Home,
  Pill,
  ClipboardList,
  X,
  Quote,
} from 'lucide-react';

// Top features get full-width image + text rows
const heroFeatures = [
  {
    icon: Heart,
    title: 'Health & Vet Records',
    description: 'Vaccinations, coggins, medications, weight tracking — all in one place. Pull up any horse\'s full health history from your phone in seconds.',
    image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=700&q=80&auto=format',
    alt: 'Person caring for a horse in a barn aisle',
  },
  {
    icon: Wheat,
    title: 'Feed Tracking & Charts',
    description: 'Set up individual feed programs for each horse. Track daily feedings, log supplements, and keep the whole team on the same page.',
    image: 'https://images.unsplash.com/photo-1508475039033-c0112d0a87e0?w=700&q=80&auto=format',
    alt: 'Close-up of a horse eating hay',
  },
  {
    icon: Home,
    title: 'Stall & Pasture Management',
    description: 'See who\'s where at a glance. Assign stalls, rotate pastures, and track turnout schedules without sticky notes on the barn door.',
    image: 'https://images.unsplash.com/photo-1504208434411-354bd06c9b68?w=700&q=80&auto=format',
    alt: 'Horses grazing in a green pasture',
  },
];

// Bottom features as icon cards (4)
const cardFeatures = [
  {
    icon: Pill,
    title: 'Medication Schedules',
    description: 'Never miss a dose. Track medications, set reminders, and log when treatments are given.',
  },
  {
    icon: Calendar,
    title: 'Calendar & Tasks',
    description: 'Vet visits, farrier appointments, and daily to-dos — all in one place so nothing slips through.',
  },
  {
    icon: FileText,
    title: 'Documents & Records',
    description: 'Store registration papers, coggins, and photos. Access everything from your phone.',
  },
  {
    icon: ClipboardList,
    title: 'Daily Care Logs',
    description: 'Log daily observations, notes, and care tasks. Keep a clear record of each horse\'s routine.',
  },
];

const testimonials = [
  {
    quote: 'Finally I know exactly what each horse has eaten and when they last had their coggins done. It\'s all right there.',
    name: 'Sarah M.',
    farm: 'Hobby barn, 4 horses',
    initial: 'S',
  },
  {
    quote: 'Way better than the whiteboard I was using. My vet loves that I can pull up records instantly during appointments.',
    name: 'Jake T.',
    farm: '4 horses',
    initial: 'J',
  },
  {
    quote: 'It\'s simple. I\'m not a tech person and I figured it out in an afternoon. My whole barn routine changed.',
    name: 'Linda R.',
    farm: 'Boarding farm, 8 horses',
    initial: 'L',
  },
];

const IMAGES = {
  parallax1: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1920&q=80&auto=format',
  howItWorks: 'https://images.unsplash.com/photo-1460134583885-95eb98e2ef85?w=800&q=80&auto=format',
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
              <Image src="/logo.png" alt="BarnKeep" width={32} height={32} className="rounded-md" />
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
          HERO — Split layout with app preview card
          ================================================================ */}
      <section className="pt-28 pb-16 lg:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div>
            <span className="inline-block text-sm font-medium text-primary bg-primary/8 px-3 py-1 rounded-full mb-5">
              Built for independent farms — not enterprise operations
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-[1.1] tracking-tight">
              Your barn, finally organized.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
              Track horses, health records, feedings, and daily care in one place. Starting at $25/month — less than a bag of grain.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Start Free Trial
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center px-6 py-3 text-foreground font-medium rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                See pricing
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required · 14-day free trial · Cancel anytime
            </p>
          </div>

          {/* App Preview Card */}
          <AnimateOnScroll animation="fade-right">
            <div className="rounded-2xl shadow-2xl border border-border bg-card overflow-hidden">
              {/* Card header */}
              <div className="bg-primary/8 px-5 py-4 border-b border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-base">
                  A
                </div>
                <div>
                  <p className="font-semibold text-foreground">Apollo</p>
                  <p className="text-xs text-muted-foreground">Bay Thoroughbred · Stall 4</p>
                </div>
                <div className="ml-auto">
                  <span className="px-2.5 py-0.5 text-xs rounded-full bg-green-100 text-green-700 font-medium dark:bg-green-900/30 dark:text-green-400">
                    Healthy
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2.5">
                    Today&apos;s Feed Schedule
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">Morning feed</span>
                      <span className="text-green-600 dark:text-green-400 font-medium text-xs">✓ Done</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">Afternoon check</span>
                      <span className="text-amber-500 font-medium text-xs">Pending</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">Evening hay</span>
                      <span className="text-muted-foreground text-xs">6:00 PM</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2.5">
                    Upcoming
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      <span className="text-foreground">Coggins due in 12 days</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                      <span className="text-foreground">Farrier visit — Mar 5</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                    <Pill className="w-3 h-3" />
                    Bute · 2g daily · Day 3 of 5
                  </span>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ================================================================
          SOCIAL PROOF STRIP
          ================================================================ */}
      <AnimateOnScroll>
        <section className="py-10 border-y border-border/40 bg-primary/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div>
                <p className="font-display text-2xl font-semibold text-foreground">$25<span className="text-base text-muted-foreground">/mo</span></p>
                <p className="text-sm text-muted-foreground mt-0.5">Plans start at</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-foreground">No setup fees</p>
                <p className="text-sm text-muted-foreground mt-0.5">Start in minutes</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-foreground">Works on mobile</p>
                <p className="text-sm text-muted-foreground mt-0.5">iOS &amp; Android</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-foreground">Cancel anytime</p>
                <p className="text-sm text-muted-foreground mt-0.5">No commitments</p>
              </div>
            </div>
          </div>
        </section>
      </AnimateOnScroll>

      {/* ================================================================
          PROBLEM STATEMENT
          ================================================================ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll>
            <div className="max-w-2xl mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
                Still managing your barn with sticky notes?
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Most barn owners patch things together with notebooks, whiteboards, and memory. It works — until it doesn&apos;t.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Pain points */}
            <AnimateOnScroll animation="fade-left">
              <div className="p-7 rounded-xl border border-border/60 bg-muted/20 h-full">
                <h3 className="font-medium text-foreground mb-5 text-sm uppercase tracking-wide">Sound familiar?</h3>
                <ul className="space-y-4">
                  {[
                    'Forgetting when vaccines are due',
                    'Medication logs in 3 different notebooks',
                    'Trying to remember who last fed who',
                    'Vet records buried in a filing cabinet',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-muted-foreground">
                      <X className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateOnScroll>

            {/* Solutions */}
            <AnimateOnScroll animation="fade-right">
              <div className="p-7 rounded-xl border border-primary/20 bg-primary/5 h-full">
                <h3 className="font-medium text-foreground mb-5 text-sm uppercase tracking-wide">This is what BarnKeep solves.</h3>
                <ul className="space-y-4">
                  {[
                    'One place for every horse\'s health history',
                    'Feed charts and medication reminders',
                    'Daily care logs the whole team can see',
                    'Documents stored and searchable from your phone',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ================================================================
          PARALLAX DIVIDER — Between problem and features
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
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
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

          {/* Alternating image + text */}
          <div className="space-y-20 lg:space-y-28">
            {heroFeatures.map((feature, index) => {
              const imageFirst = index % 2 === 0;
              return (
                <AnimateOnScroll
                  key={feature.title}
                  animation={imageFirst ? 'fade-left' : 'fade-right'}
                >
                  <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                    <div className={`relative aspect-[4/3] rounded-2xl overflow-hidden shadow-card bg-muted ${!imageFirst ? 'lg:order-2' : ''}`}>
                      <Image
                        src={feature.image}
                        alt={feature.alt}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
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

          {/* Icon cards (4) */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 lg:mt-28">
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
          TESTIMONIALS
          ================================================================ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
                Loved by horse owners everywhere
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, index) => (
              <AnimateOnScroll key={t.name} animation="fade-up" delay={index * 100}>
                <div className="p-6 rounded-xl border border-border/60 bg-card flex flex-col gap-4 h-full">
                  <Quote className="w-6 h-6 text-primary/40" />
                  <p className="text-muted-foreground leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                    <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold text-sm">
                      {t.initial}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.farm}</p>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

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
            <div className="space-y-12">
              {[
                { step: '01', title: 'Create your barn', description: 'Sign up and set up your barn profile in about 2 minutes. No complicated onboarding.' },
                { step: '02', title: 'Add your horses', description: 'Enter each horse\'s details, feed program, and health records — all in a simple form.' },
                { step: '03', title: 'Start managing', description: 'Log feedings, track medications, assign stalls, and keep your whole team in sync.' },
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
          PRICING TEASER — Two clean plan cards
          ================================================================ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
                Simple, honest pricing
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Pick the plan that fits. Both include a 14-day free trial.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Starter */}
            <AnimateOnScroll animation="fade-up">
              <div className="rounded-xl border border-border p-7 flex flex-col h-full">
                <h3 className="font-display text-xl font-semibold text-foreground">Starter</h3>
                <p className="text-sm text-muted-foreground mt-1">Perfect for hobby barns &amp; personal farms</p>
                <div className="mt-4 mb-6">
                  <span className="font-display text-4xl font-semibold text-foreground">$25</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-2 mb-8 flex-1">
                  {['Up to 10 horses', 'Feed tracking & charts', 'Health & vet records', 'Documents & photos', 'Mobile access'].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className="block w-full py-2.5 text-sm font-medium text-center rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  Start free trial
                </Link>
              </div>
            </AnimateOnScroll>

            {/* Farm */}
            <AnimateOnScroll animation="fade-up" delay={100}>
              <div className="rounded-xl border-2 border-primary/50 bg-primary/5 p-7 flex flex-col h-full">
                <h3 className="font-display text-xl font-semibold text-foreground">Farm</h3>
                <p className="text-sm text-muted-foreground mt-1">For growing operations &amp; boarding barns</p>
                <div className="mt-4 mb-6">
                  <span className="font-display text-4xl font-semibold text-foreground">$60</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-2 mb-8 flex-1">
                  {['Unlimited horses', 'Everything in Starter', 'Up to 5 team members', '50 GB document storage', 'Unlimited photos'].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className="block w-full py-2.5 text-sm font-medium text-center rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Start free trial
                </Link>
              </div>
            </AnimateOnScroll>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              See full pricing &amp; add-ons
              <ChevronRight className="w-4 h-4" />
            </Link>
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
              Your horses deserve better than a spreadsheet.
            </h2>
            <p className="mt-4 text-white/80 text-lg">
              Try BarnKeep free for 14 days. No credit card needed.
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
                <Image src="/logo.png" alt="BarnKeep" width={32} height={32} className="rounded-md" />
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
