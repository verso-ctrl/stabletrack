// src/components/storage/StorageQuota.tsx
// Storage usage display component

'use client'

import React, { useEffect } from 'react'
import { HardDrive, AlertTriangle } from 'lucide-react'
import { useStorageQuota } from '@/hooks/useStorage'
import {
  getTierLimits,
  getTierPricing,
  getNextTier,
  formatBytes,
  normalizeTier,
} from '@/lib/tiers'
import { cn } from '@/lib/utils'

interface StorageQuotaProps {
  barnId: string
  showDetails?: boolean
  variant?: 'default' | 'compact' | 'card'
}

export function StorageQuota({
  barnId,
  showDetails = true,
  variant = 'default',
}: StorageQuotaProps) {
  const { quota, loading, refresh, formattedUsed, formattedLimit } = useStorageQuota({ barnId })

  useEffect(() => {
    refresh()
  }, [refresh])

  if (loading || !quota) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-muted rounded w-32" />
      </div>
    )
  }

  const isNearLimit = quota.percentage >= 80
  const isOverLimit = quota.percentage >= 100

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <HardDrive className="w-4 h-4 text-muted-foreground" />
        <span className={cn(
          isOverLimit && 'text-destructive',
          isNearLimit && !isOverLimit && 'text-yellow-600'
        )}>
          {formattedUsed} / {formattedLimit}
        </span>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className="p-4 border rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Storage</span>
          </div>
          {isNearLimit && (
            <AlertTriangle className={cn(
              'w-5 h-5',
              isOverLimit ? 'text-destructive' : 'text-yellow-600'
            )} />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Used</span>
            <span className={cn(
              'font-medium',
              isOverLimit && 'text-destructive'
            )}>
              {formattedUsed} of {formattedLimit}
            </span>
          </div>

          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500',
                isOverLimit && 'bg-destructive',
                isNearLimit && !isOverLimit && 'bg-yellow-500',
                !isNearLimit && 'bg-primary'
              )}
              style={{ width: `${Math.min(quota.percentage, 100)}%` }}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            {quota.percentage}% used
          </p>
        </div>

        {isNearLimit && !isOverLimit && (
          <p className="text-xs text-yellow-600">
            You&apos;re running low on storage. Consider freeing up space or upgrading your plan.
          </p>
        )}

        {isOverLimit && (
          <p className="text-xs text-destructive">
            Storage limit reached. Delete files to continue uploading.
          </p>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Storage</span>
        </div>
        <span className={cn(
          'font-medium',
          isOverLimit && 'text-destructive',
          isNearLimit && !isOverLimit && 'text-yellow-600'
        )}>
          {formattedUsed} / {formattedLimit}
        </span>
      </div>

      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-500',
            isOverLimit && 'bg-destructive',
            isNearLimit && !isOverLimit && 'bg-yellow-500',
            !isNearLimit && 'bg-primary'
          )}
          style={{ width: `${Math.min(quota.percentage, 100)}%` }}
        />
      </div>

      {showDetails && isNearLimit && (
        <p className="text-xs text-muted-foreground">
          {isOverLimit 
            ? 'Storage limit reached' 
            : `${100 - quota.percentage}% remaining`
          }
        </p>
      )}
    </div>
  )
}

// =============================================================================
// STORAGE UPGRADE PROMPT
// =============================================================================

interface StorageUpgradePromptProps {
  currentTier: string
  onUpgrade: () => void
}

export function StorageUpgradePrompt({ currentTier, onUpgrade }: StorageUpgradePromptProps) {
  const tier = normalizeTier(currentTier)
  const nextTier = getNextTier(tier)

  if (!nextTier) return null

  const nextLimits = getTierLimits(nextTier)
  const nextPricing = getTierPricing(nextTier)

  return (
    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
      <h4 className="font-medium text-sm">Need more storage?</h4>
      <p className="text-xs text-muted-foreground mt-1">
        Upgrade to {nextPricing.displayName} for {formatBytes(nextLimits.maxStorageBytes)} of storage.
      </p>
      <button
        onClick={onUpgrade}
        className="mt-3 px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90"
      >
        Upgrade Plan
      </button>
    </div>
  )
}
