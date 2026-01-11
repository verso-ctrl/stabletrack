// Combined security middleware for API routes
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitIdentifier, rateLimitResponse, RateLimitConfig, RATE_LIMITS } from './rate-limit';
import { validateCsrfToken } from './csrf';

export interface SecurityOptions {
  rateLimit?: RateLimitConfig | keyof typeof RATE_LIMITS;
  requireCsrf?: boolean;
  requireAuth?: boolean;
}

export interface SecureContext {
  userId?: string;
  ip: string;
}

type HandlerFn<T = any> = (
  request: NextRequest,
  context: SecureContext & T
) => Promise<NextResponse>;

/**
 * Wrap an API handler with security middleware
 * 
 * Usage:
 * ```
 * export const POST = withSecurity(
 *   async (request, context) => {
 *     // Your handler code
 *   },
 *   { rateLimit: 'write', requireCsrf: true }
 * );
 * ```
 */
export function withSecurity<T = Record<string, unknown>>(
  handler: HandlerFn<T>,
  options: SecurityOptions = {}
): (request: NextRequest, routeContext?: T) => Promise<NextResponse> {
  return async (request: NextRequest, routeContext?: T): Promise<NextResponse> => {
    // Get IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Get user ID from headers (set by auth middleware)
    const userId = request.headers.get('x-user-id') || undefined;
    
    // Rate limiting
    if (options.rateLimit) {
      const config = typeof options.rateLimit === 'string' 
        ? RATE_LIMITS[options.rateLimit] 
        : options.rateLimit;
      
      const identifier = getRateLimitIdentifier(request, userId);
      const rateLimitKey = `${identifier}:${request.nextUrl.pathname}`;
      const result = checkRateLimit(rateLimitKey, config);
      
      if (!result.success) {
        return rateLimitResponse(result) as NextResponse;
      }
    }
    
    // CSRF validation for mutations
    if (options.requireCsrf && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      // Skip CSRF for webhook endpoints
      if (!request.nextUrl.pathname.startsWith('/api/webhooks')) {
        const isValid = await validateCsrfToken(request);
        if (!isValid) {
          return NextResponse.json(
            { error: 'Invalid CSRF token' },
            { status: 403 }
          );
        }
      }
    }
    
    // Build context
    const secureContext: SecureContext & T = {
      userId,
      ip,
      ...(routeContext || {} as T),
    };
    
    // Call handler
    return handler(request, secureContext);
  };
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // XSS protection (legacy, but still useful)
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy (basic)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
  );
  
  return response;
}

/**
 * Standard error response helper
 */
export function errorResponse(
  message: string,
  status: number = 400
): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Standard success response helper
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json({ data }, { status });
}
