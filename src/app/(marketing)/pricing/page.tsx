'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Plus, Minus } from 'lucide-react';
import { STARTER_FEATURES, FARM_FEATURES, ADD_ONS } from '@/lib/tiers';
import { MarketingNav } from '@/components/marketing/MarketingNav';

// ─── Design tokens ───────────────────────────────────────────────────────────
const MK = {
  bg:     '#fdf8f3',
  bg2:    '#f5f0eb',
  accent: '#b85470',
  text:   '#262626',
  muted:  'rgba(38,38,38,0.58)',
  font:   "'League Spartan', sans-serif",
} as const;

const labelStyle: React.CSSProperties = {
  fontFamily: MK.font,
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: '0.4em',
  textTransform: 'uppercase',
  color: MK.accent,
};

const faqs = [
  {
    question: 'Is there a horse limit?',
    answer: 'The Starter plan supports up to 10 horses. Need more? The Farm plan has no limit — unlimited horses, team members, and photos.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Absolutely. No contracts, no commitments. Cancel anytime and your data stays yours — you can export everything before you go.',
  },
  {
    question: 'Can I switch plans?',
    answer: 'Yes! Upgrade or downgrade anytime from Settings → Billing. Changes take effect immediately and billing is prorated.',
  },
  {
    question: 'Is there a mobile app?',
    answer: 'Yes — BarnKeep works on iOS and Android. Access everything from your phone, whether you\'re in the barn or out in the pasture.',
  },
  {
    question: 'Can I try before buying?',
    answer: 'Yes — every plan starts with a 14-day free trial. Just sign up, add your horses, and see if it works for you before you\'re charged.',
  },
];

const breedingFeatures = [
  'Heat cycle tracking & calendar',
  'Breeding records & stallion reports',
  'Foaling management & mare history',
];

