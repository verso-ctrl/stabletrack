import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, MessageSquare, HelpCircle } from 'lucide-react';
import { MarketingNav } from '@/components/marketing/MarketingNav';

export const metadata: Metadata = {
  title: 'Contact — BarnKeep',
  description: 'Get in touch with the BarnKeep team. We\'re happy to help.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <MarketingNav />

      {/* Header */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-foreground tracking-tight">
            We&apos;d love to hear from you.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Questions, feedback, or just want to say hello — we&apos;re a small team and we actually read every message.
          </p>
        </div>
      </section>

      {/* Contact options */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: Mail,
                title: 'General inquiries',
                description: 'Questions about BarnKeep, partnerships, or anything else.',
                contact: 'hello@barnkeep.com',
                href: 'mailto:hello@barnkeep.com',
              },
              {
                icon: MessageSquare,
                title: 'Support',
                description: 'Having trouble with something? We\'ll get you sorted.',
                contact: 'support@barnkeep.com',
                href: 'mailto:support@barnkeep.com',
              },
              {
                icon: HelpCircle,
                title: 'Privacy & legal',
                description: 'Data requests, privacy questions, or legal matters.',
                contact: 'privacy@barnkeep.com',
                href: 'mailto:privacy@barnkeep.com',
              },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-xl border border-border/60 bg-card flex flex-col gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-medium text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{item.description}</p>
                <a
                  href={item.href}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {item.contact}
                </a>
              </div>
            ))}
          </div>

          {/* Response time note */}
          <div className="rounded-xl border border-border/40 bg-muted/30 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              We typically respond within <span className="font-medium text-foreground">1 business day</span>. For urgent account issues, email support@barnkeep.com and mention &ldquo;urgent&rdquo; in the subject line.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/40 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 md:gap-12">
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5">
                <Image src="/logo.png" alt="BarnKeep" width={32} height={32} className="rounded-md" />
                <span className="font-display font-semibold text-foreground">BarnKeep</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                Simple barn management for small farms.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground text-sm">Product</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground text-sm">Company</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground text-sm">Legal</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} BarnKeep. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
