'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
import { MarketingNav } from '@/components/marketing/MarketingNav';

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
  {
    question: 'Is there a mobile app?',
    answer: 'Yes — BarnKeep works on iOS and Android. You can access everything from your phone, whether you\'re in the barn or out in the pasture.',
  },
  {
    question: 'Can I try before buying?',
    answer: 'Absolutely. Every plan starts with a 14-day free trial. No credit card required, no commitment. Just sign up and start using it.',
  },
];

const comingSoonAddOns = [
  { name: 'Training & Lessons', description: 'Training logs, lesson scheduling, and competition tracking.' },
  { name: 'Client & Billing', description: 'Client management, invoicing, payments, and recurring billing.' },
  { name: 'Team Management', description: 'Multi-user access, role-based permissions, and team coordination.' },
];

const breedingFeatures = [
  'Heat cycle tracking & calendar',
  'Breeding records & stallion reports',
  'Foaling management & mare history',
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <MarketingNav />

      {/* Header */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block text-sm font-medium text-primary bg-primary/8 px-3 py-1 rounded-full mb-5">
            No credit card required
          </span>
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
              <p className="text-sm text-muted-foreground mt-1">Perfect for hobby barns &amp; personal farms</p>
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
            <p className="text-center text-xs text-muted-foreground mt-3">No credit card required</p>
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
              <p className="text-sm text-muted-foreground mt-1">For growing operations &amp; boarding barns</p>
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
            <p className="text-center text-xs text-muted-foreground mt-3">No credit card required</p>
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
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  <h3 className="font-display font-semibold text-foreground">{ADD_ONS.breeding.name}</h3>
                  <span className="text-sm font-medium text-primary">+${ADD_ONS.breeding.monthlyPriceCents / 100}/month</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{ADD_ONS.breeding.description}</p>
                <ul className="space-y-1.5">
                  {breedingFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground mt-3">Available on any plan.</p>
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
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-display font-medium text-foreground text-sm">{addon.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{addon.description}</p>
                <p className="text-xs font-medium text-muted-foreground">Coming Soon</p>
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Link
              href="/sign-up"
              className="inline-flex px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Start free trial
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required · Takes 2 minutes to set up
          </p>
        </div>
      </section>

      {/* Footer */}
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
                <li><Link href="/#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground text-sm">Company</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
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
