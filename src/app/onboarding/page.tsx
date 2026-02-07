'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Users, Loader2, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasBarns, setHasBarns] = useState(false);

  useEffect(() => {
    // Check if user already has barns
    async function checkBarns() {
      try {
        const response = await fetch('/api/barns');
        const result = await response.json();
        
        if (response.ok && result.data?.length > 0) {
          // User already has barns, redirect to dashboard
          router.push('/dashboard');
          return;
        }
        
        setHasBarns(false);
      } catch (error) {
        console.error('Error checking barns:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkBarns();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
          <p className="mt-4 text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-4">
            <svg className="w-10 h-10 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12c0-4-3-8-8-8-3 0-5.5 1.5-7 3.5L3 10l1 3-2 4 3 1 2-1 2 3h4l1-2 2 1 4-3c1-1 2-2.5 2-4z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Welcome to StableTrack!</h1>
          <p className="text-muted-foreground mt-2">Let's get your barn set up so you can start managing your horses.</p>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Create New Barn */}
          <Link
            href="/onboarding/create-barn"
            className="group bg-card rounded-xl border-2 border-border p-6 hover:border-amber-500 hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
              <Building2 className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Create a New Barn</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Start fresh with your own barn. You'll be the owner and can invite team members later.
            </p>
            <div className="flex items-center text-amber-600 font-medium text-sm group-hover:gap-2 transition-all">
              Get Started <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* Join Existing Barn */}
          <Link
            href="/onboarding/join-barn"
            className="group bg-card rounded-xl border-2 border-border p-6 hover:border-amber-500 hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent transition-colors">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Join an Existing Barn</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Have an invite code? Join a barn that's already set up and start collaborating.
            </p>
            <div className="flex items-center text-muted-foreground font-medium text-sm group-hover:gap-2 transition-all">
              Enter Code <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        </div>

        {/* Skip for now */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-muted-foreground hover:text-muted-foreground underline"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
