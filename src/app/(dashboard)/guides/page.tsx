'use client';

import Link from 'next/link';
import { BookOpen, Play, FileText, Heart, Activity, Calendar, Wrench, Users, Settings, ChevronRight, Sparkles } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

interface Guide {
  title: string;
  description: string;
  type: 'video' | 'article';
  duration: string;
  status: 'available' | 'coming-soon';
  href?: string;
}

interface Section {
  icon: React.ElementType;
  color: string;
  iconColor: string;
  title: string;
  description: string;
  guides: Guide[];
}

const HorseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12c0-4-3-8-8-8-3 0-5.5 1.5-7 3.5L3 10l1 3-2 4 3 1 2-1 2 3h4l1-2 2 1 4-3c1-1 2-2.5 2-4z"/>
    <circle cx="18" cy="9" r="1"/>
  </svg>
);

const sections: Section[] = [
  {
    icon: Sparkles,
    color: 'bg-amber-500/10',
    iconColor: 'text-amber-600',
    title: 'Getting Started',
    description: 'Set up your barn and get familiar with BarnKeep in under 10 minutes.',
    guides: [
      { title: 'Setting up your barn', description: 'Name your barn, add your address, and invite your first team member.', type: 'video', duration: '3 min', status: 'coming-soon' },
      { title: 'Adding your first horse', description: 'Create a horse profile with photos, breed, and basic health info.', type: 'video', duration: '4 min', status: 'coming-soon' },
      { title: 'Understanding the dashboard', description: 'A quick tour of everything on your main dashboard.', type: 'article', duration: '2 min read', status: 'available', href: '/guides/understanding-the-dashboard' },
    ],
  },
  {
    icon: HorseIcon,
    color: 'bg-blue-500/10',
    iconColor: 'text-blue-600',
    title: 'Horse Profiles',
    description: 'Everything about managing horse records, health history, and photos.',
    guides: [
      { title: 'Horse profile overview', description: 'Walk through each tab on a horse profile — health, feeding, breeding, and more.', type: 'video', duration: '6 min', status: 'coming-soon' },
      { title: 'Logging vaccinations & medications', description: 'How to record vaccines, set medication schedules, and track health records.', type: 'article', duration: '3 min read', status: 'coming-soon' },
      { title: 'Uploading photos & documents', description: 'Add photos, coggins papers, vet records, and other documents to a horse profile.', type: 'video', duration: '3 min', status: 'coming-soon' },
      { title: 'Tracking weight over time', description: 'Log weight records and read the weight history chart.', type: 'article', duration: '2 min read', status: 'coming-soon' },
    ],
  },
  {
    icon: Activity,
    color: 'bg-green-500/10',
    iconColor: 'text-green-600',
    title: 'Daily Care & Feeding',
    description: 'Build feed programs, log daily care, and keep your whole team on the same page.',
    guides: [
      { title: 'Creating a feed program', description: 'Set up hay, grain, and supplement schedules for each horse.', type: 'video', duration: '5 min', status: 'coming-soon' },
      { title: 'Using the feed chart', description: 'How to read and print the daily feed chart for your barn.', type: 'article', duration: '2 min read', status: 'coming-soon' },
      { title: 'Logging daily care', description: 'Record turnout, grooming, and general care observations each day.', type: 'video', duration: '3 min', status: 'coming-soon' },
    ],
  },
  {
    icon: Calendar,
    color: 'bg-violet-500/10',
    iconColor: 'text-violet-600',
    title: 'Schedule & Tasks',
    description: 'Stay on top of vet appointments, farrier visits, and daily to-dos.',
    guides: [
      { title: 'Creating events on the calendar', description: 'Schedule vet visits, farrier appointments, and competitions.', type: 'video', duration: '4 min', status: 'coming-soon' },
      { title: 'Managing tasks', description: 'Create one-off and recurring tasks, assign them to team members, and mark them done.', type: 'article', duration: '3 min read', status: 'coming-soon' },
      { title: 'Setting reminders', description: 'Get notified before important events so nothing falls through the cracks.', type: 'article', duration: '2 min read', status: 'coming-soon' },
    ],
  },
  {
    icon: Heart,
    color: 'bg-pink-500/10',
    iconColor: 'text-pink-600',
    title: 'Breeding Tracker',
    description: 'Track heat cycles, breeding records, pregnancies, and foaling from start to finish.',
    guides: [
      { title: 'Breeding tracker overview', description: 'How the five tabs work together — heat cycles, records, pregnancies, foalings, and stallions.', type: 'video', duration: '5 min', status: 'coming-soon' },
      { title: 'Logging a heat cycle', description: 'Record signs of estrus and let BarnKeep predict the next cycle.', type: 'article', duration: '2 min read', status: 'coming-soon' },
      { title: 'Recording a breeding', description: 'Log a breeding event with mare, stallion, type, vet, and stud fee.', type: 'video', duration: '4 min', status: 'coming-soon' },
      { title: 'Tracking a pregnancy', description: 'Add pregnancy check results, update status, and monitor the gestation progress bar.', type: 'article', duration: '3 min read', status: 'coming-soon' },
      { title: 'Recording a foaling', description: 'Document the birth outcome and automatically add the foal to your herd.', type: 'video', duration: '3 min', status: 'coming-soon' },
      { title: 'In-utero nominations', description: 'Track futurity and stakes nominations for a foal before it\'s born.', type: 'article', duration: '2 min read', status: 'coming-soon' },
    ],
  },
  {
    icon: Wrench,
    color: 'bg-orange-500/10',
    iconColor: 'text-orange-600',
    title: 'Farm Tasks & Maintenance',
    description: 'Keep up with barn repairs, equipment checks, and farm-wide to-dos.',
    guides: [
      { title: 'Farm tasks vs. horse tasks', description: 'Understand the difference between farm-level and horse-level task management.', type: 'article', duration: '2 min read', status: 'coming-soon' },
      { title: 'Setting up recurring maintenance', description: 'Schedule repeating tasks like water trough cleaning or equipment checks.', type: 'video', duration: '3 min', status: 'coming-soon' },
    ],
  },
  {
    icon: Users,
    color: 'bg-indigo-500/10',
    iconColor: 'text-indigo-600',
    title: 'Team & Permissions',
    description: 'Invite staff, set roles, and control who can see and do what.',
    guides: [
      { title: 'Inviting a team member', description: 'Generate an invite code or share a link to bring someone onto your barn.', type: 'article', duration: '2 min read', status: 'coming-soon' },
      { title: 'Understanding roles', description: 'Owner, Manager, Trainer, Caretaker — what each role can and can\'t do.', type: 'article', duration: '3 min read', status: 'coming-soon' },
    ],
  },
  {
    icon: Settings,
    color: 'bg-gray-500/10',
    iconColor: 'text-gray-600',
    title: 'Settings & Billing',
    description: 'Manage your subscription, update barn details, and configure your account.',
    guides: [
      { title: 'Upgrading your plan', description: 'How to switch from Starter to Farm, or add the Breeding Tracker.', type: 'article', duration: '2 min read', status: 'coming-soon' },
      { title: 'Barn settings overview', description: 'Update your barn name, address, timezone, and notification preferences.', type: 'article', duration: '2 min read', status: 'coming-soon' },
    ],
  },
];

