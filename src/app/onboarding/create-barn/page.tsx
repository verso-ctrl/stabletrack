'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { csrfFetch } from '@/lib/fetch';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { PlanPicker } from '@/components/billing/PlanPicker';
import { AddOnCard } from '@/components/billing/AddOnCard';
import { ADD_ONS, TIER_PRICING, type SubscriptionTier } from '@/lib/tiers';

export default function CreateBarnPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('STARTER');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
  });

  const totalSteps = 3;

  const validateStep = (): boolean => {
    const errors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.name.trim()) {
        errors.name = 'Barn name is required';
      }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
      if (formData.phone && !/^[\d\s\-().+]+$/.test(formData.phone)) {
        errors.phone = 'Please enter a valid phone number';
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsCreating(true);
    setError('');

    try {
      // Try Stripe checkout first
      const checkoutResponse = await csrfFetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedTier,
          addOns: selectedAddOns,
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

      const checkoutResult = await checkoutResponse.json();

      // If Stripe is configured and checkout created, redirect to Stripe
      if (checkoutResult.url) {
        window.location.href = checkoutResult.url;
        return;
      }

      // If Stripe not configured (demo mode), create barn directly
      if (checkoutResult.demoMode) {
        const response = await csrfFetch('/api/barns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            tier: selectedTier,
            addOns: selectedAddOns,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create barn');
        }

        // Full reload so BarnProvider re-fetches the barn list
        window.location.href = '/dashboard';
        return;
      }

      // If checkout failed for another reason
      if (!checkoutResponse.ok) {
        throw new Error(checkoutResult.error || 'Failed to start checkout');
      }
    } catch (err) {
      console.error('Error creating barn:', err);
      setError(err instanceof Error ? err.message : 'Failed to create barn. Please try again.');
      setIsCreating(false);
    }
  };

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns(prev =>
      prev.includes(addOnId)
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const pricing = TIER_PRICING[selectedTier];
  const addOnTotal = selectedAddOns.reduce((sum, id) => {
    const addOn = ADD_ONS[id];
    return sum + (addOn ? addOn.monthlyPriceCents : 0);
  }, 0);
  const totalMonthlyCents = pricing.monthlyPriceCents + addOnTotal;

  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 14);
  const trialEndString = trialEndDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

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
                w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm
                ${step >= s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
                }
              `}>
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < totalSteps && (
                <div className={`w-12 h-1 mx-2 rounded ${step > s ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex justify-between text-xs text-muted-foreground mb-6 max-w-sm mx-auto">
          <span className={step === 1 ? 'text-foreground font-medium' : ''}>Barn Info</span>
          <span className={step === 2 ? 'text-foreground font-medium' : ''}>Choose Plan</span>
          <span className={step === 3 ? 'text-foreground font-medium' : ''}>Confirm</span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error creating barn</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={step === totalSteps ? handleSubmit : handleNext} className="bg-card rounded-xl shadow-sm border border-border p-6">
          {/* Step 1: Barn Info */}
          {step === 1 && (
            <>
              <h2 className="font-semibold text-foreground mb-4">Barn Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Barn Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: '' }));
                      }}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-primary ${fieldErrors.name ? 'border-destructive' : 'border-border'}`}
                      placeholder="e.g., Sunny Meadow Farm"
                      aria-invalid={!!fieldErrors.name}
                      aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                    />
                  </div>
                  {fieldErrors.name && (
                    <p id="name-error" className="text-sm text-destructive mt-1" role="alert">{fieldErrors.name}</p>
                  )}
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
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="123 Farm Road"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-4">
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-muted-foreground mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-muted-foreground mb-1">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                      maxLength={2}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: '' }));
                      }}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-primary ${fieldErrors.phone ? 'border-destructive' : 'border-border'}`}
                      placeholder="(555) 123-4567"
                      aria-invalid={!!fieldErrors.phone}
                      aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p id="phone-error" className="text-sm text-destructive mt-1" role="alert">{fieldErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
                      }}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-primary ${fieldErrors.email ? 'border-destructive' : 'border-border'}`}
                      placeholder="barn@example.com"
                      aria-invalid={!!fieldErrors.email}
                      aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p id="email-error" className="text-sm text-destructive mt-1" role="alert">{fieldErrors.email}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Step 2: Choose Plan */}
          {step === 2 && (
            <>
              <h2 className="font-semibold text-foreground mb-4">Choose Your Plan</h2>
              <p className="text-sm text-muted-foreground mb-4">Both plans include a 14-day free trial.</p>

              <PlanPicker
                selectedTier={selectedTier}
                onSelect={setSelectedTier}
              />

              {/* Optional Add-On */}
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-medium text-foreground mb-3">Optional Add-On</h3>
                <AddOnCard
                  addOn={ADD_ONS.breeding}
                  isActive={selectedAddOns.includes('breeding')}
                  onAdd={() => toggleAddOn('breeding')}
                  onRemove={() => toggleAddOn('breeding')}
                  compact
                />
              </div>
            </>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <>
              <h2 className="font-semibold text-foreground mb-4">Confirm &amp; Start Trial</h2>

              {/* Trial callout */}
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 mb-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-900 dark:text-green-200">Your 14-day free trial starts now!</h3>
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                      Full access to all features on your {pricing.displayName} plan.
                      You won&apos;t be charged until {trialEndString}.
                      After your trial: ${totalMonthlyCents / 100}/month. Cancel anytime.
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl bg-background border border-border">
                <h3 className="font-medium text-foreground mb-3">Summary</h3>
                <dl className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Barn Name:</dt>
                    <dd className="text-foreground font-medium">{formData.name || 'Not set'}</dd>
                  </div>
                  {formData.city && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Location:</dt>
                      <dd className="text-foreground">{formData.city}, {formData.state}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Plan:</dt>
                    <dd className="text-foreground">{pricing.displayName} &mdash; ${pricing.monthlyPriceCents / 100}/mo</dd>
                  </div>
                  {selectedAddOns.length > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Add-Ons:</dt>
                      <dd className="text-foreground">
                        {selectedAddOns.map(id => ADD_ONS[id]?.name).join(', ')} (+${addOnTotal / 100}/mo)
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-border">
                    <dt className="text-muted-foreground font-medium">Trial:</dt>
                    <dd className="text-foreground font-medium">14 days free</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">After trial:</dt>
                    <dd className="text-foreground font-medium">${totalMonthlyCents / 100}/month</dd>
                  </div>
                </dl>
              </div>
            </>
          )}

          {/* Navigation Buttons */}
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
              disabled={isCreating}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirecting to checkout...
                </>
              ) : step < totalSteps ? (
                'Continue'
              ) : (
                'Continue to payment'
              )}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Want to join an existing barn instead?{' '}
          <Link href="/onboarding/join-barn" className="text-primary hover:underline font-medium">
            Enter invite code
          </Link>
        </p>
      </div>
    </div>
  );
}
