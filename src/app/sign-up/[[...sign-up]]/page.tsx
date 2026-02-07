import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-4">
            <svg className="w-10 h-10 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12c0-4-3-8-8-8-3 0-5.5 1.5-7 3.5L3 10l1 3-2 4 3 1 2-1 2 3h4l1-2 2 1 4-3c1-1 2-2.5 2-4z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-muted-foreground mt-1">Start managing your barn today</p>
        </div>
        
        {/* Clerk Sign Up Component */}
        <SignUp 
          fallbackRedirectUrl="/onboarding"
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-xl border border-border',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: 'border-border hover:bg-accent',
              formButtonPrimary: 'bg-amber-500 hover:bg-amber-600',
              footerActionLink: 'text-amber-600 hover:text-amber-700',
            },
          }}
        />
      </div>
    </div>
  );
}
