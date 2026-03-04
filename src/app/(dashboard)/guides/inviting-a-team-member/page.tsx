'use client';

import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Camera, ChevronRight, Users } from 'lucide-react';

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

export default function InvitingATeamMemberGuide() {
  return (
    <div className="max-w-3xl space-y-8 mt-4">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Guides', href: '/guides' },
        { label: 'Inviting a team member' },
      ]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>Team & Permissions</span>
          <ChevronRight className="w-3 h-3" />
          <span>Article · 2 min read</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Inviting a team member</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          BarnKeep supports multiple people on one barn — staff, managers, trainers, and more. There are two ways to bring someone in: share an invite code, or add them directly by email.
        </p>
      </div>

      <hr className="border-border" />

      <Section number={1} title="Opening the Team page">
        <p className="text-foreground/80 leading-relaxed">
          Click <strong>Team</strong> in the sidebar to open the team management page. You'll see your current active members, any pending approval requests, and the barn invite code. Only Owners and Managers can invite or manage team members.
        </p>
        <Screenshot label="Team page showing active members grid, pending approvals, and the barn invite code card" />
      </Section>

      <Section number={2} title="Method 1 — Share the invite code">
        <p className="text-foreground/80 leading-relaxed">
          Every barn has a unique <strong>barn invite code</strong> — shown in the amber card on the Team page. To invite someone using this method:
        </p>
        <ol className="text-sm text-foreground/80 space-y-2 list-decimal pl-5">
          <li>Click the <strong>Copy</strong> button next to the code to copy it to your clipboard.</li>
          <li>Share the code with your team member via text, email, or any other way you prefer.</li>
          <li>They sign up for BarnKeep (or sign in if they already have an account) and enter the code when prompted.</li>
          <li>Their request appears in the <strong>Pending Approvals</strong> section at the top of the Team page.</li>
          <li>You choose their role and click <strong>Approve</strong>.</li>
        </ol>
        <Tip>The invite code method is great for situations where you want to approve who joins before they get access — like a new hire you haven't met yet. You review and approve their request before they can see anything.</Tip>
      </Section>

      <Section number={3} title="Method 2 — Add directly by email">
        <p className="text-foreground/80 leading-relaxed">
          If you want to add someone immediately without an approval step, click the <strong>"Invite Member"</strong> button in the top-right of the Team page, then choose the direct invite option. Fill in:
        </p>
        <div className="rounded-lg border border-border p-4 space-y-2 text-sm text-foreground/80">
          <ul className="space-y-1.5">
            <li><strong>Email</strong> — required. The person's email address. They'll receive an invitation email.</li>
            <li><strong>First Name</strong> — optional. Helps you recognize them before they accept.</li>
            <li><strong>Last Name</strong> — optional.</li>
            <li><strong>Role</strong> — required. Choose Manager or Caretaker. (Only Owners can have the Owner role — that can't be assigned by invitation.)</li>
          </ul>
        </div>
        <p className="text-foreground/80 leading-relaxed">
          Click <strong>"Add Member."</strong> The person receives an email with a link to join. Once they sign up, they're added to the barn with the role you assigned — no approval step needed.
        </p>
      </Section>

      <Section number={4} title="Approving pending requests">
        <p className="text-foreground/80 leading-relaxed">
          If someone joined via the invite code, they'll appear in the <strong>Pending Approvals</strong> section with a clock icon. To approve them:
        </p>
        <ol className="text-sm text-foreground/80 space-y-1.5 list-decimal pl-5">
          <li>Select their role using the dropdown next to their name (Manager or Caretaker).</li>
          <li>Click the green <strong>Approve</strong> button.</li>
        </ol>
        <p className="text-foreground/80 leading-relaxed">
          To reject a request — for example, if you don't recognize the person — click the red <strong>X</strong> button. They won't be added to your barn.
        </p>
      </Section>

      <Section number={5} title="Changing a member's role or removing them">
        <p className="text-foreground/80 leading-relaxed">
          Once someone is on your team, you can change their role or remove them by clicking the <strong>colored role badge</strong> on their team member card. A modal appears with three role options and a red <strong>"Remove from Barn"</strong> button. Select the new role or click Remove to complete the change.
        </p>
      </Section>

      <hr className="border-border" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What to read next</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/guides/understanding-roles', label: 'Understanding roles', desc: 'Owner, Manager, and Caretaker — what each role can and can\'t do.' },
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
