'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  ChevronLeft,
  Loader2,
  Key,
  Clock,
  CheckCircle,
} from 'lucide-react';

export default function JoinBarnPage() {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [pendingBarn, setPendingBarn] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }
    
    setIsJoining(true);
    setError('');
    
    try {
      const response = await fetch('/api/barns/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Invalid invite code');
      }
      
      // Check if pending approval
      if (result.data?.status === 'PENDING') {
        setPendingBarn(result.data.barnName);
      } else {
        // Direct approval - redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join barn');
      setIsJoining(false);
    }
  };

  // Show pending approval message
  if (pendingBarn) {
    return (
      <div className="min-h-screen bg-muted py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-xl shadow-sm border border-border p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Request Submitted!</h1>
            <p className="text-muted-foreground mb-6">
              Your request to join <span className="font-semibold">{pendingBarn}</span> has been sent to the barn owner for approval.
            </p>
            
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 mb-6">
              <h3 className="font-medium text-amber-900 text-sm mb-1">What happens next?</h3>
              <p className="text-amber-700 text-sm">
                The barn owner will review your request and assign you a role. You'll get access once approved.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/onboarding/create-barn"
                className="block w-full px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium"
              >
                Create Your Own Barn
              </Link>
              <Link
                href="/dashboard"
                className="block w-full px-4 py-3 bg-muted text-muted-foreground rounded-lg hover:bg-accent font-medium"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Back Link */}
        <Link 
          href="/onboarding" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Join a Barn</h1>
          <p className="text-muted-foreground mt-2">
            Enter the invite code you received from your barn manager
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-sm border border-border p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Invite Code
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-center font-mono text-lg tracking-wider"
                  placeholder="BARN-XXXXXX"
                  maxLength={14}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                The invite code looks like "BARN-ABC123"
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isJoining || !inviteCode.trim()}
            className="w-full mt-6 px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isJoining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting Request...
              </>
            ) : (
              'Request to Join'
            )}
          </button>
        </form>

        {/* Info about approval */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="font-medium text-blue-900 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Approval Required
          </h3>
          <p className="text-blue-700 text-sm mt-1">
            After submitting, the barn owner will review your request and assign you a role with the appropriate permissions.
          </p>
        </div>

        {/* Help Text */}
        <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
          <h3 className="font-medium text-amber-900 text-sm">Don't have an invite code?</h3>
          <p className="text-amber-700 text-sm mt-1">
            Ask your barn manager or owner to send you an invite from their team settings page.
          </p>
        </div>

        {/* Alternative */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Want to create your own barn instead?{' '}
          <Link href="/onboarding/create-barn" className="text-amber-600 hover:text-amber-700 font-medium">
            Create a barn
          </Link>
        </p>
      </div>
    </div>
  );
}
