'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { useSubscription } from '@/contexts/SubscriptionContext'

export function TrialBanner() {
  const { trial } = useSubscription()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || !trial.isTrialing || trial.isExpired) return null

  const { daysRemaining } = trial

  // Color scheme based on urgency
  let colorClasses: string
  let bgClasses: string
  if (daysRemaining <= 1) {
    colorClasses = 'text-red-800 dark:text-red-200'
    bgClasses = 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
  } else if (daysRemaining <= 3) {
    colorClasses = 'text-amber-800 dark:text-amber-200'
    bgClasses = 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
  } else {
    colorClasses = 'text-blue-800 dark:text-blue-200'
    bgClasses = 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800'
  }

  const dayLabel = daysRemaining === 1 ? 'day' : 'days'
  const dayNumber = 14 - daysRemaining + 1

  return (
    <div className={`rounded-lg border p-3 sm:p-4 flex items-center justify-between gap-3 ${bgClasses}`}>
      <p className={`text-sm ${colorClasses}`}>
        {daysRemaining <= 1 ? (
          <span className="font-medium">Your free trial ends today.</span>
        ) : daysRemaining <= 3 ? (
          <>
            <span className="font-medium">Trial ending soon.</span>
            {' '}{daysRemaining} {dayLabel} remaining.
          </>
        ) : (
          <>
            You&apos;re on day {dayNumber} of your free trial.
            {' '}<span className="font-medium">{daysRemaining} {dayLabel} remaining.</span>
          </>
        )}
      </p>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href="/settings/billing"
          className={`text-sm font-medium px-3 py-1 rounded-md transition-colors ${
            daysRemaining <= 3
              ? 'bg-primary text-primary-foreground hover:opacity-90'
              : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
          }`}
        >
          Choose plan
        </Link>
        {daysRemaining > 3 && (
          <button
            onClick={() => setDismissed(true)}
            className={`p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 ${colorClasses}`}
            aria-label="Dismiss trial banner"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
