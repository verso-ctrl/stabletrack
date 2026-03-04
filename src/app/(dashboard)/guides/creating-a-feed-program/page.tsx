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

export default function CreatingAFeedProgramGuide() {
  return (
    <div className="max-w-3xl space-y-8 mt-4">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Guides', href: '/guides' },
        { label: 'Creating a feed program' },
      ]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="w-4 h-4" />
          <span>Daily Care & Feeding</span>
          <ChevronRight className="w-3 h-3" />
          <span>Article · 5 min read</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Creating a feed program</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          A feed program tells BarnKeep what each horse eats, how much, and when. Once set up, it populates the feed chart automatically so your whole team knows exactly what to give each horse.
        </p>
      </div>

      <hr className="border-border" />

      <Section number={1} title="Finding the feed program editor">
        <p className="text-foreground/80 leading-relaxed">
          Feed programs are set per-horse. Open a horse's profile and go to the <strong>Care</strong> tab. If no feed program has been set up yet, you'll see an empty state with an <strong>"Edit Feed Program"</strong> button. If a program already exists, the current items are listed and you can click the edit button to make changes.
        </p>
        <Screenshot label="Care tab showing the feed program section with existing items and the edit button" aspectRatio="aspect-[16/5]" />
      </Section>

      <Section number={2} title="Naming the program (optional)">
        <p className="text-foreground/80 leading-relaxed">
          At the top of the editor you can give this feed program a <strong>name</strong> — something like "Senior Diet" or "Performance Feed." The name is optional but helpful if you manage multiple horses with different programs, since it appears in amber text at the top of the Care tab as a quick label.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          There's also a <strong>"Load Template"</strong> dropdown. If you've previously saved a template for another horse, you can load it here to pre-fill the form — a good time-saver if most of your horses eat the same thing.
        </p>
      </Section>

      <Section number={3} title="Adding feed items">
        <p className="text-foreground/80 leading-relaxed">
          Each item in the feed program represents one thing the horse eats. Click <strong>"+ Add Item"</strong> to add a row. Each row has four fields:
        </p>
        <Screenshot label="Feed program editor showing two feed item rows with name, amount, unit, and feeding time fields" />
        <div className="rounded-lg border border-border p-4 space-y-2 text-sm text-foreground/80">
          <ul className="space-y-2">
            <li><strong>Feed Name</strong> — type the name of the feed (e.g., "Timothy Hay," "Senior Grain," "Electrolyte Supplement").</li>
            <li>
              <strong>Amount</strong> — enter a number (e.g., 2, 0.5, 3).
            </li>
            <li>
              <strong>Unit</strong> — choose from:
              <span className="block mt-1 ml-4">lbs · oz · cups · flakes · scoops</span>
            </li>
            <li>
              <strong>Feeding Time</strong> — when this item is given:
              <ul className="mt-1 ml-4 space-y-0.5">
                <li>AM — morning feeding</li>
                <li>PM — evening feeding</li>
                <li>Midday — midday feeding</li>
                <li>Both AM &amp; PM — given at both morning and evening</li>
              </ul>
            </li>
          </ul>
        </div>
        <p className="text-foreground/80 leading-relaxed">
          Add as many items as the horse needs. Click the <strong>X icon</strong> on any row to remove it (you need at least one item).
        </p>
        <Tip>If a horse gets hay twice a day and grain once in the morning, add two rows: one for hay with "Both AM &amp; PM" and one for grain with "AM."</Tip>
      </Section>

      <Section number={4} title="Special instructions">
        <p className="text-foreground/80 leading-relaxed">
          At the bottom of the editor is a <strong>Special Instructions</strong> textarea. Use this for anything your team needs to know that isn't captured in the feed items — for example:
        </p>
        <ul className="text-sm text-foreground/80 space-y-1 list-disc pl-5">
          <li>"Always soak the senior grain before feeding"</li>
          <li>"Allergic to alfalfa — hay must be timothy only"</li>
          <li>"Give electrolytes in PM only on competition days"</li>
        </ul>
        <p className="text-foreground/80 leading-relaxed">
          These instructions appear in an amber callout box on the Care tab and are also visible on the feed chart.
        </p>
      </Section>

      <Section number={5} title="Saving and using templates">
        <p className="text-foreground/80 leading-relaxed">
          You have two save options at the bottom of the form:
        </p>
        <div className="space-y-3">
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="font-semibold text-foreground text-sm">Save Feed Program</p>
            <p className="text-sm text-muted-foreground">Saves this program to the current horse. The feed chart will update automatically to reflect the new schedule.</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="font-semibold text-foreground text-sm">Save Template</p>
            <p className="text-sm text-muted-foreground">Saves the current program as a reusable template. Next time you set up a feed program for another horse, you can load this template from the dropdown at the top of the editor.</p>
          </div>
        </div>
        <Tip>Save a template after setting up your first horse. If you have multiple horses on similar diets, loading the template and making small adjustments is much faster than starting from scratch each time.</Tip>
      </Section>

      <Section number={6} title="Medications that need to go with food">
        <p className="text-foreground/80 leading-relaxed">
          If a horse has an active medication that should be given with food — set via the medication's route or frequency — an amber alert box appears at the top of the Care tab listing those medications. The same reminder shows up as a purple banner on the feed chart for each affected feeding time.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          This is automatic — you don't need to add medications to the feed program manually. As long as the medication is recorded on the Health tab, BarnKeep will flag it at the right feeding times.
        </p>
      </Section>

      <hr className="border-border" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What to read next</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/using-the-feed-chart', label: 'Using the feed chart', desc: 'How to read and mark feedings complete on the daily feed chart.' },
            { href: '/guides/logging-daily-care', label: 'Logging daily care', desc: 'Record health checks, feedings, and medications for each day.' },
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
