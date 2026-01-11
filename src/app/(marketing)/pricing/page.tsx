'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  X,
  ChevronLeft,
  Zap,
  Building2,
  Crown,
  HelpCircle,
} from 'lucide-react';

const HorseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12c0-4-3-8-8-8-3 0-5.5 1.5-7 3.5L3 10l1 3-2 4 3 1 2-1 2 3h4l1-2 2 1 4-3c1-1 2-2.5 2-4z"/>
    <circle cx="18" cy="9" r="1"/>
  </svg>
);

const plans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for individual horse owners',
    price: { monthly: 0, yearly: 0 },
    icon: HorseIcon,
    color: 'stone',
    features: [
      { name: 'Up to 5 horses', included: true },
      { name: '1 barn', included: true },
      { name: 'Basic health records', included: true },
      { name: 'Event calendar', included: true },
      { name: 'Mobile access', included: true },
      { name: 'Community support', included: true },
      { name: 'Team members', included: false },
      { name: 'Billing & invoicing', included: false },
      { name: 'Client portal', included: false },
      { name: 'Advanced reports', included: false },
      { name: 'API access', included: false },
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For small boarding & training facilities',
    price: { monthly: 49, yearly: 39 },
    icon: Zap,
    color: 'blue',
    popular: true,
    features: [
      { name: 'Up to 25 horses', included: true },
      { name: '1 barn', included: true },
      { name: 'Complete health records', included: true },
      { name: 'Event calendar', included: true },
      { name: 'Mobile access', included: true },
      { name: 'Email support', included: true },
      { name: 'Up to 5 team members', included: true },
      { name: 'Billing & invoicing', included: true },
      { name: 'Client portal', included: true },
      { name: 'Advanced reports', included: false },
      { name: 'API access', included: false },
    ],
  },
  {
    id: 'farm',
    name: 'Farm',
    description: 'For established equestrian facilities',
    price: { monthly: 99, yearly: 79 },
    icon: Building2,
    color: 'amber',
    features: [
      { name: 'Up to 100 horses', included: true },
      { name: 'Up to 3 barns', included: true },
      { name: 'Complete health records', included: true },
      { name: 'Event calendar', included: true },
      { name: 'Mobile access', included: true },
      { name: 'Priority support', included: true },
      { name: 'Unlimited team members', included: true },
      { name: 'Billing & invoicing', included: true },
      { name: 'Client portal', included: true },
      { name: 'Advanced reports', included: true },
      { name: 'API access', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large operations & organizations',
    price: { monthly: 249, yearly: 199 },
    icon: Crown,
    color: 'purple',
    features: [
      { name: 'Unlimited horses', included: true },
      { name: 'Unlimited barns', included: true },
      { name: 'Complete health records', included: true },
      { name: 'Event calendar', included: true },
      { name: 'Mobile access', included: true },
      { name: 'Dedicated support', included: true },
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
    answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate your billing accordingly.',
  },
  {
    question: 'What happens when I reach my horse limit?',
    answer: 'We\'ll notify you as you approach your limit. You can upgrade your plan anytime to add more horses, or archive inactive horses to free up space.',
  },
  {
    question: 'Is there a contract or commitment?',
    answer: 'No contracts! All plans are month-to-month or yearly (with 20% savings). Cancel anytime with no penalties.',
  },
  {
    question: 'Can I get a refund?',
    answer: 'We offer a 30-day money-back guarantee on all paid plans. If you\'re not satisfied, contact us for a full refund.',
  },
  {
    question: 'Do you offer discounts for nonprofits?',
    answer: 'Yes! We offer 50% off for registered nonprofit equestrian organizations. Contact us with proof of nonprofit status.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express) and can arrange invoicing for Enterprise plans.',
  },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const getColorClasses = (color: string, type: 'bg' | 'border' | 'text') => {
    const colors: Record<string, Record<string, string>> = {
      stone: { bg: 'bg-stone-100', border: 'border-stone-300', text: 'text-stone-600' },
      blue: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-600' },
      amber: { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-600' },
      purple: { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-600' },
    };
    return colors[color]?.[type] || colors.stone[type];
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                <HorseIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-stone-900">StableTrack</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/sign-in" className="text-stone-600 hover:text-stone-900 font-medium">
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-stone-600 mb-8">
            Choose the plan that fits your barn. All plans include a 14-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-1 bg-stone-100 rounded-xl">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingPeriod === 'yearly'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs text-green-600 font-semibold">Save 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const price = plan.price[billingPeriod];

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border-2 p-6 ${
                    plan.popular
                      ? 'border-amber-500 shadow-xl'
                      : 'border-stone-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className={`w-12 h-12 rounded-xl ${getColorClasses(plan.color, 'bg')} ${getColorClasses(plan.color, 'text')} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-bold text-stone-900">{plan.name}</h3>
                  <p className="text-sm text-stone-500 mt-1 mb-4">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-stone-900">
                      ${price}
                    </span>
                    {price > 0 && (
                      <span className="text-stone-500">/month</span>
                    )}
                    {billingPeriod === 'yearly' && price > 0 && (
                      <p className="text-sm text-stone-500 mt-1">
                        Billed annually (${price * 12}/year)
                      </p>
                    )}
                  </div>

                  <Link
                    href="/sign-up"
                    className={`block w-full py-3 rounded-lg font-medium text-center transition-colors ${
                      plan.popular
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {price === 0 ? 'Get Started' : 'Start Free Trial'}
                  </Link>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature.name}
                        className={`flex items-center gap-2 text-sm ${
                          feature.included ? 'text-stone-700' : 'text-stone-400'
                        }`}
                      >
                        {feature.included ? (
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-stone-300 flex-shrink-0" />
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

      {/* Feature Comparison */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-stone-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-stone-900 text-center mb-8">
            Compare All Features
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-4 px-4 font-medium text-stone-500">Feature</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="text-center py-4 px-4 font-semibold text-stone-900">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Horses', values: ['5', '25', '100', 'Unlimited'] },
                  { name: 'Barns', values: ['1', '1', '3', 'Unlimited'] },
                  { name: 'Team Members', values: ['1', '5', 'Unlimited', 'Unlimited'] },
                  { name: 'Storage', values: ['1 GB', '10 GB', '50 GB', '500 GB'] },
                  { name: 'Health Records', values: ['Basic', 'Full', 'Full', 'Full'] },
                  { name: 'Billing', values: [false, true, true, true] },
                  { name: 'Client Portal', values: [false, true, true, true] },
                  { name: 'API Access', values: [false, false, false, true] },
                  { name: 'Support', values: ['Community', 'Email', 'Priority', 'Dedicated'] },
                ].map((row) => (
                  <tr key={row.name} className="border-b border-stone-100">
                    <td className="py-4 px-4 text-stone-700">{row.name}</td>
                    {row.values.map((value, index) => (
                      <td key={index} className="text-center py-4 px-4">
                        {typeof value === 'boolean' ? (
                          value ? (
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-stone-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-stone-700">{value}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-stone-900 text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-stone-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-stone-50 transition-colors"
                >
                  <span className="font-medium text-stone-900">{faq.question}</span>
                  <HelpCircle className={`w-5 h-5 text-stone-400 transition-transform ${
                    openFaq === index ? 'rotate-180' : ''
                  }`} />
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4 text-stone-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-stone-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-stone-400 mb-8">
            Start your 14-day free trial today. No credit card required.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 text-white rounded-xl hover:bg-amber-600 font-semibold text-lg transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-stone-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-amber-500 flex items-center justify-center">
              <HorseIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-stone-900">StableTrack</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-stone-500">
            <Link href="/privacy" className="hover:text-stone-900">Privacy</Link>
            <Link href="/terms" className="hover:text-stone-900">Terms</Link>
            <Link href="/" className="hover:text-stone-900">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
