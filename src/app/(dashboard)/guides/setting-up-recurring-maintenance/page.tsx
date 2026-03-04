'use client';

import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Camera, ChevronRight, Wrench } from 'lucide-react';

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

export default function SettingUpRecurringMaintenanceGuide() {
  return (
    <div className="max-w-3xl space-y-8 mt-4">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Guides', href: '/guides' },
        { label: 'Setting up recurring maintenance' },
      ]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Wrench className="w-4 h-4" />
          <span>Farm Tasks & Maintenance</span>
          <ChevronRight className="w-3 h-3" />
          <span>Article · 3 min read</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Setting up recurring maintenance</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Repeating tasks are one of the most useful features in BarnKeep. Set them up once and they show up automatically — no manual re-entry each week or month.
        </p>
      </div>

      <hr className="border-border" />

      <Section number={1} title="Creating a repeating task">
        <p className="text-foreground/80 leading-relaxed">
          From the <strong>Farm Tasks</strong> page, click <strong>"Add Task."</strong> Fill in the task title and any other details you want, then check the <strong>"Repeat this task"</strong> checkbox near the bottom of the form. A new set of options appears below it.
        </p>
        <Screenshot label="Add Task form with the recurring task section expanded showing Daily, Weekly, Monthly, and Custom buttons" />
      </Section>

      <Section number={2} title="Choosing how often it repeats">
        <p className="text-foreground/80 leading-relaxed">
          Select one of four repeat patterns:
        </p>
        <div className="space-y-3">
          <div className="rounded-lg border border-border p-4 space-y-2">
            <p className="font-semibold text-foreground text-sm">Daily</p>
            <p className="text-sm text-muted-foreground">The task appears every day. Good for things like checking water levels, morning feed checks, or daily health observations during treatment.</p>
            <p className="text-xs text-muted-foreground font-medium">Example: "Check water troughs" → Daily</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-2">
            <p className="font-semibold text-foreground text-sm">Weekly</p>
            <p className="text-sm text-muted-foreground">Choose one or more days of the week. A row of buttons (S / M / T / W / T / F / S) lets you pick which days. You can select multiple — for example, Monday and Thursday.</p>
            <p className="text-xs text-muted-foreground font-medium">Example: "Clean barn aisles" → Weekly on Monday, Wednesday, Friday</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-2">
            <p className="font-semibold text-foreground text-sm">Monthly</p>
            <p className="text-sm text-muted-foreground">Choose a day of the month (1–28). The task appears on that date each month. Note: use day 28 or lower to avoid months with fewer than 31 days.</p>
            <p className="text-xs text-muted-foreground font-medium">Example: "Monthly deworming check" → Monthly on day 1</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-2">
            <p className="font-semibold text-foreground text-sm">Custom</p>
            <p className="text-sm text-muted-foreground">Set it to repeat every X days. Enter any number from 1 to 365. This is useful for odd intervals that don't fit neatly into daily/weekly/monthly.</p>
            <p className="text-xs text-muted-foreground font-medium">Example: "Rotate pastures" → Every 14 days</p>
          </div>
        </div>
      </Section>

      <Section number={3} title="Setting an end date (optional)">
        <p className="text-foreground/80 leading-relaxed">
          By default, recurring tasks run indefinitely. If you want the task to stop automatically, choose one of the end conditions:
        </p>
        <ul className="text-sm text-foreground/80 space-y-1.5 list-disc pl-5">
          <li><strong>Never</strong> — keeps repeating until you delete it (default)</li>
          <li><strong>On [date]</strong> — stops after the specified end date</li>
          <li><strong>After [number] occurrences</strong> — stops after it has appeared X times</li>
        </ul>
        <Tip>For seasonal tasks (like mowing pastures), set an end date in late fall and create a new recurring task in spring. That way your task list stays clean during the off-season.</Tip>
      </Section>

      <Section number={4} title="What happens when you complete a recurring task">
        <p className="text-foreground/80 leading-relaxed">
          When you check off a recurring task, that instance is marked complete — but the task automatically re-appears on its next scheduled date. You don't need to do anything to "reset" it. Completed instances disappear from the Pending view and appear in the Completed list.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          Recurring tasks display a purple <strong>"Repeats"</strong> badge so they're easy to identify at a glance.
        </p>
      </Section>

      <Section number={5} title="Good recurring tasks to set up right away">
        <p className="text-foreground/80 leading-relaxed">
          Here are some examples worth creating when you're first getting organized:
        </p>
        <div className="rounded-lg border border-border p-4">
          <ul className="text-sm text-foreground/80 space-y-1.5 list-disc pl-4">
            <li>Clean and scrub water buckets — Weekly</li>
            <li>Check and tighten fence boards — Monthly</li>
            <li>Test smoke detectors in barn — Monthly</li>
            <li>Restock first aid kit — Every 90 days</li>
            <li>Schedule farrier — Every 6–8 weeks (Custom: every 42 days)</li>
            <li>Monthly dewormer rotation check — Monthly</li>
            <li>Deep clean stalls — Weekly</li>
          </ul>
        </div>
      </Section>

      <hr className="border-border" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What to read next</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/managing-tasks', label: 'Managing tasks', desc: 'Create, complete, and organize all your barn tasks.' },
            { href: '/guides/farm-tasks-vs-horse-tasks', label: 'Farm tasks vs. horse tasks', desc: 'Understand the difference between barn-wide and horse-specific tasks.' },
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
            <Link href="/farm-maintenance" className="btn-secondary btn-md text-sm">Farm Tasks →</Link>
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
