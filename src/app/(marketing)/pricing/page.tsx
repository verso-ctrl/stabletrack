'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  HelpCircle,
  ClipboardList,
} from 'lucide-react';

const HorseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12c0-4-3-8-8-8-3 0-5.5 1.5-7 3.5L3 10l1 3-2 4 3 1 2-1 2 3h4l1-2 2 1 4-3c1-1 2-2.5 2-4z"/>
    <circle cx="18" cy="9" r="1"/>
  </svg>
);

const coreFeatures = [
  'Unlimited horses',
  'Horse profiles & management',
  'Feed tracking & feed charts',
  'Stall assignments',
  'Pasture & paddock assignments',
  'Vaccinations & health records',
  'Medication tracking & schedules',
  'Daily health checks',
  'Daily care logs',
  'Calendar & scheduling',
  'Task management',
  'Document storage',
  'Activity log',
  'Mobile access',
];

const addOns = [
  {
    name: 'Breeding Tracker',
    description: 'Heat cycles, breeding records, and foaling management.',
  },
  {
    name: 'Training & Lessons',
    description: 'Training logs, lesson scheduling, and competition tracking.',
  },
  {
    name: 'Client & Billing',
    description: 'Client management, invoicing, payments, and recurring billing.',
  },
  {
    name: 'Team Management',
    description: 'Multi-user access, role-based permissions, and team coordination.',
  },
];

const faqs = [
  {
    question: 'Is there a horse limit?',
    answer: 'Nope! The core plan includes unlimited horses. Whether you have 2 or 20, you pay the same $25/month.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Absolutely. No contracts, no commitments. Cancel anytime and your data stays yours — you can export everything before you go.',
  },
  {
    question: 'What are add-ons?',
    answer: 'Add-ons are optional features you can purchase on top of the core plan. They\'re designed for farms that need extras like breeding tracking, training logs, client billing, or team access. Only pay for what you actually use.',
  },
  {
    question: 'Do I need a credit card for the trial?',
    answer: 'No! Start your 14-day free trial without entering any payment info. We\'ll only ask for payment if you want to continue after the trial.',
  },
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
            One plan. One price. No surprises.
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Everything your barn needs for $25 a month. Start with a free 14-day trial.
          </p>
        </div>
      </section>

      {/* Core Plan */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl border-2 border-primary/50 bg-primary/5 p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">StableTrack Core</h2>
                <p className="text-sm text-muted-foreground mt-1">Everything you need to manage your barn</p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-4xl font-display font-semibold text-foreground">$25</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>

            <Link
              href="/sign-up"
              className="block w-full py-3 rounded-lg text-sm font-medium text-center bg-primary text-primary-foreground hover:opacity-90 transition-opacity mb-6"
            >
              Start free 14-day trial
            </Link>

            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
              {coreFeatures.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2.5 text-sm text-foreground"
                >
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Add-Ons */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight">
              Optional add-ons
            </h2>
            <p className="mt-2 text-muted-foreground">
              Need more? Add features as your farm grows. Only pay for what you use.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {addOns.map((addon) => (
              <div
                key={addon.name}
                className="rounded-lg border border-border/60 bg-card p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  <h3 className="font-display font-medium text-foreground text-sm">{addon.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{addon.description}</p>
                <p className="mt-3 text-xs font-medium text-primary">Coming Soon</p>
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
            14-day free trial. No credit card required. Just $25/month after that.
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
