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

// ============================================================================
// In-memory rate limiter for middleware (edge-compatible)
// ============================================================================
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkApiRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const key = `api:${ip}`;
  const entry = rateLimitMap.get(key);

  // Clean up periodically (1% chance per request)
  if (Math.random() < 0.01) {
    for (const [k, v] of rateLimitMap) {
      if (v.resetAt < now) rateLimitMap.delete(k);
    }
  }

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  entry.count++;
  return entry.count <= limit;
}

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

// ============================================================================
// CSRF validation
// ============================================================================
const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';

function validateCsrf(request: NextRequest): boolean {
  const headerToken = request.headers.get(CSRF_HEADER);
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;

  if (!headerToken || !cookieToken) return false;
  if (headerToken.length !== cookieToken.length) return false;

  // Timing-safe comparison
  let result = 0;
  for (let i = 0; i < headerToken.length; i++) {
    result |= headerToken.charCodeAt(i) ^ cookieToken.charCodeAt(i);
  }
  return result === 0;
}

// Routes exempt from CSRF (use their own auth mechanisms)
const csrfExemptPaths = [
  '/api/webhooks',   // Stripe webhooks use signature verification
  '/api/portal',     // Portal uses token auth
  '/api/csrf',       // CSRF token endpoint itself
];

// ============================================================================
// Security headers
// ============================================================================
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.clerk.accounts.dev https://clerk.barnkeep.com https://challenges.cloudflare.com https://app.termly.io",
    "worker-src 'self' blob:",
    "style-src 'self' 'unsafe-inline' https://app.termly.io",
    "img-src 'self' data: blob: https://*.clerk.com https://img.clerk.com https://*.stripe.com https://clerk.barnkeep.com https://*.barnkeep.com https://app.termly.io",
    "font-src 'self' https://app.termly.io",
    "connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://api.stripe.com https://*.sentry.io https://clerk.barnkeep.com https://*.barnkeep.com https://app.termly.io",
    "frame-src 'self' https://js.stripe.com https://*.clerk.accounts.dev https://accounts.barnkeep.com https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
  ].join('; '));

  return response;
}

// ============================================================================
// Main middleware
// ============================================================================
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Rate limiting for all API routes (200 requests/min per IP) ---
  if (pathname.startsWith('/api/')) {
    const ip = getClientIp(request);
    if (!checkApiRateLimit(ip, 200, 60000)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    // --- CSRF validation for API mutation requests ---
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
    const isExempt = csrfExemptPaths.some(p => pathname.startsWith(p));

    if (isMutation && !isExempt) {
      const isValid = validateCsrf(request);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid or missing CSRF token' },
          { status: 403 }
        );
      }
    }
  }

  // --- Clerk authentication ---
  if (isClerkConfigured) {
    try {
      const { clerkMiddleware, createRouteMatcher } = await import('@clerk/nextjs/server');

      const isPublicRoute = createRouteMatcher([
        '/',
        '/pricing(.*)',
        '/about(.*)',
        '/contact(.*)',
        '/privacy(.*)',
        '/terms(.*)',
        '/sign-in(.*)',
        '/sign-up(.*)',
        '/sitemap.xml',
        '/robots.txt',
        '/api/webhooks(.*)',
        '/api/portal(.*)',
        '/api/csrf(.*)',
      ]);

      const isAuthRoute = createRouteMatcher([
        '/sign-in(.*)',
        '/sign-up(.*)',
      ]);

      const clerkMw = clerkMiddleware(async (auth, req) => {
        const { userId } = await auth();

        if (userId && isAuthRoute(req)) {
          const response = NextResponse.redirect(new URL('/dashboard', req.url));
          return addSecurityHeaders(response);
        }

        if (!isPublicRoute(req)) {
          await auth.protect();
        }

        const response = NextResponse.next();
        return addSecurityHeaders(response);
      });

      return clerkMw(request, {} as any);
    } catch (e) {
      console.error('Clerk middleware error:', e);
    }
  }

  // --- Demo mode fallback ---
  if (pathname === '/') {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

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
