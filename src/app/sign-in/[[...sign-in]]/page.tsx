import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-4">
            <svg className="w-10 h-10 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12c0-4-3-8-8-8-3 0-5.5 1.5-7 3.5L3 10l1 3-2 4 3 1 2-1 2 3h4l1-2 2 1 4-3c1-1 2-2.5 2-4z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Welcome to StableTrack</h1>
          <p className="text-stone-500 mt-1">Sign in to manage your barn</p>
        </div>
        
        {/* Clerk Sign In Component */}
        <SignIn 
          fallbackRedirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-xl border border-stone-200',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: 'border-stone-300 hover:bg-stone-50',
              formButtonPrimary: 'bg-amber-500 hover:bg-amber-600',
              footerActionLink: 'text-amber-600 hover:text-amber-700',
            },
          }}
        />
      </div>
    </div>
  );
}
