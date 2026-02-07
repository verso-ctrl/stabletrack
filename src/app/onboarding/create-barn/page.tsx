'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  type SubscriptionTier,
  TIER_PRICING,
  TIER_LIMITS,
  TIER_FEATURES,
  formatPrice,
  formatBytes,
} from '@/lib/tiers';

export default function CreateBarnPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [stripeUnavailable, setStripeUnavailable] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    tier: '' as SubscriptionTier | '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // If FREE tier, create barn directly
      if (formData.tier === 'FREE') {
        const response = await fetch('/api/barns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create barn');
        }

        // Success - redirect to dashboard
        router.push('/dashboard');
      } else {
        // For paid tiers, redirect to Stripe checkout
        const response = await fetch('/api/stripe/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tier: formData.tier,
            barnData: {
              name: formData.name,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode,
              phone: formData.phone,
              email: formData.email,
            },
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          // If Stripe is not configured, show helpful error
          if (result.demoMode || response.status === 503) {
            setStripeUnavailable(true);
            setError(
              'Stripe is not configured. Please select the FREE tier to continue, or configure Stripe payment processing.'
            );
            setIsCreating(false);
            return;
          }
          const errorMsg = result.details || result.error || 'Failed to create checkout session';
          throw new Error(errorMsg);
        }

        // Redirect to Stripe checkout
        if (result.url) {
          window.location.href = result.url;
        } else {
          throw new Error('No checkout URL received');
        }
      }
    } catch (err) {
      console.error('Error creating barn:', err);
      setError(err instanceof Error ? err.message : 'Failed to create barn. Please try again.');
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Back Link */}
        <Link 
          href="/onboarding" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create a New Barn</h1>
          <p className="text-muted-foreground mt-2">
            Set up your barn to start managing your horses
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-medium
                ${step >= s
                  ? 'bg-amber-500 text-white'
                  : 'bg-muted text-muted-foreground'
                }
              `}>
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-1 mx-2 rounded ${step > s ? 'bg-amber-500' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error creating barn</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-sm border border-border p-6">
          {step === 1 ? (
            <>
              <h2 className="font-semibold text-foreground mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Barn Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="e.g., Sunny Meadow Farm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Street Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="123 Farm Road"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-4">
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      maxLength={2}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : step === 2 ? (
            <>
              <h2 className="font-semibold text-foreground mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="barn@example.com"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-background">
                  <h3 className="font-medium text-foreground mb-2">Summary</h3>
                  <dl className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Barn Name:</dt>
                      <dd className="text-foreground">{formData.name || 'Not set'}</dd>
                    </div>
                    {formData.city && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Location:</dt>
                        <dd className="text-foreground">{formData.city}, {formData.state}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-semibold text-foreground mb-4">Choose Your Plan</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Select the subscription tier that best fits your barn's needs
              </p>
              {error && error.includes('Stripe is not configured') && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  <p className="font-medium">Payment Processing Unavailable</p>
                  <p className="mt-1">Stripe is not configured. Please select the FREE tier to continue without payment.</p>
                </div>
              )}

              <div className="space-y-3">
                {(['FREE', 'BASIC', 'ADVANCED'] as SubscriptionTier[]).map((tier) => {
                  const pricing = TIER_PRICING[tier];
                  const limits = TIER_LIMITS[tier];
                  const features = TIER_FEATURES[tier];
                  const isSelected = formData.tier === tier;

                  const keyFeatures = [
                    `${limits.maxHorses === -1 ? 'Unlimited' : limits.maxHorses} horses`,
                    `${limits.maxPhotosPerHorse === -1 ? 'Unlimited' : limits.maxPhotosPerHorse} photos per horse`,
                    `${formatBytes(limits.maxStorageBytes)} storage`,
                    features.canUploadDocuments && 'Document uploads',
                    features.lessonManagement && 'Lesson management',
                    features.invoicing && 'Invoicing',
                    features.advancedAnalytics && 'Advanced analytics',
                  ].filter(Boolean);

                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setFormData({ ...formData, tier })}
                      className={`
                        w-full text-left p-4 rounded-xl border-2 transition-all relative
                        ${isSelected
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-border hover:border-border bg-card'
                        }
                      `}
                    >
                      {pricing.popular && (
                        <div className="absolute -top-3 left-4 px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Most Popular
                        </div>
                      )}

                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">
                              {pricing.displayName}
                            </h3>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {pricing.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {keyFeatures.slice(0, 3).map((feature, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-foreground">
                            {formatPrice(pricing.monthlyPriceCents)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {tier === 'FREE' ? 'Forever' : 'per month'}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-accent font-medium"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={
                isCreating ||
                (step === 1 && !formData.name) ||
                (step === 3 && !formData.tier)
              }
              className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : step < 3 ? (
                'Continue'
              ) : (
                'Create Barn'
              )}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Want to join an existing barn instead?{' '}
          <Link href="/onboarding/join-barn" className="text-amber-600 hover:text-amber-700 font-medium">
            Enter invite code
          </Link>
        </p>
      </div>
    </div>
  );
}
