'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

export default function AcceptTermsPage() {
  const router = useRouter();
  const [tosAccepted, setTosAccepted] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState('');
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    async function init() {
      try {
        const [userRes, csrfRes] = await Promise.all([
          fetch('/api/user'),
          fetch('/api/csrf'),
        ]);
        if (userRes.ok) {
          const { data } = await userRes.json();
          if (data?.tosAcceptedAt) {
            router.push('/onboarding');
            return;
          }
        }
        if (csrfRes.ok) {
          const { csrfToken } = await csrfRes.json();
          setCsrfToken(csrfToken);
        }
      } catch {
        // Continue showing the page
      } finally {
        setIsChecking(false);
      }
    }
    init();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tosAccepted) return;

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/user/accept-terms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ tosAccepted: true, marketingOptIn }),
      });

      if (!res.ok) {
        const { error: msg } = await res.json();
        setError(msg || 'Something went wrong');
        return;
      }

      router.push('/onboarding');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <Image src="/logo.png" alt="BarnKeep" width={64} height={64} className="rounded-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Almost There!</h1>
          <p className="text-muted-foreground mt-2">
            Please review and accept our terms before getting started.
          </p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} className="bg-card rounded-xl border-2 border-border p-6 space-y-5">
          {/* ToS Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={tosAccepted}
              onChange={(e) => setTosAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm text-foreground">
              I agree to the{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 underline hover:text-amber-700"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 underline hover:text-amber-700"
              >
                Privacy Policy
              </a>
              <span className="text-red-500 ml-0.5">*</span>
            </span>
          </label>

          {/* Marketing Opt-In */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={(e) => setMarketingOptIn(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm text-muted-foreground">
              Send me product updates and tips (optional)
            </span>
          </label>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!tosAccepted || isSubmitting}
            className="w-full py-3 px-4 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
