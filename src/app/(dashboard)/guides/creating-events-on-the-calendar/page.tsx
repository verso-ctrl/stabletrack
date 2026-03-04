'use client';

import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Camera, ChevronRight, Calendar } from 'lucide-react';

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

export default function CreatingEventsOnTheCalendarGuide() {
  return (
    <div className="max-w-3xl space-y-8 mt-4">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Guides', href: '/guides' },
        { label: 'Creating events on the calendar' },
      ]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Schedule & Tasks</span>
          <ChevronRight className="w-3 h-3" />
          <span>Article · 4 min read</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Creating events on the calendar</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          The Schedule page is where you track vet visits, farrier appointments, competitions, and anything else that needs to happen on a specific date. Here's how to create and manage events.
        </p>
      </div>

      <hr className="border-border" />

      <Section number={1} title="Opening the calendar">
        <p className="text-foreground/80 leading-relaxed">
          Click <strong>Schedule</strong> in the sidebar to open the calendar. By default you'll see a <strong>month view</strong> — a full calendar grid with dots on dates that have events. You can switch to a <strong>list view</strong> (showing upcoming events sorted by date) using the toggle buttons in the top right.
        </p>
        <Screenshot label="Calendar in month view showing colored dots on dates with events" />
        <Tip>In month view, click any date to see the events scheduled for that day in the right sidebar panel.</Tip>
      </Section>

      <Section number={2} title="Step 1 — Event details">
        <p className="text-foreground/80 leading-relaxed">
          To create a new event, click the <strong>"+ Add Event"</strong> button (or double-click any date in the month view). This opens a two-step form. The first step covers event details:
        </p>
        <Screenshot label="Add Event form Step 1 showing event type buttons and detail fields" />
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-4 space-y-2 text-sm text-foreground/80">
            <p className="font-semibold text-foreground">Event Type (required)</p>
            <p>Choose from 10 event types. Selecting one auto-fills the title field — you can change the title afterward.</p>
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {['Veterinary', 'Farrier', 'Vaccination', 'Dental', 'Deworming', 'Show / Competition', 'Training', 'Transport', 'Breeding', 'Other'].map(t => (
                <span key={t} className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs">{t}</span>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1 text-sm text-foreground/80">
            <ul className="space-y-1.5">
              <li><strong>Title</strong> — required. Auto-filled based on event type; edit it to be more specific (e.g., "Spring Coggins — Dr. Johnson").</li>
              <li><strong>Date</strong> — required. The date of the event.</li>
              <li><strong>Time</strong> — optional. Defaults to 9:00 AM.</li>
              <li><strong>Provider Name &amp; Phone</strong> — optional. Available for vet, farrier, vaccination, dental, and deworming events. Useful for keeping contact info attached to the appointment.</li>
              <li><strong>Location</strong> — available for competitions. Enter the venue or address.</li>
              <li><strong>Notes</strong> — optional. Any additional context.</li>
            </ul>
          </div>
        </div>
        <p className="text-foreground/80 leading-relaxed">
          Click <strong>Next</strong> to move to step 2.
        </p>
      </Section>

      <Section number={3} title="Step 2 — Select horses">
        <p className="text-foreground/80 leading-relaxed">
          The second step asks which horses this event applies to. By default, <strong>"All horses / Barn-wide"</strong> is selected — this is the right choice for something like a barn-wide deworming day or a vet who's coming to check everyone.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          To assign the event to specific horses only, uncheck "All horses" and check the individual horses from the list. The form shows a count of how many horses you've selected.
        </p>
        <Screenshot label="Add Event Step 2 showing a checkbox list of horses with some selected" aspectRatio="aspect-[16/5]" />
        <p className="text-foreground/80 leading-relaxed">
          Click <strong>"Create Event"</strong> to save. The event appears on the calendar immediately.
        </p>
        <Tip>Events assigned to specific horses also appear on that horse's Events tab in their profile — so you can see a horse's full appointment history from one place.</Tip>
      </Section>

      <Section number={4} title="Editing and deleting events">
        <p className="text-foreground/80 leading-relaxed">
          To edit or delete an event, hover over it in the calendar (or find it in list view) and click the <strong>pencil icon</strong> to edit or the <strong>trash icon</strong> to delete.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          The edit form lets you change the event type, title, date, time, and notes. A red <strong>Delete</strong> button in the edit form also lets you remove the event. Deleting asks for confirmation before removing the event permanently.
        </p>
      </Section>

      <Section number={5} title="Month view vs. list view">
        <p className="text-foreground/80 leading-relaxed">
          <strong>Month view</strong> shows the calendar grid with colored dots on dates that have events. Color-coding indicates the event type — blue for vet, green for vaccination, and so on. Click a date to see the events for that day in the right panel.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          <strong>List view</strong> shows your next 20 upcoming events sorted by date. This is easier to scan when you just want to know what's coming up.
        </p>
      </Section>

      <hr className="border-border" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What to read next</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/managing-tasks', label: 'Managing tasks', desc: 'Create and track one-off and recurring barn tasks.' },
            { href: '/guides/setting-reminders', label: 'Setting reminders', desc: 'Stay on top of events with Google Calendar sync.' },
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
