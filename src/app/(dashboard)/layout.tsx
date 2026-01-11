'use client';

import { Sidebar, MobileBottomNav } from '@/components/dashboard/Sidebar';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Demo mode: No authentication required
  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-stone-50">
        <Sidebar />

        <main className="flex-1 lg:ml-0 pb-20 lg:pb-0 pt-16 lg:pt-0">
          <div className="max-w-7xl mx-auto p-4 lg:p-8">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>

        <MobileBottomNav />
      </div>
    </ErrorBoundary>
  );
}
