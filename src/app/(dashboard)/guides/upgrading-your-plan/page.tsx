'use client';

import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Camera, ChevronRight, Settings } from 'lucide-react';

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

export default function UpgradingYourPlanGuide() {
  return (
    <div className="max-w-3xl space-y-8 mt-4">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Guides', href: '/guides' },
        { label: 'Upgrading your plan' },
      ]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Settings className="w-4 h-4" />
          <span>Settings & Billing</span>
          <ChevronRight className="w-3 h-3" />
          <span>Article · 2 min read</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Upgrading your plan</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Whether you're upgrading from Starter to Farm, or adding the Breeding Tracker, it all happens from the Billing page. Here's how to make changes to your subscription.
        </p>
      </div>

      <hr className="border-border" />

      <Section number={1} title="Quick plan summary">
        <p className="text-foreground/80 leading-relaxed">
          BarnKeep has two base plans:
        </p>
        <div className="space-y-3">
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="font-semibold text-foreground">Starter — $25/month</p>
            <p className="text-sm text-muted-foreground">Up to 10 horses, solo use, 10 GB storage, 20 photos per horse. All core features included — health records, feeding, scheduling, and tasks.</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="font-semibold text-foreground">Farm — $60/month</p>
            <p className="text-sm text-muted-foreground">Unlimited horses, unlimited team members, unlimited photos per horse, 50 GB storage. Everything in Starter plus room to grow.</p>
          </div>
        </div>
        <p className="text-foreground/80 leading-relaxed mt-2">
          There's also an add-on available on top of either plan:
        </p>
        <div className="rounded-lg border border-border p-4 space-y-1">
          <p className="font-semibold text-foreground">Breeding Tracker — $10/month</p>
          <p className="text-sm text-muted-foreground">Heat cycle tracking, breeding records, pregnancy monitoring, foaling records, and stallion management. Can be added or removed at any time.</p>
        </div>
      </Section>

      <Section number={2} title="How to upgrade or change your plan">
        <p className="text-foreground/80 leading-relaxed">
          Only the barn Owner can make billing changes. To upgrade:
        </p>
        <ol className="text-sm text-foreground/80 space-y-2 list-decimal pl-5">
          <li>Go to <strong>Settings</strong> in the sidebar.</li>
          <li>Click <strong>Billing &amp; Plans</strong> in the Settings menu.</li>
          <li>On the Billing page, your current plan and payment method are shown. Click the <strong>plan management</strong> or <strong>upgrade</strong> button to open the plan picker.</li>
          <li>Select the new plan and confirm the change. You'll be redirected to Stripe's secure checkout to complete the payment.</li>
        </ol>
        <Screenshot label="Billing page showing current plan with upgrade option" aspectRatio="aspect-[16/5]" />
        <Tip>Upgrading from Starter to Farm mid-billing-cycle is prorated — you only pay for the remaining days in your current period. Downgrading takes effect at the end of the current billing period.</Tip>
      </Section>

      <Section number={3} title="Adding the Breeding Tracker add-on">
        <p className="text-foreground/80 leading-relaxed">
          The Breeding Tracker add-on can be added from the Billing page as well. Look for the Add-Ons section and toggle on <strong>Breeding Tracker</strong>. The $10/month fee is added to your next billing cycle.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          Once activated, the <strong>Breeding</strong> link appears in your sidebar, and the Breeding tab appears on horse profiles for mares and stallions.
        </p>
      </Section>

      <Section number={4} title="Managing your subscription with Stripe">
        <p className="text-foreground/80 leading-relaxed">
          BarnKeep uses <strong>Stripe</strong> for all payments. From the Billing page, you can also click <strong>"Manage Billing"</strong> to open the Stripe customer portal, where you can:
        </p>
        <ul className="text-sm text-foreground/80 space-y-1 list-disc pl-5">
          <li>Update your payment method (credit card)</li>
          <li>Download past invoices</li>
          <li>Cancel your subscription</li>
          <li>View upcoming charges</li>
        </ul>
        <p className="text-foreground/80 leading-relaxed">
          All payment details are handled securely by Stripe — BarnKeep never stores your credit card information.
        </p>
      </Section>

      <Section number={5} title="After your trial ends">
        <p className="text-foreground/80 leading-relaxed">
          Your barn starts with a 14-day free trial. No charges are made during the trial period. When the trial ends, your card is charged for the first billing cycle. If you haven't added a payment method by the time the trial expires, access to the barn is paused until payment is set up.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          You won't lose any of your data during this time — just add a payment method to resume where you left off.
        </p>
      </Section>

      <hr className="border-border" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What to read next</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/barn-settings-overview', label: 'Barn settings overview', desc: 'Update your barn name, address, timezone, and notification preferences.' },
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
            <Link href="/settings" className="btn-secondary btn-md text-sm">Settings →</Link>
          </div>
        </div>
      </div>

      <div className="card p-5 bg-muted/30 text-center">
        <p className="text-sm text-muted-foreground">Questions about billing?</p>
        <a href="mailto:support@barnkeep.com" className="text-sm font-medium text-primary hover:underline mt-1 inline-block">
          Email support@barnkeep.com →
        </a>
      </div>
    </div>
  );
}
