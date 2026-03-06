import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { TermlyEmbed } from '@/components/marketing/TermlyEmbed';

export const metadata: Metadata = {
  title: 'Terms of Service — BarnKeep',
  description: 'Read the BarnKeep Terms of Service.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="text-amber-600 hover:text-amber-700 mb-8 inline-block">
          ← Back to Home
        </Link>
        <TermlyEmbed dataId="81155145-dd9b-4b8a-b213-d813032bb92f" />
      </div>
    </div>
  );
}
