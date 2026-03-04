'use client';

import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Camera, ChevronRight, Syringe, AlertTriangle, CheckCircle2, Pencil, Trash2, Clock } from 'lucide-react';

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

function FieldTable({ rows }: { rows: { field: string; required: boolean; notes: string }[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border my-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-left px-4 py-2.5 font-semibold text-foreground w-44">Field</th>
            <th className="text-left px-4 py-2.5 font-semibold text-foreground w-20">Required</th>
            <th className="text-left px-4 py-2.5 font-semibold text-foreground">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map(row => (
            <tr key={row.field} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-2.5 font-medium text-foreground">{row.field}</td>
              <td className="px-4 py-2.5">
                {row.required
                  ? <span className="text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 px-1.5 py-0.5 rounded">Yes</span>
                  : <span className="text-xs text-muted-foreground">Optional</span>
                }
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function LogVaccinationsMedicationsGuide() {
  return (
    <div className="max-w-3xl space-y-10 mt-4">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Guides', href: '/guides' },
        { label: 'Logging Vaccinations & Medications' },
      ]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Syringe className="w-4 h-4" />
          <span>Horse Profiles</span>
          <ChevronRight className="w-3 h-3" />
          <span>Article · 3 min read</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Logging Vaccinations & Medications</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Keep every horse's health history in one place. BarnKeep lets you record vaccines with due-date reminders and track active medications — including who prescribed them, how often they're given, and when the course ends.
        </p>
      </div>

      <hr className="border-border" />

      {/* ── PART 1: VACCINATIONS ───────────────────────────────────────────── */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Part 1 — Vaccinations</h2>
        <p className="text-muted-foreground">Where to find them, how to log them, and how due-date tracking works.</p>
      </div>

      <Section number={1} title="Finding the Health Tab">
        <p className="text-foreground/80 leading-relaxed">
          Vaccinations and medications both live on the <strong>Health tab</strong> of each horse's profile. To get there:
        </p>
        <ol className="list-decimal list-inside space-y-1 text-foreground/80 text-sm pl-2">
          <li>Click <strong>Horses</strong> in the left sidebar</li>
          <li>Click the horse you want to update</li>
          <li>Select the <strong>Health</strong> tab at the top of their profile</li>
        </ol>
        <Screenshot label="Horse profile with the Health tab selected, showing the Vaccinations and Medications sections" />
        <p className="text-foreground/80 leading-relaxed">
          The Health tab is split into several sections. Vaccinations appear near the top in a two-column grid. Active medications are below them.
        </p>
      </Section>

      <Section number={2} title="Logging a vaccination">
        <p className="text-foreground/80 leading-relaxed">
          Click the <strong>Log Vaccination</strong> button in the top-right corner of the Vaccinations section. A modal opens with the following fields:
        </p>

        <FieldTable rows={[
          { field: 'Vaccine Type', required: true, notes: 'Pick from 10 standard types — Rabies, Tetanus, EWT, West Nile, Influenza, Rhinopneumonitis, Strangles, Potomac Horse Fever, Botulism, or Other.' },
          { field: 'Date Given', required: true, notes: 'The date the vaccine was administered.' },
          { field: 'Next Due Date', required: false, notes: 'When the next dose is due. BarnKeep will flag this as "Due Soon" if it\'s within 30 days.' },
          { field: 'Administered By', required: false, notes: 'Vet or staff member who gave the vaccine.' },
          { field: 'Manufacturer', required: false, notes: 'e.g. Zoetis, Merck. Useful for lot tracking.' },
          { field: 'Lot Number', required: false, notes: 'Lot or batch number from the vial label.' },
          { field: 'Notes', required: false, notes: 'Any observations, reactions, or special circumstances.' },
        ]} />

        <Screenshot label="Log Vaccination modal with all fields visible" aspectRatio="aspect-[4/5]" />
        <Tip>You only need to fill in Vaccine Type and Date Given to save a record. You can always edit it later to add the lot number or next due date.</Tip>
      </Section>

      <Section number={3} title="Due Soon warnings">
        <p className="text-foreground/80 leading-relaxed">
          If you set a <strong>Next Due Date</strong> on a vaccination, BarnKeep watches that date for you. When the due date is 30 days away or less, a yellow <strong>"Due Soon"</strong> badge appears on the vaccination card. This shows up every time you open the horse's Health tab so it's hard to miss.
        </p>
        <Screenshot label="Vaccination card with a 'Due Soon' badge highlighted in yellow" aspectRatio="aspect-[16/5]" />
        <Note>There's no automated notification for due dates yet — the badge is the reminder. Check the Health tab regularly during vaccination season or before vet visits.</Note>
      </Section>

      <Section number={4} title="Editing a vaccination record">
        <p className="text-foreground/80 leading-relaxed">
          Every vaccination card has a <Pencil className="w-3.5 h-3.5 inline mx-0.5 text-muted-foreground" /> pencil icon in the top-right corner. Click it to reopen the form with all the existing values pre-filled. Change whatever needs updating and click <strong>Save Vaccination</strong>.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          Common reasons to edit: adding a lot number you didn't have at the time, updating the next due date after a vet changes the schedule, or correcting a typo in the date.
        </p>
      </Section>

      <Section number={5} title="Deleting a vaccination record">
        <p className="text-foreground/80 leading-relaxed">
          Click the <Trash2 className="w-3.5 h-3.5 inline mx-0.5 text-muted-foreground" /> trash icon on a vaccination card to delete it. The record is removed immediately — there's no confirmation prompt, so double-check before clicking.
        </p>
        <Tip>If you made a mistake, just re-log the vaccination with the correct information rather than editing the wrong one. Deletion is instant and can't be undone.</Tip>
      </Section>

      <hr className="border-border" />

      {/* ── PART 2: MEDICATIONS ───────────────────────────────────────────── */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Part 2 — Medications</h2>
        <p className="text-muted-foreground">How to add a medication, manage a course, and discontinue when the horse is done.</p>
      </div>

      <Section number={6} title="Adding a medication">
        <p className="text-foreground/80 leading-relaxed">
          On the Health tab, click <strong>Add Medication</strong>. Unlike vaccinations (which open a quick modal), medications open a <strong>full-page form</strong> — there's more to fill in since you're setting up an ongoing treatment, not just recording a one-time event.
        </p>
        <Screenshot label="Add Medication page showing the full form with four sections" />

        <p className="text-sm font-semibold text-foreground mt-4 mb-1">Medication Information</p>
        <FieldTable rows={[
          { field: 'Medication Name', required: true, notes: 'e.g. "Bute (Phenylbutazone)", "Ulcergard", "Dexamethasone".' },
          { field: 'Dosage', required: true, notes: 'e.g. "2 grams", "1 tube", "10 mg/kg".' },
          { field: 'Route', required: false, notes: 'How it\'s given: Oral, Intramuscular (IM), Intravenous (IV), Topical, Ophthalmic, or Other.' },
          { field: 'Give with Food', required: false, notes: 'Check this box if the medication must be mixed into feed. Reveals a notes field for specifics (e.g. "mix into morning grain").' },
          { field: 'Frequency', required: false, notes: 'Once daily, Twice daily, Three times daily, Every other day, Weekly, As needed, or Other.' },
          { field: 'Instructions', required: false, notes: 'Free-text field for anything else — timing, handling, storage notes, etc.' },
        ]} />

        <p className="text-sm font-semibold text-foreground mt-4 mb-1">Schedule</p>
        <FieldTable rows={[
          { field: 'Start Date', required: true, notes: 'When the horse begins taking the medication.' },
          { field: 'End Date', required: false, notes: 'Leave blank for ongoing medications with no fixed stop date. Set this for a defined course (e.g. a 10-day antibiotic).' },
        ]} />

        <p className="text-sm font-semibold text-foreground mt-4 mb-1">Prescriber & Pharmacy</p>
        <FieldTable rows={[
          { field: 'Prescribing Veterinarian', required: false, notes: 'e.g. "Dr. Smith" — useful for record-keeping and refill calls.' },
          { field: 'Pharmacy', required: false, notes: 'e.g. "Valley Vet Supply", "KV Vet".' },
          { field: 'Refills Remaining', required: false, notes: 'Optional counter — update this as refills are used.' },
          { field: 'Controlled Substance', required: false, notes: 'Check this box if the medication is a controlled substance. An amber warning box appears on the form as a reminder.' },
        ]} />

        <Screenshot label="Prescriber & Pharmacy section of the Add Medication form" aspectRatio="aspect-[16/6]" />
        <Tip>The "Give with Food" checkbox is especially useful if you have multiple staff feeding. It makes the medication visible on the feed chart with a warning indicator so whoever is feeding knows to mix it in.</Tip>
      </Section>

      <Section number={7} title="What you see on the Health tab">
        <p className="text-foreground/80 leading-relaxed">
          Once added, the medication appears on the Health tab under <strong>Current Medications</strong>. The card shows:
        </p>
        <ul className="space-y-2 text-sm text-foreground/80 pl-2">
          {[
            { icon: '💊', text: 'Medication name (bold) and dosage · frequency on the same line' },
            { icon: '📋', text: 'Route, if specified (e.g. "Route: Oral")' },
            { icon: '📝', text: 'Instructions text, if any was entered' },
            { icon: <Clock className="w-3.5 h-3.5 inline text-muted-foreground" />, text: 'Last given date and who logged it — appears once a dose has been recorded' },
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="flex-shrink-0">{item.icon}</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
        <Screenshot label="Current Medications section showing two active medications with dosage, frequency, and last-given info" />
        <Note>Only <strong>active</strong> medications appear here. If you mark a medication as inactive (discontinued), it disappears from this view — but the record isn't deleted. Think of it as archiving rather than erasing.</Note>
      </Section>

      <Section number={8} title="Editing a medication">
        <p className="text-foreground/80 leading-relaxed">
          Click the <Pencil className="w-3.5 h-3.5 inline mx-0.5 text-muted-foreground" /> pencil icon on a medication card to open an edit modal. Unlike the creation form (which is a full page), editing happens in a compact modal so you don't lose your place on the Health tab.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          In edit mode you can update the name, dosage, frequency, route, instructions, and — importantly — the <strong>status</strong>. Status has two options:
        </p>
        <div className="grid grid-cols-2 gap-3 my-3">
          <div className="rounded-lg border border-border p-3 space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <p className="font-semibold text-sm text-foreground">Active</p>
            </div>
            <p className="text-xs text-muted-foreground">Medication is currently being given. Shows on the Health tab and feed chart.</p>
          </div>
          <div className="rounded-lg border border-border p-3 space-y-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              <p className="font-semibold text-sm text-foreground">Inactive</p>
            </div>
            <p className="text-xs text-muted-foreground">Course is finished or discontinued. Hidden from view but preserved in the record history.</p>
          </div>
        </div>
        <Screenshot label="Edit Medication modal showing the Status dropdown set to Active" aspectRatio="aspect-[4/3]" />
        <Tip>When a vet clears a horse to stop taking something, change the status to <strong>Inactive</strong> rather than deleting the record. This keeps the treatment history intact for future vet visits.</Tip>
      </Section>

      <Section number={9} title="Deleting a medication">
        <p className="text-foreground/80 leading-relaxed">
          Click the <Trash2 className="w-3.5 h-3.5 inline mx-0.5 text-muted-foreground" /> trash icon on a medication card to permanently remove it. Like vaccinations, deletion is immediate with no confirmation prompt.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          Only delete a medication if it was entered by mistake. If the course is simply finished, mark it <strong>Inactive</strong> instead so you have a record of what the horse was treated with and when.
        </p>
      </Section>

      <hr className="border-border" />

      {/* Quick Reference */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Quick reference</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-2.5 font-semibold text-foreground"> </th>
                <th className="text-left px-4 py-2.5 font-semibold text-foreground">Vaccinations</th>
                <th className="text-left px-4 py-2.5 font-semibold text-foreground">Medications</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { label: 'Where to add', vacc: 'Modal on Health tab', med: 'Full-page form (Health tab → Add Medication)' },
                { label: 'Where to edit', vacc: 'Modal on Health tab', med: 'Modal on Health tab' },
                { label: 'Due date tracking', vacc: '"Due Soon" badge within 30 days', med: 'End Date field — no auto-badge' },
                { label: 'Discontinuing', vacc: 'Delete the record', med: 'Set status to Inactive (keeps history)' },
                { label: 'Lot/batch tracking', vacc: 'Yes — Manufacturer + Lot Number fields', med: 'No' },
                { label: 'Controlled substance flag', vacc: 'No', med: 'Yes — checkbox on the form' },
                { label: 'Visible on feed chart', vacc: 'No', med: 'Yes — if "Give with Food" is checked' },
              ].map(row => (
                <tr key={row.label} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium text-foreground">{row.label}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{row.vacc}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{row.med}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <hr className="border-border" />

      {/* Next steps */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What to read next</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/understanding-the-dashboard', label: 'Understanding the Dashboard', desc: 'A tour of everything on your main dashboard.' },
            { href: '/guides', label: 'Back to all guides', desc: 'Browse the full guide library.' },
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
            <Link href="/horses" className="btn-secondary btn-md text-sm">Open Horses →</Link>
          </div>
        </div>
      </div>

      {/* Help CTA */}
      <div className="card p-5 bg-muted/30 text-center">
        <p className="text-sm text-muted-foreground">Something not making sense?</p>
        <a href="mailto:support@barnkeep.com" className="text-sm font-medium text-primary hover:underline mt-1 inline-block">
          Email support@barnkeep.com →
        </a>
      </div>
    </div>
  );
}
