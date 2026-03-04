'use client';

import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Camera, ChevronRight, Activity, CheckCircle2, Syringe } from 'lucide-react';

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

export default function LoggingDailyCareGuide() {
  return (
    <div className="max-w-3xl space-y-8 mt-4">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Guides', href: '/guides' },
        { label: 'Logging daily care' },
      ]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="w-4 h-4" />
          <span>Daily Care & Feeding</span>
          <ChevronRight className="w-3 h-3" />
          <span>Article · 3 min read</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Logging daily care</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          The Daily Care page is where you track everything that happens at the barn each day — health checks, feedings, and medications. It's the closest thing to a digital care sheet.
        </p>
      </div>

      <hr className="border-border" />

      <Section number={1} title="The Overview tab — today at a glance">
        <p className="text-foreground/80 leading-relaxed">
          Open <strong>Daily Care</strong> from the sidebar. The default view is the Overview tab, which gives you a quick read on where things stand today:
        </p>
        <Screenshot label="Daily Care overview tab showing stats cards and horse status list" />
        <div className="space-y-3">
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-600" />
              <p className="font-semibold text-foreground text-sm">Health Checks Done</p>
            </div>
            <p className="text-sm text-muted-foreground">Shows the percentage of horses that have had a health check logged today, plus the completed / total count.</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <p className="font-semibold text-foreground text-sm">Feedings Logged</p>
            </div>
            <p className="text-sm text-muted-foreground">How many feedings have been recorded across all horses today.</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center gap-2">
              <Syringe className="w-4 h-4 text-purple-600" />
              <p className="font-semibold text-foreground text-sm">Medications Given</p>
            </div>
            <p className="text-sm text-muted-foreground">How many medications have been logged as given. A red "overdue" badge appears here if any are past due.</p>
          </div>
        </div>
        <p className="text-foreground/80 leading-relaxed">
          Below the stat cards is a <strong>Horse Status list</strong> showing every horse with color-coded badges: a green "Health" badge if they've been checked, an amber "AM" badge if the morning feeding was logged, and an indigo "PM" badge for the evening feeding. This lets you see in a glance who's been looked after and who still needs attention.
        </p>
        <Tip>Use Daily Care as your morning starting point. Scan the horse status list to see who still needs a health check or feeding before the day is done.</Tip>
      </Section>

      <Section number={2} title="Health Checks tab">
        <p className="text-foreground/80 leading-relaxed">
          The <strong>Health Checks</strong> tab shows a progress bar and a list of every horse with their current check status. Green "Checked" badges appear for horses that have been logged; others show "Not checked" in gray.
        </p>
        <Screenshot label="Health Checks tab showing a progress bar and horse list with checked/unchecked status" aspectRatio="aspect-[16/5]" />
        <p className="text-foreground/80 leading-relaxed">
          Click <strong>"Start Checks"</strong> to open the daily health check logging form. For each horse you can record observations like attitude, feed intake, water intake, temperature, and any notable signs. The form walks you through horse by horse.
        </p>
      </Section>

      <Section number={3} title="Feeding tab">
        <p className="text-foreground/80 leading-relaxed">
          The <strong>Feeding</strong> tab shows your morning (AM) and evening (PM) feeding status in two stat boxes, plus a list of horses with their feeding status for each session. You can see at a glance which horses have been fed and which haven't.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          Click <strong>"Log Feeding"</strong> to record a feeding event. For more detail — including marking individual feeding times as complete or adding notes — use the <strong>Feed Chart</strong>, which gives a full breakdown of all six daily feeding slots.
        </p>
        <Tip>The Feed Chart (in the sidebar) is the more detailed tool for tracking feedings per-time-slot. Daily Care gives you the summary; Feed Chart gives you the full picture.</Tip>
      </Section>

      <Section number={4} title="Medications tab">
        <p className="text-foreground/80 leading-relaxed">
          The <strong>Medications</strong> tab tracks which medications have been given today. Three stat boxes show: medications given, medications due today, and any that are overdue.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          If anything is overdue, a red alert box appears at the top of the tab to make it hard to miss.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          Click <strong>"Log Medication"</strong> to record that a medication was administered. You'll select the horse, the medication, the dose given, and the date/time.
        </p>
      </Section>

      <Section number={5} title="Printing a daily care sheet">
        <p className="text-foreground/80 leading-relaxed">
          The <strong>Print Care Sheet</strong> button (top right of the Daily Care page, with a printer icon) generates a printable daily care table. It includes columns for each horse with checkboxes for AM/PM feed, medications, turnout, and a notes column. Useful for leaving at the barn for staff who prefer paper.
        </p>
      </Section>

      <hr className="border-border" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What to read next</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/using-the-feed-chart', label: 'Using the feed chart', desc: 'Read and mark feedings on the detailed daily feed chart.' },
            { href: '/guides/creating-a-feed-program', label: 'Creating a feed program', desc: 'Set up each horse\'s feeding schedule.' },
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
              { href: '/daily-care', label: 'Daily Care' },
              { href: '/feed-chart', label: 'Feed Chart' },
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
