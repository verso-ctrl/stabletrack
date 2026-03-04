'use client';

import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Camera, ChevronRight, Image as ImageIcon, FileText } from 'lucide-react';

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

export default function UploadingPhotosAndDocumentsGuide() {
  return (
    <div className="max-w-3xl space-y-8 mt-4">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Guides', href: '/guides' },
        { label: 'Uploading photos & documents' },
      ]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <HorseIcon className="w-4 h-4" />
          <span>Horse Profiles</span>
          <ChevronRight className="w-3 h-3" />
          <span>Article · 3 min read</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Uploading photos & documents</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Each horse profile has a dedicated photo gallery and document storage area. Here's how to add images and files, and how to find them again later.
        </p>
      </div>

      <hr className="border-border" />

      {/* Photos section */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <ImageIcon className="w-4 h-4 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Photos</h2>
      </div>

      <Section number={1} title="Opening the Photos tab">
        <p className="text-foreground/80 leading-relaxed">
          Open any horse's profile and click the <strong>Photos</strong> tab. You'll see the gallery header with a count of how many photos have been uploaded (e.g., "Photos (4) / 20 max" on the Starter plan). Starter plan allows up to <strong>20 photos per horse</strong>; Farm plan has no limit.
        </p>
        <Screenshot label="Photos tab showing a 3-column grid of horse photos with a primary badge" />
      </Section>

      <Section number={2} title="Uploading a photo">
        <p className="text-foreground/80 leading-relaxed">
          Click the <strong>"Add Photos"</strong> link in the tab header (or the upload area below the gallery grid) to open the file picker. Select one or more image files — JPEG, PNG, HEIC, WebP, and most common formats are supported.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          While uploading, a progress bar shows the status. Once complete, the photo appears in the gallery.
        </p>
        <Tip>On mobile, you can upload directly from your camera roll. The app is designed to work on phones — you can snap a photo right at the barn and upload it in seconds.</Tip>
      </Section>

      <Section number={3} title="Setting a primary photo">
        <p className="text-foreground/80 leading-relaxed">
          The <strong>primary photo</strong> is the one that appears as the horse's profile picture throughout the app — in the horse list, on the feed chart, and anywhere else the horse is shown. It gets a green border ring and a "Primary" badge in the gallery.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          To set a photo as primary, hover over it and click the <strong>star icon</strong> that appears in the overlay. The badge will move to the new primary photo immediately.
        </p>
      </Section>

      <Section number={4} title="Viewing photos in full screen">
        <p className="text-foreground/80 leading-relaxed">
          Click any photo thumbnail to open it in the <strong>lightbox viewer</strong>. In the lightbox you can:
        </p>
        <ul className="text-sm text-foreground/80 space-y-1.5 list-disc pl-5">
          <li>See the photo at full size</li>
          <li>Use the left and right arrows to navigate between photos</li>
          <li>Use your keyboard's arrow keys to navigate</li>
          <li>Click the download icon to save a copy</li>
          <li>Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">Esc</kbd> or click the X to close</li>
        </ul>
        <Screenshot label="Lightbox viewer showing a horse photo at full size with navigation arrows" aspectRatio="aspect-[16/7]" />
      </Section>

      <Section number={5} title="Deleting a photo">
        <p className="text-foreground/80 leading-relaxed">
          Hover over any photo and click the <strong>trash icon</strong> in the overlay to delete it. You'll be asked to confirm before it's removed. Deleted photos can't be recovered, so make sure you have a copy before removing anything important.
        </p>
      </Section>

      <hr className="border-border" />

      {/* Documents section */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <FileText className="w-4 h-4 text-purple-600" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Documents</h2>
      </div>

      <Section number={6} title="Opening the Documents tab">
        <p className="text-foreground/80 leading-relaxed">
          The <strong>Documents</strong> tab on a horse profile stores files like coggins papers, vet records, registration certificates, insurance, and anything else worth keeping. Click the tab to see all documents for that horse.
        </p>
        <Screenshot label="Documents tab showing a list of uploaded files with tags and action buttons" />
        <p className="text-foreground/80 leading-relaxed">
          If you've uploaded documents with different tags, a <strong>tag filter bar</strong> appears at the top. Click a tag to show only documents with that label (e.g., "Coggins" or "Vet Record"). Click "All" to see everything.
        </p>
      </Section>

      <Section number={7} title="Uploading a document">
        <p className="text-foreground/80 leading-relaxed">
          Click the <strong>Upload</strong> button to open the upload modal. You'll need to:
        </p>
        <ul className="text-sm text-foreground/80 space-y-1.5 list-disc pl-5">
          <li>Select a file from your device (PDF, DOC, DOCX, XLS, images, and more — up to 25 MB)</li>
          <li>Give the document a <strong>name</strong> (required)</li>
          <li>Add a <strong>description</strong> (optional) for extra context</li>
          <li>Add a <strong>tag</strong> to categorize it (optional, but helpful for finding it later)</li>
        </ul>
        <p className="text-foreground/80 leading-relaxed">
          For tags, you can type anything or click one of the quick-select buttons: <em>Coggins, Vet Record, Registration, Insurance, Health Certificate, Farrier, Dental, Contract, Invoice, Other</em>.
        </p>
        <Tip>Tagging documents consistently makes them much easier to find. Use "Coggins" for coggins papers and "Vet Record" for vet visit summaries — then you can filter by tag to pull them up instantly.</Tip>
      </Section>

      <Section number={8} title="Viewing, editing, and downloading documents">
        <p className="text-foreground/80 leading-relaxed">
          Each document in the list shows its name, description, tag, file size, and upload date. The action buttons on the right let you:
        </p>
        <ul className="text-sm text-foreground/80 space-y-1.5 list-disc pl-5">
          <li><strong>View</strong> — opens the file in a new browser tab</li>
          <li><strong>Download</strong> — saves the file to your device</li>
          <li><strong>Edit</strong> — update the name, description, or tag</li>
          <li><strong>Delete</strong> — permanently removes the file (with a confirmation step)</li>
        </ul>
      </Section>

      <hr className="border-border" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What to read next</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/horse-profile-overview', label: 'Horse profile overview', desc: 'Walk through each tab on a horse profile.' },
            { href: '/guides/logging-vaccinations-and-medications', label: 'Logging vaccinations & medications', desc: 'Record vaccines and manage active medications.' },
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
