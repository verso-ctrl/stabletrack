import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { TermlyEmbed } from '@/components/marketing/TermlyEmbed';

export const metadata: Metadata = {
  title: 'Cookie Policy — BarnKeep',
  description: 'Read the BarnKeep Cookie Policy.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <MarketingNav />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="text-amber-600 hover:text-amber-700 mb-8 inline-block">
          ← Back to Home
        </Link>
        <div className="bg-white rounded-xl p-6 sm:p-10 min-h-[400px]">
          <TermlyEmbed dataId="f16eb82e-4817-488a-9923-eafaeb20b634" />
        </div>
      </div>
    </div>
  );
}
