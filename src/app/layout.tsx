import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from './providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'StableTrack - Horse Farm Management',
    template: '%s | StableTrack',
  },
  description: 'Professional horse farm management software.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ffffff',
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
  // If Clerk is not configured, render without ClerkProvider (demo mode)
  if (!isClerkConfigured) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-stone-50" suppressHydrationWarning>
          {/* Demo Mode Banner */}
          <div className="bg-amber-500 text-amber-950 text-center py-2 px-4 text-sm font-medium">
            🔧 Demo Mode - Configure Clerk & Stripe keys in .env for full features
          </div>
          <Providers>{children}</Providers>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-stone-50" suppressHydrationWarning>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
