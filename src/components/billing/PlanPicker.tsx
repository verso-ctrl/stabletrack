'use client'

import React from 'react'
import { Check, Star } from 'lucide-react'
import {
  TIER_PRICING,
  STARTER_FEATURES,
  FARM_FEATURES,
  type SubscriptionTier,
} from '@/lib/tiers'

interface PlanPickerProps {
  selectedTier: SubscriptionTier
  onSelect: (tier: SubscriptionTier) => void
  compact?: boolean
}

const PLANS: {
  tier: SubscriptionTier
  features: string[]
  bestValue?: boolean
}[] = [
  {
    tier: 'STARTER',
    features: STARTER_FEATURES,
  },
  {
    tier: 'FARM',
    features: FARM_FEATURES,
    bestValue: true,
  },
]

export function PlanPicker({ selectedTier, onSelect, compact = false }: PlanPickerProps) {
  return (
    <div className={`grid grid-cols-1 ${compact ? 'sm:grid-cols-2 gap-3' : 'md:grid-cols-2 gap-4'}`}>
      {PLANS.map(({ tier, features, bestValue }) => {
        const pricing = TIER_PRICING[tier]
        const isSelected = selectedTier === tier

        return (
          <button
            key={tier}
            type="button"
            onClick={() => onSelect(tier)}
            className={`
              relative text-left rounded-xl border-2 p-5 transition-all
              ${isSelected
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border hover:border-border/80 hover:bg-muted/30'
              }
            `}
          >
            {bestValue && (
              <span className="absolute -top-3 right-4 inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-medium px-2.5 py-0.5 rounded-full">
                <Star className="w-3 h-3" />
                Best Value
              </span>
            )}

            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground">{pricing.displayName}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{pricing.description}</p>
              </div>
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'}
              `}>
                {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
            </div>

            <div className="mb-4">
              <span className="text-3xl font-bold text-foreground">
                ${pricing.monthlyPriceCents / 100}
              </span>
              <span className="text-muted-foreground">/month</span>
            </div>

            {!compact && (
              <ul className="space-y-2">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </button>
        )
      })}
    </div>
  )
}
