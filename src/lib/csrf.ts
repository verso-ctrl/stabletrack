// CSRF Protection utilities
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const CSRF_TOKEN_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_LENGTH = 32;

/**
 * Generate a random CSRF token
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Set CSRF token in cookie (call this from a server component or API route)
 */
export async function setCsrfCookie(): Promise<string> {
  const token = generateCsrfToken();
  const cookieStore = await cookies();
  
  cookieStore.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
  
  return token;
}

/**
 * Get CSRF token from cookie
 */
export async function getCsrfToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_TOKEN_NAME)?.value;
}

/**
 * Validate CSRF token from request
 */
export async function validateCsrfToken(request: NextRequest): Promise<boolean> {
  // Get token from header
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  
  // Get token from cookie
  const cookieToken = request.cookies.get(CSRF_TOKEN_NAME)?.value;
  
  // Both must exist and match
  if (!headerToken || !cookieToken) {
    return false;
  }
  
  // Timing-safe comparison
  return timingSafeEqual(headerToken, cookieToken);
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * CSRF validation middleware for API routes
 * Use this wrapper for mutation endpoints (POST, PUT, DELETE, PATCH)
 */
export function withCsrfProtection<T extends any[], R>(
  handler: (request: NextRequest, ...args: T) => Promise<R>
) {
  return async (request: NextRequest, ...args: T): Promise<R | NextResponse> => {
    // Skip CSRF check for GET and HEAD requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return handler(request, ...args);
    }
    
    // Skip CSRF for webhook endpoints (they use their own auth)
    if (request.nextUrl.pathname.startsWith('/api/webhooks')) {
      return handler(request, ...args);
    }
    
    // Skip CSRF for portal endpoints (they use token auth)
    if (request.nextUrl.pathname.startsWith('/api/portal')) {
      return handler(request, ...args);
    }
    
    // Validate CSRF token
    const isValid = await validateCsrfToken(request);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
    
    return handler(request, ...args);
  };
}

/**
 * API endpoint to get CSRF token for client
 */
export async function GET() {
  const token = await setCsrfCookie();
  
  return NextResponse.json({ csrfToken: token });
}