const comingSoon = [
  { name: 'Training & Lessons', description: 'Training logs, lesson scheduling, and competition tracking.' },
  { name: 'Client & Billing',   description: 'Client management, invoicing, payments, and recurring billing.' },
  { name: 'Team Management',    description: 'Multi-user access, role-based permissions, and team coordination.' },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ backgroundColor: MK.bg, fontFamily: MK.font, color: MK.text, minHeight: '100vh' }}>
      <MarketingNav />

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: MK.bg, padding: '80px 0 64px' }}>
        <div className="max-w-3xl mx-auto px-6 sm:px-10" style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontFamily: MK.font,
              fontWeight: 900,
              fontSize: 'clamp(44px, 7vw, 88px)',
              lineHeight: 0.88,
              letterSpacing: '-0.03em',
              color: MK.text,
              marginBottom: 24,
            }}
          >
            Simple plans for<br />
            <em style={{ fontStyle: 'italic', color: MK.accent }}>every farm.</em>
          </h1>
          <p style={{ fontFamily: MK.font, fontSize: 17, color: MK.muted, lineHeight: 1.65 }}>
            Pick the size that fits your barn. Both include a 14-day free trial.
          </p>
        </div>
      </section>

      {/* ── PLAN CARDS ───────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: MK.bg2, padding: '64px 0' }}>
        <div className="max-w-4xl mx-auto px-6 sm:px-10">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Starter */}
            <div style={{ backgroundColor: MK.bg, borderRadius: 20, padding: '44px 40px', border: `1px solid rgba(38,38,38,0.07)`, display: 'flex', flexDirection: 'column' }}>
              <span style={{ ...labelStyle, display: 'block', marginBottom: 20 }}>Starter</span>
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontFamily: MK.font, fontWeight: 900, fontSize: 64, color: MK.text, letterSpacing: '-0.04em', lineHeight: 1 }}>$25</span>
                <span style={{ fontFamily: MK.font, fontSize: 14, color: MK.muted }}>/month</span>
              </div>
              <p style={{ fontFamily: MK.font, fontSize: 13, color: MK.muted, marginBottom: 32 }}>
                Perfect for hobby barns & personal farms
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36, flex: 1 }}>
                {STARTER_FEATURES.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <Check style={{ width: 14, height: 14, color: MK.accent, flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontFamily: MK.font, fontSize: 13, color: MK.text }}>{f}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/sign-up"
                style={{ display: 'block', textAlign: 'center', padding: '15px 0', border: `2px solid ${MK.text}`, borderRadius: 4, fontFamily: MK.font, fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: MK.text, textDecoration: 'none', marginBottom: 12 }}
              >
                Start Free Trial
              </Link>
            </div>

            {/* Farm */}
            <div style={{ backgroundColor: MK.text, borderRadius: 20, padding: '44px 40px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              {/* Best value badge */}
              <div style={{ position: 'absolute', top: 24, right: 24, backgroundColor: MK.accent, color: MK.text, fontFamily: MK.font, fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '6px 14px', borderRadius: 100 }}>
                Best Value
              </div>

              <span style={{ ...labelStyle, color: MK.accent, display: 'block', marginBottom: 20 }}>Farm</span>
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontFamily: MK.font, fontWeight: 900, fontSize: 64, color: MK.bg, letterSpacing: '-0.04em', lineHeight: 1 }}>$60</span>
                <span style={{ fontFamily: MK.font, fontSize: 14, color: 'rgba(253,248,243,0.45)' }}>/month</span>
              </div>
              <p style={{ fontFamily: MK.font, fontSize: 13, color: 'rgba(253,248,243,0.45)', marginBottom: 32 }}>
                For growing operations & boarding barns
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36, flex: 1 }}>
                {FARM_FEATURES.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <Check style={{ width: 14, height: 14, color: MK.accent, flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontFamily: MK.font, fontSize: 13, color: MK.bg }}>{f}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/sign-up"
                style={{ display: 'block', textAlign: 'center', padding: '15px 0', backgroundColor: MK.accent, borderRadius: 4, fontFamily: MK.font, fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: MK.text, textDecoration: 'none', marginBottom: 12 }}
              >
                Start Free Trial
              </Link>
            </div>
          </div>

          <p style={{ fontFamily: MK.font, fontSize: 11, color: MK.muted, textAlign: 'center', marginTop: 24, letterSpacing: '0.05em' }}>
            Both plans include a 14-day free trial. Switch plans anytime.
          </p>
        </div>
      </section>

      {/* ── ADD-ONS ───────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: MK.bg, padding: '80px 0' }}>
        <div className="max-w-4xl mx-auto px-6 sm:px-10">
          <div style={{ marginBottom: 48 }}>
            <span style={{ ...labelStyle, display: 'block', marginBottom: 16 }}>Add-Ons</span>
            <h2 style={{ fontFamily: MK.font, fontWeight: 900, fontSize: 'clamp(32px, 4vw, 52px)', lineHeight: 0.92, letterSpacing: '-0.03em', color: MK.text, marginBottom: 12 }}>
              Only pay for<br />
              <em style={{ fontStyle: 'italic', color: MK.accent }}>what you use.</em>
            </h2>
            <p style={{ fontFamily: MK.font, fontSize: 15, color: MK.muted, lineHeight: 1.6 }}>
              Optional features you can add to any plan as your farm grows.
            </p>
          </div>

          {/* Breeding Tracker — available */}
          <div style={{ backgroundColor: MK.bg2, border: `1px solid rgba(228,164,189,0.35)`, borderRadius: 16, padding: '36px', marginBottom: 20 }}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                  <span style={{ ...labelStyle, color: MK.accent }}>Available Now</span>
                  <span style={{ fontFamily: MK.font, fontSize: 13, fontWeight: 700, color: MK.accent }}>+${ADD_ONS.breeding.monthlyPriceCents / 100}/month</span>
                </div>
                <h3 style={{ fontFamily: MK.font, fontWeight: 800, fontSize: 22, color: MK.text, marginBottom: 8, letterSpacing: '-0.01em' }}>
                  {ADD_ONS.breeding.name}
                </h3>
                <p style={{ fontFamily: MK.font, fontSize: 14, color: MK.muted, lineHeight: 1.6, marginBottom: 20 }}>
                  {ADD_ONS.breeding.description}
                </p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {breedingFeatures.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Check style={{ width: 13, height: 13, color: MK.accent, flexShrink: 0 }} />
                      <span style={{ fontFamily: MK.font, fontSize: 13, color: MK.text }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <p style={{ fontFamily: MK.font, fontSize: 11, color: MK.muted, marginTop: 16, letterSpacing: '0.04em' }}>
                  Available on any plan. Add or remove anytime.
                </p>
              </div>
              <Link
                href="/sign-up"
                style={{ backgroundColor: MK.text, color: MK.bg, fontFamily: MK.font, fontSize: 10, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '14px 28px', borderRadius: 4, textDecoration: 'none', flexShrink: 0, display: 'inline-block', whiteSpace: 'nowrap' }}
              >
                Add to my plan
              </Link>
            </div>
          </div>

          {/* Coming soon */}
          <div className="grid sm:grid-cols-3 gap-4">
            {comingSoon.map((addon) => (
              <div
                key={addon.name}
                style={{ backgroundColor: MK.bg2, border: `1px solid rgba(38,38,38,0.06)`, borderRadius: 12, padding: '24px', opacity: 0.55 }}
              >
                <p style={{ ...labelStyle, color: 'rgba(38,38,38,0.4)', marginBottom: 10 }}>Coming Soon</p>
                <h3 style={{ fontFamily: MK.font, fontWeight: 700, fontSize: 15, color: MK.text, marginBottom: 8 }}>
                  {addon.name}
                </h3>
                <p style={{ fontFamily: MK.font, fontSize: 12, color: MK.muted, lineHeight: 1.6 }}>
                  {addon.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQS ─────────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: MK.bg2, padding: '80px 0' }}>
        <div className="max-w-2xl mx-auto px-6 sm:px-10">
          <span style={{ ...labelStyle, display: 'block', marginBottom: 16 }}>FAQ</span>
          <h2 style={{ fontFamily: MK.font, fontWeight: 900, fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: 0.92, letterSpacing: '-0.03em', color: MK.text, marginBottom: 48 }}>
            Common questions.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {faqs.map((faq, index) => (
              <div
                key={index}
                style={{ borderBottom: `1px solid rgba(38,38,38,0.08)`, overflow: 'hidden' }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 0', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', gap: 16 }}
                >
                  <span style={{ fontFamily: MK.font, fontSize: 15, fontWeight: 700, color: MK.text, letterSpacing: '-0.01em' }}>
                    {faq.question}
                  </span>
                  {openFaq === index
                    ? <Minus style={{ width: 16, height: 16, color: MK.accent, flexShrink: 0 }} />
                    : <Plus  style={{ width: 16, height: 16, color: MK.text,   flexShrink: 0 }} />
                  }
                </button>
                {openFaq === index && (
                  <p style={{ fontFamily: MK.font, fontSize: 14, color: MK.muted, lineHeight: 1.7, paddingBottom: 24, marginTop: -4 }}>
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: MK.text, padding: '80px 0' }}>
        <div className="max-w-2xl mx-auto px-6 sm:px-10" style={{ textAlign: 'center' }}>
          <span style={{ ...labelStyle, color: MK.accent, display: 'block', marginBottom: 24 }}>
            Get started today
          </span>
          <h2 style={{ fontFamily: MK.font, fontWeight: 900, fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 0.92, letterSpacing: '-0.03em', color: MK.bg, marginBottom: 16 }}>
            Ready to simplify<br />
            <em style={{ fontStyle: 'italic', color: MK.accent }}>your barn?</em>
          </h2>
          <p style={{ fontFamily: MK.font, fontSize: 15, color: 'rgba(253,248,243,0.55)', marginBottom: 44, lineHeight: 1.6 }}>
            14-day free trial. Plans start at $25/month.
          </p>
          <Link
            href="/sign-up"
            style={{ backgroundColor: MK.accent, color: MK.text, fontFamily: MK.font, fontSize: 11, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '18px 52px', borderRadius: 4, textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}
          >
            Start Free Trial
          </Link>
          <p style={{ fontFamily: MK.font, fontSize: 10, color: 'rgba(253,248,243,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Takes 2 minutes to set up
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: MK.bg2, padding: '64px 0 32px' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid md:grid-cols-5 gap-10 md:gap-16 mb-16">
            <div className="md:col-span-2">
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 16 }}>
                <Image src="/logo.png" alt="BarnKeep" width={30} height={30} style={{ borderRadius: 7 }} />
                <span style={{ fontFamily: MK.font, fontWeight: 800, fontSize: 16, color: MK.text, letterSpacing: '-0.01em' }}>BARNKEEP</span>
              </Link>
              <p style={{ fontFamily: MK.font, fontSize: 13, color: MK.muted, lineHeight: 1.7, maxWidth: 260 }}>
                Boutique barn management for the horse farms that care about the details.
              </p>
            </div>

            {[
              { heading: 'Product', links: [['Features', '/#features'], ['Pricing', '/pricing']] },
              { heading: 'Company', links: [['About', '/about'], ['Contact', '/contact']] },
              { heading: 'Legal',   links: [['Privacy', '/privacy'], ['Terms', '/terms']] },
            ].map((col) => (
              <div key={col.heading}>
                <p style={{ fontFamily: MK.font, fontSize: 9, fontWeight: 900, letterSpacing: '0.35em', textTransform: 'uppercase', color: MK.accent, marginBottom: 16, borderBottom: `2px solid ${MK.accent}`, paddingBottom: 8, display: 'inline-block' }}>
                  {col.heading}
                </p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                  {col.links.map(([label, href]) => (
                    <li key={href}>
                      <Link href={href} style={{ fontFamily: MK.font, fontSize: 13, color: MK.muted, textDecoration: 'none' }}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ borderTop: `1px solid rgba(38,38,38,0.08)`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <p style={{ fontFamily: MK.font, fontSize: 9, color: 'rgba(38,38,38,0.3)', letterSpacing: '0.08em' }}>
              © {new Date().getFullYear()} BARNKEEP. ALL RIGHTS RESERVED.
            </p>
            <Link
              href="/sign-up"
              style={{ fontFamily: MK.font, fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: MK.text, textDecoration: 'none', borderBottom: `1px solid ${MK.accent}`, paddingBottom: 1 }}
            >
              Start Free Trial →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
