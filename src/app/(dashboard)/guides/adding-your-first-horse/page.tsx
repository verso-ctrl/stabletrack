'use client';

import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Camera, ChevronRight, Sparkles } from 'lucide-react';

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

export default function AddingYourFirstHorseGuide() {
  return (
    <div className="max-w-3xl space-y-8 mt-4">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Guides', href: '/guides' },
        { label: 'Adding your first horse' },
      ]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4" />
          <span>Getting Started</span>
          <ChevronRight className="w-3 h-3" />
          <span>Article · 4 min read</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Adding your first horse</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Every horse in BarnKeep starts with a profile. You only need one thing to create it — the horse's name — but the more you fill in upfront, the more useful the rest of the app becomes.
        </p>
      </div>

      <hr className="border-border" />

      <Section number={1} title="Getting to the Add Horse form">
        <p className="text-foreground/80 leading-relaxed">
          There are two ways to open the form:
        </p>
        <ul className="text-sm text-foreground/80 space-y-2 list-disc pl-5">
          <li>From the <strong>dashboard</strong>, click the <strong>"Add Horse"</strong> button in the top-right corner of the page.</li>
          <li>From the <strong>Horses</strong> page, click the <strong>"Add Horse"</strong> button in the page header.</li>
        </ul>
        <p className="text-foreground/80 leading-relaxed">
          Both take you to the same Add Horse page at <em>/horses/new</em>.
        </p>
      </Section>

      <Section number={2} title="Adding a profile photo (optional)">
        <p className="text-foreground/80 leading-relaxed">
          At the top of the form is a square photo area with a dashed border. Click it to select an image from your device. Once a photo is selected, you'll see a thumbnail preview with an <strong>X</strong> button to remove it and a camera icon to swap it for a different one.
        </p>
        <Screenshot label="Profile photo upload area with a thumbnail preview and remove button" aspectRatio="aspect-[16/5]" />
        <Tip>The profile photo appears in the Horses list, on the horse's profile page, and in the feed chart. A clear headshot works best.</Tip>
      </Section>

      <Section number={3} title="Basic information">
        <p className="text-foreground/80 leading-relaxed">
          The <strong>Basic Information</strong> section is where you enter the core details. Only <strong>Nickname</strong> is required — everything else is optional.
        </p>
        <Screenshot label="Basic information section of the Add Horse form" />
        <div className="space-y-2 text-sm text-foreground/80">
          <div className="rounded-lg border border-border p-4 space-y-2">
            <ul className="space-y-1.5">
              <li><strong>Nickname</strong> — the name you use day-to-day (e.g., "Thunder"). This is what appears throughout the app.</li>
              <li><strong>Registered Name</strong> — the horse's full registered name if different from the nickname.</li>
              <li><strong>Breed</strong> — start typing and common breeds appear as suggestions.</li>
              <li><strong>Color</strong> — same autocomplete behavior (Bay, Chestnut, Grey, and more).</li>
              <li><strong>Markings</strong> — free text, e.g., "Star, Four White Socks."</li>
              <li><strong>Sex</strong> — Mare, Gelding, Stallion, Colt, or Filly.</li>
              <li><strong>Date of Birth</strong> — used to calculate age automatically.</li>
              <li><strong>Height (hands)</strong> — enter in hands (e.g., 16.2). Step is 0.1.</li>
              <li><strong>Status</strong> — Active (default), Layup, or Retired. Layup horses appear with an amber badge throughout the app.</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section number={4} title="Additional information">
        <p className="text-foreground/80 leading-relaxed">
          The <strong>Additional Information</strong> section is for registration and identification details — all optional.
        </p>
        <div className="rounded-lg border border-border p-4 space-y-1 text-sm text-foreground/80">
          <ul className="space-y-1.5">
            <li><strong>Microchip Number</strong> — if the horse has been chipped.</li>
            <li><strong>Registry</strong> — e.g., AQHA, APHA, USEF.</li>
            <li><strong>Registration Number</strong> — the registration number from that registry.</li>
          </ul>
        </div>
      </Section>

      <Section number={5} title="Ownership">
        <p className="text-foreground/80 leading-relaxed">
          The <strong>Ownership</strong> section lets you record who owns the horse. Start typing a name and existing contacts from your contact book appear as suggestions, or type a new name.
        </p>
        <div className="rounded-lg border border-border p-4 space-y-1 text-sm text-foreground/80">
          <ul className="space-y-1.5">
            <li><strong>Owner Name</strong> — primary owner's name.</li>
            <li><strong>Owner Phone</strong> — formatted as (555) 123-4567.</li>
            <li><strong>Co-Owner Name</strong> — optional second owner.</li>
            <li><strong>Co-Owner Phone</strong> — optional.</li>
          </ul>
        </div>
        <Tip>Owner details appear on the horse's profile page and are included in printed health reports.</Tip>
      </Section>

      <Section number={6} title="Saving the horse">
        <p className="text-foreground/80 leading-relaxed">
          When you're ready, click the <strong>"Save Horse"</strong> button at the bottom of the form. The button shows "Saving…" with a spinner while it works. Once saved, you're taken directly to the horse's profile page where you can start adding health records, a feed program, and more.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          If you change your mind, click <strong>Cancel</strong> to go back to the Horses list without saving anything.
        </p>
      </Section>

      <hr className="border-border" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What to read next</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/horse-profile-overview', label: 'Horse profile overview', desc: 'Walk through each tab on a horse profile — health, feeding, and more.' },
            { href: '/guides/uploading-photos-and-documents', label: 'Uploading photos & documents', desc: 'Add photos and vet records to a horse profile.' },
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
              { href: '/horses/new', label: 'Add a Horse' },
              { href: '/horses', label: 'Horses' },
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
