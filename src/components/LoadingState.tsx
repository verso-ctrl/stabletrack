import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({
  message = 'Loading...',
  fullScreen = false,
  size = 'md'
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const containerClasses = fullScreen
    ? 'flex items-center justify-center min-h-screen bg-background'
    : 'flex items-center justify-center h-64';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-amber-500 mx-auto mb-3`} />
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  );
}

export function LoadingSpinner({
  size = 'md',
  className = ''
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin text-amber-500 ${className}`} />
  );
}

export function LoadingOverlay({ message = 'Processing...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl shadow-xl p-8 flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
        <p className="text-muted-foreground font-medium">{message}</p>
      </div>
    </div>
  );
}

export function InlineLoader({ message }: { message?: string }) {
  return (
    <div className="flex items-center gap-3 text-muted-foreground">
      <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
      {message && <span className="text-sm">{message}</span>}
    </div>
  );
}

export function ButtonLoader() {
  return <Loader2 className="w-4 h-4 animate-spin" />;
}

export function SkeletonCard() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-muted rounded w-2/3"></div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-muted rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
