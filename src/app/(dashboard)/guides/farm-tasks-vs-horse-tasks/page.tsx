'use client';

import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Camera, ChevronRight, Wrench } from 'lucide-react';

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

export default function FarmTasksVsHorseTasksGuide() {
  return (
    <div className="max-w-3xl space-y-8 mt-4">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Guides', href: '/guides' },
        { label: 'Farm tasks vs. horse tasks' },
      ]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Wrench className="w-4 h-4" />
          <span>Farm Tasks & Maintenance</span>
          <ChevronRight className="w-3 h-3" />
          <span>Article · 2 min read</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Farm tasks vs. horse tasks</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          In BarnKeep, tasks can either belong to the whole barn or be linked to a specific horse. Understanding the difference helps you keep your task list organized.
        </p>
      </div>

      <hr className="border-border" />

      <Section number={1} title="Farm tasks — barn-wide chores">
        <p className="text-foreground/80 leading-relaxed">
          A <strong>farm task</strong> is any job that applies to the barn as a whole rather than to one horse specifically. These are things that need to get done regardless of which horses are in the barn:
        </p>
        <div className="rounded-lg border border-border p-4 space-y-1">
          <p className="font-semibold text-foreground text-sm mb-2">Examples of farm tasks</p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
            <li>Clean water troughs</li>
            <li>Check and repair fences</li>
            <li>Mow pastures</li>
            <li>Spread manure</li>
            <li>Clean barn aisles</li>
            <li>Check barn lights and equipment</li>
            <li>Order feed and supplies</li>
          </ul>
        </div>
        <p className="text-foreground/80 leading-relaxed">
          When you create a task and leave the horse assignment as <strong>"Barn task (no horse),"</strong> it becomes a farm task. Farm tasks appear in the Farm Tasks page and on the dashboard's Barn Overview panel — but not on any individual horse's profile.
        </p>
      </Section>

      <Section number={2} title="Horse tasks — linked to a specific horse">
        <p className="text-foreground/80 leading-relaxed">
          A <strong>horse task</strong> is a task assigned to one specific horse. Use these for anything that's unique to that animal:
        </p>
        <div className="rounded-lg border border-border p-4 space-y-1">
          <p className="font-semibold text-foreground text-sm mb-2">Examples of horse tasks</p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
            <li>Schedule Thunder's farrier appointment</li>
            <li>Give Luna her monthly dewormer</li>
            <li>Call vet about Bella's swollen leg</li>
            <li>Reorder Storm's joint supplement</li>
            <li>Clip Mac before the show</li>
          </ul>
        </div>
        <p className="text-foreground/80 leading-relaxed">
          When you create a task and select a specific horse in the <strong>"Assign to Horse"</strong> dropdown, it becomes a horse task. Horse tasks show up:
        </p>
        <ul className="text-sm text-foreground/80 space-y-1 list-disc pl-5">
          <li>On the Farm Tasks page (with an amber badge showing the horse's name)</li>
          <li>On that horse's individual <strong>Tasks tab</strong> in their profile</li>
          <li>On the dashboard Barn Overview (if it's urgent or overdue)</li>
        </ul>
        <Screenshot label="Farm Tasks list showing mixed farm and horse tasks with horse name badges on horse-specific tasks" />
      </Section>

      <Section number={3} title="Filtering by task type">
        <p className="text-foreground/80 leading-relaxed">
          On the Farm Tasks page, a <strong>task type filter</strong> lets you narrow the list:
        </p>
        <ul className="text-sm text-foreground/80 space-y-1.5 list-disc pl-5">
          <li><strong>All</strong> — shows every task, both farm-wide and horse-specific</li>
          <li><strong>Farm Only</strong> — shows only barn-wide tasks (no horse assigned)</li>
          <li><strong>Horse Tasks</strong> — shows only tasks linked to a specific horse</li>
        </ul>
        <Tip>Use the "Farm Only" filter when you're doing a barn walk-through and want to check off farm chores without seeing horse-specific items. Use "Horse Tasks" when you're catching up on per-horse to-dos.</Tip>
      </Section>

      <hr className="border-border" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What to read next</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/managing-tasks', label: 'Managing tasks', desc: 'Create, complete, and track all types of tasks.' },
            { href: '/guides/setting-up-recurring-maintenance', label: 'Setting up recurring maintenance', desc: 'Schedule repeating farm tasks so you never have to add them twice.' },
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
