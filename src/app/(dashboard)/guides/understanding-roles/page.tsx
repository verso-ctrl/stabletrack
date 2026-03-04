'use client';

import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Camera, ChevronRight, Users, Crown, UserCog, User } from 'lucide-react';

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

export default function UnderstandingRolesGuide() {
  return (
    <div className="max-w-3xl space-y-8 mt-4">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Guides', href: '/guides' },
        { label: 'Understanding roles' },
      ]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>Team & Permissions</span>
          <ChevronRight className="w-3 h-3" />
          <span>Article · 3 min read</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Understanding roles</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Every person on your barn team has a role that determines what they can see and do. BarnKeep has three main roles: Owner, Manager, and Caretaker.
        </p>
      </div>

      <hr className="border-border" />

      <Section number={1} title="The three roles">
        <p className="text-foreground/80 leading-relaxed">
          When you create a barn, you automatically become the <strong>Owner</strong>. Everyone you invite gets either Manager or Caretaker access.
        </p>
        <Screenshot label="Role permissions info card showing Owner, Manager, and Caretaker side by side" aspectRatio="aspect-[16/5]" />

        <div className="space-y-4 mt-2">
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-900/10 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-600" />
              <p className="font-semibold text-foreground">Owner</p>
              <span className="text-xs px-1.5 py-0.5 rounded bg-amber-200/60 text-amber-800 dark:bg-amber-800/30 dark:text-amber-400">Full access</span>
            </div>
            <p className="text-sm text-foreground/80">Full access to everything in the barn — horses, health records, schedules, billing, settings, and team management. There can only be one Owner per barn, and the Owner role cannot be transferred by invitation.</p>
            <p className="text-sm text-foreground/80">The Owner is the only person who can delete the barn, manage billing, and promote or remove other members.</p>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-800/50 dark:bg-blue-900/10 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <UserCog className="w-5 h-5 text-blue-600" />
              <p className="font-semibold text-foreground">Manager</p>
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-200/60 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400">Broad access</span>
            </div>
            <p className="text-sm text-foreground/80">Managers can do almost everything an Owner can — manage horses, health records, events, tasks, team members, contacts, and clients. The main things they <em>can't</em> do are manage billing and delete the barn.</p>
            <p className="text-sm text-foreground/80">Give this role to a barn manager, head trainer, or anyone who needs to run day-to-day operations independently.</p>
          </div>

          <div className="rounded-lg border border-green-200 bg-green-50/50 dark:border-green-800/50 dark:bg-green-900/10 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              <p className="font-semibold text-foreground">Caretaker</p>
              <span className="text-xs px-1.5 py-0.5 rounded bg-green-200/60 text-green-800 dark:bg-green-800/30 dark:text-green-400">Daily care access</span>
            </div>
            <p className="text-sm text-foreground/80">Caretakers can view horse profiles, log health records, complete tasks, record feedings, and manage events. They <em>cannot</em> manage team members, billing, or sensitive settings.</p>
            <p className="text-sm text-foreground/80">The right role for barn staff, grooms, exercise riders, or anyone doing day-to-day horse care.</p>
          </div>
        </div>
      </Section>

      <Section number={2} title="Permission comparison">
        <p className="text-foreground/80 leading-relaxed">
          Here's a quick comparison of what each role can access:
        </p>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-semibold text-foreground">Feature</th>
                <th className="text-center p-3 font-semibold text-amber-600">Owner</th>
                <th className="text-center p-3 font-semibold text-blue-600">Manager</th>
                <th className="text-center p-3 font-semibold text-green-600">Caretaker</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ['View horses & health records', '✓', '✓', '✓'],
                ['Add & edit horses', '✓', '✓', '✓'],
                ['Log health, feedings, tasks', '✓', '✓', '✓'],
                ['Manage events (calendar)', '✓', '✓', '✓'],
                ['Manage team members', '✓', '✓', '—'],
                ['Manage contacts & clients', '✓', '✓', '—'],
                ['Access billing & invoices', '✓', '✓', '—'],
                ['Barn settings', '✓', '✓', '—'],
                ['Billing & plan management', '✓', '—', '—'],
                ['Delete barn', '✓', '—', '—'],
              ].map(([feature, owner, manager, caretaker]) => (
                <tr key={feature}>
                  <td className="p-3 text-foreground/80">{feature}</td>
                  <td className="p-3 text-center text-amber-600 font-medium">{owner}</td>
                  <td className="p-3 text-center text-blue-600 font-medium">{manager}</td>
                  <td className="p-3 text-center text-green-600 font-medium">{caretaker}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section number={3} title="Changing a team member's role">
        <p className="text-foreground/80 leading-relaxed">
          Owners and Managers can change a team member's role at any time. Go to the <strong>Team</strong> page, find the member's card, and click their role badge (the colored button showing their current role). A modal appears with the three role options — select the new one and it takes effect immediately.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          Role changes are instant. The team member will see the new level of access the next time they refresh the page.
        </p>
      </Section>

      <hr className="border-border" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What to read next</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/inviting-a-team-member', label: 'Inviting a team member', desc: 'Generate an invite code or add a member directly by email.' },
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
            <Link href="/team" className="btn-secondary btn-md text-sm">Team →</Link>
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
