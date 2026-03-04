'use client';

import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Camera, ChevronRight, Heart } from 'lucide-react';

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

export default function LoggingAHeatCycleGuide() {
  return (
    <div className="max-w-3xl space-y-8 mt-4">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Guides', href: '/guides' },
        { label: 'Logging a heat cycle' },
      ]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Heart className="w-4 h-4" />
          <span>Breeding Tracker</span>
          <ChevronRight className="w-3 h-3" />
          <span>Article · 2 min read</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Logging a heat cycle</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Recording heat cycles helps you spot patterns, time breeding windows, and let BarnKeep predict when a mare is likely to cycle again.
        </p>
      </div>

      <hr className="border-border" />

      <Section number={1} title="Opening the Heat Cycles tab">
        <p className="text-foreground/80 leading-relaxed">
          Go to <strong>Breeding</strong> in the sidebar and click the <strong>Heat Cycles</strong> tab. You'll see a list of previously recorded cycles (or an empty state if none have been logged yet) and a <strong>"Log Heat Cycle"</strong> button in the top-right corner.
        </p>
        <Screenshot label="Heat Cycles tab showing a list of recorded cycles and the log button" aspectRatio="aspect-[16/5]" />
        <p className="text-foreground/80 leading-relaxed">
          You can also log a heat cycle from a mare's horse profile — open the horse, go to the <strong>Breeding</strong> tab, and find the Heat Cycles section there.
        </p>
      </Section>

      <Section number={2} title="Filling in the heat cycle form">
        <p className="text-foreground/80 leading-relaxed">
          Click <strong>"Log Heat Cycle"</strong> to open the form. You'll need to fill in:
        </p>
        <div className="rounded-lg border border-border p-4 space-y-2 text-sm text-foreground/80">
          <ul className="space-y-2">
            <li><strong>Mare</strong> — select which mare this cycle belongs to. If you're already viewing a specific mare's profile, this is pre-filled.</li>
            <li><strong>Date Observed</strong> — the date you first noticed signs of estrus.</li>
            <li><strong>Signs Observed</strong> — describe what you noticed (e.g., "Squatting, receptive to stallion, increased urination"). This is a free-text field.</li>
            <li><strong>Intensity</strong> — how strong the heat appears (mild, moderate, strong), if your vet uses this scale.</li>
            <li><strong>Notes</strong> — any additional context (e.g., "Checked by vet, follicle at 35mm").</li>
          </ul>
        </div>
        <Screenshot label="Log Heat Cycle form showing mare selection, date, and signs observed fields" aspectRatio="aspect-[16/5]" />
        <p className="text-foreground/80 leading-relaxed">
          Click <strong>Save</strong> to record the cycle. It immediately appears in the Heat Cycles list.
        </p>
      </Section>

      <Section number={3} title="Predicted next cycle">
        <p className="text-foreground/80 leading-relaxed">
          Once you have a few heat cycles logged for a mare, BarnKeep calculates the average interval between them and displays a <strong>predicted next cycle date</strong> on the Heat Cycles tab. This is a helpful guide — not a guarantee — based on the mare's own history rather than a generic 21-day average.
        </p>
        <Tip>The more heat cycles you log, the more accurate the prediction becomes. Aim to record every cycle you observe, even if you're not planning to breed that month.</Tip>
      </Section>

      <Section number={4} title="Viewing the cycle timeline">
        <p className="text-foreground/80 leading-relaxed">
          The Heat Cycle Timeline (shown on the breeding overview for a mare) displays all logged cycles on a visual timeline. This makes it easy to spot seasonal patterns or irregularities that might be worth discussing with your vet.
        </p>
      </Section>

      <hr className="border-border" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What to read next</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/recording-a-breeding', label: 'Recording a breeding', desc: 'Log a breeding event with mare, stallion, type, vet, and stud fee.' },
            { href: '/guides/breeding-tracker-overview', label: 'Breeding tracker overview', desc: 'How the five tabs work together.' },
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
            <Link href="/breeding" className="btn-secondary btn-md text-sm">Breeding →</Link>
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
