import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimateOnScroll } from '@/components/marketing/AnimateOnScroll';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import {
  Check,
  X,
  Heart,
  Wheat,
  Home,
  Pill,
  Calendar,
  FileText,
  ClipboardList,
  Monitor,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'BarnKeep — Simple Barn Management',
  description:
    'The barn management tool built for small farms. Track horses, health records, feedings, and daily care — starting at $25/month.',
};

// ─── Design tokens ──────────────────────────────────────────────────────────
const MK = {
  bg:       '#fdf8f3',
  bg2:      '#f0e8df',
  accent:   '#b85470',
  accentBg: 'rgba(184,84,112,0.10)',
  dark:     '#1c1410',
  text:     '#262626',
  muted:    'rgba(38,38,38,0.56)',
  font:     "'League Spartan', sans-serif",
} as const;

// ─── Images ──────────────────────────────────────────────────────────────────
const IMG = {
  hero:  '/images/horse-portrait.jpg',   // close-up chestnut horse face — striking hero
  f1:    '/images/horses-in-stalls.jpg', // horses looking out of log stalls — health records
  f2:    '/images/horse-in-barn.jpg',    // horse in barn aisle — feed / daily care
  f3:    '/images/horses-pasture.jpg',   // two horses in pasture — stall/pasture
  f4:    '/images/horseshoe.jpg',        // horseshoe on barn — scheduling
  hiw:   '/images/palomino-barn.jpg',    // palomino inside barn — how it works
  cta:   '/images/tack-hooks.jpg',       // colorful tack/halters — CTA atmosphere
};

const heroFeatures = [
  {
    icon: Heart,
    label: 'Health & Vet Records',
    title: 'Every record, at your fingertips.',
    description:
      'Vaccinations, coggins, medications, weight tracking — all in one place. Pull up any horse\'s full health history from your phone in seconds.',
    image: IMG.f1,
    alt: 'Person caring for a horse in a barn aisle',
  },
  {
    icon: Wheat,
    label: 'Feed Tracking',
    title: 'Feed programs that actually work.',
    description:
      'Set up individual feed programs for each horse. Log daily feedings, track supplements, and keep the whole team on the same page with a daily feed chart.',
    image: IMG.f2,
    alt: 'Close-up of a horse eating hay',
  },
  {
    icon: Home,
    label: 'Stall & Pasture',
    title: 'See who\'s where, always.',
    description:
      'Assign stalls, rotate pastures, and track turnout schedules without sticky notes on the barn door. At a glance, everything is accounted for.',
    image: IMG.f3,
    alt: 'Horses grazing in a pasture',
  },
];

const cardFeatures = [
  { icon: Pill,          title: 'Medication Schedules', description: 'Never miss a dose. Track medications, set reminders, and log when treatments are given.' },
  { icon: Calendar,      title: 'Calendar & Tasks',     description: 'Vet visits, farrier appointments, and daily to-dos — all in one place so nothing slips through.' },
  { icon: FileText,      title: 'Documents & Records',  description: 'Store registration papers, coggins, and photos. Access everything from your phone in the barn.' },
  { icon: ClipboardList, title: 'Daily Care Logs',      description: 'Log daily observations and care tasks. Keep a clear, timestamped record for every horse.' },
];

const staggerFeatures = [
  { image: '/images/buckskin-pasture.jpg', label: 'Health Records', title: 'Complete health history', tags: 'Vaccinations · Medications · Weight' },
  { image: '/images/horse-in-barn.jpg',    label: 'Daily Care',     title: 'Daily feed tracking',     tags: 'Programs · Logs · Supplements'    },
  { image: '/images/horses-pasture.jpg',   label: 'Pastures',       title: 'Turnout management',      tags: 'Stalls · Rotation · Assignments'  },
  { image: '/images/horse-window.jpg',     label: 'Scheduling',     title: 'Calendar & events',       tags: 'Vet · Farrier · Tasks'            },
];

const testimonials = [
  {
    quote: 'Finally I know exactly what each horse has eaten and when they last had their coggins done. It\'s all right there.',
    name: 'Sarah M.',
    farm: 'Hobby barn · 4 horses',
    initial: 'S',
  },
  {
    quote: 'Way better than the whiteboard I was using. My vet loves that I can pull up records instantly during appointments.',
    name: 'Jake T.',
    farm: '4 horses',
    initial: 'J',
  },
  {
    quote: 'Simple. I\'m not a tech person and I figured it out in an afternoon. My whole barn routine changed.',
    name: 'Linda R.',
    farm: 'Boarding farm · 8 horses',
    initial: 'L',
  },
];

