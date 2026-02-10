'use client';

import { Sidebar, MobileBottomNav } from '@/components/dashboard/Sidebar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastContainer } from '@/components/ui/ToastContainer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Demo mode: No authentication required
  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-background">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:text-sm focus:font-medium"
        >
          Skip to main content
        </a>
        <Sidebar />

        <main id="main-content" className="flex-1 lg:ml-0 pb-24 lg:pb-0 pt-[60px] lg:pt-0">
          <div className="max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>

        <MobileBottomNav />
        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
}
