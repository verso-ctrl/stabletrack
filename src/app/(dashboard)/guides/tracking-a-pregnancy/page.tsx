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

export default function TrackingAPregnancyGuide() {
  return (
    <div className="max-w-3xl space-y-8 mt-4">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Guides', href: '/guides' },
        { label: 'Tracking a pregnancy' },
      ]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Heart className="w-4 h-4" />
          <span>Breeding Tracker</span>
          <ChevronRight className="w-3 h-3" />
          <span>Article · 3 min read</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Tracking a pregnancy</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Once a mare has been confirmed in foal, BarnKeep keeps tabs on her pregnancy — check results, due date, and how far along she is — all in one place.
        </p>
      </div>

      <hr className="border-border" />

      <Section number={1} title="Creating a pregnancy record">
        <p className="text-foreground/80 leading-relaxed">
          Go to <strong>Breeding → Pregnancies</strong> and click <strong>"Add Pregnancy."</strong> You'll link this pregnancy to:
        </p>
        <div className="rounded-lg border border-border p-4 space-y-2 text-sm text-foreground/80">
          <ul className="space-y-2">
            <li><strong>Mare</strong> — which mare is confirmed in foal.</li>
            <li><strong>Breeding Record</strong> — link back to the breeding event that produced this pregnancy (optional, but keeps your records connected).</li>
            <li><strong>Breeding Date / Conception Date</strong> — used to calculate the estimated due date. Equine gestation is approximately 340 days (about 11 months).</li>
            <li><strong>Status</strong> — Active, Confirmed, or Pending (before the first check).</li>
            <li><strong>Notes</strong> — any initial notes from the vet.</li>
          </ul>
        </div>
        <Screenshot label="Add Pregnancy form showing mare, breeding date, and status fields" aspectRatio="aspect-[16/5]" />
        <p className="text-foreground/80 leading-relaxed">
          Once saved, BarnKeep calculates an <strong>estimated due date</strong> and shows a <strong>gestation progress bar</strong> — a visual indicator of how far along the pregnancy is based on the breeding date.
        </p>
      </Section>

      <Section number={2} title="Logging pregnancy check results">
        <p className="text-foreground/80 leading-relaxed">
          Your vet will check the pregnancy at regular intervals (typically day 14–18, day 25–30, and again around day 45–60). Each time, open the pregnancy record and click <strong>"Add Check"</strong> to log the result.
        </p>
        <div className="rounded-lg border border-border p-4 space-y-2 text-sm text-foreground/80">
          <ul className="space-y-2">
            <li><strong>Check Date</strong> — when the exam was performed.</li>
            <li><strong>Result</strong> — Positive (in foal), Negative (not in foal), or Inconclusive.</li>
            <li><strong>Veterinarian</strong> — who performed the check.</li>
            <li><strong>Notes</strong> — measurements, heartbeat detected, twin check, etc.</li>
          </ul>
        </div>
        <p className="text-foreground/80 leading-relaxed">
          All checks are displayed chronologically on the pregnancy record. If a check comes back negative, you can update the pregnancy status to reflect that — and plan to breed the mare again on her next cycle.
        </p>
        <Tip>Log check results immediately after the vet visit while the details are fresh. The date and vet name are especially important to have on record.</Tip>
      </Section>

      <Section number={3} title="The gestation progress bar">
        <p className="text-foreground/80 leading-relaxed">
          Each pregnancy card in the Pregnancies list shows a colored progress bar indicating how far along the mare is in her roughly 11-month gestation. The estimated due date is displayed alongside the bar.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          As the due date approaches, you can start planning for the foaling — and when the time comes, record the birth in the <strong>Foalings</strong> tab.
        </p>
      </Section>

      <Section number={4} title="Adding in-utero nominations">
        <p className="text-foreground/80 leading-relaxed">
          If you plan to nominate the unborn foal to a futurity or stakes program, you can track those nominations directly on the pregnancy record. See the <strong>In-utero nominations</strong> guide for details.
        </p>
      </Section>

      <hr className="border-border" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What to read next</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/recording-a-foaling', label: 'Recording a foaling', desc: 'Document the birth outcome and add the foal to your herd.' },
            { href: '/guides/in-utero-nominations', label: 'In-utero nominations', desc: 'Track futurity nominations for a foal before it\'s born.' },
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
