'use client'

import React from 'react'
import { Plus, X, Clock } from 'lucide-react'
import type { AddOnConfig } from '@/lib/tiers'

interface AddOnCardProps {
  addOn: AddOnConfig
  isActive?: boolean
  onAdd?: () => void
  onRemove?: () => void
  compact?: boolean
}

export function AddOnCard({ addOn, isActive = false, onAdd, onRemove, compact = false }: AddOnCardProps) {
  if (!addOn.available) {
    return (
      <div className={`rounded-lg border border-border/60 bg-card ${compact ? 'p-3' : 'p-4'} opacity-60`}>
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground text-sm">{addOn.name}</h3>
          <span className="text-xs text-muted-foreground">Coming Soon</span>
        </div>
        {!compact && (
          <p className="text-sm text-muted-foreground mt-1">{addOn.description}</p>
        )}
      </div>
    )
  }

  return (
    <div className={`
      rounded-lg border bg-card transition-colors
      ${isActive ? 'border-primary/50 bg-primary/5' : 'border-border/60'}
      ${compact ? 'p-3' : 'p-5'}
    `}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground text-sm">{addOn.name}</h3>
            <span className="text-xs font-medium text-primary">
              +${addOn.monthlyPriceCents / 100}/mo
            </span>
          </div>
          {!compact && (
            <p className="text-sm text-muted-foreground mt-1">{addOn.description}</p>
          )}
        </div>

        {isActive ? (
          <button
            onClick={onRemove}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-destructive bg-destructive/10 rounded-md hover:bg-destructive/20 transition-colors"
          >
            <X className="w-3 h-3" />
            Remove
          </button>
        ) : (
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        )}
      </div>

      {!compact && (
        <p className="text-xs text-muted-foreground mt-2">Available on any plan.</p>
      )}
    </div>
  )
}
