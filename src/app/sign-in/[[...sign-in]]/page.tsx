import { SignIn } from '@clerk/nextjs';

const HorseIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12c0-4-3-8-8-8-3 0-5.5 1.5-7 3.5L3 10l1 3-2 4 3 1 2-1 2 3h4l1-2 2 1 4-3c1-1 2-2.5 2-4z"/>
    <circle cx="18" cy="9" r="1"/>
  </svg>
);

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 text-primary rounded-lg mb-4">
            <HorseIcon />
          </div>
          <h1 className="font-display text-2xl font-semibold text-foreground tracking-tight">BarnKeep</h1>
          <p className="text-muted-foreground mt-1">Sign in to manage your barn</p>
        </div>
        
        <SignIn 
          fallbackRedirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-card border border-border/60',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: 'border-border hover:bg-muted',
              formButtonPrimary: 'bg-primary hover:opacity-90',
              footerActionLink: 'text-primary hover:opacity-80',
            },
          }}
        />
      </div>
    </div>
  );
}
