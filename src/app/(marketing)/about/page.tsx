import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Wheat, Shield } from 'lucide-react';
import { MarketingNav } from '@/components/marketing/MarketingNav';

export const metadata: Metadata = {
  title: 'About — BarnKeep',
  description: 'BarnKeep is built for small horse farms and hobby barns. Learn why we made it and who it\'s for.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <MarketingNav />

      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-foreground tracking-tight">
            Built for the people who actually muck stalls.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            BarnKeep started with a simple observation: the barn management software that existed was built for large commercial operations — not for the hobby farmer with 4 horses, or the small boarding barn with 12.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto prose prose-stone max-w-none">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-4">Why we built this</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Small farm owners were managing their horses with a patchwork of sticky notes, spiral notebooks, group texts, and memory. That works — until a horse gets sick, a new caretaker starts, or you can&apos;t remember when the last coggins was done.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Enterprise barn software costs hundreds of dollars a month and assumes you have a full-time farm manager to configure it. We wanted something different: a tool that a single horse owner could set up in an afternoon and actually stick with.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            BarnKeep is that tool. Straightforward, affordable, and genuinely useful — whether you have 2 horses or 20.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-12 text-center">What we believe</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: 'Simple over powerful',
                description: 'A tool you actually use beats a tool that does everything. We keep BarnKeep focused on what small farms genuinely need.',
              },
              {
                icon: Wheat,
                title: 'Affordable by design',
                description: 'Horse ownership is already expensive. Barn management software shouldn\'t be a luxury. Starting at $25/month, it\'s less than a bag of grain.',
              },
              {
                icon: Shield,
                title: 'Your data is yours',
                description: 'We don\'t sell your data, don\'t lock you in, and let you export everything anytime. Cancel whenever you want.',
              },
            ].map((value) => (
              <div key={value.title} className="p-6 rounded-xl border border-border/60 bg-card">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <value.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-medium text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border/40">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Give it a try — free for 14 days
          </h2>
          <p className="mt-3 text-muted-foreground">
            No complicated setup. Cancel anytime.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Start free trial
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 text-foreground font-medium rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              See pricing
            </Link>
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
