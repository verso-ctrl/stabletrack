import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { TermlyEmbed } from '@/components/marketing/TermlyEmbed';

export const metadata: Metadata = {
  title: 'Privacy Policy — BarnKeep',
  description: 'Read the BarnKeep Privacy Policy.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <MarketingNav />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="text-amber-600 hover:text-amber-700 mb-8 inline-block">
          ← Back to Home
        </Link>
        <div className="bg-white rounded-xl p-6 sm:p-10 min-h-[400px]">
          <TermlyEmbed dataId="0b27dd69-5a34-4bcd-af72-dfaf3bddc6e7" />
        </div>
      </div>
    </div>
  );
}
