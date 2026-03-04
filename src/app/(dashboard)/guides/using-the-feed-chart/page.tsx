'use client';

import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Camera, ChevronRight, Activity } from 'lucide-react';

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

export default function UsingTheFeedChartGuide() {
  return (
    <div className="max-w-3xl space-y-8 mt-4">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Guides', href: '/guides' },
        { label: 'Using the feed chart' },
      ]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="w-4 h-4" />
          <span>Daily Care & Feeding</span>
          <ChevronRight className="w-3 h-3" />
          <span>Article · 2 min read</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Using the feed chart</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          The feed chart is your barn's daily feeding schedule in one view — all horses, all feeding times, all in a single scrollable table. Use it to track what's been fed and what still needs to happen.
        </p>
      </div>

      <hr className="border-border" />

      <Section number={1} title="What you see on the feed chart">
        <p className="text-foreground/80 leading-relaxed">
          The feed chart at <strong>/feed-chart</strong> is a table with your horses listed on the left and six feeding times across the top:
        </p>
        <div className="grid grid-cols-3 gap-2 text-sm">
          {['Early AM', 'Morning', 'Midday', 'Afternoon', 'Evening', 'Night'].map(t => (
            <div key={t} className="rounded-lg border border-border px-3 py-2 text-center font-medium text-foreground">{t}</div>
          ))}
        </div>
        <p className="text-foreground/80 leading-relaxed mt-3">
          Each cell shows the feed items scheduled for that horse at that time (name and amount), along with the current status of that feeding.
        </p>
        <Screenshot label="Feed chart table showing horses on the left and feeding time columns with status indicators" />
        <p className="text-foreground/80 leading-relaxed">
          At the top of the page, four stat cards show: total horses, how many have feed programs, how many feeding times are scheduled, and how many feedings have been marked complete today.
        </p>
      </Section>

      <Section number={2} title="Marking a feeding complete or skipped">
        <p className="text-foreground/80 leading-relaxed">
          Each cell that has a scheduled feeding shows two action buttons in pending state:
        </p>
        <ul className="text-sm text-foreground/80 space-y-1.5 list-disc pl-5">
          <li><strong>Checkmark (✓)</strong> — marks the feeding as complete. The cell turns green.</li>
          <li><strong>X</strong> — marks it as skipped. The cell turns red.</li>
        </ul>
        <p className="text-foreground/80 leading-relaxed">
          Once a feeding is marked, the buttons are replaced with the result icon. You can undo a marking by clicking the icon again.
        </p>
        <Tip>Print the feed chart for your barn staff before morning feeding. Use the <strong>Print</strong> button at the top of the page to generate a clean, printer-friendly version.</Tip>
      </Section>

      <Section number={3} title="Adding a feeding note">
        <p className="text-foreground/80 leading-relaxed">
          Each cell also has a small message icon (speech bubble). Click it to add a <strong>feeding note</strong> for that specific horse and time — for example, "Didn't finish grain" or "Horse seemed off, only ate half." Notes are saved per feeding and visible to your whole team.
        </p>
      </Section>

      <Section number={4} title="Navigating dates">
        <p className="text-foreground/80 leading-relaxed">
          The feed chart defaults to today. Use the <strong>previous and next arrow buttons</strong> on either side of the date to move to a different day, or click the date directly to open a date picker. Click the <strong>"Go to Today"</strong> link to jump back to the current date.
        </p>
        <Tip>You can look at yesterday's chart to verify everything was logged — handy if your team fills it in after the fact.</Tip>
      </Section>

      <Section number={5} title="Filtering by horse status">
        <p className="text-foreground/80 leading-relaxed">
          A status dropdown in the top right lets you filter which horses appear in the chart:
        </p>
        <ul className="text-sm text-foreground/80 space-y-1 list-disc pl-5">
          <li><strong>Active &amp; Layup</strong> — the default; shows all horses that need feeding</li>
          <li><strong>Active Only</strong> — hides horses on layup</li>
          <li><strong>Layup Only</strong> — shows only layup horses</li>
        </ul>
      </Section>

      <Section number={6} title="The medication warning banner">
        <p className="text-foreground/80 leading-relaxed">
          If any horses have active medications that should be given with food, a <strong>purple banner</strong> appears below each affected horse in the chart. It lists the medication name, dosage, and any special instructions. This is a reminder to include the medication with that feeding — it doesn't automatically mark the medication as given.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          To log that a medication was actually administered, go to <strong>Daily Care → Medications</strong>.
        </p>
      </Section>

      <hr className="border-border" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What to read next</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/creating-a-feed-program', label: 'Creating a feed program', desc: 'Set up each horse\'s hay, grain, and supplement schedule.' },
            { href: '/guides/logging-daily-care', label: 'Logging daily care', desc: 'Record health checks, feedings, and medication logs for the day.' },
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
              { href: '/feed-chart', label: 'Feed Chart' },
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
