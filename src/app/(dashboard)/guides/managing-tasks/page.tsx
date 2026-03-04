'use client';

import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Camera, ChevronRight, CheckCircle2 } from 'lucide-react';

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

export default function ManagingTasksGuide() {
  return (
    <div className="max-w-3xl space-y-8 mt-4">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Guides', href: '/guides' },
        { label: 'Managing tasks' },
      ]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="w-4 h-4" />
          <span>Schedule & Tasks</span>
          <ChevronRight className="w-3 h-3" />
          <span>Article · 3 min read</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Managing tasks</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Tasks are the to-do list for your barn. They can be tied to a specific horse or apply to the whole barn — and they can repeat on a schedule so you never have to re-enter the same chore again.
        </p>
      </div>

      <hr className="border-border" />

      <Section number={1} title="Where tasks live">
        <p className="text-foreground/80 leading-relaxed">
          BarnKeep has two places to manage tasks:
        </p>
        <div className="space-y-3">
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="font-semibold text-foreground text-sm">Farm Tasks (sidebar)</p>
            <p className="text-sm text-muted-foreground">The main task manager. Shows all tasks for your barn — both horse-specific tasks and farm-wide chores. This is the best place to get an overview and manage everything from one screen.</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="font-semibold text-foreground text-sm">Horse profile → Tasks tab</p>
            <p className="text-sm text-muted-foreground">Shows only the tasks linked to that specific horse. Useful when you want to see everything queued up for one animal.</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="font-semibold text-foreground text-sm">Dashboard → Barn Overview</p>
            <p className="text-sm text-muted-foreground">Shows your 5 most urgent pending tasks so you can stay on top of things without navigating away from the main page.</p>
          </div>
        </div>
      </Section>

      <Section number={2} title="Creating a task">
        <p className="text-foreground/80 leading-relaxed">
          From the Farm Tasks page, click <strong>"Add Task."</strong> The form opens with these fields:
        </p>
        <Screenshot label="Add Task form showing title, due date, priority, and horse assignment fields" />
        <div className="rounded-lg border border-border p-4 space-y-2 text-sm text-foreground/80">
          <ul className="space-y-2">
            <li><strong>Task Title</strong> — required. A short description of what needs doing (e.g., "Clean water troughs").</li>
            <li><strong>Description</strong> — optional. Add more detail if the title isn't self-explanatory.</li>
            <li><strong>Assign to Horse</strong> — optional. Select a horse to make this a horse-specific task; leave as "Barn task (no horse)" for farm-wide chores.</li>
            <li><strong>Due Date</strong> — optional but recommended. Used to sort and flag overdue tasks.</li>
            <li><strong>Due Time</strong> — optional. Useful for time-sensitive tasks.</li>
            <li><strong>Priority</strong> — Low, Medium (default), High, or Urgent. Urgent tasks show a red badge.</li>
          </ul>
        </div>
        <Tip>When the title field is empty, quick-suggestion buttons appear (e.g., "Clean water troughs," "Check & repair fences"). Click one to fill in the title instantly.</Tip>
      </Section>

      <Section number={3} title="Making a task repeat">
        <p className="text-foreground/80 leading-relaxed">
          Check the <strong>"Make this a repeating task"</strong> (or "Repeat this task") checkbox to reveal the recurring options. Choose how often the task should repeat:
        </p>
        <div className="space-y-2 text-sm text-foreground/80">
          <div className="rounded-lg border border-border p-3 space-y-1">
            <p className="font-semibold text-foreground">Daily</p>
            <p>Repeats every day. Good for things like water checks.</p>
          </div>
          <div className="rounded-lg border border-border p-3 space-y-1">
            <p className="font-semibold text-foreground">Weekly</p>
            <p>Choose which day(s) of the week it should repeat. You can select multiple days — for example, Monday and Thursday.</p>
          </div>
          <div className="rounded-lg border border-border p-3 space-y-1">
            <p className="font-semibold text-foreground">Monthly</p>
            <p>Pick the day of the month (1–28) it should occur. Good for monthly deworming or farrier checks.</p>
          </div>
          <div className="rounded-lg border border-border p-3 space-y-1">
            <p className="font-semibold text-foreground">Custom</p>
            <p>Set it to repeat every X days (e.g., every 3 days, every 14 days).</p>
          </div>
        </div>
        <p className="text-foreground/80 leading-relaxed">
          You can also set an <strong>end condition</strong>: never (runs indefinitely), on a specific end date, or after a set number of occurrences.
        </p>
      </Section>

      <Section number={4} title="Completing and managing tasks">
        <p className="text-foreground/80 leading-relaxed">
          To mark a task complete, click the <strong>circle checkbox</strong> on the left of the task card. The title gets a strikethrough, then the task fades out after a moment. A toast notification appears at the bottom with an <strong>Undo</strong> button in case you checked off the wrong one.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          Use the status filter buttons at the top of the Farm Tasks page to toggle between <strong>Pending</strong> and <strong>Completed</strong> tasks. The task type filter (All / Farm Only / Horse Tasks) lets you narrow down the list further.
        </p>
      </Section>

      <hr className="border-border" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What to read next</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/farm-tasks-vs-horse-tasks', label: 'Farm tasks vs. horse tasks', desc: 'Understand when to use each type and how they differ.' },
            { href: '/guides/setting-up-recurring-maintenance', label: 'Setting up recurring maintenance', desc: 'Schedule repeating chores so you never have to add them twice.' },
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
              { href: '/farm-maintenance', label: 'Farm Tasks' },
              { href: '/daily-care', label: 'Daily Care' },
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
