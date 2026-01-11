import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import LandingPage from './(marketing)/page';

export default async function Home() {
  // Check if Clerk is configured
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured = 
    clerkPublishableKey &&
    clerkPublishableKey.startsWith('pk_') &&
    !clerkPublishableKey.includes('your_key');

  // If Clerk is configured, check auth and redirect if logged in
  if (isClerkConfigured) {
    try {
      const { userId } = await auth();
      if (userId) {
        redirect('/dashboard');
      }
    } catch {
      // Auth check failed, show landing page
    }
  }

  // Show landing page for unauthenticated users
  return <LandingPage />;
}
