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

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 px-4 py-3 text-sm text-blue-800 dark:text-blue-300 my-4">
      <span className="font-semibold">Note: </span>{children}
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

export default function BreedingTrackerOverviewGuide() {
  return (
    <div className="max-w-3xl space-y-8 mt-4">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Guides', href: '/guides' },
        { label: 'Breeding tracker overview' },
      ]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Heart className="w-4 h-4" />
          <span>Breeding Tracker</span>
          <ChevronRight className="w-3 h-3" />
          <span>Article · 5 min read</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Breeding tracker overview</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          The Breeding Tracker is an optional add-on that brings your entire breeding program into one place — from heat cycles to foaling, and everything in between.
        </p>
      </div>

      <hr className="border-border" />

      <Note>The Breeding Tracker is a <strong>$10/month add-on</strong> available on top of either the Starter or Farm plan. If you don't see "Breeding" in your sidebar, it hasn't been added to your subscription yet. Go to Settings → Billing to add it.</Note>

      <Section number={1} title="The five tabs">
        <p className="text-foreground/80 leading-relaxed">
          The Breeding section has five tabs that work together to track a mare's reproductive journey from start to finish — or a stallion's breeding history:
        </p>
        <Screenshot label="Breeding tracker page showing the five tab navigation bar" aspectRatio="aspect-[16/3]" />
        <div className="space-y-3">
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="font-semibold text-foreground text-sm">Heat Cycles</p>
            <p className="text-sm text-muted-foreground">Log observed heat cycles for mares. Record signs of estrus, the date observed, and any notes. BarnKeep uses this history to predict the next expected cycle — so you're never caught off guard.</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="font-semibold text-foreground text-sm">Records</p>
            <p className="text-sm text-muted-foreground">Document each breeding event — which mare was bred to which stallion, the breeding type (live cover, AI, embryo transfer), the attending vet, and any stud fees paid. This tab is the historical record of all breeding attempts.</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="font-semibold text-foreground text-sm">Pregnancies</p>
            <p className="text-sm text-muted-foreground">Track confirmed pregnancies with pregnancy check results and dates. Each pregnancy shows a gestation progress bar so you can see at a glance how far along a mare is. Update the status as checks are performed.</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="font-semibold text-foreground text-sm">Foalings</p>
            <p className="text-sm text-muted-foreground">Record the birth outcome — date, time, foal sex, condition, and any complications. You can automatically add the foal to your herd as a new horse profile from within the foaling record.</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="font-semibold text-foreground text-sm">Stallions</p>
            <p className="text-sm text-muted-foreground">Maintain a database of external stallions used in your breeding program — name, breed, registration, contact for the owner, and any notes. This keeps stallion info handy without having to search for it each time.</p>
          </div>
        </div>
      </Section>

      <Section number={2} title="How the tabs connect">
        <p className="text-foreground/80 leading-relaxed">
          The tabs are designed to follow a natural flow:
        </p>
        <ol className="text-sm text-foreground/80 space-y-2 list-decimal pl-5">
          <li>Log a <strong>heat cycle</strong> when you observe the mare coming into heat.</li>
          <li>When you breed her, create a <strong>breeding record</strong> linking the mare to a stallion.</li>
          <li>After a positive pregnancy check, add a <strong>pregnancy</strong> entry and log check results as they come in.</li>
          <li>When the foal arrives, record the <strong>foaling</strong> and optionally add the foal as a new horse.</li>
          <li>Track any pre-birth <strong>nominations</strong> on the pregnancy record.</li>
        </ol>
        <Tip>You don't have to use every tab. If you only want to track heat cycles to time breeding better, just use the Heat Cycles tab. Or if you're keeping records of a stallion's covers, start with the Records tab.</Tip>
      </Section>

      <Section number={3} title="Accessing the breeding tracker from a horse profile">
        <p className="text-foreground/80 leading-relaxed">
          The main Breeding section (accessible from the sidebar) shows all horses. But you can also access breeding data for a specific mare or stallion directly from their horse profile — look for the <strong>Breeding</strong> tab in the horse's tab bar. This tab only appears for mares and stallions (not geldings) when the add-on is active.
        </p>
      </Section>

      <hr className="border-border" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What to read next</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/logging-a-heat-cycle', label: 'Logging a heat cycle', desc: 'Record signs of estrus and let BarnKeep predict the next cycle.' },
            { href: '/guides/recording-a-breeding', label: 'Recording a breeding', desc: 'Log a breeding event with mare, stallion, type, and vet.' },
            { href: '/guides/tracking-a-pregnancy', label: 'Tracking a pregnancy', desc: 'Add pregnancy check results and monitor the gestation progress bar.' },
            { href: '/guides/recording-a-foaling', label: 'Recording a foaling', desc: 'Document the birth outcome and add the foal to your herd.' },
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
              { href: '/breeding', label: 'Breeding' },
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
