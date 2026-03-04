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

export default function RecordingAFoalingGuide() {
  return (
    <div className="max-w-3xl space-y-8 mt-4">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Guides', href: '/guides' },
        { label: 'Recording a foaling' },
      ]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Heart className="w-4 h-4" />
          <span>Breeding Tracker</span>
          <ChevronRight className="w-3 h-3" />
          <span>Article · 3 min read</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Recording a foaling</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          When a foal arrives, record the birth in BarnKeep to close out the pregnancy and — optionally — add the foal as a new horse in your barn.
        </p>
      </div>

      <hr className="border-border" />

      <Section number={1} title="Opening the Foalings tab">
        <p className="text-foreground/80 leading-relaxed">
          Go to <strong>Breeding → Foalings</strong> and click <strong>"Record Foaling."</strong> You can also start from an existing pregnancy record — open the pregnancy and look for the "Record Foaling" button at the bottom, which pre-fills the mare and breeding details.
        </p>
        <Screenshot label="Foalings tab showing a list of past foaling records and the Record Foaling button" aspectRatio="aspect-[16/5]" />
      </Section>

      <Section number={2} title="The foaling record form">
        <p className="text-foreground/80 leading-relaxed">
          The foaling form captures the details of the birth:
        </p>
        <div className="rounded-lg border border-border p-4 space-y-2 text-sm text-foreground/80">
          <ul className="space-y-2">
            <li><strong>Mare</strong> — the dam. Pre-filled if you started from a pregnancy record.</li>
            <li><strong>Date of Birth</strong> — the foal's birthdate.</li>
            <li><strong>Time of Birth</strong> — optional, but useful for registration paperwork.</li>
            <li><strong>Foal Sex</strong> — Colt (male), Filly (female), or Unknown.</li>
            <li><strong>Outcome</strong> — Live birth, Stillborn, or Other.</li>
            <li><strong>Foal Condition</strong> — a description of the foal's initial condition (e.g., "Healthy, nursing within 1 hour," "Required vet intervention for dysmature foal").</li>
            <li><strong>Veterinarian</strong> — the vet who attended the foaling, if applicable.</li>
            <li><strong>Complications</strong> — any issues during delivery (e.g., Red Bag delivery, dystocia).</li>
            <li><strong>Notes</strong> — anything else worth documenting.</li>
          </ul>
        </div>
        <Screenshot label="Record Foaling form showing birth date, foal sex, outcome, and condition fields" />
        <Tip>Even if the foaling was uncomplicated, log it right away while the details are fresh. Birth weight, time, and initial condition matter for the foal's health record.</Tip>
      </Section>

      <Section number={3} title="Adding the foal as a new horse">
        <p className="text-foreground/80 leading-relaxed">
          After recording the foaling, BarnKeep offers the option to <strong>add the foal to your barn</strong> as a new horse profile. If you select this option, the system pre-fills:
        </p>
        <ul className="text-sm text-foreground/80 space-y-1 list-disc pl-5">
          <li>Date of Birth</li>
          <li>Sex (from the foaling record)</li>
          <li>Dam (the mare)</li>
          <li>Sire (from the linked breeding record, if available)</li>
        </ul>
        <p className="text-foreground/80 leading-relaxed">
          You can then fill in the foal's name and any other details. The foal appears in your Horses list just like any other horse, ready for its own health records, photos, and feed program as it grows.
        </p>
      </Section>

      <Section number={4} title="Closing out the pregnancy">
        <p className="text-foreground/80 leading-relaxed">
          When you record a foaling linked to a pregnancy, the pregnancy status updates automatically to reflect that it has concluded. The pregnancy record remains in your history as a permanent record of the reproductive cycle.
        </p>
      </Section>

      <hr className="border-border" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What to read next</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/adding-your-first-horse', label: 'Adding your first horse', desc: 'Create a full horse profile for the new foal.' },
            { href: '/guides/breeding-tracker-overview', label: 'Breeding tracker overview', desc: 'How the five breeding tabs work together.' },
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
            <Link href="/horses" className="btn-secondary btn-md text-sm">Horses →</Link>
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
