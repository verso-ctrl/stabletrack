import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Check if Clerk is configured at build/runtime
const isClerkConfigured = 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('your_key') &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('_here') &&
  process.env.CLERK_SECRET_KEY &&
  !process.env.CLERK_SECRET_KEY.includes('your_key') &&
  !process.env.CLERK_SECRET_KEY.includes('_here');

// Add security headers to response
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // HSTS - enforce HTTPS
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Content Security Policy
  response.headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://js.stripe.com https://*.clerk.accounts.dev",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.clerk.com https://img.clerk.com https://*.stripe.com",
    "font-src 'self'",
    "connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://api.stripe.com https://*.sentry.io",
    "frame-src 'self' https://js.stripe.com https://*.clerk.accounts.dev",
    "object-src 'none'",
    "base-uri 'self'",
  ].join('; '));

  return response;
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // If Clerk is configured, use Clerk middleware
  if (isClerkConfigured) {
    try {
      const { clerkMiddleware, createRouteMatcher } = await import('@clerk/nextjs/server');
      
      const isPublicRoute = createRouteMatcher([
        '/',
        '/pricing(.*)',
        '/privacy(.*)',
        '/terms(.*)',
        '/sign-in(.*)',
        '/sign-up(.*)',
        '/api/webhooks(.*)',
        '/api/portal(.*)',
        '/api/csrf(.*)',
        '/portal(.*)',
      ]);

      const isAuthRoute = createRouteMatcher([
        '/sign-in(.*)',
        '/sign-up(.*)',
      ]);

      // Create and call the Clerk middleware
      const clerkMw = clerkMiddleware(async (auth, req) => {
        const { userId } = await auth();
        
        // Redirect authenticated users away from auth pages
        if (userId && isAuthRoute(req)) {
          const response = NextResponse.redirect(new URL('/dashboard', req.url));
          return addSecurityHeaders(response);
        }
        
        // Protect non-public routes
        if (!isPublicRoute(req)) {
          await auth.protect();
        }
        
        const response = NextResponse.next();
        return addSecurityHeaders(response);
      });

      return clerkMw(request, {} as any);
    } catch (e) {
      // Fall through to demo mode if Clerk fails
      console.error('Clerk middleware error:', e);
    }
  }
  
  // Demo mode - no authentication required
  // Allow landing page in demo mode
  if (pathname === '/') {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }
  
  // Redirect sign-in/sign-up to dashboard in demo mode
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    return addSecurityHeaders(response);
  }
  
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
