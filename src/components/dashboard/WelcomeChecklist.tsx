'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, CheckCircle2, Circle, ChevronRight } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  href: string;
  completed: boolean;
}

interface WelcomeChecklistProps {
  barnName: string;
  horsesCount: number;
  stallsCount: number;
  paddocksCount: number;
  eventsCount: number;
}

export function WelcomeChecklist({
  barnName,
  horsesCount,
  stallsCount,
  paddocksCount,
  eventsCount,
}: WelcomeChecklistProps) {
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash

  useEffect(() => {
    const hidden = localStorage.getItem('barnkeep-checklist-dismissed');
    setDismissed(hidden === 'true');
  }, []);

  const items: ChecklistItem[] = [
    { id: 'horse', label: 'Add your first horse', href: '/horses/new', completed: horsesCount > 0 },
    { id: 'stall', label: 'Set up your stalls', href: '/pastures?tab=stalls', completed: stallsCount > 0 },
    { id: 'pasture', label: 'Add a pasture', href: '/pastures', completed: paddocksCount > 0 },
    { id: 'event', label: 'Schedule your first event', href: '/calendar', completed: eventsCount > 0 },
  ];

  const completedCount = items.filter(i => i.completed).length;
  const allDone = completedCount === items.length;

  // Auto-dismiss permanently once all items are complete
  useEffect(() => {
    if (allDone) {
      localStorage.setItem('barnkeep-checklist-dismissed', 'true');
      setDismissed(true);
    }
  }, [allDone]);

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem('barnkeep-checklist-dismissed', 'true');
    setDismissed(true);
  };

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-semibold text-foreground">
            Welcome to {barnName}!
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Let's get your barn set up. {completedCount} of {items.length} done.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded hover:bg-amber-100 transition-colors text-muted-foreground hover:text-muted-foreground"
          aria-label="Dismiss checklist"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-amber-100 rounded-full mb-4">
        <div
          className="h-full bg-amber-500 rounded-full transition-all duration-500"
          style={{ width: `${(completedCount / items.length) * 100}%` }}
        />
      </div>

      <div className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
              item.completed
                ? 'text-muted-foreground'
                : 'text-muted-foreground hover:bg-amber-100/50'
            }`}
          >
            {item.completed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            )}
            <span className={`text-sm flex-1 ${item.completed ? 'line-through' : 'font-medium'}`}>
              {item.label}
            </span>
            {!item.completed && (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
