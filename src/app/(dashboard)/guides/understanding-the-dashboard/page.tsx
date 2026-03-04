'use client';

import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Camera, ChevronRight, CheckCircle2, Calendar, AlertTriangle, Activity, Syringe, LayoutDashboard } from 'lucide-react';

// ── Reusable screenshot placeholder ──────────────────────────────────────────
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

// ── Callout box ───────────────────────────────────────────────────────────────
function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-300 my-4">
      <span className="font-semibold">Tip: </span>{children}
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────
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

export default function UnderstandingDashboardGuide() {
  return (
    <div className="max-w-3xl space-y-8 mt-4">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Guides', href: '/guides' },
        { label: 'Understanding the Dashboard' },
      ]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LayoutDashboard className="w-4 h-4" />
          <span>Getting Started</span>
          <ChevronRight className="w-3 h-3" />
          <span>Article · 2 min read</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Understanding the Dashboard</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Your dashboard is the first thing you see when you log in. It's designed to give you a quick read on what's happening at the barn today — without digging through menus.
        </p>
      </div>

      <hr className="border-border" />

      {/* Section 1 — Greeting & barn name */}
      <Section number={1} title="The header — where you are and what day it is">
        <p className="text-foreground/80 leading-relaxed">
          At the top of the page you'll see a greeting (<em>"Good morning"</em>, <em>"Good afternoon"</em>, or <em>"Good evening"</em> depending on the time of day), today's date, and the name of your currently selected barn.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          If you manage more than one barn, you can switch between them using the barn switcher in the left sidebar — the rest of the dashboard updates to reflect the selected barn.
        </p>
        <Screenshot label="Dashboard header showing greeting, date, and barn name" />
        <Tip>The "Add Horse" button in the top-right corner is a shortcut to add a new horse without navigating to the Horses section first.</Tip>
      </Section>

      {/* Section 2 — Today's schedule alert */}
      <Section number={2} title="Today's Schedule banner">
        <p className="text-foreground/80 leading-relaxed">
          If any events are scheduled for today — vet visits, farrier appointments, competitions — a gold banner appears at the top of the page listing them. This only shows up when there's something happening today, so if you don't see it, your schedule is clear.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          Up to three events are shown inline. If there are more, a "+N more" link takes you straight to the full calendar for today.
        </p>
        <Screenshot label="Today's Schedule banner showing two events for the day" aspectRatio="aspect-[16/4]" />
        <Tip>Click "View all →" on the banner to jump directly to today's calendar view.</Tip>
      </Section>

      {/* Section 3 — Stat cards */}
      <Section number={3} title="The four stat cards">
        <p className="text-foreground/80 leading-relaxed">
          Below the header (or below the schedule banner if it's showing) you'll find four summary cards. These give you an at-a-glance count of the most important things in your barn right now.
        </p>

        <Screenshot label="The four stat cards: Active Horses, Events, Tasks, and Today" />

        <div className="space-y-4">
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <span className="text-amber-600 text-xs font-bold">🐴</span>
              </div>
              <p className="font-semibold text-foreground">Active Horses</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              How many horses in your barn have an <strong>Active</strong> status. If any horses are on layup, a small note appears below the number — for example "2 on layup" — so you know without opening the horse list.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <p className="font-semibold text-foreground">Events (this week)</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The number of events scheduled for the current week across all horses. Click this card to go straight to the Schedule page.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
              </div>
              <p className="font-semibold text-foreground">Tasks (pending)</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Open tasks that haven't been completed yet. If any tasks have been finished today, a green "X done" count shows below the number as a small encouragement. Click to go to Daily Care.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-amber-500" />
              </div>
              <p className="font-semibold text-foreground">Today</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              How many events are scheduled specifically for today (as opposed to the full week). A count of 0 means nothing on the calendar for today.
            </p>
          </div>
        </div>
      </Section>

      {/* Section 4 — Barn Overview / Tasks */}
      <Section number={4} title="Barn Overview — your task list">
        <p className="text-foreground/80 leading-relaxed">
          The large panel on the left side of the main grid is your <strong>Barn Overview</strong>. It shows your five most urgent pending tasks, sorted by due date so the most overdue ones appear first.
        </p>
        <Screenshot label="Barn Overview panel showing a list of pending tasks with checkboxes" />
        <p className="text-foreground/80 leading-relaxed">
          Each task shows the horse it's linked to (if any), its due date, and an "Urgent" badge if it was flagged as high priority. To complete a task, click the circle on the left — it'll get a strikethrough, then fade out after a moment. A toast notification appears at the bottom of the screen with an <strong>Undo</strong> option in case you checked off the wrong one.
        </p>
        <Tip>Click "View all" in the top-right of the Barn Overview panel to see your complete task list in Daily Care.</Tip>
      </Section>

      {/* Section 5 — Quick Actions */}
      <Section number={5} title="Quick Actions">
        <p className="text-foreground/80 leading-relaxed">
          In the right column, the <strong>Quick Actions</strong> card gives you four one-click shortcuts for the things you do most often during the day:
        </p>
        <Screenshot label="Quick Actions card showing Health Check, Add Event, Log Meds, and Tasks shortcuts" aspectRatio="aspect-[16/6]" />
        <ul className="space-y-2 text-sm text-foreground/80">
          <li className="flex items-start gap-2">
            <Activity className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span><strong>Health Check</strong> — log a daily health observation for any horse (temperature, attitude, feed intake, etc.)</span>
          </li>
          <li className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <span><strong>Add Event</strong> — jump straight to the calendar to schedule something new</span>
          </li>
          <li className="flex items-start gap-2">
            <Syringe className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <span><strong>Log Meds</strong> — record that a medication was given today</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <span><strong>Tasks</strong> — go to the full task list in Daily Care</span>
          </li>
        </ul>
      </Section>

      {/* Section 6 — Upcoming Events */}
      <Section number={6} title="Upcoming Events">
        <p className="text-foreground/80 leading-relaxed">
          Below Quick Actions is a short list of your next four upcoming events. Each one shows the event name, which horse it's for, and a relative date label — <strong>Today</strong>, <strong>Tomorrow</strong>, or the month and day if it's further out.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          Clicking any event takes you to that specific day in the calendar so you can see full details or make changes.
        </p>
        <Screenshot label="Upcoming Events panel showing four events with horse names and dates" aspectRatio="aspect-[16/6]" />
      </Section>

      {/* Section 7 — Horses */}
      <Section number={7} title="Horses preview">
        <p className="text-foreground/80 leading-relaxed">
          At the bottom of the right column is a preview of your first four horses with their profile photo (or initial if no photo has been added), name, and breed. If any horse is on layup, an amber "Layup" badge appears on their row.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          Click any horse to go directly to their profile, or click "View all" to open the full Horses list.
        </p>
        <Screenshot label="Horses panel showing four horses with photos, names, and breeds" aspectRatio="aspect-[16/6]" />
      </Section>

      {/* Section 8 — Getting Started checklist */}
      <Section number={8} title="The Getting Started checklist (new barns only)">
        <p className="text-foreground/80 leading-relaxed">
          When you first create a barn, a checklist appears between the stat cards and the main grid. It walks you through the four steps to get fully set up: adding a horse, setting up a stall or paddock, scheduling an event, and completing your first task.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          Each step has a checkbox that fills in automatically as you complete it. The checklist disappears on its own once all four steps are done — you won't see it again after that.
        </p>
        <Screenshot label="Getting Started checklist with four steps, two of them already checked off" />
      </Section>

      <hr className="border-border" />

      {/* Next steps */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What to read next</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/logging-vaccinations-and-medications', label: 'Logging vaccinations & medications', desc: 'Record vaccines with due-date tracking and manage active medications.' },
            { href: '/guides', label: 'Back to all guides', desc: 'Browse the full guide library.' },
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
          <p className="text-sm font-medium text-muted-foreground">Jump to the app</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: '/horses', label: 'Horses' },
              { href: '/daily-care', label: 'Daily Care' },
              { href: '/calendar', label: 'Schedule' },
            ].map(link => (
              <Link key={link.href} href={link.href} className="btn-secondary btn-md text-sm">
                {link.label} →
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Help CTA */}
      <div className="card p-5 bg-muted/30 text-center">
        <p className="text-sm text-muted-foreground">Something not making sense?</p>
        <a href="mailto:support@barnkeep.com" className="text-sm font-medium text-primary hover:underline mt-1 inline-block">
          Email support@barnkeep.com →
        </a>
      </div>
    </div>
  );
}
