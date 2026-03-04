'use client';

import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Camera, ChevronRight, Sparkles, Building2 } from 'lucide-react';

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

export default function SettingUpYourBarnGuide() {
  return (
    <div className="max-w-3xl space-y-8 mt-4">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Guides', href: '/guides' },
        { label: 'Setting up your barn' },
      ]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4" />
          <span>Getting Started</span>
          <ChevronRight className="w-3 h-3" />
          <span>Article · 3 min read</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Setting up your barn</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Before you can add horses or track anything, you need to create your first barn. This takes about two minutes and walks you through three simple steps.
        </p>
      </div>

      <hr className="border-border" />

      <Section number={1} title="Step 1 — Barn information">
        <p className="text-foreground/80 leading-relaxed">
          The first step asks for basic details about your barn. Only one field is required: the <strong>Barn Name</strong>. Everything else is optional, but filling in your address and contact info makes it easier to share your barn profile and generate documents later.
        </p>
        <Screenshot label="Step 1 of the barn setup form showing barn name, address, and contact fields" />
        <div className="space-y-2">
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="font-semibold text-foreground text-sm">Fields in this step</p>
            <ul className="text-sm text-muted-foreground space-y-1 mt-2">
              <li><strong>Barn Name</strong> — required. This is how your barn appears throughout the app.</li>
              <li><strong>Street Address, City, State, ZIP</strong> — optional. Used on printed reports and documents.</li>
              <li><strong>Phone Number</strong> — optional. Saved with your barn profile.</li>
              <li><strong>Email Address</strong> — optional. Used for barn-level correspondence.</li>
            </ul>
          </div>
        </div>
        <Tip>You can update any of this information later from Settings → Barn Settings.</Tip>
      </Section>

      <Section number={2} title="Step 2 — Choose your plan">
        <p className="text-foreground/80 leading-relaxed">
          Next, choose which plan fits your barn. Both plans include a <strong>14-day free trial</strong> — no credit card required to get started.
        </p>
        <Screenshot label="Plan selection showing Starter and Farm plan cards side by side" aspectRatio="aspect-[16/6]" />
        <div className="space-y-3">
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="font-semibold text-foreground">Starter — $25/month</p>
            <p className="text-sm text-muted-foreground">Best for hobby farms and personal operations. Includes up to 10 horses, solo use, 10 GB storage, and all core features — health records, feed tracking, scheduling, and tasks.</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="font-semibold text-foreground">Farm — $60/month</p>
            <p className="text-sm text-muted-foreground">For growing operations and boarding barns. Unlimited horses, unlimited team members, 50 GB storage, and priority support. Everything in Starter, plus room to scale.</p>
          </div>
        </div>
        <p className="text-foreground/80 leading-relaxed">
          Below the plan cards, you'll see an optional <strong>Breeding Tracker add-on</strong> ($10/month). This adds heat cycle tracking, breeding records, pregnancy monitoring, and foaling management. You can add or remove it at any time from your billing settings.
        </p>
        <Tip>Not sure which plan to pick? Start with Starter. You can upgrade to Farm anytime from your billing page without losing any data.</Tip>
      </Section>

      <Section number={3} title="Step 3 — Confirm and start your trial">
        <p className="text-foreground/80 leading-relaxed">
          The final step shows a summary of your setup before you continue to payment. You'll see your barn name, location (if entered), the plan you chose, any add-ons selected, and a confirmation that your 14-day free trial begins immediately.
        </p>
        <Screenshot label="Step 3 confirmation screen showing barn summary and trial start" aspectRatio="aspect-[16/6]" />
        <p className="text-foreground/80 leading-relaxed">
          Clicking <strong>"Continue to payment"</strong> takes you to the checkout screen where you enter your payment details. You won't be charged until your trial ends. If you cancel before the 14 days are up, you owe nothing.
        </p>
      </Section>

      <Section number={4} title="After setup — what happens next">
        <p className="text-foreground/80 leading-relaxed">
          Once your barn is created, you'll land on the dashboard. The first thing you'll see is a <strong>Getting Started checklist</strong> with four steps to get fully set up:
        </p>
        <ul className="space-y-2 text-sm text-foreground/80 list-disc pl-5">
          <li>Add your first horse</li>
          <li>Set up a stall or paddock</li>
          <li>Schedule an event</li>
          <li>Complete your first task</li>
        </ul>
        <p className="text-foreground/80 leading-relaxed">
          Each step checks off automatically as you complete it. The checklist disappears once all four are done.
        </p>
        <Tip>You can manage multiple barns in BarnKeep. To add a second barn, click the barn switcher at the top of the left sidebar and select "Add New Barn."</Tip>
      </Section>

      <hr className="border-border" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What to read next</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/adding-your-first-horse', label: 'Adding your first horse', desc: 'Create a horse profile with photos, breed info, and ownership details.' },
            { href: '/guides/understanding-the-dashboard', label: 'Understanding the dashboard', desc: 'A quick tour of everything on your main dashboard.' },
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
              { href: '/dashboard', label: 'Dashboard' },
              { href: '/horses', label: 'Horses' },
              { href: '/settings', label: 'Settings' },
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
