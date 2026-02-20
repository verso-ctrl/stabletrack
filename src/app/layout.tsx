import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from './providers';
import '@/styles/globals.css';

const rawUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.barnkeep.com';
const siteUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;

export const metadata: Metadata = {
  title: {
    default: 'BarnKeep - Simple Barn Management for Small Farms',
    template: '%s | BarnKeep',
  },
  description: 'Affordable barn management for small horse farms. Track horses, feedings, health records, stalls, and pastures — all for $25/month.',
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'BarnKeep',
    title: 'BarnKeep - Simple Barn Management for Small Farms',
    description: 'Affordable barn management for small horse farms. Track horses, feedings, health records, stalls, and pastures — all for $25/month.',
    url: siteUrl,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'BarnKeep' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BarnKeep - Simple Barn Management for Small Farms',
    description: 'Affordable barn management for small horse farms. Track horses, feedings, health records, stalls, and pastures — all for $25/month.',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#f7f4f0',
};

// Check if Clerk is properly configured - only check NEXT_PUBLIC_ vars to avoid hydration mismatch
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = 
  clerkPublishableKey &&
  clerkPublishableKey.startsWith('pk_') &&
  !clerkPublishableKey.includes('your_key') &&
  !clerkPublishableKey.includes('_here');

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Script to prevent flash of wrong theme
  const themeScript = `(function(){try{var t=localStorage.getItem('barnkeep-theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})()`;

  // If Clerk is not configured, render without ClerkProvider (demo mode)
  if (!isClerkConfigured) {
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body className="min-h-screen bg-background" suppressHydrationWarning>
          {/* Demo Mode Banner */}
          <div className="bg-primary/90 text-primary-foreground text-center py-2 px-4 text-sm font-medium">
            Demo Mode - Configure Clerk & Stripe keys in .env for full features
          </div>
          <Providers>{children}</Providers>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body className="min-h-screen bg-background" suppressHydrationWarning>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