export default function GuidesPage() {
  return (
    <div className="space-y-6 mt-4">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Guides' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Guides & Tutorials</h1>
          <p className="text-muted-foreground mt-1">Learn how to get the most out of BarnKeep — at your own pace.</p>
        </div>
        <a
          href="mailto:support@barnkeep.com"
          className="btn-secondary btn-md flex items-center gap-2 self-start sm:self-auto"
        >
          Need help? Email us
        </a>
      </div>

      {/* Coming soon banner */}
      <div className="card p-4 flex items-start gap-3 bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800">
        <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-900 dark:text-amber-400">Guides are on the way</p>
          <p className="text-sm text-amber-700 dark:text-amber-500 mt-0.5">
            We&apos;re recording video walkthroughs and writing step-by-step articles for every feature. In the meantime, email us at{' '}
            <a href="mailto:support@barnkeep.com" className="underline">support@barnkeep.com</a> and we&apos;ll walk you through anything.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            {/* Section header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${section.color}`}>
                <section.icon className={`w-5 h-5 ${section.iconColor}`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </div>
            </div>

            {/* Guide cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {section.guides.map((guide) => {
                const CardWrapper = guide.status === 'available' && guide.href
                  ? ({ children }: { children: React.ReactNode }) => (
                      <Link href={guide.href!} className="card p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
                        {children}
                      </Link>
                    )
                  : ({ children }: { children: React.ReactNode }) => (
                      <div className="card p-4 flex flex-col gap-3 opacity-70">
                        {children}
                      </div>
                    );
                return (
                <CardWrapper key={guide.title}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {guide.type === 'video' ? (
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Play className="w-4 h-4 text-primary fill-primary" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {guide.type === 'video' ? 'Video' : 'Article'}
                      </span>
                    </div>
                    {guide.status === 'coming-soon' && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground whitespace-nowrap">
                        Coming soon
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm leading-snug">{guide.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{guide.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{guide.duration}</span>
                    {guide.status === 'available' && (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </CardWrapper>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="card p-6 text-center bg-muted/30">
        <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="font-medium text-foreground">Can&apos;t find what you&apos;re looking for?</p>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          We&apos;re a small team and we genuinely want to help. Reach out and we&apos;ll get back to you the same day.
        </p>
        <a href="mailto:support@barnkeep.com" className="btn-primary btn-md">
          Email support@barnkeep.com
        </a>
      </div>
    </div>
  );
}
