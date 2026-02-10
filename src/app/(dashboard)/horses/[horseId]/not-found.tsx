import Link from 'next/link';

export default function HorseNotFound() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🐴</div>
        <h1 className="text-2xl font-bold text-foreground mb-3">Horse not found</h1>
        <p className="text-muted-foreground mb-8">
          This horse doesn&apos;t exist or may have been removed from your barn.
        </p>
        <Link
          href="/horses"
          className="inline-block px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 font-medium transition-opacity"
        >
          Back to Horses
        </Link>
      </div>
    </div>
  );
}
