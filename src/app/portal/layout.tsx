import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
        <p className="text-muted-foreground">Loading portal...</p>
      </div>
    </div>
  );
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  );
}
