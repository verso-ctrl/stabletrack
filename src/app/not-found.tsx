import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🐴</div>
        <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
        <h2 className="text-xl font-semibold text-foreground mb-3">Page not found</h2>
        <p className="text-muted-foreground mb-8">
          This page doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 font-medium transition-opacity"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="px-6 py-2.5 border border-border rounded-lg text-muted-foreground hover:bg-muted font-medium transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
