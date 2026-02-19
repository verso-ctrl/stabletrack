'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { PlanPicker } from './PlanPicker'
import {
  type SubscriptionTier,
  TIER_PRICING,
} from '@/lib/tiers'
import { useSubscription } from '@/contexts/SubscriptionContext'

export function TrialExpiredOverlay() {
  const { trial, changeTier } = useSubscription()
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('STARTER')
  const [isSubscribing, setIsSubscribing] = useState(false)

  if (!trial.isExpired) return null

  const handleSubscribe = async () => {
    setIsSubscribing(true)
    try {
      await changeTier(selectedTier)
    } finally {
      setIsSubscribing(false)
    }
  }

  const pricing = TIER_PRICING[selectedTier]

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Your free trial has ended.
          </h2>
          <p className="text-muted-foreground mt-2">
            Choose a plan to keep managing your barn. All your data is saved and waiting.
          </p>
        </div>

        <PlanPicker
          selectedTier={selectedTier}
          onSelect={setSelectedTier}
          compact
        />

        <button
          onClick={handleSubscribe}
          disabled={isSubscribing}
          className="w-full mt-6 py-3 px-4 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubscribing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Subscribe now — ${pricing.displayName} $${pricing.monthlyPriceCents / 100}/mo`
          )}
        </button>

        <p className="text-center text-xs text-muted-foreground mt-3">
          Cancel anytime. No contracts.
        </p>
      </div>
    </div>
  )
}
