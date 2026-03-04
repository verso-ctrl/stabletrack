'use client';

import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Camera, ChevronRight } from 'lucide-react';

const HorseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12c0-4-3-8-8-8-3 0-5.5 1.5-7 3.5L3 10l1 3-2 4 3 1 2-1 2 3h4l1-2 2 1 4-3c1-1 2-2.5 2-4z"/>
    <circle cx="18" cy="9" r="1"/>
  </svg>
);

function Screenshot({ label, aspectRatio = 'aspect-video' }: { label: string; aspectRatio?: string }) {
  return (
    <div className={`w-full ${aspectRatio} rounded-xl border-2 border-dashed border-border bg-muted/40 flex flex-col items-center justify-center gap-3 my-6 text-center px-4`}>
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <Camera className="w-6 h-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">Screenshot coming soon</p>
      </div>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-300 my-4">
      <span className="font-semibold">Tip: </span>{children}
    </div>
  );
}

function Section({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center flex-shrink-0">
          {number}
        </span>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      <div className="pl-10 space-y-3">{children}</div>
    </section>
  );
}

export default function TrackingWeightOverTimeGuide() {
  return (
    <div className="max-w-3xl space-y-8 mt-4">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Guides', href: '/guides' },
        { label: 'Tracking weight over time' },
      ]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <HorseIcon className="w-4 h-4" />
          <span>Horse Profiles</span>
          <ChevronRight className="w-3 h-3" />
          <span>Article · 2 min read</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Tracking weight over time</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Logging a horse's weight regularly gives you an easy way to spot gradual changes before they become problems. BarnKeep keeps a running history so you can see the trend at a glance.
        </p>
      </div>

      <hr className="border-border" />

      <Section number={1} title="Finding the Log Weight button">
        <p className="text-foreground/80 leading-relaxed">
          Weight records live on the horse's <strong>Health tab</strong>. Open any horse's profile and click <strong>Health</strong> in the tab bar. Scroll down to the <strong>Weight History</strong> section — you'll see a list of past records and a <strong>"Log Weight"</strong> button in the top-right corner of that section.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          You can also log weight from the <strong>Overview tab</strong>, which has a shortcut to the same form.
        </p>
        <Screenshot label="Weight History section on the Health tab with the Log Weight button and recent records" aspectRatio="aspect-[16/5]" />
      </Section>

      <Section number={2} title="Filling in the weight form">
        <p className="text-foreground/80 leading-relaxed">
          Clicking "Log Weight" opens a modal with four fields:
        </p>
        <div className="rounded-lg border border-border p-4 space-y-2 text-sm text-foreground/80">
          <ul className="space-y-2">
            <li>
              <strong>Weight (lbs)</strong> — required. Enter the horse's weight in pounds.
            </li>
            <li>
              <strong>Body Condition Score (1–9)</strong> — optional. The standard Henneke scale used by vets to describe body condition. A score of 5 is ideal for most horses; scores below 4 or above 7 warrant attention.
            </li>
            <li>
              <strong>Date</strong> — defaults to today, but you can change it to backdate a record.
            </li>
            <li>
              <strong>Notes</strong> — optional. Any context worth recording, like "post-competition" or "started new hay."
            </li>
          </ul>
        </div>
        <p className="text-foreground/80 leading-relaxed">
          Click <strong>"Save Weight"</strong> to record the entry. The new record appears immediately in the Weight History list.
        </p>
        <Tip>If you weigh your horses monthly, set a reminder on the calendar so you don't forget. Consistent intervals make the trend data much more useful.</Tip>
      </Section>

      <Section number={3} title="Reading your weight history">
        <p className="text-foreground/80 leading-relaxed">
          The Weight History section shows your <strong>five most recent records</strong>, sorted from newest to oldest. Each entry shows:
        </p>
        <ul className="text-sm text-foreground/80 space-y-1.5 list-disc pl-5">
          <li>The date the weight was recorded</li>
          <li>The weight in pounds (shown in bold)</li>
          <li>The Body Condition Score (if one was entered)</li>
        </ul>
        <Screenshot label="Weight History list showing five recent entries with dates, weights, and BCS" aspectRatio="aspect-[16/5]" />
        <p className="text-foreground/80 leading-relaxed">
          The most recently logged weight also appears in the horse's profile card under the <strong>Weight</strong> field, so it's visible without opening the Health tab.
        </p>
      </Section>

      <Section number={4} title="Deleting a record">
        <p className="text-foreground/80 leading-relaxed">
          To remove an incorrect or duplicate entry, hover over the record and click the <strong>trash icon</strong> that appears on the right. Deletions are immediate and cannot be undone, so double-check before removing anything.
        </p>
      </Section>

      <hr className="border-border" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What to read next</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/logging-vaccinations-and-medications', label: 'Logging vaccinations & medications', desc: 'Record vaccines and manage active medications on the Health tab.' },
            { href: '/guides/horse-profile-overview', label: 'Horse profile overview', desc: 'Walk through every tab on a horse profile.' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="card p-4 flex items-start gap-3 hover:shadow-md transition-shadow">
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">{link.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{link.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            </Link>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Try it now</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: '/horses', label: 'Horses' },
            ].map(link => (
              <Link key={link.href} href={link.href} className="btn-secondary btn-md text-sm">
                {link.label} →
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5 bg-muted/30 text-center">
        <p className="text-sm text-muted-foreground">Something not making sense?</p>
        <a href="mailto:support@barnkeep.com" className="text-sm font-medium text-primary hover:underline mt-1 inline-block">
          Email support@barnkeep.com →
        </a>
      </div>
    </div>
  );
}