// ─── Shared label style ──────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontFamily: MK.font,
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: '0.4em',
  textTransform: 'uppercase',
  color: MK.accent,
};

// ─── Screenshot frame component ──────────────────────────────────────────────
// Drop your app screenshots in by passing a `src` prop.
// Until then, each slot shows a labeled placeholder.
function ScreenshotFrame({ src, alt, label, aspectRatio = '16/10', small = false }: {
  src?: string;
  alt?: string;
  label: string;
  aspectRatio?: string;
  small?: boolean;
}) {
  const dotSize = small ? 7 : 10;
  return (
    <div style={{
      borderRadius: small ? 10 : 14,
      overflow: 'hidden',
      boxShadow: small
        ? '0 6px 24px rgba(0,0,0,0.12)'
        : '0 32px 80px rgba(0,0,0,0.14)',
      border: '1px solid rgba(38,38,38,0.08)',
    }}>
      {/* Browser chrome */}
      <div style={{
        backgroundColor: '#e8e2da',
        padding: small ? '7px 12px' : '11px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: small ? 8 : 12,
        borderBottom: '1px solid rgba(38,38,38,0.08)',
      }}>
        <div style={{ display: 'flex', gap: small ? 4 : 6 }}>
          {(['#ff5f57', '#febc2e', '#28c840'] as const).map((c) => (
            <div key={c} style={{ width: dotSize, height: dotSize, borderRadius: '50%', backgroundColor: c }} />
          ))}
        </div>
        <div style={{
          flex: 1,
          backgroundColor: 'rgba(38,38,38,0.06)',
          borderRadius: 5,
          padding: small ? '3px 10px' : '5px 14px',
          fontFamily: 'system-ui, monospace',
          fontSize: small ? 9 : 11,
          color: 'rgba(38,38,38,0.28)',
        }}>
          app.barnkeep.com
        </div>
      </div>
      {/* Content area */}
      <div style={{ position: 'relative', aspectRatio, backgroundColor: '#f8f4ef' }}>
        {src ? (
          <Image src={src} alt={alt ?? label} fill className="object-cover object-top" unoptimized />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 10,
            border: '2px dashed rgba(38,38,38,0.1)',
            margin: small ? 8 : 12,
            borderRadius: small ? 6 : 8,
          }}>
            <div style={{
              width: small ? 30 : 44, height: small ? 30 : 44,
              borderRadius: '50%',
              backgroundColor: 'rgba(38,38,38,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Monitor style={{ width: small ? 14 : 20, height: small ? 14 : 20, color: 'rgba(38,38,38,0.2)' }} />
            </div>
            <p style={{
              fontFamily: "'League Spartan', sans-serif",
              fontSize: small ? 9 : 11,
              color: 'rgba(38,38,38,0.28)',
              letterSpacing: '0.06em',
              textAlign: 'center',
              padding: '0 16px',
              lineHeight: 1.6,
            }}>
              {label}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: MK.bg, fontFamily: MK.font, color: MK.text }}>
      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <MarketingNav fixed />

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: '100vh',
          paddingTop: 80,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: MK.bg,
          overflow: 'hidden',
        }}
      >
        <div
          className="w-full px-6 sm:px-10 lg:px-16"
          style={{ maxWidth: 1280, margin: '0 auto' }}
        >
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-16 lg:py-24">
            {/* Left */}
            <div>
              <span style={{ ...labelStyle, display: 'block', marginBottom: 28 }}>
                Barn Management Made Simple
              </span>
              <h1
                style={{
                  fontFamily: MK.font,
                  fontWeight: 900,
                  fontSize: 'clamp(52px, 8vw, 104px)',
                  lineHeight: 0.88,
                  letterSpacing: '-0.03em',
                  color: MK.text,
                  marginBottom: 32,
                }}
              >
                Your barn,
                <br />
                <em style={{ fontStyle: 'italic', color: MK.accent }}>beautifully</em>
                <br />
                organized.
              </h1>
              <p
                style={{
                  fontSize: 18,
                  color: MK.muted,
                  lineHeight: 1.65,
                  maxWidth: 440,
                  marginBottom: 44,
                  fontFamily: MK.font,
                  fontWeight: 400,
                }}
              >
                Track horses, health records, feedings, and daily care in one place.
                Built for the farm that cares about the details.
              </p>

              <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
                <Link
                  href="/sign-up"
                  style={{
                    backgroundColor: MK.text,
                    color: MK.bg,
                    fontFamily: MK.font,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.2em',
                    padding: '16px 44px',
                    borderRadius: 4,
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    display: 'inline-block',
                  }}
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/pricing"
                  style={{
                    color: MK.text,
                    fontFamily: MK.font,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    borderBottom: `2px solid ${MK.accent}`,
                    paddingBottom: 2,
                  }}
                >
                  See Pricing →
                </Link>
              </div>
              <p style={{ fontSize: 11, color: 'rgba(38,38,38,0.38)', letterSpacing: '0.06em', fontFamily: MK.font }}>
                14-day free trial · Cancel anytime
              </p>
            </div>

            {/* Right: image + floating badge */}
            <div style={{ position: 'relative' }}>
              <div
                className="mk-img-wrap"
                style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', aspectRatio: '3/4' }}
              >
                <Image
                  src={IMG.hero}
                  alt="Horse on a small farm"
                  fill
                  className="object-cover object-center"
                  unoptimized
                  priority
                />
              </div>

              {/* Floating concierge badge */}
              <div
                className="animate-bounce-slow hidden lg:flex"
                style={{
                  position: 'absolute',
                  bottom: -28,
                  left: -28,
                  width: 152,
                  height: 152,
                  borderRadius: '50%',
                  backgroundColor: MK.accent,
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  zIndex: 10,
                }}
              >
                <em style={{ fontFamily: MK.font, fontSize: 42, fontStyle: 'italic', fontWeight: 800, color: MK.text, lineHeight: 1 }}>
                  01
                </em>
                <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: '0.25em', color: MK.text, textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.5 }}>
                  YOUR<br />FARM
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF STRIP ──────────────────────────────────────────── */}
      <AnimateOnScroll>
        <section style={{ backgroundColor: MK.accent, padding: '36px 0' }}>
          <div className="max-w-5xl mx-auto px-6 sm:px-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {[
                { value: '$25/mo', sub: 'Plans start at' },
                { value: 'No setup fees', sub: 'Start in minutes' },
                { value: 'iOS & Android', sub: 'Works on mobile' },
                { value: 'Cancel anytime', sub: 'No commitments' },
              ].map((item) => (
                <div key={item.sub}>
                  <p style={{ fontFamily: MK.font, fontSize: 17, fontWeight: 800, color: MK.bg, letterSpacing: '-0.01em', marginBottom: 4 }}>
                    {item.value}
                  </p>
                  <p style={{ fontFamily: MK.font, fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', color: 'rgba(253,248,243,0.7)', textTransform: 'uppercase' }}>
                    {item.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimateOnScroll>

      {/* ── APP PREVIEW ──────────────────────────────────────────────────── */}
      {/*
        TO ADD SCREENSHOTS:
        Pass a `src="/images/your-screenshot.png"` prop to each ScreenshotFrame.
        Example: <ScreenshotFrame src="/images/dashboard.png" label="Dashboard" />
      */}
      <section style={{ backgroundColor: MK.bg, padding: '96px 0' }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16">
          <AnimateOnScroll>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <span style={{ ...labelStyle, display: 'block', marginBottom: 16 }}>The App</span>
              <h2 style={{ fontFamily: MK.font, fontWeight: 900, fontSize: 'clamp(28px, 3.5vw, 48px)', lineHeight: 0.95, letterSpacing: '-0.03em', color: MK.text }}>
                See it for yourself.
              </h2>
              <p style={{ fontFamily: MK.font, fontSize: 15, color: MK.muted, marginTop: 16 }}>
                Everything you need, nothing you don&apos;t.
              </p>
            </div>

            {/* Large hero screenshot */}
            <ScreenshotFrame label="Dashboard overview — add a screenshot here" aspectRatio="16/9" />

            {/* 3 smaller feature screenshots */}
            <div className="grid sm:grid-cols-3 gap-4 mt-5">
              <ScreenshotFrame label="Horse profile — add a screenshot here" aspectRatio="4/3" small />
              <ScreenshotFrame label="Feed chart — add a screenshot here" aspectRatio="4/3" small />
              <ScreenshotFrame label="Health records — add a screenshot here" aspectRatio="4/3" small />
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── PROBLEM STATEMENT ────────────────────────────────────────────── */}
      <section style={{ backgroundColor: MK.bg, padding: '96px 0' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
          <AnimateOnScroll>
            <div style={{ marginBottom: 56 }}>
              <span style={{ ...labelStyle, display: 'block', marginBottom: 20 }}>The Problem</span>
              <h2 style={{ fontFamily: MK.font, fontWeight: 900, fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 0.92, letterSpacing: '-0.03em', color: MK.text, maxWidth: 640 }}>
                Still managing your barn with{' '}
                <em style={{ fontStyle: 'italic', color: MK.accent }}>sticky notes?</em>
              </h2>
              <p style={{ fontFamily: MK.font, fontSize: 17, color: MK.muted, lineHeight: 1.6, maxWidth: 520, marginTop: 24 }}>
                Most barn owners patch things together with notebooks, whiteboards, and memory. It works — until it doesn&apos;t.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
            <AnimateOnScroll animation="fade-left">
              <div style={{ padding: '36px', borderRadius: 16, border: `1px solid rgba(38,38,38,0.08)`, backgroundColor: MK.bg2 }}>
                <p style={{ ...labelStyle, marginBottom: 28, color: 'rgba(38,38,38,0.4)' }}>Sound familiar?</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {[
                    'Forgetting when vaccines are due',
                    'Medication logs in 3 different notebooks',
                    'Trying to remember who last fed who',
                    'Vet records buried in a filing cabinet',
                  ].map((item) => (
                    <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <X style={{ width: 16, height: 16, color: '#e07070', flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontFamily: MK.font, fontSize: 15, color: MK.muted, lineHeight: 1.5 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-right">
              <div style={{ padding: '36px', borderRadius: 16, backgroundColor: MK.accent }}>
                <p style={{ ...labelStyle, color: 'rgba(253,248,243,0.7)', marginBottom: 28 }}>This is what BarnKeep solves.</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {[
                    'One place for every horse\'s health history',
                    'Feed charts and medication reminders',
                    'Daily care logs the whole team can see',
                    'Documents stored and searchable from your phone',
                  ].map((item) => (
                    <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <Check style={{ width: 16, height: 16, color: MK.bg, flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontFamily: MK.font, fontSize: 15, color: MK.bg, lineHeight: 1.5 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ── FEATURES — alternating rows ──────────────────────────────────── */}
      <section id="features" style={{ backgroundColor: MK.bg2, padding: '96px 0' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
          <AnimateOnScroll>
            <span style={{ ...labelStyle, display: 'block', marginBottom: 20 }}>Features</span>
            <h2 style={{ fontFamily: MK.font, fontWeight: 900, fontSize: 'clamp(36px, 5vw, 72px)', lineHeight: 0.9, letterSpacing: '-0.03em', color: MK.text, marginBottom: 72 }}>
              Everything your<br />
              <em style={{ fontStyle: 'italic', color: MK.accent }}>farm needs.</em>
            </h2>
          </AnimateOnScroll>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>
            {heroFeatures.map((feature, index) => {
              const imageFirst = index % 2 === 0;
              return (
                <AnimateOnScroll key={feature.title} animation={imageFirst ? 'fade-left' : 'fade-right'}>
                  <div className={`grid lg:grid-cols-2 gap-10 lg:gap-20 items-center`}>
                    {/* Image */}
                    <div
                      className={`mk-img-wrap relative group/card ${!imageFirst ? 'lg:order-2' : ''}`}
                      style={{ borderRadius: 16, overflow: 'hidden', aspectRatio: '4/3', position: 'relative' }}
                    >
                      <Image
                        src={feature.image}
                        alt={feature.alt}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="mk-card-overlay">
                        <span>{feature.label}</span>
                      </div>
                    </div>
                    {/* Text */}
                    <div className={!imageFirst ? 'lg:order-1' : ''}>
                      <span style={{ ...labelStyle, display: 'block', marginBottom: 20 }}>{feature.label}</span>
                      <h3 style={{ fontFamily: MK.font, fontWeight: 800, fontSize: 'clamp(28px, 3vw, 42px)', lineHeight: 1.05, letterSpacing: '-0.02em', color: MK.text, marginBottom: 20 }}>
                        {feature.title}
                      </h3>
                      <p style={{ fontFamily: MK.font, fontSize: 16, color: MK.muted, lineHeight: 1.7 }}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </AnimateOnScroll>
              );
            })}
          </div>

          {/* Icon cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-20" style={{ borderTop: `1px solid rgba(38,38,38,0.08)`, paddingTop: 64 }}>
            {cardFeatures.map((feature, index) => (
              <AnimateOnScroll key={feature.title} animation="fade-up" delay={index * 80}>
                <div
                  className="mk-service-card"
                  style={{
                    padding: '32px 28px',
                    border: `1px solid rgba(38,38,38,0.08)`,
                    backgroundColor: index % 2 === 1 ? MK.dark : MK.bg,
                    borderRadius: 12,
                    cursor: 'default',
                  }}
                >
                  <feature.icon
                    className="mk-service-icon"
                    style={{ width: 32, height: 32, color: MK.accent, marginBottom: 20 }}
                  />
                  <h3 style={{ fontFamily: MK.font, fontWeight: 800, fontSize: 14, letterSpacing: '0.05em', textTransform: 'uppercase', color: index % 2 === 1 ? MK.bg : MK.text, marginBottom: 10 }}>
                    {feature.title}
                  </h3>
                  <p style={{ fontFamily: MK.font, fontSize: 13, color: index % 2 === 1 ? 'rgba(253,248,243,0.55)' : MK.muted, lineHeight: 1.7 }}>
                    {feature.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── STAGGERED FEATURE GALLERY ────────────────────────────────────── */}
      <section style={{ backgroundColor: MK.bg, padding: '96px 0' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
          <AnimateOnScroll>
            <span style={{ ...labelStyle, display: 'block', marginBottom: 20 }}>At a glance</span>
            <h2 style={{ fontFamily: MK.font, fontWeight: 900, fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 0.92, letterSpacing: '-0.03em', color: MK.text, marginBottom: 64 }}>
              Built for real barn life.
            </h2>
          </AnimateOnScroll>

          <div className="grid sm:grid-cols-2 gap-6">
            {staggerFeatures.map((item, index) => (
              <AnimateOnScroll key={item.title} animation="fade-up" delay={index * 60}>
                <div className={index % 2 === 1 ? 'mk-stagger-right' : ''}>
                  {/* Image */}
                  <div
                    className="mk-img-wrap group/card"
                    style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="mk-card-overlay">
                      <span>{item.label}</span>
                    </div>
                  </div>
                  {/* Caption */}
                  <p style={{ ...labelStyle, color: MK.accent, marginBottom: 8 }}>{item.label}</p>
                  <h3 style={{ fontFamily: MK.font, fontWeight: 800, fontSize: 22, letterSpacing: '-0.01em', color: MK.text, marginBottom: 6 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontFamily: MK.font, fontSize: 11, color: MK.muted, letterSpacing: '0.05em' }}>
                    {item.tags}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: MK.dark, padding: '96px 0' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
          <AnimateOnScroll>
            <span style={{ ...labelStyle, color: MK.accent, display: 'block', marginBottom: 20 }}>Testimonials</span>
            <h2 style={{ fontFamily: MK.font, fontWeight: 900, fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 0.92, letterSpacing: '-0.03em', color: MK.bg, marginBottom: 56 }}>
              Loved by horse owners<br />
              <em style={{ fontStyle: 'italic', color: MK.accent }}>everywhere.</em>
            </h2>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, index) => (
              <AnimateOnScroll key={t.name} animation="fade-up" delay={index * 100}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 36, border: `1px solid rgba(255,255,255,0.08)`, height: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <span style={{ fontFamily: MK.font, fontSize: 48, color: MK.accent, lineHeight: 1, display: 'block' }}>&ldquo;</span>
                  <p style={{ fontFamily: MK.font, fontSize: 15, color: 'rgba(253,248,243,0.65)', lineHeight: 1.7, flex: 1, marginTop: -16 }}>
                    {t.quote}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 16, borderTop: `1px solid rgba(255,255,255,0.08)` }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: MK.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MK.font, fontWeight: 800, fontSize: 16, color: MK.bg, flexShrink: 0 }}>
                      {t.initial}
                    </div>
                    <div>
                      <p style={{ fontFamily: MK.font, fontSize: 13, fontWeight: 700, color: MK.bg }}>{t.name}</p>
                      <p style={{ fontFamily: MK.font, fontSize: 11, color: 'rgba(253,248,243,0.4)', letterSpacing: '0.05em' }}>{t.farm}</p>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: MK.bg, padding: '96px 0' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left */}
            <div>
              <AnimateOnScroll>
                <span style={{ ...labelStyle, display: 'block', marginBottom: 20 }}>How it works</span>
                <h2 style={{ fontFamily: MK.font, fontWeight: 900, fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 0.92, letterSpacing: '-0.03em', color: MK.text, marginBottom: 56 }}>
                  Up and running<br />
                  <em style={{ fontStyle: 'italic', color: MK.accent }}>in minutes.</em>
                </h2>
              </AnimateOnScroll>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 44 }}>
                {[
                  { step: '01', title: 'Create your barn', description: 'Sign up and set up your barn profile in about 2 minutes. No complicated onboarding, no setup fees.' },
                  { step: '02', title: 'Add your horses', description: "Enter each horse's details, feed program, and health records — all in a simple, intuitive form." },
                  { step: '03', title: 'Start managing', description: 'Log feedings, track medications, assign stalls, and keep your whole team in sync from any device.' },
                ].map((item, index) => (
                  <AnimateOnScroll key={item.step} animation="fade-up" delay={index * 120}>
                    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                      <span style={{ fontFamily: MK.font, fontWeight: 900, fontSize: 52, color: 'rgba(228,164,189,0.35)', lineHeight: 0.9, flexShrink: 0, letterSpacing: '-0.04em' }}>
                        {item.step}
                      </span>
                      <div>
                        <h3 style={{ fontFamily: MK.font, fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em', color: MK.text, marginBottom: 8 }}>
                          {item.title}
                        </h3>
                        <p style={{ fontFamily: MK.font, fontSize: 14, color: MK.muted, lineHeight: 1.65 }}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            </div>

            {/* Right: sticky image */}
            <AnimateOnScroll animation="fade-right">
              <div
                className="mk-img-wrap hidden lg:block"
                style={{ borderRadius: 20, overflow: 'hidden', position: 'sticky', top: 112, aspectRatio: '3/4' }}
              >
                <Image
                  src={IMG.hiw}
                  alt="Person walking alongside a horse"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ───────────────────────────────────────────────── */}
      <section style={{ backgroundColor: MK.bg2, padding: '96px 0' }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16">
          <AnimateOnScroll>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <span style={{ ...labelStyle, display: 'block', marginBottom: 20 }}>Pricing</span>
              <h2 style={{ fontFamily: MK.font, fontWeight: 900, fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 0.92, letterSpacing: '-0.03em', color: MK.text, marginBottom: 16 }}>
                Simple, honest pricing.
              </h2>
              <p style={{ fontFamily: MK.font, fontSize: 16, color: MK.muted }}>
                Both plans include a 14-day free trial.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Starter */}
            <AnimateOnScroll animation="fade-up">
              <div style={{ backgroundColor: MK.bg, borderRadius: 16, padding: '40px 36px', border: `1px solid rgba(38,38,38,0.08)`, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <p style={{ ...labelStyle, marginBottom: 16 }}>Starter</p>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontFamily: MK.font, fontWeight: 900, fontSize: 52, color: MK.text, letterSpacing: '-0.04em' }}>$25</span>
                  <span style={{ fontFamily: MK.font, fontSize: 14, color: MK.muted }}>/month</span>
                </div>
                <p style={{ fontFamily: MK.font, fontSize: 13, color: MK.muted, marginBottom: 28 }}>
                  Perfect for hobby barns & personal farms
                </p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32, flex: 1 }}>
                  {['Up to 10 horses', 'Feed tracking & charts', 'Health & vet records', 'Documents & photos', 'Mobile access'].map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Check style={{ width: 14, height: 14, color: MK.accent, flexShrink: 0 }} />
                      <span style={{ fontFamily: MK.font, fontSize: 13, color: MK.text }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  style={{ display: 'block', textAlign: 'center', padding: '14px 0', border: `2px solid ${MK.text}`, borderRadius: 4, fontFamily: MK.font, fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: MK.text, textDecoration: 'none' }}
                >
                  Start Free Trial
                </Link>
              </div>
            </AnimateOnScroll>

            {/* Farm */}
            <AnimateOnScroll animation="fade-up" delay={100}>
              <div style={{ backgroundColor: MK.text, borderRadius: 16, padding: '40px 36px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <p style={{ ...labelStyle, color: MK.accent, marginBottom: 16 }}>Farm</p>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontFamily: MK.font, fontWeight: 900, fontSize: 52, color: MK.bg, letterSpacing: '-0.04em' }}>$60</span>
                  <span style={{ fontFamily: MK.font, fontSize: 14, color: 'rgba(253,248,243,0.55)' }}>/month</span>
                </div>
                <p style={{ fontFamily: MK.font, fontSize: 13, color: 'rgba(253,248,243,0.55)', marginBottom: 28 }}>
                  For growing operations & boarding barns
                </p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32, flex: 1 }}>
                  {['Unlimited horses', 'Everything in Starter', 'Up to 5 team members', '50 GB document storage', 'Unlimited photos'].map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Check style={{ width: 14, height: 14, color: MK.accent, flexShrink: 0 }} />
                      <span style={{ fontFamily: MK.font, fontSize: 13, color: MK.bg }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  style={{ display: 'block', textAlign: 'center', padding: '14px 0', backgroundColor: MK.accent, borderRadius: 4, fontFamily: MK.font, fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: MK.text, textDecoration: 'none' }}
                >
                  Start Free Trial
                </Link>
              </div>
            </AnimateOnScroll>
          </div>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link
              href="/pricing"
              style={{ fontFamily: MK.font, fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: MK.text, textDecoration: 'none', borderBottom: `2px solid ${MK.accent}`, paddingBottom: 2 }}
            >
              See full pricing & add-ons →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '120px 0' }}>
        <Image
          src={IMG.cta}
          alt=""
          fill
          className="object-cover"
          unoptimized
        />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(38,38,38,0.62)' }} />
        <AnimateOnScroll animation="fade-up">
          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>
            <span style={{ ...labelStyle, color: MK.accent, display: 'block', marginBottom: 24 }}>
              Get started today
            </span>
            <h2 style={{ fontFamily: MK.font, fontWeight: 900, fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 0.9, letterSpacing: '-0.03em', color: '#fdf8f3', marginBottom: 20 }}>
              Your horses deserve better<br />
              <em style={{ fontStyle: 'italic', color: MK.accent }}>than a spreadsheet.</em>
            </h2>
            <p style={{ fontFamily: MK.font, fontSize: 16, color: 'rgba(253,248,243,0.7)', marginBottom: 44 }}>
              Try BarnKeep free for 14 days.
            </p>
            <Link
              href="/sign-up"
              style={{ backgroundColor: MK.bg, color: MK.text, fontFamily: MK.font, fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', padding: '18px 52px', borderRadius: 4, textDecoration: 'none', textTransform: 'uppercase', display: 'inline-block' }}
            >
              Start Your Free Trial
            </Link>
          </div>
        </AnimateOnScroll>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: MK.bg2, padding: '64px 0 32px' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid md:grid-cols-5 gap-10 md:gap-16 mb-16">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 16 }}>
                <Image src="/logo.png" alt="BarnKeep" width={30} height={30} style={{ borderRadius: 7 }} />
                <span style={{ fontFamily: MK.font, fontWeight: 800, fontSize: 16, color: MK.text, letterSpacing: '-0.01em' }}>BARNKEEP</span>
              </Link>
              <p style={{ fontFamily: MK.font, fontSize: 13, color: MK.muted, lineHeight: 1.7, maxWidth: 260 }}>
                Simple barn management for the farms that care about the details.
              </p>
            </div>

            {/* Links */}
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
                      <Link href={href} style={{ fontFamily: MK.font, fontSize: 13, color: MK.muted, textDecoration: 'none', letterSpacing: '0.02em' }}>
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
