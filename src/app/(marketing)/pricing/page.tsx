'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  HelpCircle,
  ClipboardList,
  Star,
} from 'lucide-react';
import {
  STARTER_FEATURES,
  FARM_FEATURES,
  ADD_ONS,
} from '@/lib/tiers';

const HorseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12c0-4-3-8-8-8-3 0-5.5 1.5-7 3.5L3 10l1 3-2 4 3 1 2-1 2 3h4l1-2 2 1 4-3c1-1 2-2.5 2-4z"/>
    <circle cx="18" cy="9" r="1"/>
  </svg>
);

const faqs = [
  {
    question: 'Is there a horse limit?',
    answer: 'The Starter plan supports up to 10 horses. Need more? The Farm plan has no limit.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Absolutely. No contracts, no commitments. Cancel anytime and your data stays yours — you can export everything before you go.',
  },
  {
    question: 'Can I switch plans?',
    answer: 'Yes! Upgrade or downgrade anytime from Settings → Billing. Changes take effect immediately and billing is prorated.',
  },
  {
    question: 'What are add-ons?',
    answer: 'Optional features you can add to any plan. Breeding Tracker is available now — more coming soon.',
  },
  {
    question: 'Do I need a credit card for the trial?',
    answer: 'No! Start your 14-day free trial without entering any payment info. We\'ll only ask for payment if you want to continue after the trial.',
  },
];

const comingSoonAddOns = [
  { name: 'Training & Lessons', description: 'Training logs, lesson scheduling, and competition tracking.' },
  { name: 'Client & Billing', description: 'Client management, invoicing, payments, and recurring billing.' },
  { name: 'Team Management', description: 'Multi-user access, role-based permissions, and team coordination.' },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
                <HorseIcon className="w-4 h-4" />
              </div>
              <span className="font-display font-semibold text-lg text-foreground tracking-tight">StableTrack</span>
            </Link>
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

      {/* Header */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-foreground tracking-tight">
            Simple plans for every farm.
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            All plans include a 14-day free trial. Pick the size that fits your barn.
          </p>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Starter Plan */}
          <div className="rounded-xl border-2 border-border p-8 flex flex-col">
            <div className="mb-6">
              <h2 className="font-display text-xl font-semibold text-foreground">Starter</h2>
              <p className="text-sm text-muted-foreground mt-1">Perfect for small farms with a few horses.</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-display font-semibold text-foreground">$25</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            <div className="space-y-2.5 mb-8 flex-1">
              {STARTER_FEATURES.map((feature) => (
                <div key={feature} className="flex items-center gap-2.5 text-sm text-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>

            <Link
              href="/sign-up"
              className="block w-full py-3 rounded-lg text-sm font-medium text-center border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Start free trial
            </Link>
          </div>

          {/* Farm Plan */}
          <div className="relative rounded-xl border-2 border-primary/50 bg-primary/5 p-8 flex flex-col">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full">
                <Star className="w-3.5 h-3.5" />
                Best Value
              </span>
            </div>

            <div className="mb-6">
              <h2 className="font-display text-xl font-semibold text-foreground">Farm</h2>
              <p className="text-sm text-muted-foreground mt-1">For growing farms that need no limits.</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-display font-semibold text-foreground">$60</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            <div className="space-y-2.5 mb-8 flex-1">
              {FARM_FEATURES.map((feature) => (
                <div key={feature} className="flex items-center gap-2.5 text-sm text-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>

            <Link
              href="/sign-up"
              className="block w-full py-3 rounded-lg text-sm font-medium text-center bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Start free trial
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Both plans include a 14-day free trial. Switch plans anytime.
        </p>
      </section>

      {/* Add-Ons */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight">
              Optional add-ons
            </h2>
            <p className="mt-2 text-muted-foreground">
              Need more? Add features as your farm grows. Only pay for what you use.
            </p>
          </div>

          {/* Breeding Tracker - Available */}
          <div className="rounded-xl border-2 border-primary/30 bg-card p-6 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  <h3 className="font-display font-semibold text-foreground">{ADD_ONS.breeding.name}</h3>
                  <span className="text-sm font-medium text-primary">+${ADD_ONS.breeding.monthlyPriceCents / 100}/month</span>
                </div>
                <p className="text-sm text-muted-foreground">{ADD_ONS.breeding.description}</p>
                <p className="text-xs text-muted-foreground mt-1">Available on any plan.</p>
              </div>
              <Link
                href="/sign-up"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors flex-shrink-0"
              >
                Add to my plan
              </Link>
            </div>
          </div>

          {/* Coming Soon Add-Ons */}
          <div className="grid sm:grid-cols-3 gap-4">
            {comingSoonAddOns.map((addon) => (
              <div
                key={addon.name}
                className="rounded-lg border border-border/60 bg-card p-4 opacity-60"
              >
                <div className="flex items-center gap-2 mb-1">
                  <ClipboardList className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-display font-medium text-foreground text-sm">{addon.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground">Coming Soon</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight mb-8">
            Common questions
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-lg border border-border/60 bg-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <span className="font-medium text-foreground text-sm">{faq.question}</span>
                  <HelpCircle className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${
                    openFaq === index ? 'rotate-180' : ''
                  }`} />
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border/40">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight">
            Ready to simplify your barn?
          </h2>
          <p className="mt-2 text-muted-foreground">
            14-day free trial. No credit card required. Plans start at $25/month.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex mt-6 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Start free trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border/40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <HorseIcon className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-medium text-foreground">StableTrack</span>
          </Link>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
