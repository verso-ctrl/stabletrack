import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'One plan, one price. Everything your barn needs for $25/month. Optional add-ons for breeding, training, billing, and team management.',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
