'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f7f4f0] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-100 flex items-center justify-center">
            <span className="text-2xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-500 mb-8">
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-[#b8860b] text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
