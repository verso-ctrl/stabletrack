'use client';

import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Camera, ChevronRight, Calendar, Bell } from 'lucide-react';

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

export default function SettingRemindersGuide() {
  return (
    <div className="max-w-3xl space-y-8 mt-4">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Guides', href: '/guides' },
        { label: 'Setting reminders' },
      ]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Schedule & Tasks</span>
          <ChevronRight className="w-3 h-3" />
          <span>Article · 2 min read</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Setting reminders</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          BarnKeep keeps you ahead of upcoming events in several ways — from the dashboard banner to Google Calendar sync. Here's how to make sure nothing slips through the cracks.
        </p>
      </div>

      <hr className="border-border" />

      <Section number={1} title="The dashboard schedule banner">
        <p className="text-foreground/80 leading-relaxed">
          The quickest reminder in BarnKeep is right on the dashboard. If any events are scheduled for today, a <strong>gold banner</strong> appears at the top of the dashboard listing them. Up to three events are shown inline; if there are more, a "+N more" link takes you to the full calendar for today.
        </p>
        <Screenshot label="Dashboard schedule banner showing two events scheduled for today" aspectRatio="aspect-[16/4]" />
        <p className="text-foreground/80 leading-relaxed">
          There's also an <strong>Upcoming Events</strong> card on the right side of the dashboard showing your next four scheduled events with relative dates (Today, Tomorrow, or the month and day). Clicking any event jumps you to that day on the calendar.
        </p>
      </Section>

      <Section number={2} title="Vaccination due-date alerts">
        <p className="text-foreground/80 leading-relaxed">
          Vaccinations with a <strong>Next Due Date</strong> get automatic alerts. On the horse's Health tab, any vaccine due within the next 30 days displays a yellow <strong>"Due Soon"</strong> badge. This is a passive reminder — no setup required beyond entering the next due date when you log the vaccination.
        </p>
        <Tip>When logging a vaccination, always fill in the "Next Due Date" field. That's what powers the Due Soon badge.</Tip>
      </Section>

      <Section number={3} title="Google Calendar sync">
        <p className="text-foreground/80 leading-relaxed">
          For calendar-based reminders on your phone, you can sync BarnKeep events with Google Calendar. On the Schedule page, click the <strong>Sync</strong> button to open the Calendar Settings panel.
        </p>
        <Screenshot label="Calendar Settings panel showing Google Calendar connection status and sync options" aspectRatio="aspect-[16/5]" />
        <p className="text-foreground/80 leading-relaxed">
          If you haven't connected yet, click <strong>"Connect Google Calendar."</strong> Once connected, you can:
        </p>
        <ul className="text-sm text-foreground/80 space-y-1.5 list-disc pl-5">
          <li>Click <strong>"Sync Now"</strong> to push your current events to Google Calendar</li>
          <li>Choose which types of data to sync: <strong>Events</strong>, <strong>Lessons</strong>, and <strong>Tasks</strong></li>
        </ul>
        <p className="text-foreground/80 leading-relaxed">
          After syncing, events appear in your Google Calendar where you can set standard Google reminders — push notifications, email alerts, or SMS — just like any other event.
        </p>
        <Tip>Syncing to Google Calendar is the best way to get a push notification on your phone before an important appointment. Set a reminder in Google Calendar for 1 day or 1 hour before the event after it syncs.</Tip>
      </Section>

      <Section number={4} title="Task due dates as your checklist">
        <p className="text-foreground/80 leading-relaxed">
          Tasks with due dates act as their own reminders. On the dashboard, the Barn Overview panel shows your five most urgent pending tasks sorted by due date — overdue tasks appear first. The dashboard stat card for <strong>Tasks</strong> also shows the count of pending tasks so you can't miss a pile-up.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          For recurring maintenance like monthly deworming or weekly water trough cleaning, set up a <strong>repeating task</strong> so it shows up automatically without any manual entry each time.
        </p>
      </Section>

      <hr className="border-border" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What to read next</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/creating-events-on-the-calendar', label: 'Creating events on the calendar', desc: 'Schedule vet visits, farrier appointments, and competitions.' },
            { href: '/guides/managing-tasks', label: 'Managing tasks', desc: 'Create and track one-off and recurring barn tasks.' },
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
              { href: '/calendar', label: 'Schedule' },
              { href: '/dashboard', label: 'Dashboard' },
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
