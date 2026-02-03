'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  X,
  Zap,
  Building2,
  Crown,
  HelpCircle,
} from 'lucide-react';

const HorseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12c0-4-3-8-8-8-3 0-5.5 1.5-7 3.5L3 10l1 3-2 4 3 1 2-1 2 3h4l1-2 2 1 4-3c1-1 2-2.5 2-4z"/>
    <circle cx="18" cy="9" r="1"/>
  </svg>
);

const plans = [
  {
    id: 'free',
    name: 'Free',
    description: 'For individual horse owners',
    price: { monthly: 0, yearly: 0 },
    icon: HorseIcon,
    features: [
      { name: 'Up to 5 horses', included: true },
      { name: '1 barn', included: true },
      { name: 'Basic health records', included: true },
      { name: 'Event calendar', included: true },
      { name: 'Mobile access', included: true },
      { name: 'Team members', included: false },
      { name: 'Billing & invoicing', included: false },
      { name: 'Client portal', included: false },
      { name: 'Advanced reports', included: false },
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For small boarding & training facilities',
    price: { monthly: 49, yearly: 39 },
    icon: Zap,
    popular: true,
    features: [
      { name: 'Up to 25 horses', included: true },
      { name: '1 barn', included: true },
      { name: 'Complete health records', included: true },
      { name: 'Event calendar', included: true },
      { name: 'Mobile access', included: true },
      { name: 'Up to 5 team members', included: true },
      { name: 'Billing & invoicing', included: true },
      { name: 'Client portal', included: true },
      { name: 'Advanced reports', included: false },
    ],
  },
  {
    id: 'farm',
    name: 'Farm',
    description: 'For established equestrian facilities',
    price: { monthly: 99, yearly: 79 },
    icon: Building2,
    features: [
      { name: 'Up to 100 horses', included: true },
      { name: 'Up to 3 barns', included: true },
      { name: 'Complete health records', included: true },
      { name: 'Event calendar', included: true },
      { name: 'Mobile access', included: true },
      { name: 'Unlimited team members', included: true },
      { name: 'Billing & invoicing', included: true },
      { name: 'Client portal', included: true },
      { name: 'Advanced reports', included: true },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large operations',
    price: { monthly: 249, yearly: 199 },
    icon: Crown,
    features: [
      { name: 'Unlimited horses', included: true },
      { name: 'Unlimited barns', included: true },
      { name: 'Complete health records', included: true },
      { name: 'Event calendar', included: true },
      { name: 'Mobile access', included: true },
      { name: 'Unlimited team members', included: true },
      { name: 'Billing & invoicing', included: true },
      { name: 'Client portal', included: true },
      { name: 'Advanced reports', included: true },
      { name: 'API access', included: true },
    ],
  },
];

const faqs = [
  {
    question: 'Can I switch plans anytime?',
    answer: 'Yes! You can upgrade or downgrade at any time. Changes take effect immediately, and we\'ll prorate your billing accordingly.',
  },
  {
    question: 'What happens when I reach my horse limit?',
    answer: 'We\'ll notify you as you approach your limit. You can upgrade anytime or archive inactive horses to free up space.',
  },
  {
    question: 'Is there a contract or commitment?',
    answer: 'No contracts! All plans are month-to-month or yearly (with 20% savings). Cancel anytime.',
  },
  {
    question: 'Can I get a refund?',
    answer: 'We offer a 30-day money-back guarantee on all paid plans. Contact us for a full refund if unsatisfied.',
  },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
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
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Choose the plan that fits your barn. All plans include a 14-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center p-1 rounded-lg bg-muted">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === 'monthly' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === 'yearly' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs text-emerald-600 font-medium">Save 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const price = plan.price[billingPeriod];

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-lg border p-6 ${
                    plan.popular ? 'border-primary/50 bg-primary/5' : 'border-border/60 bg-card'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <span className="px-2.5 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-md">
                        Most popular
                      </span>
                    </div>
                  )}

                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="font-display font-medium text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-3xl font-display font-semibold text-foreground">
                      ${price}
                    </span>
                    {price > 0 && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                    {billingPeriod === 'yearly' && price > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Billed annually (${price * 12}/year)
                      </p>
                    )}
                  </div>

                  <Link
                    href="/sign-up"
                    className={`block w-full py-2.5 rounded-lg text-sm font-medium text-center transition-opacity ${
                      plan.popular
                        ? 'bg-primary text-primary-foreground hover:opacity-90'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                  >
                    {price === 0 ? 'Get started' : 'Start free trial'}
                  </Link>

                  <ul className="mt-6 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li
                        key={feature.name}
                        className={`flex items-center gap-2 text-sm ${
                          feature.included ? 'text-foreground' : 'text-muted-foreground/70'
                        }`}
                      >
                        {feature.included ? (
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                        )}
                        {feature.name}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight mb-8">
            Frequently asked questions
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
            Ready to get started?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Start your 14-day free trial. No credit card required.
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
