'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const MK_FONT = "'League Spartan', sans-serif";
const MK_BG = '#fdf8f3';
const MK_ACCENT = '#e4a4bd';
const MK_TEXT = '#262626';

interface MarketingNavProps {
  fixed?: boolean;
}

export function MarketingNav({ fixed = false }: MarketingNavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!fixed) return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [fixed]);

  return (
    <nav
      style={{
        position: fixed ? 'fixed' : 'relative',
        top: 0, left: 0, right: 0,
        zIndex: 50,
        height: 80,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: scrolled
          ? 'rgba(253, 248, 243, 0.92)'
          : 'rgba(253, 248, 243, 0.80)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid rgba(38, 38, 38, ${scrolled ? '0.08' : '0.04'})`,
        transition: 'background 0.4s ease, border-color 0.4s ease',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 40px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
          }}
        >
          <Image
            src="/logo.png"
            alt="BarnKeep"
            width={30}
            height={30}
            style={{ borderRadius: 7 }}
          />
          <span
            style={{
              fontFamily: MK_FONT,
              fontWeight: 800,
              fontSize: 17,
              color: MK_TEXT,
              letterSpacing: '-0.01em',
            }}
          >
            BARNKEEP
          </span>
        </Link>

        {/* Center nav */}
        <div
          className="hidden md:flex"
          style={{ gap: 40, alignItems: 'center' }}
        >
          {([
            ['Features', '/#features'],
            ['Pricing', '/pricing'],
            ['About', '/about'],
          ] as const).map(([label, href]) => (
            <Link
              key={href}
              href={href}
              style={{
                fontFamily: MK_FONT,
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: '0.2em',
                color: 'rgba(38,38,38,0.55)',
                textDecoration: 'none',
                textTransform: 'uppercase',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = MK_TEXT)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = 'rgba(38,38,38,0.55)')
              }
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link
            href="/sign-in"
            className="hidden md:inline-block"
            style={{
              fontFamily: MK_FONT,
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: '0.2em',
              color: 'rgba(38,38,38,0.55)',
              textDecoration: 'none',
              textTransform: 'uppercase',
            }}
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            style={{
              fontFamily: MK_FONT,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: MK_TEXT,
              backgroundColor: MK_ACCENT,
              textDecoration: 'none',
              textTransform: 'uppercase',
              borderRadius: 100,
              padding: '12px 28px',
              display: 'inline-block',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.opacity = '0.85')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.opacity = '1')
            }
          >
            Start Free
          </Link>
        </div>
      </div>
    </nav>
  );
}
