'use client';

import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Camera, ChevronRight } from 'lucide-react';

const HorseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12c0-4-3-8-8-8-3 0-5.5 1.5-7 3.5L3 10l1 3-2 4 3 1 2-1 2 3h4l1-2 2 1 4-3c1-1 2-2.5 2-4z"/>
    <circle cx="18" cy="9" r="1"/>
  </svg>
);

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

export default function HorseProfileOverviewGuide() {
  return (
    <div className="max-w-3xl space-y-8 mt-4">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Guides', href: '/guides' },
        { label: 'Horse profile overview' },
      ]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <HorseIcon className="w-4 h-4" />
          <span>Horse Profiles</span>
          <ChevronRight className="w-3 h-3" />
          <span>Article · 6 min read</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Horse profile overview</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Every horse in your barn has its own profile — a central place for everything related to that horse. Here's a quick tour of what you'll find there.
        </p>
      </div>

      <hr className="border-border" />

      <Section number={1} title="The profile header">
        <p className="text-foreground/80 leading-relaxed">
          At the top of every horse profile is the header. On the left is the horse's <strong>profile photo</strong> (or a placeholder with the horse's initial if no photo has been added). Click the camera icon overlay to upload or change the photo directly from this page.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          Next to the photo you'll see:
        </p>
        <ul className="text-sm text-foreground/80 space-y-1.5 list-disc pl-5">
          <li>The horse's <strong>nickname</strong> in large text</li>
          <li>A <strong>status badge</strong> — Active (green), Layup (amber), Retired (gray), or Leased Out</li>
          <li>The horse's <strong>registered name</strong> in smaller text below, if one was entered</li>
          <li>An <strong>Edit</strong> button to update the horse's details</li>
        </ul>
        <Screenshot label="Horse profile header showing photo, name, status badge, and edit button" aspectRatio="aspect-[16/4]" />
        <Tip>If a horse is on Layup, an amber status note appears below the profile card to make the reason visible at a glance.</Tip>
      </Section>

      <Section number={2} title="The profile card — key details at a glance">
        <p className="text-foreground/80 leading-relaxed">
          Below the header is a card showing all the important details about the horse in a grid layout. This pulls together everything you entered when you created the horse's profile:
        </p>
        <Screenshot label="Horse profile card grid showing breed, color, age, height, weight, and stall" />
        <div className="rounded-lg border border-border p-4 space-y-1 text-sm text-foreground/80">
          <ul className="space-y-1.5">
            <li><strong>Breed</strong> and <strong>Color</strong></li>
            <li><strong>Sex</strong> — Mare, Gelding, Stallion, Colt, or Filly</li>
            <li><strong>Age</strong> — calculated automatically from the date of birth</li>
            <li><strong>Height</strong> in hands</li>
            <li><strong>Weight</strong> in pounds — updated from the weight log</li>
            <li><strong>Stall assignment</strong> — the stall or paddock this horse is currently assigned to</li>
            <li><strong>Owner</strong> and <strong>Co-Owner</strong> names and phone numbers</li>
            <li><strong>Microchip Number</strong>, <strong>Registry</strong>, and <strong>Registration Number</strong> (if entered)</li>
          </ul>
        </div>
        <p className="text-foreground/80 leading-relaxed">
          To update any of these fields, click the <strong>Edit</strong> button in the header. Changes save immediately when you submit the edit form.
        </p>
      </Section>

      <Section number={3} title="Navigating the tabs">
        <p className="text-foreground/80 leading-relaxed">
          Below the profile card, a tab bar gives you access to everything else for that horse. On mobile, tabs show as a compact grid with icons. On desktop, they appear as a full horizontal row.
        </p>
        <Screenshot label="Horse profile tab navigation bar showing all available tabs" aspectRatio="aspect-[16/3]" />
        <div className="space-y-4 mt-2">
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="font-semibold text-foreground text-sm">Overview</p>
            <p className="text-sm text-muted-foreground">A summary of recent activity — latest weight, upcoming events, active medications, and any notes.</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="font-semibold text-foreground text-sm">Photos</p>
            <p className="text-sm text-muted-foreground">A photo gallery for this horse. Upload images, set a primary photo, and view them in full-screen. Starter plan allows up to 20 photos per horse; Farm plan is unlimited.</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="font-semibold text-foreground text-sm">Activity</p>
            <p className="text-sm text-muted-foreground">A chronological log of everything that's been recorded for this horse — health records, weight entries, medication logs, and more.</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="font-semibold text-foreground text-sm">Health</p>
            <p className="text-sm text-muted-foreground">Current medications, coggins status, vaccinations, weight history, and detailed health records. This is the tab you'll use most for medical tracking.</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="font-semibold text-foreground text-sm">Care</p>
            <p className="text-sm text-muted-foreground">The horse's feeding plan — what to feed, how much, and when. Also shows any medications that need to be given with food.</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="font-semibold text-foreground text-sm">Tasks</p>
            <p className="text-sm text-muted-foreground">Tasks assigned specifically to this horse. Create, complete, and track recurring horse-level tasks from here.</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="font-semibold text-foreground text-sm">Events</p>
            <p className="text-sm text-muted-foreground">Calendar events that include this horse — vet visits, farrier appointments, competitions, and more.</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="font-semibold text-foreground text-sm">Breeding <span className="text-xs font-normal text-muted-foreground">(add-on)</span></p>
            <p className="text-sm text-muted-foreground">Appears for mares and stallions if the Breeding Tracker add-on is active. Links to heat cycles, breeding records, and pregnancy status for this horse.</p>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-1">
            <p className="font-semibold text-foreground text-sm">Documents</p>
            <p className="text-sm text-muted-foreground">Upload and store PDFs, vet records, coggins papers, registration documents, and more. Filter by tag to find files quickly.</p>
          </div>
        </div>
      </Section>

      <hr className="border-border" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What to read next</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/logging-vaccinations-and-medications', label: 'Logging vaccinations & medications', desc: 'Record vaccines with due-date tracking and manage active medications.' },
            { href: '/guides/uploading-photos-and-documents', label: 'Uploading photos & documents', desc: 'Add photos and vet records to a horse profile.' },
            { href: '/guides/tracking-weight-over-time', label: 'Tracking weight over time', desc: 'Log weight records and read the weight history.' },
            { href: '/guides/creating-a-feed-program', label: 'Creating a feed program', desc: 'Set up hay, grain, and supplement schedules for each horse.' },
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
