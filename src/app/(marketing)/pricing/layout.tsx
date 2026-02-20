import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple pricing for small farms. Starter plan at $25/month, Farm plan at $60/month. Optional add-ons for breeding, training, billing, and team management.',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
