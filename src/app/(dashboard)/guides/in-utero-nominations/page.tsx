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

export default function InUteroNominationsGuide() {
  return (
    <div className="max-w-3xl space-y-8 mt-4">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Guides', href: '/guides' },
        { label: 'In-utero nominations' },
      ]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Heart className="w-4 h-4" />
          <span>Breeding Tracker</span>
          <ChevronRight className="w-3 h-3" />
          <span>Article · 2 min read</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">In-utero nominations</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Some futurities and stakes programs allow you to nominate a foal before it's born — sometimes even before the breeding happens. BarnKeep lets you track these nominations on the pregnancy record so you never miss a deadline.
        </p>
      </div>

      <hr className="border-border" />

      <Section number={1} title="What are in-utero nominations?">
        <p className="text-foreground/80 leading-relaxed">
          Many major Quarter Horse, Paint, and Warmblood futurities offer early-bird or in-utero nomination slots. Nominating early is typically cheaper than nominating after the foal is born and registered — but it means keeping track of deadlines before the foal even arrives.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          BarnKeep stores these nominations on the pregnancy record, so you have a clear record of what's been entered, when the deadline was, and how much it cost.
        </p>
      </Section>

      <Section number={2} title="Adding a nomination to a pregnancy">
        <p className="text-foreground/80 leading-relaxed">
          Open the pregnancy record you want to add nominations to (from <strong>Breeding → Pregnancies</strong>). Find the <strong>In-Utero Nominations</strong> section and click <strong>"Add Nomination."</strong>
        </p>
        <Screenshot label="Pregnancy record showing the In-Utero Nominations section with an Add Nomination button" aspectRatio="aspect-[16/5]" />
        <p className="text-foreground/80 leading-relaxed">
          For each nomination you'll record:
        </p>
        <div className="rounded-lg border border-border p-4 space-y-2 text-sm text-foreground/80">
          <ul className="space-y-2">
            <li><strong>Show / Futurity Name</strong> — the name of the event or program (e.g., "AQHA Adequan Select World," "NCHA Futurity").</li>
            <li><strong>Nomination Date</strong> — when you submitted the nomination.</li>
            <li><strong>Deadline</strong> — the submission deadline for this nomination entry.</li>
            <li><strong>Fee Paid</strong> — how much the nomination cost.</li>
            <li><strong>Confirmation Number</strong> — the reference number from the association, if provided.</li>
            <li><strong>Notes</strong> — any other relevant details.</li>
          </ul>
        </div>
        <Tip>Set a task reminder in BarnKeep for any upcoming nomination deadlines. A recurring task or a calendar event is an easy way to make sure you don't forget to re-nominate at the next payment stage.</Tip>
      </Section>

      <Section number={3} title="Viewing nominations after the foal is born">
        <p className="text-foreground/80 leading-relaxed">
          After you record the foaling and link it to the pregnancy, the in-utero nominations remain on the pregnancy record as a historical reference. Once the foal is born and registered, you'll typically transfer or confirm the nomination with the association using the foal's registration number.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          BarnKeep doesn't integrate directly with breed registries — but having the nomination details in one place means you always know what the foal has been nominated for and can reference it quickly when needed.
        </p>
      </Section>

      <hr className="border-border" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What to read next</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/tracking-a-pregnancy', label: 'Tracking a pregnancy', desc: 'Log pregnancy check results and monitor gestation progress.' },
            { href: '/guides/recording-a-foaling', label: 'Recording a foaling', desc: 'Document the birth and add the foal to your herd.' },
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
