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

export default function RecordingABreedingGuide() {
  return (
    <div className="max-w-3xl space-y-8 mt-4">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Guides', href: '/guides' },
        { label: 'Recording a breeding' },
      ]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Heart className="w-4 h-4" />
          <span>Breeding Tracker</span>
          <ChevronRight className="w-3 h-3" />
          <span>Article · 4 min read</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Recording a breeding</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Every time a mare is bred, create a breeding record to document the event — which stallion, what method, who was there, and how much it cost. These records form the backbone of your breeding history.
        </p>
      </div>

      <hr className="border-border" />

      <Section number={1} title="Opening the Records tab">
        <p className="text-foreground/80 leading-relaxed">
          Go to <strong>Breeding</strong> in the sidebar and click the <strong>Breeding Records</strong> tab. You'll see all past breeding records in a list. Click <strong>"Record Breeding"</strong> to add a new entry.
        </p>
        <Screenshot label="Records tab showing a list of past breeding events and the Record Breeding button" aspectRatio="aspect-[16/5]" />
      </Section>

      <Section number={2} title="Filling in the breeding record">
        <p className="text-foreground/80 leading-relaxed">
          The breeding record form captures everything about the breeding event:
        </p>
        <Screenshot label="Record Breeding form showing mare, stallion, breeding type, and date fields" />
        <div className="rounded-lg border border-border p-4 space-y-2 text-sm text-foreground/80">
          <ul className="space-y-2">
            <li>
              <strong>Mare</strong> — select the mare being bred. Dropdown shows all mares in your barn.
            </li>
            <li>
              <strong>Stallion</strong> — select from your stallion database (added via the Stallions tab) or enter a new stallion name. You can also link to a stallion in your barn if you own him.
            </li>
            <li>
              <strong>Breeding Date</strong> — the date the breeding took place.
            </li>
            <li>
              <strong>Breeding Type</strong> — choose from:
              <ul className="mt-1 ml-4 space-y-0.5">
                <li><strong>Natural Cover</strong> — bred naturally in-hand or at pasture</li>
                <li><strong>AI (Fresh Semen)</strong> — artificial insemination with fresh semen</li>
                <li><strong>AI (Cooled Semen)</strong> — artificial insemination with shipped cooled semen</li>
                <li><strong>AI (Frozen Semen)</strong> — artificial insemination with frozen semen</li>
                <li><strong>Embryo Transfer</strong> — embryo transferred to a recipient mare</li>
              </ul>
            </li>
            <li>
              <strong>Veterinarian</strong> — the vet who performed or supervised the breeding.
            </li>
            <li>
              <strong>Stud Fee</strong> — the fee paid to the stallion owner. Stored for your records.
            </li>
            <li>
              <strong>Notes</strong> — any other details worth recording (e.g., "Mare was teased first," "Second cover," "AI successful, semen from Farm X").
            </li>
          </ul>
        </div>
        <Tip>Add stallions to the Stallions tab before recording a breeding — it's faster than typing the information from scratch each time, especially for stallions you use regularly.</Tip>
      </Section>

      <Section number={3} title="After the breeding — confirming pregnancy">
        <p className="text-foreground/80 leading-relaxed">
          After 14–18 days, your vet will typically do a pregnancy check via ultrasound. If the check is positive, go to the <strong>Pregnancies</strong> tab and create a pregnancy record linked to this breeding. You can then log subsequent check results there and track the gestation progress.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          If the breeding didn't result in a pregnancy, you can note that on the breeding record and start the cycle again when the mare comes back into heat.
        </p>
      </Section>

      <hr className="border-border" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What to read next</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/tracking-a-pregnancy', label: 'Tracking a pregnancy', desc: 'Log pregnancy check results and monitor the gestation progress bar.' },
            { href: '/guides/logging-a-heat-cycle', label: 'Logging a heat cycle', desc: 'Record signs of estrus before planning a breeding.' },
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
